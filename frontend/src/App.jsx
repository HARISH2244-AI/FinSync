import { Routes, Route, Navigate } from "react-router-dom";
import Splash from "./pages/Splash.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import LoadingScreen from "./pages/LoadingScreen.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Transactions from "./pages/Transactions.jsx";
import Wallet from "./pages/Wallet.jsx";
import Budget from "./pages/Budget.jsx";
import Split from "./pages/Split.jsx";
import Currency from "./pages/Currency.jsx";
import ScanPay from "./pages/ScanPay.jsx";
import PayMerchant from "./pages/PayMerchant.jsx";
import PaymentProcessing from "./pages/PaymentProcessing.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/loading" element={<ProtectedRoute><LoadingScreen /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
      <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
      <Route path="/budget" element={<ProtectedRoute><Budget /></ProtectedRoute>} />
      <Route path="/split" element={<ProtectedRoute><Split /></ProtectedRoute>} />
      <Route path="/currency" element={<ProtectedRoute><Currency /></ProtectedRoute>} />
      <Route path="/scan-pay" element={<ProtectedRoute><ScanPay /></ProtectedRoute>} />
      <Route path="/pay-merchant" element={<ProtectedRoute><PayMerchant /></ProtectedRoute>} />
      <Route path="/payment-processing" element={<ProtectedRoute><PaymentProcessing /></ProtectedRoute>} />
      <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;