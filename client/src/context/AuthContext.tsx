import React, { createContext, useContext, ReactNode } from 'react';

export interface AuthSession {
  email: string;
  role: 'SUPER_ADMIN' | 'OWNER' | 'ACCOUNTANT' | 'DATA_ENTRY';
  tenantId: string;
  tenantName?: string;
  subdomain?: string;
  tenantStatus?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TRIAL';
  suspendedReason?: string;
}

interface AuthContextType {
  session: AuthSession | null;
  setSession: (session: AuthSession | null) => void;
  getAuthHeaders: () => Record<string, string>;
}

const DEFAULT_HEADERS: Record<string, string> = {
  'x-tenant-id': 'tenant-default-01',
  'x-user-id': 'usr-admin',
  'x-user-role': 'OWNER',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  session?: AuthSession | null;
  setSession?: (session: AuthSession | null) => void;
}

export function AuthProvider({ children, session = null, setSession = () => {} }: AuthProviderProps) {
  const getAuthHeaders = (): Record<string, string> => {
    if (!session) return DEFAULT_HEADERS;
    return {
      'x-tenant-id': session.tenantId,
      'x-user-id': session.email,
      'x-user-role': session.role,
    };
  };

  return (
    <AuthContext.Provider value={{ session, setSession, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Safe fallback when used outside AuthProvider
    return {
      session: null,
      setSession: () => {},
      getAuthHeaders: () => DEFAULT_HEADERS,
    };
  }
  return context;
}
