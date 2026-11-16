import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import type { Profile } from '@/types/database.types';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isInitialized: boolean;
  setAuth: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  fetchProfile: (userId: string) => Promise<void>;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isInitialized: false,

  setAuth: (session) => {
    set({
      session,
      user: session?.user ?? null,
    });
  },

  setProfile: (profile) => set({ profile }),

  fetchProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      set({ profile: data });
    }
  },

  initialize: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      set({
        session,
        user: session?.user ?? null,
      });

      if (session?.user) {
        await get().fetchProfile(session.user.id);
      }
    } finally {
      set({ isInitialized: true });
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({
        session,
        user: session?.user ?? null,
      });

      if (session?.user) {
        await get().fetchProfile(session.user.id);
      } else {
        set({ profile: null });
      }
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null });
  },
}));