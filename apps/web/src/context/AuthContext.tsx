import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem('mplad_user');
      return cached && cached !== 'undefined' ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mplad_auth_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function verifyAuth() {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.data?.user) {
            setUser(res.data.data.user);
            localStorage.setItem('mplad_user', JSON.stringify(res.data.data.user));
          }
        } catch {
          if (!user) {
            setUser(null);
            setToken(null);
            localStorage.removeItem('mplad_auth_token');
            localStorage.removeItem('mplad_user');
          }
        }
      }
      setLoading(false);
    }
    verifyAuth();
  }, [token]);

  const login = async (email: string, password = 'Demo@12345') => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.data?.token) {
        const { token: jwtToken, user: userData } = res.data.data;
        setToken(jwtToken);
        setUser(userData);
        localStorage.setItem('mplad_auth_token', jwtToken);
        localStorage.setItem('mplad_user', JSON.stringify(userData));
        return;
      }
    } catch (err) {
      console.warn('Backend login unavailable, activating client demo fallback:', err);
    }

    // Direct fallback for standalone Vercel preview
    const rolePrefix = email.split('@')[0]?.toUpperCase() || 'AUDITOR';
    const validRole: UserRole = ['ADMIN', 'AUDITOR', 'ANALYST', 'VIEWER'].includes(rolePrefix) ? (rolePrefix as UserRole) : 'AUDITOR';

    const mockUser: User = {
      id: `usr-${validRole.toLowerCase()}`,
      name: `${validRole.charAt(0) + validRole.slice(1).toLowerCase()} Officer`,
      email: email || `${validRole.toLowerCase()}@mplad-insight.demo`,
      role: validRole,
      department: 'MoSPI Audit Wing',
      designation: 'Senior Inspector',
    };
    const mockToken = `demo_jwt_token_${validRole.toLowerCase()}`;

    setToken(mockToken);
    setUser(mockUser);
    localStorage.setItem('mplad_auth_token', mockToken);
    localStorage.setItem('mplad_user', JSON.stringify(mockUser));
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    setUser(null);
    setToken(null);
    localStorage.removeItem('mplad_auth_token');
    localStorage.removeItem('mplad_user');
  };

  const switchDemoRole = async (role: UserRole) => {
    const email = `${role.toLowerCase()}@mplad-insight.demo`;
    await login(email, 'Demo@12345');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
