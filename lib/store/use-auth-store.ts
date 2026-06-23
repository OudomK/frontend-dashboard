import { create } from "zustand";
import { apiClient } from "../api-client";

interface UserInfo {
  email: string;
  roleId: number;
  avatarUrl?: string;
  name?: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  roleId: number | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, expectedRole: "admin" | "doctor") => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => void;
  updateAvatar: (url: string) => void;
  updateName: (name: string) => void;
}

// Helper to decode JWT payload without external libraries
function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode JWT token", e);
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Listen to session expired events from Axios client
  if (typeof window !== "undefined") {
    window.addEventListener("auth:logout", () => {
      set({
        token: null,
        refreshToken: null,
        roleId: null,
        user: null,
        isAuthenticated: false,
      });
    });
  }

  return {
    token: null,
    refreshToken: null,
    roleId: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,

    login: async (email, password, expectedRole) => {
      set({ isLoading: true });
      try {
        // Construct standard OAuth2 / Form url-encoded request body
        const params = new URLSearchParams();
        params.append("username", email);
        params.append("password", password);

        const response = await apiClient.post("/api/v1/users/login", params, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });

        const { access_token, refresh_token, role_id } = response.data;

        // Verify role mapping compatibility
        // Role ID mappings: 2 = doctor, 3 = admin
        if (expectedRole === "admin" && role_id !== 3) {
          throw new Error("Unauthorized: This account does not have admin permissions.");
        }
        if (expectedRole === "doctor" && role_id !== 2) {
          throw new Error("Unauthorized: This account does not have doctor permissions.");
        }

        // Save tokens in local storage
        localStorage.setItem("women_health_access_token", access_token);
        localStorage.setItem("women_health_refresh_token", refresh_token);
        localStorage.setItem("women_health_role_id", String(role_id));
        localStorage.setItem("women_health_user_email", email);

        // Fetch User Profile to retrieve avatar and name if present
        let avatarUrl = undefined;
        let fullName = undefined;
        try {
          const profileResponse = await apiClient.get("/api/v1/users/me", {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          });
          avatarUrl = profileResponse.data.avatar_url;
          fullName = profileResponse.data.full_name;
          
          if (avatarUrl) {
            // Ensure full URL is stored
            if (!avatarUrl.startsWith('http')) {
              avatarUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${avatarUrl}`;
            }
            localStorage.setItem("women_health_avatar_url", avatarUrl);
          }
        } catch (profileError) {
          console.warn("Could not fetch user profile details", profileError);
        }

        const decoded = decodeJwt(access_token);
        
        let formattedName = fullName;
        if (!formattedName) {
          const namePart = email.split("@")[0];
          formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        }
        localStorage.setItem("women_health_user_name", formattedName);

        set({
          token: access_token,
          refreshToken: refresh_token,
          roleId: role_id,
          user: {
            email: email,
            roleId: role_id,
            avatarUrl: avatarUrl,
            name: formattedName,
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error: any) {
        set({ isLoading: false });
        const errMsg = error.response?.data?.detail || error.message || "Failed to log in. Please check your credentials.";
        throw new Error(errMsg);
      }
    },

    logout: async () => {
      const currentRefreshToken = get().refreshToken || localStorage.getItem("women_health_refresh_token");
      const currentRoleId = get().roleId;
      
      try {
        if (currentRefreshToken) {
          // Send logout to backend with refresh token
          await apiClient.post(`/api/v1/users/logout?refresh_token=${currentRefreshToken}`);
        }
      } catch (error) {
        console.error("Backend logout error", error);
      } finally {
        // Clear tokens from local storage
        localStorage.removeItem("women_health_access_token");
        localStorage.removeItem("women_health_refresh_token");
        localStorage.removeItem("women_health_role_id");
        localStorage.removeItem("women_health_user_email");
        localStorage.removeItem("women_health_user_name");
        localStorage.removeItem("women_health_avatar_url");

        set({
          token: null,
          refreshToken: null,
          roleId: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });

        // Redirect appropriately
        if (typeof window !== "undefined") {
          if (currentRoleId === 3) {
            window.location.href = "/auth/admin-login";
          } else {
            window.location.href = "/auth/doctor-login";
          }
        }
      }
    },

    initialize: () => {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("women_health_access_token");
      const refreshToken = localStorage.getItem("women_health_refresh_token");
      const roleIdStr = localStorage.getItem("women_health_role_id");
      const email = localStorage.getItem("women_health_user_email");
      const avatarUrl = localStorage.getItem("women_health_avatar_url") || undefined;
      const name = localStorage.getItem("women_health_user_name") || undefined;

      if (token && refreshToken && roleIdStr && email) {
        const roleId = Number(roleIdStr);
        set({
          token,
          refreshToken,
          roleId,
          user: {
            email,
            roleId,
            avatarUrl,
            name,
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    },

    updateAvatar: (url) => {
      const currentUser = get().user;
      if (currentUser) {
        localStorage.setItem("women_health_avatar_url", url);
        set({
          user: {
            ...currentUser,
            avatarUrl: url,
          },
        });
      }
    },

    updateName: (name) => {
      const currentUser = get().user;
      if (currentUser) {
        localStorage.setItem("women_health_user_name", name);
        set({
          user: {
            ...currentUser,
            name: name,
          },
        });
      }
    },
  };
});
