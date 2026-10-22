package com.example.webapp.dto;

import com.example.webapp.model.SplitExpense;
import com.example.webapp.model.SplitGroup;
import com.example.webapp.model.SplitMember;
import com.example.webapp.model.SplitShare;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

public class SplitGroupResponse {

    public Long id;
    public String name;
    public List<MemberInfo> members = new ArrayList<>();
    public List<ExpenseInfo> expenses = new ArrayList<>();
    public List<Settlement> settlements = new ArrayList<>();

    public SplitGroupResponse(SplitGroup group, List<SplitExpense> groupExpenses) {
        this.id = group.getId();
        this.name = group.getName();

        Map<Long, BigDecimal> netBalance = new LinkedHashMap<>();
        Map<Long, String> memberNames = new LinkedHashMap<>();

        for (SplitMember m : group.getMembers()) {
            memberNames.put(m.getId(), m.getName());
            netBalance.put(m.getId(), BigDecimal.ZERO);
            members.add(new MemberInfo(m.getId(), m.getName()));
        }

        for (SplitExpense e : groupExpenses) {
            netBalance.merge(e.getPaidBy().getId(), e.getAmount(), BigDecimal::add);

            List<ShareInfo> shareInfos = new ArrayList<>();
            for (SplitShare s : e.getShares()) {
                netBalance.merge(s.getMember().getId(), s.getShareAmount().negate(), BigDecimal::add);
                shareInfos.add(new ShareInfo(s.getMember().getId(), s.getMember().getName(), s.getShareAmount()));
            }

            expenses.add(new ExpenseInfo(
                    e.getId(), e.getDescription(), e.getAmount(),
                    e.getPaidBy().getId(), e.getPaidBy().getName(), shareInfos
            ));
        }

        this.settlements = simplifyDebts(netBalance, memberNames);
    }

    private List<Settlement> simplifyDebts(Map<Long, BigDecimal> netBalance, Map<Long, String> names) {
        List<Settlement> result = new ArrayList<>();

        PriorityQueue<long[]> creditors = new PriorityQueue<>((a, b) -> 0);
        List<Map.Entry<Long, BigDecimal>> debtors = new ArrayList<>();
        List<Map.Entry<Long, BigDecimal>> creditorsList = new ArrayList<>();

        for (Map.Entry<Long, BigDecimal> entry : netBalance.entrySet()) {
            int cmp = entry.getValue().setScale(2, RoundingMode.HALF_UP).compareTo(BigDecimal.ZERO);
            if (cmp < 0) debtors.add(entry);
            else if (cmp > 0) creditorsList.add(entry);
        }

        debtors.sort((a, b) -> a.getValue().compareTo(b.getValue()));
        creditorsList.sort((a, b) -> b.getValue().compareTo(a.getValue()));

        int i = 0, j = 0;
        List<Map.Entry<Long, BigDecimal>> debtorsMut = new ArrayList<>(debtors);
        List<Map.Entry<Long, BigDecimal>> creditorsMut = new ArrayList<>(creditorsList);

        BigDecimal[] debtorAmounts = debtorsMut.stream().map(e -> e.getValue().negate()).toArray(BigDecimal[]::new);
        BigDecimal[] creditorAmounts = creditorsMut.stream().map(Map.Entry::getValue).toArray(BigDecimal[]::new);

        while (i < debtorsMut.size() && j < creditorsMut.size()) {
            BigDecimal owe = debtorAmounts[i];
            BigDecimal owed = creditorAmounts[j];
            BigDecimal settled = owe.min(owed);

            if (settled.compareTo(BigDecimal.valueOf(0.01)) >= 0) {
                result.add(new Settlement(
                        debtorsMut.get(i).getKey(), names.get(debtorsMut.get(i).getKey()),
                        creditorsMut.get(j).getKey(), names.get(creditorsMut.get(j).getKey()),
                        settled.setScale(2, RoundingMode.HALF_UP)
                ));
            }

            debtorAmounts[i] = owe.subtract(settled);
            creditorAmounts[j] = owed.subtract(settled);

            if (debtorAmounts[i].compareTo(BigDecimal.valueOf(0.01)) < 0) i++;
            if (creditorAmounts[j].compareTo(BigDecimal.valueOf(0.01)) < 0) j++;
        }

        return result;
    }

    public static class MemberInfo {
        public Long id;
        public String name;
        public MemberInfo(Long id, String name) { this.id = id; this.name = name; }
    }

    public static class ShareInfo {
        public Long memberId;
        public String memberName;
        public BigDecimal amount;
        public ShareInfo(Long memberId, String memberName, BigDecimal amount) {
            this.memberId = memberId; this.memberName = memberName; this.amount = amount;
        }
    }

    public static class ExpenseInfo {
        public Long id;
        public String description;
        public BigDecimal amount;
        public Long paidByMemberId;
        public String paidByName;
        public List<ShareInfo> shares;
        public ExpenseInfo(Long id, String description, BigDecimal amount,
                            Long paidByMemberId, String paidByName, List<ShareInfo> shares) {
            this.id = id; this.description = description; this.amount = amount;
            this.paidByMemberId = paidByMemberId; this.paidByName = paidByName; this.shares = shares;
        }
    }

    public static class Settlement {
        public Long fromMemberId;
        public String fromName;
        public Long toMemberId;
        public String toName;
        public BigDecimal amount;
        public Settlement(Long fromMemberId, String fromName, Long toMemberId, String toName, BigDecimal amount) {
            this.fromMemberId = fromMemberId; this.fromName = fromName;
            this.toMemberId = toMemberId; this.toName = toName; this.amount = amount;
        }
    }
}