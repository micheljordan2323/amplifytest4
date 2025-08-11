// チャットセッションの型定義
export interface ChatSession {
  id: string;
  title: string;
  userId: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

// メッセージの型定義
export interface Message {
  id: string;
  sessionId: string;
  userId: string;
  content: string;
  role: 'user' | 'assistant';
  tokens?: number;
  createdAt: string;
  updatedAt: string;
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
} 