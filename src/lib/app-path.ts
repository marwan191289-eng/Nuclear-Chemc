const APP_BASE_PATH = import.meta.env.BASE_URL || "/";
const SESSION_TOKEN_STORAGE_KEY = "nkh_session_token";

export function getStoredSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return (
      window.sessionStorage.getItem(SESSION_TOKEN_STORAGE_KEY) ||
      window.localStorage.getItem(SESSION_TOKEN_STORAGE_KEY)
    );
  } catch {
    return null;
  }
}

export function setStoredSessionToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      window.sessionStorage.setItem(SESSION_TOKEN_STORAGE_KEY, token);
      window.localStorage.setItem(SESSION_TOKEN_STORAGE_KEY, token);
    } else {
      window.sessionStorage.removeItem(SESSION_TOKEN_STORAGE_KEY);
      window.localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage restrictions
  }
}

export function appPath(path: string): string {
  if (/^(?:https?:|data:|blob:)/i.test(path)) return path;
  const normalizedPath = path.replace(/^\/+/, "");
  const base = APP_BASE_PATH.endsWith("/") ? APP_BASE_PATH : `${APP_BASE_PATH}/`;
  return `${base}${normalizedPath}`;
}

/**
 * Safe wrapper around window.fetch that never mutates window.fetch (preventing
 * "Cannot set property fetch of #<Window> which has only a getter" in iframe sandboxes)
 * while automatically attaching and persisting X-Session-Token for API requests.
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const urlStr =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;

  const isApiCall =
    urlStr.includes("/api/") || urlStr.includes("/_nuclear-knowledge-api/");

  const headers = new Headers(
    init?.headers || (input instanceof Request ? input.headers : undefined),
  );

  if (isApiCall) {
    const token = getStoredSessionToken();
    if (token && !headers.has("X-Session-Token")) {
      headers.set("X-Session-Token", token);
    }
  }

  const response = await window.fetch(input, {
    ...init,
    credentials: init?.credentials ?? "include",
    headers,
  });

  if (isApiCall) {
    if (urlStr.endsWith("/logout") && (response.ok || response.status === 204)) {
      setStoredSessionToken(null);
    } else {
      const responseToken = response.headers.get("X-Session-Token");
      if (responseToken) {
        setStoredSessionToken(responseToken);
      }
    }
  }

  return response;
}
