package com.example.webapp.repository;

import com.example.webapp.model.SplitGroup;
import com.example.webapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SplitGroupRepository extends JpaRepository<SplitGroup, Long> {
    List<SplitGroup> findByOwner(User owner);
    Optional<SplitGroup> findByIdAndOwner(Long id, User owner);
}