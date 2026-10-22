package com.example.webapp.controller;

import com.example.webapp.dto.DashboardSummary;
import com.example.webapp.dto.TransactionResponse;
import com.example.webapp.model.Transaction;
import com.example.webapp.model.TransactionType;
import com.example.webapp.model.User;
import com.example.webapp.repository.TransactionRepository;
import com.example.webapp.util.CurrentUserProvider;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final TransactionRepository transactionRepository;
    private final CurrentUserProvider currentUserProvider;

    public DashboardController(TransactionRepository transactionRepository,
                                CurrentUserProvider currentUserProvider) {
        this.transactionRepository = transactionRepository;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping("/summary")
    public DashboardSummary getSummary(Authentication authentication) {
        User user = currentUserProvider.resolve(authentication);

        BigDecimal totalIncome = transactionRepository.sumByUserAndType(user, TransactionType.INCOME);
        BigDecimal totalExpense = transactionRepository.sumByUserAndType(user, TransactionType.EXPENSE);
        BigDecimal balance = totalIncome.subtract(totalExpense);

        List<Transaction> all = transactionRepository.findByUserOrderByDateDescCreatedAtDesc(user);
        List<TransactionResponse> recent = all.stream()
                .limit(5)
                .map(TransactionResponse::new)
                .toList();

        return new DashboardSummary(totalIncome, totalExpense, balance, recent);
    }
}