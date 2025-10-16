import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, mockSignIn, mockSignUp, mockSignOut } from '../services/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string) => Promise<UserProfile>;
  signUp: (email: string, role: UserRole) => Promise<UserProfile>;
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
    // onAuthStateChanged is now our mock API subscription
    const unsubscribe = onAuthStateChanged((user) => {
      setUserProfile(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    userProfile,
    loading,
    signIn: mockSignIn,
    signUp: mockSignUp,
    signOut: mockSignOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
