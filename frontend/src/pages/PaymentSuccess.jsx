import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { CheckCircleIcon, CopyIcon, ChevronDownIcon } from "../components/icons";
import "./PaymentSuccess.css";

function PaymentSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const checkRef = useRef(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!state) navigate("/dashboard", { replace: true });
  }, [state, navigate]);

  useEffect(() => {
    if (checkRef.current) {
      gsap.fromTo(checkRef.current, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.9)" });
    }
  }, []);

  if (!state) return null;

  const { merchantName, merchantCity, amount, transaction } = state;
  const txId = transaction ? `FSN${transaction.id}${Date.now().toString().slice(-6)}` : "—";
  const date = transaction?.createdAt ? new Date(transaction.createdAt).toLocaleString() : new Date().toLocaleString();

  const handleCopy = () => {
    navigator.clipboard?.writeText(txId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="success-page">
      <div className="success-icon" ref={checkRef}>
        <CheckCircleIcon width={48} height={48} />
      </div>

      <p className="success-title">Payment Successful!</p>
      <p className="success-amount">₹{Number(amount).toFixed(0)}</p>
      <p className="success-merchant">Paid to {merchantName}</p>
      <p className="success-date">{date}</p>

      <div className="success-txid-box">
        <span>Transaction ID</span>
        <div className="success-txid-row">
          <span>{txId}</span>
          <button onClick={handleCopy} data-cursor-hover><CopyIcon width={14} height={14} /></button>
        </div>
        {copied && <span className="success-copied">Copied!</span>}
      </div>

      <button className="success-receipt-toggle" onClick={() => setShowReceipt((s) => !s)} data-cursor-hover>
        View Receipt <ChevronDownIcon width={16} height={16} style={{ transform: showReceipt ? "rotate(180deg)" : "none" }} />
      </button>

      {showReceipt && (
        <div className="success-receipt-details">
          <div><span>Merchant</span><span>{merchantName}</span></div>
          {merchantCity && <div><span>Location</span><span>{merchantCity}</span></div>}
          <div><span>Payment Method</span><span>SBI Bank •••• 4582</span></div>
          <div><span>Status</span><span className="status-success">Completed</span></div>
        </div>
      )}

      <button className="success-done" onClick={() => navigate("/dashboard")} data-cursor-hover>
        Done
      </button>
    </div>
  );
}

export default PaymentSuccess;