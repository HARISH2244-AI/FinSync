package com.example.webapp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "split_shares")
public class SplitShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_id", nullable = false)
    private SplitExpense expense;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private SplitMember member;

    @Column(name = "share_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal shareAmount;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SplitExpense getExpense() { return expense; }
    public void setExpense(SplitExpense expense) { this.expense = expense; }

    public SplitMember getMember() { return member; }
    public void setMember(SplitMember member) { this.member = member; }

    public BigDecimal getShareAmount() { return shareAmount; }
    public void setShareAmount(BigDecimal shareAmount) { this.shareAmount = shareAmount; }
}