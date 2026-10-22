package com.example.webapp.controller;

import com.example.webapp.dto.SplitExpenseRequest;
import com.example.webapp.dto.SplitGroupRequest;
import com.example.webapp.dto.SplitGroupResponse;
import com.example.webapp.model.*;
import com.example.webapp.repository.SplitExpenseRepository;
import com.example.webapp.repository.SplitGroupRepository;
import com.example.webapp.repository.SplitMemberRepository;
import com.example.webapp.util.CurrentUserProvider;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@RestController
@RequestMapping("/api/split-groups")
@CrossOrigin(origins = {"http://localhost:5173", "https://fin-sync-alpha.vercel.app"})
public class SplitGroupController {

    private final SplitGroupRepository splitGroupRepository;
    private final SplitMemberRepository splitMemberRepository;
    private final SplitExpenseRepository splitExpenseRepository;
    private final CurrentUserProvider currentUserProvider;

    public SplitGroupController(SplitGroupRepository splitGroupRepository,
                                 SplitMemberRepository splitMemberRepository,
                                 SplitExpenseRepository splitExpenseRepository,
                                 CurrentUserProvider currentUserProvider) {
        this.splitGroupRepository = splitGroupRepository;
        this.splitMemberRepository = splitMemberRepository;
        this.splitExpenseRepository = splitExpenseRepository;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping
    public List<SplitGroupResponse> getAll(Authentication authentication) {
        User user = currentUserProvider.resolve(authentication);
        return splitGroupRepository.findByOwner(user).stream()
                .map(g -> new SplitGroupResponse(g, splitExpenseRepository.findByGroupOrderByCreatedAtDesc(g)))
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SplitGroupResponse> getOne(@PathVariable Long id, Authentication authentication) {
        User user = currentUserProvider.resolve(authentication);
        return splitGroupRepository.findByIdAndOwner(id, user)
                .map(g -> ResponseEntity.ok(new SplitGroupResponse(g, splitExpenseRepository.findByGroupOrderByCreatedAtDesc(g))))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SplitGroupResponse> create(@Valid @RequestBody SplitGroupRequest request,
                                                       Authentication authentication) {
        User user = currentUserProvider.resolve(authentication);

        SplitGroup group = new SplitGroup();
        group.setOwner(user);
        group.setName(request.getName());
        SplitGroup savedGroup = splitGroupRepository.save(group);

        for (String memberName : request.getMemberNames()) {
            SplitMember member = new SplitMember();
            member.setGroup(savedGroup);
            member.setName(memberName);
            splitMemberRepository.save(member);
        }

        SplitGroup reloaded = splitGroupRepository.findById(savedGroup.getId()).orElseThrow();
        return ResponseEntity.ok(new SplitGroupResponse(reloaded, List.of()));
    }

    @PostMapping("/{groupId}/expenses")
    public ResponseEntity<?> addExpense(@PathVariable Long groupId,
                                         @Valid @RequestBody SplitExpenseRequest request,
                                         Authentication authentication) {
        User user = currentUserProvider.resolve(authentication);
        SplitGroup group = splitGroupRepository.findByIdAndOwner(groupId, user)
                .orElse(null);
        if (group == null) return ResponseEntity.notFound().build();

        SplitMember paidBy = splitMemberRepository.findByIdAndGroup(request.getPaidByMemberId(), group)
                .orElse(null);
        if (paidBy == null) return ResponseEntity.badRequest().body("Invalid paid-by member for this group.");

        List<SplitMember> members = splitMemberRepository.findByGroup(group);
        if (members.isEmpty()) return ResponseEntity.badRequest().body("Group has no members.");

        SplitExpense expense = new SplitExpense();
        expense.setGroup(group);
        expense.setPaidBy(paidBy);
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());

        BigDecimal equalShare = request.getAmount()
                .divide(BigDecimal.valueOf(members.size()), 2, RoundingMode.HALF_UP);

        for (SplitMember member : members) {
            SplitShare share = new SplitShare();
            share.setExpense(expense);
            share.setMember(member);
            share.setShareAmount(equalShare);
            expense.getShares().add(share);
        }

        splitExpenseRepository.save(expense);

        SplitGroup reloaded = splitGroupRepository.findById(groupId).orElseThrow();
        List<SplitExpense> expenses = splitExpenseRepository.findByGroupOrderByCreatedAtDesc(reloaded);
        return ResponseEntity.ok(new SplitGroupResponse(reloaded, expenses));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        User user = currentUserProvider.resolve(authentication);
        return splitGroupRepository.findByIdAndOwner(id, user)
                .map(g -> {
                    splitGroupRepository.delete(g);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}