import { useEffect, useState } from "react";
import { getSplitGroups, createSplitGroup, addSplitExpense, deleteSplitGroup } from "../api/split";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import MagneticButton from "../components/MagneticButton";
import "./Split.css";

function Split() {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [memberNames, setMemberNames] = useState("");
  const [error, setError] = useState("");
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [expenseForm, setExpenseForm] = useState({ description: "", amount: "", paidByMemberId: "" });

  const load = () => getSplitGroups().then(setGroups).catch((e) => setError(e.message));

  useEffect(() => { load(); }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setError("");
    const names = memberNames.split(",").map((n) => n.trim()).filter(Boolean);
    if (names.length === 0) {
      setError("Add at least one member (comma-separated names)");
      return;
    }
    try {
      await createSplitGroup({ name: groupName, memberNames: names });
      setGroupName("");
      setMemberNames("");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddExpense = async (groupId) => {
    setError("");
    if (!expenseForm.description || !expenseForm.amount || !expenseForm.paidByMemberId) {
      setError("Fill all expense fields");
      return;
    }
    try {
      await addSplitExpense(groupId, {
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        paidByMemberId: parseInt(expenseForm.paidByMemberId, 10),
      });
      setExpenseForm({ description: "", amount: "", paidByMemberId: "" });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AppShell>
      <PageHeader title="Split Expenses" subtitle="Groups, bills & settlements" />
      <div className="split-page">
        {error && <p className="auth-error">{error}</p>}

        <form className="budget-form split-create-form" onSubmit={handleCreateGroup}>
          <input
            type="text" placeholder="Group name (e.g. Goa Trip)"
            value={groupName} onChange={(e) => setGroupName(e.target.value)} required
          />
          <input
            type="text" placeholder="Members, comma-separated (e.g. You, Riya, Aman)"
            value={memberNames} onChange={(e) => setMemberNames(e.target.value)} required
          />
          <MagneticButton type="submit">Create Group</MagneticButton>
        </form>

        {groups.length === 0 ? (
          <p className="empty-state">No split groups yet.</p>
        ) : (
          groups.map((group) => (
            <div key={group.id} className="split-group-card">
              <div className="split-group-header">
                <h3>{group.name}</h3>
                <button onClick={() => deleteSplitGroup(group.id).then(load)} data-cursor-hover>Delete</button>
              </div>

              <p className="split-members">
                Members: {group.members.map((m) => m.name).join(", ")}
              </p>

              <div className="split-expense-form">
                <input
                  type="text" placeholder="What was it for?"
                  value={activeGroupId === group.id ? expenseForm.description : ""}
                  onChange={(e) => { setActiveGroupId(group.id); setExpenseForm({ ...expenseForm, description: e.target.value }); }}
                />
                <input
                  type="number" step="0.01" placeholder="Amount"
                  value={activeGroupId === group.id ? expenseForm.amount : ""}
                  onChange={(e) => { setActiveGroupId(group.id); setExpenseForm({ ...expenseForm, amount: e.target.value }); }}
                />
                <select
                  value={activeGroupId === group.id ? expenseForm.paidByMemberId : ""}
                  onChange={(e) => { setActiveGroupId(group.id); setExpenseForm({ ...expenseForm, paidByMemberId: e.target.value }); }}
                >
                  <option value="">Paid by...</option>
                  {group.members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <button className="split-add-btn" onClick={() => handleAddExpense(group.id)} data-cursor-hover>Add</button>
              </div>

              {group.expenses.length > 0 && (
                <ul className="split-expense-list">
                  {group.expenses.map((e) => (
                    <li key={e.id}>
                      <span>{e.description}</span>
                      <span>₹{Number(e.amount).toFixed(2)} by {e.paidByName}</span>
                    </li>
                  ))}
                </ul>
              )}

              {group.settlements.length > 0 && (
                <div className="split-settlements">
                  <p className="split-settlements-title">Who owes whom</p>
                  {group.settlements.map((s, idx) => (
                    <p key={idx} className="split-settlement-row">
                      <strong>{s.fromName}</strong> owes <strong>{s.toName}</strong> ₹{Number(s.amount).toFixed(2)}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}

export default Split;