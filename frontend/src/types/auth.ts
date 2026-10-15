export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar_initials: string;
  token?: string;
  created_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  role: string;
  department: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'signup';
  openAuthModal: (tab?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  signup: (data: SignUpData) => Promise<boolean>;
  logout: () => void;
  switchAccount: (roleName: string) => void;
}
