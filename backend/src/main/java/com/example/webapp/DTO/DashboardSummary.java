package com.example.webapp.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardSummary {

    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal balance;
    private List<TransactionResponse> recentTransactions;

    public DashboardSummary(BigDecimal totalIncome, BigDecimal totalExpense,
                             BigDecimal balance, List<TransactionResponse> recentTransactions) {
        this.totalIncome = totalIncome;
        this.totalExpense = totalExpense;
        this.balance = balance;
        this.recentTransactions = recentTransactions;
    }

    public BigDecimal getTotalIncome() { return totalIncome; }
    public BigDecimal getTotalExpense() { return totalExpense; }
    public BigDecimal getBalance() { return balance; }
    public List<TransactionResponse> getRecentTransactions() { return recentTransactions; }
}