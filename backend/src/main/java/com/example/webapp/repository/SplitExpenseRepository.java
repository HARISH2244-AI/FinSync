package com.example.webapp.repository;

import com.example.webapp.model.SplitExpense;
import com.example.webapp.model.SplitGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SplitExpenseRepository extends JpaRepository<SplitExpense, Long> {
    List<SplitExpense> findByGroupOrderByCreatedAtDesc(SplitGroup group);
}