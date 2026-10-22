import { apiFetch } from "./client";

export const getBudgets = (month, year) => apiFetch(`/api/budgets?month=${month}&year=${year}`);
export const createBudget = (data) => apiFetch("/api/budgets", { method: "POST", body: JSON.stringify(data) });
export const deleteBudget = (id) => apiFetch(`/api/budgets/${id}`, { method: "DELETE" });

export const getSavingsGoals = () => apiFetch("/api/savings-goals");
export const createSavingsGoal = (data) => apiFetch("/api/savings-goals", { method: "POST", body: JSON.stringify(data) });
export const contributeSavingsGoal = (id, data) =>
  apiFetch(`/api/savings-goals/${id}/contribute`, { method: "POST", body: JSON.stringify(data) });
export const deleteSavingsGoal = (id) => apiFetch(`/api/savings-goals/${id}`, { method: "DELETE" });