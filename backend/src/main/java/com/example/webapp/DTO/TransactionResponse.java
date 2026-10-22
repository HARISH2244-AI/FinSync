package com.example.webapp.dto;

import com.example.webapp.model.Transaction;
import com.example.webapp.model.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionResponse {

    private Long id;
    private BigDecimal amount;
    private TransactionType type;
    private String category;
    private String description;
    private LocalDate date;

    public TransactionResponse(Transaction t) {
        this.id = t.getId();
        this.amount = t.getAmount();
        this.type = t.getType();
        this.category = t.getCategory();
        this.description = t.getDescription();
        this.date = t.getDate();
    }

    public Long getId() { return id; }
    public BigDecimal getAmount() { return amount; }
    public TransactionType getType() { return type; }
    public String getCategory() { return category; }
    public String getDescription() { return description; }
    public LocalDate getDate() { return date; }
}