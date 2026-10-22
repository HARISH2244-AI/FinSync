import { apiFetch } from "./client";

export const convertCurrency = (from, to, amount) =>
  apiFetch(`/api/currency/convert?from=${from}&to=${to}&amount=${amount}`);

export const getRates = (base = "INR") => apiFetch(`/api/currency/rates?base=${base}`);