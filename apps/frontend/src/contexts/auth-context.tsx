'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  authUserId?: string;
  doctorSurname?: string;
  practiceName?: string;
  providerNumber?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function buildProviderUser(input: {
  id: string;
  email: string;
  name?: string | null;
  doctorSurname?: string | null;
  practiceName?: string | null;
  providerNumber?: string | null;
  authUserId?: string;
}): User {
  const displayName = (input.name || input.practiceName || input.email || '')
    .replace(/\s+/g, ' ')
    .trim();
  const nameParts = displayName.split(' ').filter(Boolean);

  return {
    id: input.id,
    email: input.email,
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    roles: ['provider'],
    permissions: [],
    authUserId: input.authUserId,
    doctorSurname: input.doctorSurname || undefined,
    practiceName: input.practiceName || undefined,
    providerNumber: input.providerNumber || undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    console.log('Loading user...');
    setLoading(true);
    let cachedProvider: User | null = null;

    try {
      if (typeof window !== 'undefined') {
        const providerSession = localStorage.getItem('provider_session');
        if (providerSession) {
          const { provider, timestamp } = JSON.parse(providerSession);
          if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
            console.log('Provider session found');
            cachedProvider = provider;
          } else {
            localStorage.removeItem('provider_session');
          }
        }
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.log('No active session');
        if (cachedProvider) {
          setUser(cachedProvider);
          setLoading(false);
          return;
        }
        setUser(null);
        setLoading(false);
        return;
      }

      console.log('Session found, fetching user data...');

      const providerResponse = await fetch('/api/provider/me', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (providerResponse.ok) {
        const providerData = await providerResponse.json();
        const provider = providerData.provider;

        if (provider) {
          const transformedUser = buildProviderUser({
            id: provider.providerId || provider.id,
            email: provider.email || session.user.email || '',
            name: provider.providerName || '',
            doctorSurname: provider.doctorSurname || '',
            practiceName: provider.practiceName,
            providerNumber: provider.providerNumber,
            authUserId: session.user.id,
          });

          if (typeof window !== 'undefined') {
            localStorage.setItem(
              'provider_session',
              JSON.stringify({
                provider: transformedUser,
                timestamp: Date.now(),
              })
            );
          }

          setUser(transformedUser);
          setLoading(false);
          return;
        }
      }

      if (session.user.user_metadata?.role === 'provider') {
        console.log('Provider metadata found, using fallback provider session');
        const fallbackProvider = buildProviderUser({
          id: session.user.id,
          email: session.user.email || '',
          name:
            session.user.user_metadata?.firstName ||
            session.user.user_metadata?.first_name ||
            '',
          doctorSurname:
            session.user.user_metadata?.doctorSurname ||
            session.user.user_metadata?.doctor_surname ||
            '',
          practiceName:
            session.user.user_metadata?.practiceName ||
            session.user.user_metadata?.practice_name ||
            '',
          providerNumber:
            session.user.user_metadata?.prno ||
            session.user.user_metadata?.providerNumber ||
            session.user.user_metadata?.provider_number ||
            '',
          authUserId: session.user.id,
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem(
            'provider_session',
            JSON.stringify({
              provider: fallbackProvider,
              timestamp: Date.now(),
            })
          );
        }

        setUser(fallbackProvider);
        setLoading(false);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, is_active')
        .eq('email', session.user.email)
        .maybeSingle();

      if (userError || !userData) {
        console.error('Error loading user data:', userError);
        console.error('Session email:', session.user.email);
        setUser(null);
        setLoading(false);
        return;
      }

      if (!userData.is_active) {
        console.error('User is inactive');
        await supabase.auth.signOut();
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: userRolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', userData.id);

      if (rolesError) {
        console.error('Error loading roles:', rolesError);
      }

      const roles: string[] = userRolesData?.map((ur: any) => ur.roles?.name).filter(Boolean) || [];

      setUser({
        id: userData.id,
        email: userData.email,
        firstName: '',
        lastName: '',
        roles,
        permissions: [],
      });
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(cachedProvider);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error('Invalid email or password');
      }

      await loadUser();
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('provider_session');
      }

      await supabase.auth.signOut();
      setUser(null);

      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      await loadUser();
    } catch (error: any) {
      console.error('Register error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
