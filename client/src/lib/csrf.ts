let csrfToken: string | null = null;

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Fetches a CSRF token from the server and caches it for the session.
 * The server sets a csrfToken cookie; we read it back as a header on mutations.
 */
export async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  const res = await fetch(`${API}/api/csrf-token`, { credentials: "include" });
  const data = await res.json();
  csrfToken = data.csrfToken as string;
  return csrfToken;
}

/** Call this after logout to clear the cached token */
export function clearCsrfToken() {
  csrfToken = null;
}
