// チャットセッションの型定義
export interface ChatSession {
  id: string;
  title: string;
  userId: string;
  messageCount: number;
  lastMessageAt?: string;
  isArchived: boolean;
  model: string;
  temperature: number;
  maxTokens: number;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  user?: UserProfile;
}

// メッセージの型定義
export interface Message {
  id: string;
  sessionId: string;
  userId: string;
  content: string;
  role: 'user' | 'assistant';
  tokens?: number;
  model?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  session?: ChatSession;
  user?: UserProfile;
}

// ユーザープロフィールの型定義
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  avatar?: string;
  preferences?: Record<string, any>;
  usageStats?: {
    totalMessages: number;
    totalTokens: number;
    sessionsCreated: number;
    lastActiveAt: string;
  };
  createdAt: string;
  updatedAt: string;
  sessions?: ChatSession[];
  messages?: Message[];
}

// Bedrock API リクエストの型定義
export interface BedrockRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
}

// Bedrock API レスポンスの型定義
export interface BedrockResponse {
  content: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

// チャット状態の型定義
export interface ChatState {
  currentSession: ChatSession | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sessions: ChatSession[];
  userProfile: UserProfile | null;
}

// チャットセッション作成時の型定義
export interface CreateSessionRequest {
  title: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// メッセージ送信時の型定義
export interface SendMessageRequest {
  sessionId: string;
  content: string;
  model?: string;
}

// ユーザープロフィール更新時の型定義
export interface UpdateProfileRequest {
  displayName?: string;
  avatar?: string;
  preferences?: Record<string, any>;
} 