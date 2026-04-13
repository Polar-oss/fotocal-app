const DEFAULT_APP_URL = "http://localhost:3000";

function normalizeUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const url = trimmedValue.startsWith("http")
    ? trimmedValue
    : `https://${trimmedValue}`;

  return url.replace(/\/$/, "");
}

export function getAppUrl() {
  return (
    normalizeUrl(process.env.NEXT_PUBLIC_APP_URL) ??
    normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    DEFAULT_APP_URL
  );
}

export function getBaseUrl() {
  return new URL(getAppUrl());
}
