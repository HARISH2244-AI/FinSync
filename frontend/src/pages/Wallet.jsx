import { useEffect, useState } from "react";
import { getWallet, topupWallet, withdrawWallet } from "../api/wallet";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import MagneticButton from "../components/MagneticButton";
import AnimatedNumber from "../components/AnimatedNumber";
import "./Wallet.css";

function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const load = () => getWallet().then(setWallet).catch((e) => setError(e.message));

  useEffect(() => { load(); }, []);

  const handleAction = async (action) => {
    setError("");
    if (!amount || parseFloat(amount) <= 0) {
      setError("Enter a valid amount");
      return;
    }
    try {
      const data = await action({ amount: parseFloat(amount), note });
      setWallet(data);
      setAmount("");
      setNote("");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <AppShell>
      <PageHeader title="Wallet" subtitle="Add money, send, or withdraw" />
      <div className="wallet-page">
        {wallet && (
          <div className="wallet-balance-card">
            <p className="wallet-balance-label">Available Balance</p>
            <p className="wallet-balance-value"><AnimatedNumber value={wallet.balance} /></p>
          </div>
        )}

        <div className="wallet-form">
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            type="text"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          {error && <p className="auth-error">{error}</p>}
          <div className="wallet-actions">
            <MagneticButton onClick={() => handleAction(topupWallet)}>Add Money</MagneticButton>
            <button className="wallet-withdraw" onClick={() => handleAction(withdrawWallet)} data-cursor-hover>
              Withdraw
            </button>
          </div>
        </div>

        <h2 className="wallet-section-title">Recent Wallet Activity</h2>
        {wallet && wallet.recentTransactions.length === 0 ? (
          <p className="empty-state">No wallet activity yet.</p>
        ) : (
          <ul className="phonepe-list">
            {wallet?.recentTransactions.map((t) => (
              <li key={t.id} className="phonepe-list-row">
                <div className={`phonepe-list-icon ${t.type === "CREDIT" ? "income" : "expense"}`}>
                  {t.type === "CREDIT" ? "⬇️" : "⬆️"}
                </div>
                <div className="phonepe-list-info">
                  <span className="phonepe-list-title">{t.note}</span>
                  <span className="phonepe-list-desc">{new Date(t.createdAt).toLocaleString()}</span>
                </div>
                <span className={`phonepe-list-amount ${t.type === "CREDIT" ? "positive" : "negative"}`}>
                  {t.type === "CREDIT" ? "+" : "-"}₹{Number(t.amount).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}

export default Wallet;