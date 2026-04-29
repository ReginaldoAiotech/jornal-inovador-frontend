import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as authService from '../services/authService';
import { getToken, setToken, removeToken } from '../utils/storage';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    authService.getMe()
      .then((data) => setUser(data))
      .catch(() => removeToken())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await authService.register(name, email, password);
    if (data.access_token) {
      setToken(data.access_token);
      setUser(data.user);
    }
    return data;
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
  }, []);

  const trialEndsAt = user?.trialEndsAt ? new Date(user.trialEndsAt) : null;
  const isExternal = user?.accountType === 'EXTERNAL';
  const trialMillisLeft = trialEndsAt ? trialEndsAt.getTime() - Date.now() : null;
  const isTrialActive = isExternal && trialMillisLeft !== null && trialMillisLeft > 0;
  const isTrialExpired = isExternal && trialMillisLeft !== null && trialMillisLeft <= 0;
  const trialDaysLeft = isTrialActive ? Math.ceil(trialMillisLeft / (1000 * 60 * 60 * 24)) : 0;

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isEditor: user?.role === 'EDITOR' || user?.role === 'ADMIN',
    isExternal,
    isTrialActive,
    isTrialExpired,
    trialDaysLeft,
    trialEndsAt,
    login,
    register,
    logout,
  }), [user, isLoading, isExternal, isTrialActive, isTrialExpired, trialDaysLeft, trialEndsAt, login, register, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
