import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("women_health_access_token");
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
      if (originalRequest.url?.includes("/api/users/refresh") || originalRequest.url?.includes("/api/users/login")) {
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

      const refreshToken = typeof window !== "undefined" ? localStorage.getItem("women_health_refresh_token") : null;

      if (!refreshToken) {
        isRefreshing = false;
        handleSessionExpired();
        return Promise.reject(error);
      }

      try {
        // Call refresh endpoint with refresh_token as query parameter
        const response = await axios.post(
          `${API_URL}/api/users/refresh`,
          null,
          {
            params: { refresh_token: refreshToken },
          }
        );

        const newAccessToken = response.data.access_token;
        
        if (typeof window !== "undefined") {
          localStorage.setItem("women_health_access_token", newAccessToken);
        }

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
    localStorage.removeItem("women_health_access_token");
    localStorage.removeItem("women_health_refresh_token");
    localStorage.removeItem("women_health_role_id");
    localStorage.removeItem("women_health_user_email");
    localStorage.removeItem("women_health_user_name");

    // Redirect to login if not already there
    if (!window.location.pathname.startsWith("/auth/")) {
      // Dispatch custom logout event so Zustand store knows
      window.dispatchEvent(new Event("auth:logout"));
      
      const currentRole = localStorage.getItem("women_health_role_id");
      if (currentRole === "3") {
        window.location.href = "/auth/admin-login";
      } else {
        window.location.href = "/auth/doctor-login";
      }
    }
  }
}
