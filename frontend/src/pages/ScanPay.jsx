import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import QRCode from "qrcode";
import { useAuth } from "../context/AuthContext";
import { ArrowLeftIcon } from "../components/icons";
import "./ScanPay.css";

function ScanPay() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState("scan"); // "scan" | "show"
  const [error, setError] = useState("");
  const scannerRef = useRef(null);
  const canvasRef = useRef(null);
  const containerId = "qr-reader";

  useEffect(() => {
    if (mode !== "scan") return;
    setError("");

    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 230, height: 230 } },
        (decodedText) => {
          scanner.stop().catch(() => {});
          let merchantName = decodedText;
          let merchantCity = "Scanned via QR";
          try {
            const parsed = JSON.parse(decodedText);
            if (parsed.merchant) merchantName = parsed.merchant;
            if (parsed.city) merchantCity = parsed.city;
          } catch {
            // plain text QR — use as-is
          }
          navigate("/pay-merchant", { state: { merchantName, merchantCity } });
        },
        () => {
          // per-frame scan failure — ignore, keeps scanning
        }
      )
      .catch(() => {
        setError("Couldn't access the camera. Check camera permissions, or try again.");
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
      }
    };
  }, [mode, navigate]);

  useEffect(() => {
    if (mode === "show" && canvasRef.current) {
      const payload = JSON.stringify({ merchant: user?.name || "FinSync User", upi: `${user?.email}@finsync` });
      QRCode.toCanvas(canvasRef.current, payload, { width: 220, margin: 1, color: { dark: "#1A1A2E", light: "#ffffff" } });
    }
  }, [mode, user]);

  return (
    <div className="scanpay-page">
      <div className="scanpay-header">
        <button onClick={() => navigate(-1)} data-cursor-hover><ArrowLeftIcon /></button>
        <h1>Scan & Pay</h1>
        <span style={{ width: 20 }} />
      </div>

      {mode === "scan" ? (
        <div className="scanpay-camera-wrap">
          <div id={containerId} className="scanpay-camera" />
          <div className="scanpay-frame-overlay">
            <span className="corner tl" /><span className="corner tr" />
            <span className="corner bl" /><span className="corner br" />
          </div>
          {error && <p className="scanpay-error">{error}</p>}
          <p className="scanpay-hint">Align the QR code within the frame</p>
        </div>
      ) : (
        <div className="scanpay-show-wrap">
          <canvas ref={canvasRef} className="scanpay-canvas" />
          <p className="scanpay-hint">Show this code to receive payment</p>
        </div>
      )}

      <div className="scanpay-tabs">
        <button className={mode === "scan" ? "active" : ""} onClick={() => setMode("scan")} data-cursor-hover>Scan QR</button>
        <button className={mode === "show" ? "active" : ""} onClick={() => setMode("show")} data-cursor-hover>Show QR</button>
      </div>
    </div>
  );
}

export default ScanPay;