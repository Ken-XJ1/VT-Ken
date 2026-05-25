import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const TOKEN_KEY = 'vt_token';
const USER_KEY = 'vt_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Sincronizar con localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }, [user]);

  function login(newToken, userData) {
    setToken(newToken);
    setUser(userData);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  const isAuthenticated = Boolean(token && user);
  const isAdmin = isAuthenticated && user?.rol === 'admin';

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
