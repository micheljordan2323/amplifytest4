"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, signIn, signOut, signUp } from 'aws-amplify/auth';
import type { User } from '@aws-amplify/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初期認証状態の確認
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      // ユーザーが認証されていない場合
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await signIn({ username: email, password });
      await checkAuthState();
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await signUp({ username: email, password });
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signOut();
      setUser(null);
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 認証エラーメッセージの日本語化
const getAuthErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('incorrect username or password')) {
      return 'メールアドレスまたはパスワードが正しくありません';
    }
    if (errorMessage.includes('user does not exist')) {
      return 'ユーザーが存在しません';
    }
    if (errorMessage.includes('user is not confirmed')) {
      return 'アカウントが確認されていません';
    }
    if (errorMessage.includes('password did not conform with policy')) {
      return 'パスワードがポリシーに適合していません';
    }
    if (errorMessage.includes('username exists')) {
      return 'このメールアドレスは既に使用されています';
    }
    if (errorMessage.includes('network')) {
      return 'ネットワークエラーが発生しました';
    }
    
    return error.message;
  }
  
  return '認証エラーが発生しました';
};
