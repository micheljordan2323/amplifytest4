// ユーザーの型定義
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// 認証状態の型定義
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ログインフォームの型定義
export interface LoginFormData {
  email: string;
  password: string;
}

// サインアップフォームの型定義
export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

// パスワードリセットフォームの型定義
export interface ForgotPasswordFormData {
  email: string;
}

// 新しいパスワード設定フォームの型定義
export interface ResetPasswordFormData {
  code: string;
  newPassword: string;
  confirmPassword: string;
} 