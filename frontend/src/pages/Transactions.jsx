import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import MagneticButton from "../components/MagneticButton";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../api/transactions";
import "./Transactions.css";

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Salary", "Other"];

function emptyForm() {
  return {
    amount: "",
    type: "EXPENSE",
    category: "Food",
    description: "",
    date: new Date().toISOString().slice(0, 10),
  };
}

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const listRef = useRef(null);

  const load = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (err) {
      setError(err.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (listRef.current && listRef.current.children.length > 0) {
      gsap.fromTo(
        listRef.current.children,
        { opacity: 0, x: -16 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, [transactions]);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      amount: parseFloat(form.amount),
      type: form.type,
      category: form.category,
      description: form.description,
      date: form.date,
    };

    try {
      if (editingId) {
        await updateTransaction(editingId, payload);
      } else {
        await createTransaction(payload);
      }
      setForm(emptyForm());
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err.message || "Failed to save transaction");
    }
  };

  const handleEdit = (t) => {
    setEditingId(t.id);
    setForm({
      amount: String(t.amount),
      type: t.type,
      category: t.category,
      description: t.description || "",
      date: t.date,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      await load();
    } catch (err) {
      setError(err.message || "Failed to delete transaction");
    }
  };

  return (
    <AppShell>
      <PageHeader title="Transactions" subtitle="Add and manage income & expenses" />
      <div className="transactions-content">
        <form className="transaction-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Amount"
              value={form.amount}
              onChange={handleChange("amount")}
              required
            />
            <select value={form.type} onChange={handleChange("type")}>
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
            <select value={form.category} onChange={handleChange("category")}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <input
              type="text"
              placeholder="Description (optional)"
              value={form.description}
              onChange={handleChange("description")}
            />
            <input
              type="date"
              value={form.date}
              onChange={handleChange("date")}
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <div className="form-actions">
            <MagneticButton type="submit">
              {editingId ? "Update Transaction" : "Add Transaction"}
            </MagneticButton>
            {editingId && (
              <button type="button" className="cancel-edit" onClick={handleCancelEdit} data-cursor-hover>
                Cancel
              </button>
            )}
          </div>
        </form>

        {loading ? (
          <p className="empty-state">Loading...</p>
        ) : transactions.length === 0 ? (
          <p className="empty-state">No transactions yet.</p>
        ) : (
          <ul className="transaction-list" ref={listRef}>
            {transactions.map((t) => (
              <li key={t.id} className="transaction-row">
                <div>
                  <span className="transaction-category">{t.category}</span>
                  {t.description && <span className="transaction-desc"> — {t.description}</span>}
                  <span className="transaction-date"> · {t.date}</span>
                </div>
                <div className="transaction-actions">
                  <span className={`transaction-amount ${t.type === "INCOME" ? "positive" : "negative"}`}>
                    {t.type === "INCOME" ? "+" : "-"}₹{Number(t.amount).toFixed(2)}
                  </span>
                  <button onClick={() => handleEdit(t)} data-cursor-hover>Edit</button>
                  <button onClick={() => handleDelete(t.id)} data-cursor-hover>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}

export default Transactions;