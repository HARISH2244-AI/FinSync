import { useEffect, useState } from "react";
import {
  getBudgets, createBudget, deleteBudget,
  getSavingsGoals, createSavingsGoal, contributeSavingsGoal, deleteSavingsGoal,
} from "../api/budget";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import MagneticButton from "../components/MagneticButton";
import "./Budget.css";

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Other"];
const now = new Date();

function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [budgetForm, setBudgetForm] = useState({ category: "Food", monthlyLimit: "" });
  const [goalForm, setGoalForm] = useState({ name: "", targetAmount: "", targetDate: "" });
  const [error, setError] = useState("");

  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const loadBudgets = () => getBudgets(month, year).then(setBudgets).catch((e) => setError(e.message));
  const loadGoals = () => getSavingsGoals().then(setGoals).catch((e) => setError(e.message));

  useEffect(() => { loadBudgets(); loadGoals(); }, []);

  const handleAddBudget = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createBudget({
        category: budgetForm.category,
        monthlyLimit: parseFloat(budgetForm.monthlyLimit),
        month, year,
      });
      setBudgetForm({ category: "Food", monthlyLimit: "" });
      loadBudgets();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createSavingsGoal({
        name: goalForm.name,
        targetAmount: parseFloat(goalForm.targetAmount),
        targetDate: goalForm.targetDate || null,
      });
      setGoalForm({ name: "", targetAmount: "", targetDate: "" });
      loadGoals();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleContribute = async (id) => {
    const amount = prompt("How much to add to this goal?");
    if (!amount || parseFloat(amount) <= 0) return;
    try {
      await contributeSavingsGoal(id, { amount: parseFloat(amount) });
      loadGoals();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AppShell>
      <PageHeader title="Budgeting" subtitle="Monthly limits & savings goals" />
      <div className="budget-page">
        {error && <p className="auth-error">{error}</p>}

        <section>
          <h2 className="wallet-section-title">Monthly Budgets</h2>
          <form className="budget-form" onSubmit={handleAddBudget}>
            <select value={budgetForm.category} onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="number" step="0.01" min="0.01" placeholder="Monthly limit"
              value={budgetForm.monthlyLimit}
              onChange={(e) => setBudgetForm({ ...budgetForm, monthlyLimit: e.target.value })}
              required
            />
            <MagneticButton type="submit">Set Budget</MagneticButton>
          </form>

          {budgets.length === 0 ? (
            <p className="empty-state">No budgets set for this month.</p>
          ) : (
            <ul className="budget-list">
              {budgets.map((b) => {
                const pct = Math.min(100, (b.spent / b.monthlyLimit) * 100);
                const over = b.spent > b.monthlyLimit;
                return (
                  <li key={b.id} className="budget-card">
                    <div className="budget-card-header">
                      <span>{b.category}</span>
                      <button onClick={() => deleteBudget(b.id).then(loadBudgets)} data-cursor-hover>✕</button>
                    </div>
                    <div className="budget-bar-track">
                      <div
                        className={`budget-bar-fill ${over ? "over" : ""}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="budget-card-footer">
                      <span className={over ? "over-text" : ""}>₹{b.spent.toFixed(2)} spent</span>
                      <span>of ₹{b.monthlyLimit.toFixed(2)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <h2 className="wallet-section-title">Savings Goals</h2>
          <form className="budget-form" onSubmit={handleAddGoal}>
            <input
              type="text" placeholder="Goal name"
              value={goalForm.name}
              onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
              required
            />
            <input
              type="number" step="0.01" min="0.01" placeholder="Target amount"
              value={goalForm.targetAmount}
              onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
              required
            />
            <input
              type="date"
              value={goalForm.targetDate}
              onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
            />
            <MagneticButton type="submit">Add Goal</MagneticButton>
          </form>

          {goals.length === 0 ? (
            <p className="empty-state">No savings goals yet.</p>
          ) : (
            <ul className="budget-list">
              {goals.map((g) => {
                const pct = Math.min(100, (g.savedAmount / g.targetAmount) * 100);
                return (
                  <li key={g.id} className="budget-card">
                    <div className="budget-card-header">
                      <span>{g.name}</span>
                      <button onClick={() => deleteSavingsGoal(g.id).then(loadGoals)} data-cursor-hover>✕</button>
                    </div>
                    <div className="budget-bar-track">
                      <div className="budget-bar-fill goal" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="budget-card-footer">
                      <span>₹{g.savedAmount.toFixed(2)} saved</span>
                      <span>of ₹{g.targetAmount.toFixed(2)}</span>
                    </div>
                    <button className="goal-contribute" onClick={() => handleContribute(g.id)} data-cursor-hover>
                      + Add Money
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}

export default Budget;