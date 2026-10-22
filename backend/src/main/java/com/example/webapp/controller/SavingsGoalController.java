package com.example.webapp.controller;

import com.example.webapp.dto.SavingsGoalRequest;
import com.example.webapp.dto.WalletRequest;
import com.example.webapp.model.SavingsGoal;
import com.example.webapp.model.User;
import com.example.webapp.repository.SavingsGoalRepository;
import com.example.webapp.util.CurrentUserProvider;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/savings-goals")
@CrossOrigin(origins = {"http://localhost:5173", "https://fin-sync-alpha.vercel.app"})
public class SavingsGoalController {

    private final SavingsGoalRepository savingsGoalRepository;
    private final CurrentUserProvider currentUserProvider;

    public SavingsGoalController(SavingsGoalRepository savingsGoalRepository,
                                  CurrentUserProvider currentUserProvider) {
        this.savingsGoalRepository = savingsGoalRepository;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping
    public List<SavingsGoal> getAll(Authentication authentication) {
        return savingsGoalRepository.findByUser(currentUserProvider.resolve(authentication));
    }

    @PostMapping
    public ResponseEntity<SavingsGoal> create(@Valid @RequestBody SavingsGoalRequest request,
                                               Authentication authentication) {
        User user = currentUserProvider.resolve(authentication);

        SavingsGoal goal = new SavingsGoal();
        goal.setUser(user);
        goal.setName(request.getName());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setSavedAmount(BigDecimal.ZERO);
        goal.setTargetDate(request.getTargetDate());

        return ResponseEntity.ok(savingsGoalRepository.save(goal));
    }

    @PostMapping("/{id}/contribute")
    public ResponseEntity<?> contribute(@PathVariable Long id, @Valid @RequestBody WalletRequest request,
                                         Authentication authentication) {
        User user = currentUserProvider.resolve(authentication);
        return savingsGoalRepository.findByIdAndUser(id, user)
                .map(goal -> {
                    goal.setSavedAmount(goal.getSavedAmount().add(request.getAmount()));
                    return ResponseEntity.ok(savingsGoalRepository.save(goal));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        User user = currentUserProvider.resolve(authentication);
        return savingsGoalRepository.findByIdAndUser(id, user)
                .map(g -> {
                    savingsGoalRepository.delete(g);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}