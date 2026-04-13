export function normalizeAppPath(
  path: string | null | undefined,
  fallback = "/app",
) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }

  return path;
}
