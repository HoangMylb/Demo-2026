const RENDER_API_BASE_URL = 'https://hoangmydemo-api.onrender.com';

function isLocalHostname(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export function getApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (!configuredBaseUrl) {
    return RENDER_API_BASE_URL;
  }

  const isConfiguredLocalhost = configuredBaseUrl.includes('localhost') || configuredBaseUrl.includes('127.0.0.1');

  if (!isConfiguredLocalhost) {
    return configuredBaseUrl;
  }

  if (typeof window !== 'undefined' && isLocalHostname(window.location.hostname)) {
    return configuredBaseUrl;
  }

  return RENDER_API_BASE_URL;
}
