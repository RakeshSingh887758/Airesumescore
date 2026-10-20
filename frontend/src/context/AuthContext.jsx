import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { authRequest } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("authToken")
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
  }, []);

  // Validate the stored token when the application loads.
  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      const savedToken = localStorage.getItem("authToken");

      if (!savedToken) {
        if (active) setLoading(false);
        return;
      }

      try {
        const data = await authRequest("/me", {
          token: savedToken,
        });

        if (active) {
          setToken(savedToken);
          setUser(data.user);
        }
      } catch {
        if (active) clearAuth();
      } finally {
        if (active) setLoading(false);
      }
    };

    restoreSession();

    return () => {
      active = false;
    };
  }, [clearAuth]);

  const saveSession = (data) => {
    if (!data.token) {
      throw new Error("The server did not return an authentication token");
    }

    localStorage.setItem("authToken", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const login = async (credentials) => {
    const data = await authRequest("/login", {
      method: "POST",
      body: credentials,
    });

    saveSession(data);
    return data;
  };

  const register = async (details) => {
    const data = await authRequest("/register", {
      method: "POST",
      body: details,
    });

    saveSession(data);
    return data;
  };

  const logout = async () => {
    const currentToken = token;

    try {
      if (currentToken) {
        await authRequest("/logout", {
          method: "POST",
          token: currentToken,
        });
      }
    } catch (error) {
      // An expired or already-invalid token cannot be used again.
      if (error.status !== 401) {
        throw error;
      }
    }

    clearAuth();
  };

  const forgotPassword = (email) =>
    authRequest("/forgot-password", {
      method: "POST",
      body: { email },
    });

  const resetPassword = (token, password) =>
    authRequest("/reset-password", {
      method: "POST",
      body: { token, password },
    });

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}