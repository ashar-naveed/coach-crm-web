const API_BASE = "https://mumkin-demo.freehosting.dev/api";

export async function apiFetch(endpoint, options = {}) {
  const response = await fetch(API_BASE + endpoint, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
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
