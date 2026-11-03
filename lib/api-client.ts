import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const ACCESS_KEY = "women_health_access_token";
const REFRESH_KEY = "women_health_refresh_token";
const REFRESH_LOCK_NAME = "women-health-token-refresh";

// "Remember me" support: a remembered login keeps its tokens in localStorage
// (survives browser restarts, the pre-existing default); an unremembered one
// keeps them in sessionStorage (cleared when the tab/browser closes). Every
// reader checks both so either mode works transparently; every writer keeps
// using whichever storage is already active for a given login (so a
// mid-session token rotation doesn't silently "promote" a session-only login
// into a persisted one, or vice versa).
function getActiveTokenStore(): Storage {
  if (typeof window === "undefined") return localStorage;
  return sessionStorage.getItem(REFRESH_KEY) !== null ? sessionStorage : localStorage;
}

export function getToken(key: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key) ?? sessionStorage.getItem(key);
}

// remember=true/false picks the store for a fresh login; omitting it (token
// rotation) keeps using whichever store is already active.
export function setTokenPair(accessToken: string, refreshToken: string, remember?: boolean) {
  if (typeof window === "undefined") return;
  const store = remember === undefined ? getActiveTokenStore() : remember ? localStorage : sessionStorage;
  const other = store === localStorage ? sessionStorage : localStorage;
  other.removeItem(ACCESS_KEY);
  other.removeItem(REFRESH_KEY);
  store.setItem(ACCESS_KEY, accessToken);
  store.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokenPair() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
}

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = getToken(ACCESS_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Refresh tokens rotate on every refresh and travel in the JSON body (never
// the URL). Tabs share localStorage, so refreshes are serialized across tabs
// with the Web Locks API: a tab that waited for the lock reuses the tokens
// another tab just stored instead of presenting the already-rotated refresh
// token, which the server treats as reuse. Without Web Locks, the server
// answers such a concurrent refresh with 409 and this tab re-reads storage.
async function refreshAccessTokenAcrossTabs(): Promise<string> {
  const staleRefreshToken = getToken(REFRESH_KEY);

  const run = async (): Promise<string> => {
    const currentRefreshToken = getToken(REFRESH_KEY);
    if (!currentRefreshToken) {
      throw new Error("No refresh token");
    }

    // Another tab rotated the session while this tab waited for the lock
    const storedAccessToken = getToken(ACCESS_KEY);
    if (currentRefreshToken !== staleRefreshToken && storedAccessToken) {
      return storedAccessToken;
    }

    try {
      const response = await axios.post(`${API_URL}/api/v1/users/refresh`, {
        refresh_token: currentRefreshToken,
      });
      const { access_token, refresh_token } = response.data;
      setTokenPair(access_token, refresh_token);
      return access_token;
    } catch (err: any) {
      if (err?.response?.status === 409) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const rotatedRefreshToken = getToken(REFRESH_KEY);
        const rotatedAccessToken = getToken(ACCESS_KEY);
        if (rotatedRefreshToken && rotatedRefreshToken !== currentRefreshToken && rotatedAccessToken) {
          return rotatedAccessToken;
        }
      }
      throw err;
    }
  };

  const locks = typeof navigator !== "undefined" ? (navigator as any).locks : undefined;
  return locks?.request ? locks.request(REFRESH_LOCK_NAME, run) : run();
}

// Response interceptor to handle session refresh and token expiry
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 Unauthorized and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/api/v1/users/refresh") || originalRequest.url?.includes("/api/v1/users/login")) {
        // If login or refresh request fails with 401, reject immediately
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getToken(REFRESH_KEY);

      if (!refreshToken) {
        isRefreshing = false;
        handleSessionExpired();
        return Promise.reject(error);
      }

      try {
        const newAccessToken = await refreshAccessTokenAcrossTabs();

        // Retry failed queue requests
        processQueue(null, newAccessToken);
        
        // Update current request and retry
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        isRefreshing = false;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        handleSessionExpired();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

function handleSessionExpired() {
  if (typeof window !== "undefined") {
    clearTokenPair();
    localStorage.removeItem("women_health_role_id");
    localStorage.removeItem("women_health_user_email");
    localStorage.removeItem("women_health_user_name");

    // Redirect to login if not already there
    if (!window.location.pathname.startsWith("/auth/")) {
      // Dispatch custom logout event so Zustand store knows
      window.dispatchEvent(new Event("auth:logout"));
      window.location.href = "/auth/login";
    }
  }
}
