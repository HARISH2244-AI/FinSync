package com.example.webapp.dto;

import com.example.webapp.model.WalletTransaction;
import com.example.webapp.model.WalletTransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class WalletResponse {

    private BigDecimal balance;
    private List<Entry> recentTransactions;

    public WalletResponse(BigDecimal balance, List<WalletTransaction> transactions) {
        this.balance = balance;
        this.recentTransactions = transactions.stream().map(Entry::new).toList();
    }

    public BigDecimal getBalance() { return balance; }
    public List<Entry> getRecentTransactions() { return recentTransactions; }

    public static class Entry {
        public Long id;
        public WalletTransactionType type;
        public BigDecimal amount;
        public String note;
        public LocalDateTime createdAt;

        public Entry(WalletTransaction t) {
            this.id = t.getId();
            this.type = t.getType();
            this.amount = t.getAmount();
            this.note = t.getNote();
            this.createdAt = t.getCreatedAt();
        }
    }
}