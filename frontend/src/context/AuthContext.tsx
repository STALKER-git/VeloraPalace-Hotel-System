import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Utilisateur } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Utilisateur | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Utilisateur>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  updateProfile: async () => ({ error: null }),
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Utilisateur | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, email?: string) => {
    console.log("DEBUG - Starting fetchProfile for ID:", userId, "Email:", email);
    
    // Try by ID first
    let { data, error } = await supabase
      .from('utilisateurs')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) console.error("DEBUG - SQL Error (ID Search):", error);

    // Fallback to email if ID fails but email is provided (Case-insensitive)
    if (!data && email) {
      console.log("DEBUG - Not found by ID, trying Case-Insensitive Email Search...");
      const { data: emailData, error: emailError } = await supabase
        .from('utilisateurs')
        .select('*')
        .ilike('email', email)
        .maybeSingle();
      
      if (emailError) console.error("DEBUG - SQL Error (Email Search):", emailError);
      data = emailData;
    }

    console.log("DEBUG - Final Profile Result:", data);
    if (data) {
      setProfile(data);
    } else {
      console.warn("DEBUG - NO PROFILE FOUND IN 'utilisateurs' TABLE.");
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id, session.user.email);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        (async () => { await fetchProfile(session.user.id, session.user.email); })();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (!error && data.user) {
      const parts = fullName.split(' ');
      const prenom = parts[0] || '';
      const nom = parts.slice(1).join(' ') || '';
      
      await supabase.from('utilisateurs').upsert({
        id: data.user.id,
        nom_utilisateur: nom || prenom || 'User',
        prenom: prenom || 'User',
        email: email,
        mot_de_passe: 'SUPABASE_AUTH_DUMMY',
        telephone: null, // nullable, no need to be empty string
        role: 'client'
      });
    }
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (data: Partial<Utilisateur>) => {
    if (!user) return { error: new Error('Not authenticated') };
    const { error } = await supabase
      .from('utilisateurs')
      .update({ ...data })
      .eq('id', user.id);
    if (!error) {
      setProfile(prev => prev ? { ...prev, ...data } : null);
    }
    return { error: error as Error | null };
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signUp, signIn, signOut, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
