import { apiFetch } from "./client";

export const getWallet = () => apiFetch("/api/wallet");
export const topupWallet = (data) => apiFetch("/api/wallet/topup", { method: "POST", body: JSON.stringify(data) });
export const withdrawWallet = (data) => apiFetch("/api/wallet/withdraw", { method: "POST", body: JSON.stringify(data) });