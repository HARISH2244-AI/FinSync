import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getWallet } from "../api/wallet";
import MagneticButton from "../components/MagneticButton";
import { ArrowLeftIcon } from "../components/icons";
import "./PayMerchant.css";

function PayMerchant() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const merchantName = state?.merchantName || "Unknown Merchant";
  const merchantCity = state?.merchantCity || "";

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    getWallet().then((w) => setBalance(w.balance)).catch(() => {});
  }, []);

  const handlePay = (e) => {
    e.preventDefault();
    setError("");
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError("Enter a valid amount");
      return;
    }
    if (balance !== null && amt > balance) {
      setError("Insufficient wallet balance");
      return;
    }
    navigate("/payment-processing", { state: { merchantName, merchantCity, amount: amt, note } });
  };

  return (
    <div className="paymerchant-page">
      <div className="paymerchant-header">
        <button onClick={() => navigate(-1)} data-cursor-hover><ArrowLeftIcon /></button>
        <h1>Scan & Pay</h1>
        <span style={{ width: 20 }} />
      </div>

      <div className="paymerchant-content">
        <div className="merchant-avatar">{merchantName.charAt(0).toUpperCase()}</div>
        <h2 className="merchant-name">{merchantName}</h2>
        {merchantCity && <p className="merchant-city">{merchantCity}</p>}

        <form onSubmit={handlePay} className="paymerchant-form">
          <label className="paymerchant-label">Enter Amount</label>
          <div className="paymerchant-amount-row">
            <span>₹</span>
            <input
              type="number" step="0.01" min="0.01" placeholder="0"
              value={amount} onChange={(e) => setAmount(e.target.value)} required autoFocus
            />
          </div>

          <input
            type="text" className="paymerchant-note" placeholder="Add a note (optional)"
            value={note} onChange={(e) => setNote(e.target.value)}
          />

          {error && <p className="auth-error">{error}</p>}

          <p className="paymerchant-pay-label">Pay Using</p>
          <div className="paymerchant-bank-row">
            <span className="paymerchant-bank-icon">🏦</span>
            <div>
              <p>SBI Bank</p>
              <span>•••• 4582</span>
            </div>
          </div>

          <MagneticButton type="submit">Pay Now</MagneticButton>
        </form>
      </div>
    </div>
  );
}

export default PayMerchant;