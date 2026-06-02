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
    practiceName: input.practiceName || undefined,
    providerNumber: input.providerNumber || undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount ONLY - no auth state listener
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    console.log('🔄 Loading user...');
    setLoading(true);
    let cachedProvider: User | null = null;
    try {
      // Check for provider session first (custom auth)
      if (typeof window !== 'undefined') {
        const providerSession = localStorage.getItem('provider_session');
        if (providerSession) {
          const { provider, timestamp } = JSON.parse(providerSession);
          // Check if session is less than 24 hours old
          if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
            console.log('✅ Provider session found');
            cachedProvider = provider;
          } else {
            // Session expired
            localStorage.removeItem('provider_session');
          }
        }
      }

      // Get Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log('❌ No active session');
        if (cachedProvider) {
          setUser(cachedProvider);
          setLoading(false);
          return;
        }
        setUser(null);
        setLoading(false);
        return;
      }

      console.log('✅ Session found, fetching user data...');

      // Check if user is a provider first
      const { data: providerData } = await supabase
        .from('providers')
        .select('id, name, practice_name, provider_number, login_email, user_id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (providerData) {
        // User is a provider
        console.log('✅ Provider user found');
        const transformedUser = buildProviderUser({
          id: providerData.id,
          email: providerData.login_email || session.user.email || '',
          name: providerData.name,
          practiceName: providerData.practice_name,
          providerNumber: providerData.provider_number,
          authUserId: session.user.id,
        });
        console.log('✅ Provider data loaded:', transformedUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('provider_session', JSON.stringify({
            provider: transformedUser,
            timestamp: Date.now()
          }));
        }
        setUser(transformedUser);
        setLoading(false);
        return;
      }

      if (session.user.user_metadata?.role === 'provider') {
        console.log('Provider metadata found, using fallback provider session');
        const fallbackProvider = buildProviderUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.firstName || session.user.user_metadata?.first_name || '',
          practiceName: session.user.user_metadata?.practiceName || session.user.user_metadata?.practice_name || '',
          providerNumber: session.user.user_metadata?.providerNumber || session.user.user_metadata?.provider_number || '',
          authUserId: session.user.id,
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem('provider_session', JSON.stringify({
            provider: fallbackProvider,
            timestamp: Date.now()
          }));
        }
        setUser(fallbackProvider);
        setLoading(false);
        return;
      }

      // Get user data from custom users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, is_active')
        .eq('email', session.user.email)
        .maybeSingle();

      if (userError || !userData) {
        console.error('❌ Error loading user data:', userError);
        console.error('❌ Session email:', session.user.email);
        setUser(null);
        setLoading(false);
        return;
      }

      console.log('✅ User data found:', userData);

      if (!userData.is_active) {
        console.error('❌ User is inactive');
        await supabase.auth.signOut();
        setUser(null);
        setLoading(false);
        return;
      }

      console.log('✅ Fetching roles for user_id:', userData.id);

      // Get user roles with role names in one query
      const { data: userRolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', userData.id);

      if (rolesError) {
        console.error('❌ Error loading roles:', rolesError);
      }

      console.log('✅ User roles data:', userRolesData);

      const roles: string[] = userRolesData?.map((ur: any) => ur.roles?.name).filter(Boolean) || [];

      console.log('✅ Extracted roles:', roles);

      const transformedUser: User = {
        id: userData.id,
        email: userData.email,
        firstName: '',
        lastName: '',
        roles,
        permissions: [],
      };

      console.log('✅ User data loaded:', transformedUser);
      setUser(transformedUser);
    } catch (error) {
      console.error('❌ Error loading user:', error);
      setUser(cachedProvider);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Try Supabase Auth (works for both staff and providers)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error('Invalid email or password');
      }

      // Check if user is a provider
      const { data: provider } = await supabase
        .from('providers')
        .select('id, name, login_email, provider_number, practice_name')
        .eq('user_id', authData.user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (provider) {
        // Provider login successful - create custom session
        console.log('✅ Provider login successful:', provider);
        const providerUser = buildProviderUser({
          id: provider.id,
          email: provider.login_email || authData.user.email || email,
          name: provider.name,
          practiceName: provider.practice_name,
          providerNumber: provider.provider_number,
          authUserId: authData.user.id,
        });

        // Store provider session in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('provider_session', JSON.stringify({
            provider: providerUser,
            timestamp: Date.now()
          }));
        }

        setUser(providerUser);
      } else if (authData.user.user_metadata?.role === 'provider') {
        const fallbackProvider = buildProviderUser({
          id: authData.user.id,
          email: authData.user.email || email,
          name: authData.user.user_metadata?.firstName || authData.user.user_metadata?.first_name || '',
          practiceName: authData.user.user_metadata?.practiceName || authData.user.user_metadata?.practice_name || '',
          providerNumber: authData.user.user_metadata?.providerNumber || authData.user.user_metadata?.provider_number || '',
          authUserId: authData.user.id,
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem('provider_session', JSON.stringify({
            provider: fallbackProvider,
            timestamp: Date.now()
          }));
        }

        setUser(fallbackProvider);
      } else {
        // Staff login successful
        await loadUser();
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear provider session
      if (typeof window !== 'undefined') {
        localStorage.removeItem('provider_session');
      }
      
      await supabase.auth.signOut();
      setUser(null);
      // Clear any cached data
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
      // Create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      // User data will be created via database trigger or we can create it here
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
