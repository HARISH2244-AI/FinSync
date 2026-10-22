import { useEffect, useState } from "react";
import { convertCurrency, getRates } from "../api/currency";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import MagneticButton from "../components/MagneticButton";
import "./Currency.css";

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AED", "SGD", "AUD", "CAD"];

function Currency() {
  const [amount, setAmount] = useState("100");
  const [to, setTo] = useState("USD");
  const [result, setResult] = useState(null);
  const [rates, setRates] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getRates("INR").then(setRates).catch(() => {});
  }, []);

  const handleConvert = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await convertCurrency("INR", to, amount);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <PageHeader title="Currency Converter" subtitle="INR to world currencies" />
      <div className="currency-page">
        <form className="currency-form" onSubmit={handleConvert}>
          <div className="currency-input-row">
            <span className="currency-fixed">₹ INR</span>
            <input
              type="number" step="0.01" min="0.01"
              value={amount} onChange={(e) => setAmount(e.target.value)} required
            />
          </div>
          <div className="currency-arrow">↓</div>
          <div className="currency-input-row">
            <select value={to} onChange={(e) => setTo(e.target.value)}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className="currency-result-preview">
              {result ? result.convertedAmount : "—"}
            </span>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <MagneticButton type="submit">{loading ? "Converting..." : "Convert"}</MagneticButton>
        </form>

        {result && (
          <div className="currency-result-card">
            <p>₹{Number(result.amount).toFixed(2)} = {result.convertedAmount} {result.to}</p>
            <p className="currency-rate">1 INR = {result.rate} {result.to}</p>
          </div>
        )}

        {rates?.rates && (
          <div className="currency-rates-grid">
            <h2 className="wallet-section-title">Live Rates (Base: INR)</h2>
            <ul>
              {Object.entries(rates.rates).map(([cur, val]) => (
                <li key={cur}>
                  <span>{cur}</span>
                  <span>{val}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default Currency;