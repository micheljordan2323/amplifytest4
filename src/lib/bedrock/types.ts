// Bedrock API リクエスト・レスポンス型定義

export interface BedrockChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface BedrockChatRequest {
  messages: BedrockChatMessage[];
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
  anthropicVersion?: string;
}

export interface BedrockChatResponse {
  content: BedrockChatResponseContent[];
  usage: BedrockUsage;
  model: string;
  finishReason: string;
}

export interface BedrockChatResponseContent {
  type: 'text';
  text: string;
}

export interface BedrockUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface BedrockError {
  type: string;
  message: string;
  code?: string;
}

// ストリーミングレスポンス型
export interface BedrockStreamResponse {
  type: 'content_block_delta' | 'message_delta' | 'message_stop';
  delta?: {
    type: 'text_delta';
    text: string;
  };
  usage?: BedrockUsage;
  finishReason?: string;
}

// チャットAPI用の型定義
export interface ChatAPIRequest {
  sessionId: string;
  message: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface ChatAPIResponse {
  content: string;
  tokens: number;
  model: string;
  finishReason: string;
  sessionId: string;
}

export interface ChatStreamResponse {
  type: 'content' | 'usage' | 'error' | 'done';
  content?: string;
  usage?: BedrockUsage;
  error?: string;
  sessionId: string;
}

// モデル設定
export interface ModelConfig {
  id: string;
  name: string;
  provider: 'anthropic' | 'amazon' | 'meta' | 'ai21';
  maxTokens: number;
  supportsStreaming: boolean;
  defaultTemperature: number;
}

export const SUPPORTED_MODELS: ModelConfig[] = [
  {
    id: 'anthropic.claude-3-sonnet-20240229-v1:0',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    maxTokens: 4096,
    supportsStreaming: true,
    defaultTemperature: 0.7,
  },
  {
    id: 'anthropic.claude-3-haiku-20240307-v1:0',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    maxTokens: 4096,
    supportsStreaming: true,
    defaultTemperature: 0.7,
  },
  {
    id: 'anthropic.claude-3-opus-20240229-v1:0',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    maxTokens: 4096,
    supportsStreaming: true,
    defaultTemperature: 0.7,
  },
];

// エラー型定義
export class BedrockAPIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'BedrockAPIError';
  }
}

export class RateLimitError extends BedrockAPIError {
  constructor(message: string = 'レート制限に達しました') {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
    this.name = 'RateLimitError';
  }
}

export class AuthenticationError extends BedrockAPIError {
  constructor(message: string = '認証に失敗しました') {
    super(message, 'AUTHENTICATION_FAILED', 401);
    this.name = 'AuthenticationError';
  }
}

export class ModelError extends BedrockAPIError {
  constructor(message: string = 'モデルエラーが発生しました') {
    super(message, 'MODEL_ERROR', 500);
    this.name = 'ModelError';
  }
}
