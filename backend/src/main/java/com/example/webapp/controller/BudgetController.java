package com.example.webapp.controller;

import com.example.webapp.dto.BudgetRequest;
import com.example.webapp.dto.BudgetResponse;
import com.example.webapp.model.Budget;
import com.example.webapp.model.TransactionType;
import com.example.webapp.model.User;
import com.example.webapp.repository.BudgetRepository;
import com.example.webapp.repository.TransactionRepository;
import com.example.webapp.util.CurrentUserProvider;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = {"http://localhost:5173", "https://fin-sync-alpha.vercel.app"})
public class BudgetController {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final CurrentUserProvider currentUserProvider;

    public BudgetController(BudgetRepository budgetRepository,
                             TransactionRepository transactionRepository,
                             CurrentUserProvider currentUserProvider) {
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
        this.currentUserProvider = currentUserProvider;
    }

    private BigDecimal spentForCategory(User user, String category, int month, int year) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        return transactionRepository.findByUserOrderByDateDescCreatedAtDesc(user).stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .filter(t -> t.getCategory().equalsIgnoreCase(category))
                .filter(t -> !t.getDate().isBefore(start) && !t.getDate().isAfter(end))
                .map(t -> t.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @GetMapping
    public List<BudgetResponse> getBudgets(@RequestParam int month, @RequestParam int year,
                                            Authentication authentication) {
        User user = currentUserProvider.resolve(authentication);
        return budgetRepository.findByUserAndMonthAndYear(user, month, year).stream()
                .map(b -> new BudgetResponse(b, spentForCategory(user, b.getCategory(), month, year)))
                .toList();
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> create(@Valid @RequestBody BudgetRequest request,
                                                  Authentication authentication) {
        User user = currentUserProvider.resolve(authentication);

        Budget budget = new Budget();
        budget.setUser(user);
        budget.setCategory(request.getCategory());
        budget.setMonthlyLimit(request.getMonthlyLimit());
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());

        Budget saved = budgetRepository.save(budget);
        BigDecimal spent = spentForCategory(user, saved.getCategory(), saved.getMonth(), saved.getYear());

        return ResponseEntity.ok(new BudgetResponse(saved, spent));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        User user = currentUserProvider.resolve(authentication);
        return budgetRepository.findByIdAndUser(id, user)
                .map(b -> {
                    budgetRepository.delete(b);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}