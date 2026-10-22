import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WalletIconSvg } from "../components/icons";
import "./LoadingScreen.css";

function LoadingScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/dashboard", { replace: true }), 1400);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="loading-page">
      <div className="loading-icon">
        <WalletIconSvg width={32} height={32} />
      </div>
      <p className="loading-title">Loading your dashboard...</p>
      <p className="loading-sub">Fetching your latest transactions</p>
      <div className="loading-dots">
        <span /><span /><span />
      </div>
    </div>
  );
}

export default LoadingScreen;