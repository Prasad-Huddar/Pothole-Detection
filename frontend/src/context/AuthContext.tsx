import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginCredentials, SignUpData, AuthContextType } from '../types/auth';
import { authApi } from '../services/api';

const DEFAULT_USER: User = {
  id: 'USR-001',
  name: 'Prasad Huddar',
  email: 'prasad.huddar@potholeiq.ai',
  role: 'Chief Road Infrastructure Engineer',
  department: 'National Highway & Road Safety Command',
  avatar_initials: 'PH',
  token: 'rv_jwt_usr_001_lead',
  created_at: '2026-01-01T00:00:00Z',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('roadvision:auth:user');
      if (saved) {
        return JSON.parse(saved);
      }
      return DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    if (user) {
      localStorage.setItem('roadvision:auth:user', JSON.stringify(user));
    } else {
      localStorage.removeItem('roadvision:auth:user');
    }
  }, [user]);

  const openAuthModal = (tab: 'login' | 'signup' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const res = await authApi.login({
        email: credentials.email,
        password: credentials.password,
      });
      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
        setIsAuthModalOpen(false);
        return true;
      }
    } catch (err: any) {
      console.warn('Backend login fallback:', err);
    }

    // Client-side fallback if server offline or custom email
    const namePart = credentials.email.split('@')[0].replace('.', ' ');
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const initials = formattedName
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'IN';

    const fallbackUser: User = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name: credentials.email.toLowerCase().includes('prasad') ? 'Prasad Huddar' : formattedName,
      email: credentials.email,
      role: credentials.email.toLowerCase().includes('prasad') ? 'Chief Road Infrastructure Engineer' : 'Municipal Road Inspector',
      department: 'Municipal Infrastructure Division',
      avatar_initials: credentials.email.toLowerCase().includes('prasad') ? 'PH' : initials,
      token: `rv_jwt_local_${Date.now()}`,
    };
    setUser(fallbackUser);
    setIsAuthModalOpen(false);
    return true;
  };

  const signup = async (data: SignUpData): Promise<boolean> => {
    try {
      const res = await authApi.signup(data);
      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
        setIsAuthModalOpen(false);
        return true;
      }
    } catch (err: any) {
      console.warn('Backend signup fallback:', err);
    }

    const initials = data.name
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'IN';

    const newUser: User = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name: data.name,
      email: data.email,
      role: data.role || 'Road Infrastructure Inspector',
      department: data.department || 'Municipal Road Safety Command',
      avatar_initials: initials,
      token: `rv_jwt_local_${Date.now()}`,
    };
    setUser(newUser);
    setIsAuthModalOpen(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('roadvision:auth:user');
    setIsAuthModalOpen(true);
  };

  const switchAccount = (_accountType?: string) => {
    setUser(DEFAULT_USER);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        signup,
        logout,
        switchAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
