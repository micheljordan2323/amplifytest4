import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind CSSクラス名を結合するユーティリティ関数
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 日付をフォーマットする関数
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffInHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return d.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else if (diffInHours < 168) { // 1週間以内
    return d.toLocaleDateString('ja-JP', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  } else {
    return d.toLocaleDateString('ja-JP', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

// 文字列を短縮する関数
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// ファイルサイズをフォーマットする関数
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// デバウンス関数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// ローカルストレージのユーティリティ
export const storage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // エラーを無視
    }
  },
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {
      // エラーを無視
    }
  },
};

// ランダムID生成
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// エラーメッセージの取得
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return '不明なエラーが発生しました';
}
