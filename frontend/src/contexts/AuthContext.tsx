'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { disconnectEcho } from '@/lib/echo';
import type { User, AuthResponse, LoginPayload } from '@/types';


interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);


function setAuthCookie() {
  document.cookie = 'auth_flag=1; path=/; max-age=86400; SameSite=Lax';
}

function clearAuthCookie() {
  document.cookie = 'auth_flag=; path=/; max-age=0';
}


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setAuthCookie();
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        clearAuthCookie();
      }
    }
    setIsLoading(false);
  }, []);

  const saveAuth = useCallback((authData: AuthResponse) => {
    localStorage.setItem('auth_token', authData.access_token);
    localStorage.setItem('auth_user', JSON.stringify(authData.user));
    setToken(authData.access_token);
    setUser(authData.user);
    setAuthCookie();
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { data } = await api.post<AuthResponse>('/auth/login', payload);
      saveAuth(data);
      router.push('/tasks');
    },
    [saveAuth, router],
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      clearAuthCookie();
      setToken(null);
      setUser(null);
      disconnectEcho();
      router.push('/login');
    }
  }, [router]);

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
