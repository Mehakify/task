'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  signOut as firebaseSignOut,
  signInAnonymously,
} from 'firebase/auth';
import { auth, isConfigValid } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();


  useEffect(() => {
    if (!isConfigValid || !auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAuthAction = async (authAction: () => Promise<any>, successRoute: string) => {
    if (!isConfigValid || !auth) {
      toast({
        title: "Configuration Error",
        description: "Firebase is not configured correctly. Please check the setup guide.",
        variant: "destructive",
      });
      return;
    }
    try {
      await authAction();
      router.push(successRoute);
    } catch (error: any) {
      console.error('Firebase Auth Error:', error);
       toast({
        title: "Authentication Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };


  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await handleAuthAction(() => signInWithPopup(auth!, provider), '/dashboard');
  };
  
  const signInAsGuest = async () => {
    await handleAuthAction(() => signInAnonymously(auth!), '/dashboard');
  };

  const signOut = async () => {
    await handleAuthAction(() => firebaseSignOut(auth!), '/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInAsGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
