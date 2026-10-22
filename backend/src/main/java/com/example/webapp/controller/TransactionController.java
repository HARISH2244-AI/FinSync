package com.example.webapp.controller;

import com.example.webapp.dto.TransactionRequest;
import com.example.webapp.dto.TransactionResponse;
import com.example.webapp.model.Transaction;
import com.example.webapp.model.User;
import com.example.webapp.repository.TransactionRepository;
import com.example.webapp.util.CurrentUserProvider;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = {"http://localhost:5173", "https://fin-sync-alpha.vercel.app"})
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final CurrentUserProvider currentUserProvider;

    public TransactionController(TransactionRepository transactionRepository,
                                  CurrentUserProvider currentUserProvider) {
        this.transactionRepository = transactionRepository;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping
    public List<TransactionResponse> getAll(Authentication authentication) {
        User user = currentUserProvider.resolve(authentication);
        return transactionRepository.findByUserOrderByDateDescCreatedAtDesc(user)
                .stream()
                .map(TransactionResponse::new)
                .toList();
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> create(@Valid @RequestBody TransactionRequest request,
                                                        Authentication authentication) {
        User user = currentUserProvider.resolve(authentication);

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setCategory(request.getCategory());
        transaction.setDescription(request.getDescription());
        transaction.setDate(request.getDate());

        Transaction saved = transactionRepository.save(transaction);
        return ResponseEntity.status(HttpStatus.CREATED).body(new TransactionResponse(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                     @Valid @RequestBody TransactionRequest request,
                                     Authentication authentication) {
        User user = currentUserProvider.resolve(authentication);

        return transactionRepository.findByIdAndUser(id, user)
                .map(existing -> {
                    existing.setAmount(request.getAmount());
                    existing.setType(request.getType());
                    existing.setCategory(request.getCategory());
                    existing.setDescription(request.getDescription());
                    existing.setDate(request.getDate());
                    Transaction saved = transactionRepository.save(existing);
                    return ResponseEntity.ok(new TransactionResponse(saved));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        User user = currentUserProvider.resolve(authentication);

        return transactionRepository.findByIdAndUser(id, user)
                .map(existing -> {
                    transactionRepository.delete(existing);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}