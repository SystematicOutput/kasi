import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as api from '../services/api';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserProfile>;
  signUp: (email: string, password: string, role: UserRole) => Promise<UserProfile>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an active session on initial app load
    const checkCurrentUser = async () => {
        try {
            const user = await api.getCurrentUser();
            setUserProfile(user);
        } catch (error) {
            console.error("Session check failed:", error);
            setUserProfile(null);
        } finally {
            setLoading(false);
        }
    };
    checkCurrentUser();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
      const user = await api.signIn(email, password);
      setUserProfile(user);
      return user;
  };

  const handleSignUp = async (email: string, password: string, role: UserRole) => {
      const user = await api.signUp(email, password, role);
      setUserProfile(user);
      return user;
  };
  
  const handleSignOut = async () => {
      await api.signOut();
      setUserProfile(null);
  };

  const value = {
    userProfile,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};