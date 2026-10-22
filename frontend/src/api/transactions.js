import { apiFetch } from "./client";

export function getTransactions() {
  return apiFetch("/api/transactions");
}

export function createTransaction(data) {
  return apiFetch("/api/transactions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateTransaction(id, data) {
  return apiFetch(`/api/transactions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteTransaction(id) {
  return apiFetch(`/api/transactions/${id}`, { method: "DELETE" });
}

export function getDashboardSummary() {
  return apiFetch("/api/dashboard/summary");
}