package com.example.webapp.repository;

import com.example.webapp.model.SplitGroup;
import com.example.webapp.model.SplitMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SplitMemberRepository extends JpaRepository<SplitMember, Long> {
    List<SplitMember> findByGroup(SplitGroup group);
    Optional<SplitMember> findByIdAndGroup(Long id, SplitGroup group);
}