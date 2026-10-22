import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { withdrawWallet } from "../api/wallet";
import { SendIcon } from "../components/icons";
import "./PaymentProcessing.css";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function PaymentProcessing() {
  const navigate = useNavigate();
  const { state } = useLocation();

  useEffect(() => {
    if (!state) {
      navigate("/scan-pay", { replace: true });
      return;
    }

    const { merchantName, merchantCity, amount, note } = state;

    const run = async () => {
      try {
        const [walletResponse] = await Promise.all([
          withdrawWallet({ amount, note: note ? `${note} — Paid to ${merchantName}` : `Paid to ${merchantName}` }),
          wait(1400),
        ]);
        const transaction = walletResponse.recentTransactions[0];
        navigate("/payment-success", {
          replace: true,
          state: { merchantName, merchantCity, amount, transaction },
        });
      } catch (err) {
        navigate("/pay-merchant", {
          replace: true,
          state: { merchantName, merchantCity, error: err.message || "Payment failed" },
        });
      }
    };

    run();
  }, [state, navigate]);

  return (
    <div className="processing-page">
      <div className="processing-icon"><SendIcon width={28} height={28} /></div>
      <p className="processing-title">Processing Payment...</p>
      <p className="processing-sub">Please wait while we complete your transaction</p>
      <div className="loading-dots">
        <span /><span /><span />
      </div>
    </div>
  );
}

export default PaymentProcessing;