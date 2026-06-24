const API_BASE = "https://coach-crm-backend-production.up.railway.app/api";

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(API_BASE + endpoint, {
    headers,
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (endpoint) => apiFetch(endpoint),
  post: (endpoint, body) =>
    apiFetch(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: (endpoint, body) =>
    apiFetch(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  patch: (endpoint, body = {}) =>
    apiFetch(endpoint, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (endpoint) => apiFetch(endpoint, { method: "DELETE" }),
};
