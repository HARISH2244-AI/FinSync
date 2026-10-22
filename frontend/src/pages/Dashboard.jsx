import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useAuth } from "../context/AuthContext";
import { getDashboardSummary, getTransactions } from "../api/transactions";
import { getWallet, topupWallet, withdrawWallet } from "../api/wallet";
import { getBudgets, getSavingsGoals } from "../api/budget";
import AnimatedNumber from "../components/AnimatedNumber";
import AppShell from "../components/AppShell";
import {
  SearchIcon, BellIcon, UserIcon, ScanIcon, SendIcon, GroupIcon,
  MoneyBagIcon, GlobeIcon, PlusIcon, ArrowUpRightIcon, ArrowDownIcon, TrendUpIcon,
} from "../components/icons";
import "./Dashboard.css";

const QUICK_ACTIONS = [
  { to: "/scan-pay", label: "Scan & Pay", sub: "Pay using UPI", Icon: ScanIcon, tone: "purple" },
  { to: "/transactions", label: "Send Money", sub: "To Contacts", Icon: SendIcon, tone: "blue" },
  { to: "/split", label: "Split Bill", sub: "Share Expenses", Icon: GroupIcon, tone: "orange" },
  { to: "/wallet", label: "Request Money", sub: "Get Paid", Icon: MoneyBagIcon, tone: "green" },
  { to: "/currency", label: "Convert Currency", sub: "Worldwide", Icon: GlobeIcon, tone: "purple" },
];

const CHART_COLORS = ["#6C4BF4", "#F43F7D", "#FB923C", "#3B82F6", "#22C55E", "#FACC15"];

function monthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function Dashboard() {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [allTransactions, setAllTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState("");
  const actionsRef = useRef(null);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  useEffect(() => {
    Promise.all([
      getDashboardSummary(),
      getWallet(),
      getTransactions(),
      getBudgets(month, year),
      getSavingsGoals(),
    ])
      .then(([s, w, tx, b, g]) => {
        setSummary(s);
        setWallet(w);
        setAllTransactions(tx);
        setBudgets(b);
        setGoals(g);
      })
      .catch((err) => setError(err.message || "Failed to load dashboard"));
  }, []);

  useEffect(() => {
    if (actionsRef.current) {
      gsap.fromTo(
        actionsRef.current.children,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power3.out" }
      );
    }
  }, [summary]);

  const handleQuickWalletAction = async (action) => {
    const amountStr = prompt(action === "topup" ? "Amount to add:" : "Amount to withdraw:");
    if (!amountStr || parseFloat(amountStr) <= 0) return;
    try {
      const data = action === "topup"
        ? await topupWallet({ amount: parseFloat(amountStr), note: "Quick add" })
        : await withdrawWallet({ amount: parseFloat(amountStr), note: "Quick withdraw" });
      setWallet(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Spending overview: current month expenses grouped by category
  const thisMonthKey = `${year}-${now.getMonth()}`;
  const lastMonthDate = new Date(year, now.getMonth() - 1, 1);
  const lastMonthKey = monthKey(lastMonthDate);

  const thisMonthExpenses = allTransactions.filter(
    (t) => t.type === "EXPENSE" && monthKey(t.date) === thisMonthKey
  );
  const lastMonthExpenses = allTransactions.filter(
    (t) => t.type === "EXPENSE" && monthKey(t.date) === lastMonthKey
  );

  const totalThisMonth = thisMonthExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalLastMonth = lastMonthExpenses.reduce((sum, t) => sum + Number(t.amount), 0);

  const categoryTotals = {};
  thisMonthExpenses.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
  });
  const categoryEntries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  let cumulative = 0;
  const gradientParts = categoryEntries.map(([cat, amt], i) => {
    const pct = totalThisMonth > 0 ? (amt / totalThisMonth) * 100 : 0;
    const start = cumulative;
    cumulative += pct;
    return `${CHART_COLORS[i % CHART_COLORS.length]} ${start}% ${cumulative}%`;
  });
  const donutStyle = {
    background: gradientParts.length > 0
      ? `conic-gradient(${gradientParts.join(", ")})`
      : "var(--color-primary-light)",
  };

  const spendingChange = totalLastMonth > 0
    ? Math.round(((totalLastMonth - totalThisMonth) / totalLastMonth) * 100)
    : null;

  const topGoal = goals[0];
  const topBudget = budgets[0];
  const overBudgetCount = budgets.filter((b) => b.spent > b.monthlyLimit).length;

  return (
    <AppShell>
      <div className="phonepe-header">
        <div className="phonepe-greeting">
          <span className="phonepe-avatar">{user?.name?.charAt(0)?.toUpperCase()}</span>
          <div>
            <p className="phonepe-hello">Hi, {user?.name} 👋</p>
            <p className="phonepe-sub">Welcome back to FinSync</p>
          </div>
        </div>
        <div className="phonepe-header-icons">
          <button className="icon-btn" data-cursor-hover><SearchIcon /></button>
          <button className="icon-btn" data-cursor-hover>
            <BellIcon />
            {overBudgetCount > 0 && <span className="icon-badge">{overBudgetCount}</span>}
          </button>
          <div className="profile-menu-wrap">
            <button className="icon-btn" data-cursor-hover onClick={() => setMenuOpen((o) => !o)}>
              <UserIcon />
            </button>
            {menuOpen && (
              <div className="profile-dropdown">
                <button onClick={logout} data-cursor-hover>Log Out</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="phonepe-banner">
        <div>
          <h1 className="phonepe-banner-title">FinSync</h1>
          <p className="phonepe-banner-tagline">Your Money. Smarter.</p>
          <p className="phonepe-banner-links">Pay &bull; Save &bull; Split &bull; Track &bull; Convert</p>
        </div>
        <div className="phonepe-banner-side">
          <p>All your finances in one place</p>
        </div>
        <div className="phonepe-banner-dots">
          <span className="dot-indicator active" />
          <span className="dot-indicator" />
          <span className="dot-indicator" />
        </div>
      </div>

      {error && <p className="auth-error" style={{ padding: "0 20px" }}>{error}</p>}

      <div className="phonepe-wallet-card">
        <div className="phonepe-wallet-left">
          <span className="phonepe-wallet-icon"><MoneyBagIcon width={22} height={22} /></span>
          <div>
            <p className="phonepe-wallet-label">Wallet Balance</p>
            <p className="phonepe-wallet-value">
              <AnimatedNumber value={wallet?.balance ?? 0} />
            </p>
          </div>
        </div>
        <div className="phonepe-wallet-actions">
          <button className="wallet-round-btn green" onClick={() => handleQuickWalletAction("topup")} data-cursor-hover>
            <PlusIcon />
            <span>Add Money</span>
          </button>
          <Link to="/transactions" className="wallet-round-btn purple" data-cursor-hover>
            <ArrowUpRightIcon />
            <span>Send Money</span>
          </Link>
          <button className="wallet-round-btn red" onClick={() => handleQuickWalletAction("withdraw")} data-cursor-hover>
            <ArrowDownIcon />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      <div className="phonepe-quick-actions" ref={actionsRef}>
        {QUICK_ACTIONS.map((action, i) => (
          <Link key={i} to={action.to} className="phonepe-action" data-cursor-hover>
            <span className={`phonepe-action-icon ${action.tone}`}><action.Icon width={20} height={20} /></span>
            <span className="phonepe-action-label">{action.label}</span>
            <span className="phonepe-action-sub">{action.sub}</span>
          </Link>
        ))}
      </div>

      <div className="phonepe-two-col">
        <div className="phonepe-card">
          <div className="phonepe-card-header">
            <h2>Recent Transactions</h2>
            <Link to="/transactions" data-cursor-hover>View All →</Link>
          </div>
          {summary?.recentTransactions?.length === 0 || !summary ? (
            <p className="empty-state">No transactions yet.</p>
          ) : (
            <ul className="phonepe-list">
              {summary.recentTransactions.slice(0, 4).map((t) => (
                <li key={t.id} className="phonepe-list-row">
                  <div className={`phonepe-list-icon ${t.type === "INCOME" ? "income" : "expense"}`}>
                    {t.type === "INCOME" ? <ArrowDownIcon width={16} height={16} /> : <ArrowUpRightIcon width={16} height={16} />}
                  </div>
                  <div className="phonepe-list-info">
                    <span className="phonepe-list-title">{t.category}</span>
                    <span className="phonepe-list-desc">{t.description || t.date}</span>
                  </div>
                  <span className={`phonepe-list-amount ${t.type === "INCOME" ? "positive" : "negative"}`}>
                    {t.type === "INCOME" ? "+" : "-"}₹{Number(t.amount).toFixed(0)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="phonepe-card">
          <div className="phonepe-card-header">
            <h2>Spending Overview</h2>
            <span className="period-pill">This Month</span>
          </div>

          <div className="donut-wrap">
            <div className="donut-chart" style={donutStyle}>
              <div className="donut-center">
                <span className="donut-total">₹{totalThisMonth.toFixed(0)}</span>
                <span className="donut-total-label">Total Spent</span>
              </div>
            </div>
            <ul className="donut-legend">
              {categoryEntries.length === 0 ? (
                <li className="empty-state">No expenses this month</li>
              ) : (
                categoryEntries.map(([cat, amt], i) => (
                  <li key={cat}>
                    <span className="legend-dot" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    {cat}
                    <strong>{totalThisMonth > 0 ? Math.round((amt / totalThisMonth) * 100) : 0}%</strong>
                  </li>
                ))
              )}
            </ul>
          </div>

          {spendingChange !== null && (
            <div className={`spending-strip ${spendingChange >= 0 ? "down" : "up"}`}>
              <span className="spending-strip-icon"><TrendUpIcon width={18} height={18} /></span>
              <div>
                <p>You're spending <strong>{Math.abs(spendingChange)}% {spendingChange >= 0 ? "less" : "more"}</strong></p>
                <span>than last month</span>
              </div>
              <span className="spending-strip-amount">
                {spendingChange >= 0 ? "↓" : "↑"} ₹{Math.abs(totalLastMonth - totalThisMonth).toFixed(0)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="phonepe-two-col">
        <div className="phonepe-card">
          <div className="phonepe-card-header">
            <h2>Savings Goals</h2>
            <Link to="/budget" data-cursor-hover>View All →</Link>
          </div>
          {!topGoal ? (
            <p className="empty-state">No savings goals yet.</p>
          ) : (
            <div className="mini-progress-row">
              <span className="mini-progress-icon home">🏠</span>
              <div className="mini-progress-info">
                <p>{topGoal.name}</p>
                <span>₹{Number(topGoal.savedAmount).toLocaleString("en-IN")} / ₹{Number(topGoal.targetAmount).toLocaleString("en-IN")}</span>
                <div className="mini-progress-track">
                  <div className="mini-progress-fill goal"
                    style={{ width: `${Math.min(100, (topGoal.savedAmount / topGoal.targetAmount) * 100)}%` }} />
                </div>
              </div>
              <span className="mini-progress-pct">
                {Math.round((topGoal.savedAmount / topGoal.targetAmount) * 100)}%
              </span>
            </div>
          )}
        </div>

        <div className="phonepe-card">
          <div className="phonepe-card-header">
            <h2>Monthly Budget</h2>
            <Link to="/budget" data-cursor-hover>View All →</Link>
          </div>
          {!topBudget ? (
            <p className="empty-state">No budgets set.</p>
          ) : (
            <div className="mini-progress-row">
              <span className="mini-progress-icon food">🍽️</span>
              <div className="mini-progress-info">
                <p>{topBudget.category}</p>
                <span>₹{Number(topBudget.spent).toLocaleString("en-IN")} / ₹{Number(topBudget.monthlyLimit).toLocaleString("en-IN")}</span>
                <div className="mini-progress-track">
                  <div className={`mini-progress-fill ${topBudget.spent > topBudget.monthlyLimit ? "over" : "budget"}`}
                    style={{ width: `${Math.min(100, (topBudget.spent / topBudget.monthlyLimit) * 100)}%` }} />
                </div>
              </div>
              <span className="mini-progress-pct">
                {Math.round((topBudget.spent / topBudget.monthlyLimit) * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default Dashboard;