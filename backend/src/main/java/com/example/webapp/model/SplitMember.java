package com.example.webapp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "split_members")
public class SplitMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private SplitGroup group;

    @Column(nullable = false)
    private String name;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SplitGroup getGroup() { return group; }
    public void setGroup(SplitGroup group) { this.group = group; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}