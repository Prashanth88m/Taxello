const localHost = window.location.hostname.includes(":")
  ? `[${window.location.hostname}]`
  : window.location.hostname;

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "");
// A single-service production deployment serves the React app and API from
// the same Express origin. Keep port 5000 only for local Vite development.
const apiBaseUrl = configuredApiUrl || (
  import.meta.env.DEV
    ? `${window.location.protocol}//${localHost}:5000`
    : ""
);

async function requestApi(path, options) {
  let response;

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      credentials: "include",
    });
  } catch {
    const message = import.meta.env.DEV
      ? "Could not reach the TAXELLO API. Start it with npm run server:dev and try again."
      : "Could not connect to the TAXELLO service. Check your connection and try again.";
    throw new Error(message);
  }

  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) {
    const error = new Error(result?.error || "The request could not be sent. Please try again.");
    error.status = response.status;
    throw error;
  }

  return result;
}

export function getApiRequest(path) {
  return requestApi(path, { method: "GET" });
}

export function postApiRequest(path, data) {
  return requestApi(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function patchApiRequest(path, data) {
  return requestApi(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function deleteApiRequest(path) {
  return requestApi(path, { method: "DELETE" });
}
