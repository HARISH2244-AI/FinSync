const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("finsync_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      isJson && body?.message
        ? body.message
        : typeof body === "string"
        ? body
        : "Request failed";
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return body;
}