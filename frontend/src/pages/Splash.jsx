import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useAuth } from "../context/AuthContext";
import { WalletIconSvg } from "../components/icons";
import "./Splash.css";

function Splash() {
  const navigate = useNavigate();
  const { token, loading } = useAuth();
  const iconRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(iconRef.current, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" })
      .fromTo(textRef.current.children, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, "-=0.2");
  }, []);

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      navigate(token ? "/dashboard" : "/login", { replace: true });
    }, 2200);
    return () => clearTimeout(timer);
  }, [loading, token, navigate]);

  return (
    <div className="splash-page">
      <div className="splash-icon" ref={iconRef}>
        <WalletIconSvg width={40} height={40} />
      </div>
      <div ref={textRef}>
        <h1 className="splash-title">FinSync</h1>
        <p className="splash-tagline">Your Money. Smarter.</p>
        <p className="splash-links">Pay &bull; Save &bull; Split &bull; Track &bull; Convert</p>
      </div>
    </div>
  );
}

export default Splash;