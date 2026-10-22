import { apiFetch } from "./client";

export const getSplitGroups = () => apiFetch("/api/split-groups");
export const getSplitGroup = (id) => apiFetch(`/api/split-groups/${id}`);
export const createSplitGroup = (data) => apiFetch("/api/split-groups", { method: "POST", body: JSON.stringify(data) });
export const addSplitExpense = (groupId, data) =>
  apiFetch(`/api/split-groups/${groupId}/expenses`, { method: "POST", body: JSON.stringify(data) });
export const deleteSplitGroup = (id) => apiFetch(`/api/split-groups/${id}`, { method: "DELETE" });