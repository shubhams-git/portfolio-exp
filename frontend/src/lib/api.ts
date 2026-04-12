const DEFAULT_DEV_API_BASE_URL = "http://127.0.0.1:8000";
const LOCAL_DEV_HOSTNAMES = new Set(["localhost", "127.0.0.1"]);

function sanitizeApiBaseUrl(value: string | undefined) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return "";
  }

  return trimmedValue.replace(/\/+$/, "");
}

export function getApiBaseUrl() {
  const configuredBaseUrl = sanitizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  if (typeof window !== "undefined" && LOCAL_DEV_HOSTNAMES.has(window.location.hostname)) {
    return DEFAULT_DEV_API_BASE_URL;
  }

  return "";
}

export function getContactEndpoint() {
  const apiBaseUrl = getApiBaseUrl();

  return apiBaseUrl ? `${apiBaseUrl}/api/contact` : null;
}
