import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MagneticButton from "../components/MagneticButton";
import { WalletIconSvg, MailIcon, LockIcon, EyeIcon, EyeOffIcon } from "../components/icons";
import "./Auth.css";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/loading");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><WalletIconSvg width={26} height={26} /></div>
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Login to continue your journey</p>

        <form onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <MailIcon width={18} height={18} />
            <input type="email" placeholder="Enter your email" value={email}
              onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="auth-input-group">
            <LockIcon width={18} height={18} />
            <input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password}
              onChange={(e) => setPassword(e.target.value)} required />
            <button type="button" onClick={() => setShowPassword((s) => !s)}>
              {showPassword ? <EyeOffIcon width={16} height={16} /> : <EyeIcon width={16} height={16} />}
            </button>
          </div>

          <div className="auth-row">
            <label className="auth-remember">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
            <button type="button" className="auth-forgot" onClick={() => alert("Password reset isn't available in this demo.")}>
              Forgot Password?
            </button>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <MagneticButton type="submit">{submitting ? "Logging in..." : "Login"}</MagneticButton>
        </form>

        <div className="auth-divider">OR</div>

        <button className="auth-google-btn" onClick={() => alert("Google login isn't available in this demo.")} data-cursor-hover>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.52 12.27c0-.85-.07-1.47-.22-2.12H12v3.85h6.56c-.13 1.09-.85 2.73-2.44 3.84l-.02.15 3.55 2.75.25.02c2.26-2.09 3.62-5.17 3.62-8.49z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.78-2.93c-1.01.7-2.37 1.19-4.15 1.19-3.18 0-5.88-2.09-6.84-5.33l-.14.01-3.7 2.86-.05.14C3.28 21.3 7.36 24 12 24z" />
            <path fill="#FBBC05" d="M5.16 14.02a7.6 7.6 0 01-.4-2.02c0-.7.14-1.38.39-2.02l-.01-.14-3.75-2.9-.12.06A11.97 11.97 0 000 12c0 1.93.47 3.76 1.27 5.37l3.89-3.35z" />
            <path fill="#EA4335" d="M12 4.75c2.25 0 3.77.97 4.64 1.78l3.39-3.3C17.94 1.19 15.24 0 12 0 7.36 0 3.28 2.7 1.27 6.63l3.88 3.35C6.12 6.74 8.82 4.75 12 4.75z" />
          </svg>
          Continue with Google
        </button>

        <p className="auth-switch">
          Don't have an account? <Link to="/register" data-cursor-hover>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;