package com.example.webapp.dto;

import com.example.webapp.model.Budget;
import java.math.BigDecimal;

public class BudgetResponse {

    private Long id;
    private String category;
    private BigDecimal monthlyLimit;
    private BigDecimal spent;
    private int month;
    private int year;

    public BudgetResponse(Budget budget, BigDecimal spent) {
        this.id = budget.getId();
        this.category = budget.getCategory();
        this.monthlyLimit = budget.getMonthlyLimit();
        this.spent = spent;
        this.month = budget.getMonth();
        this.year = budget.getYear();
    }

    public Long getId() { return id; }
    public String getCategory() { return category; }
    public BigDecimal getMonthlyLimit() { return monthlyLimit; }
    public BigDecimal getSpent() { return spent; }
    public int getMonth() { return month; }
    public int getYear() { return year; }
}