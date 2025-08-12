import type { 
  ChatSession, 
  Message, 
  UserProfile, 
  CreateSessionRequest, 
  SendMessageRequest, 
  UpdateProfileRequest 
} from "@/types/chat";

// バリデーションエラーの型定義
export interface ValidationError {
  field: string;
  message: string;
}

// バリデーション結果の型定義
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ChatSessionのバリデーション
export const validateChatSession = (session: Partial<ChatSession>): ValidationResult => {
  const errors: ValidationError[] = [];

  // titleのバリデーション
  if (session.title !== undefined) {
    if (!session.title.trim()) {
      errors.push({ field: 'title', message: 'タイトルは必須です' });
    } else if (session.title.length > 200) {
      errors.push({ field: 'title', message: 'タイトルは200文字以内で入力してください' });
    }
  }

  // userIdのバリデーション
  if (session.userId !== undefined && !session.userId.trim()) {
    errors.push({ field: 'userId', message: 'ユーザーIDは必須です' });
  }

  // temperatureのバリデーション
  if (session.temperature !== undefined) {
    if (session.temperature < 0.0 || session.temperature > 1.0) {
      errors.push({ field: 'temperature', message: 'temperatureは0.0から1.0の間で設定してください' });
    }
  }

  // maxTokensのバリデーション
  if (session.maxTokens !== undefined) {
    if (session.maxTokens < 1 || session.maxTokens > 100000) {
      errors.push({ field: 'maxTokens', message: 'maxTokensは1から100000の間で設定してください' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Messageのバリデーション
export const validateMessage = (message: Partial<Message>): ValidationResult => {
  const errors: ValidationError[] = [];

  // contentのバリデーション
  if (message.content !== undefined) {
    if (!message.content.trim()) {
      errors.push({ field: 'content', message: 'メッセージ内容は必須です' });
    } else if (message.content.length > 10000) {
      errors.push({ field: 'content', message: 'メッセージ内容は10000文字以内で入力してください' });
    }
  }

  // sessionIdのバリデーション
  if (message.sessionId !== undefined && !message.sessionId.trim()) {
    errors.push({ field: 'sessionId', message: 'セッションIDは必須です' });
  }

  // userIdのバリデーション
  if (message.userId !== undefined && !message.userId.trim()) {
    errors.push({ field: 'userId', message: 'ユーザーIDは必須です' });
  }

  // roleのバリデーション
  if (message.role !== undefined && !['user', 'assistant'].includes(message.role)) {
    errors.push({ field: 'role', message: 'roleはuserまたはassistantである必要があります' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// UserProfileのバリデーション
export const validateUserProfile = (profile: Partial<UserProfile>): ValidationResult => {
  const errors: ValidationError[] = [];

  // emailのバリデーション
  if (profile.email !== undefined) {
    if (!profile.email.trim()) {
      errors.push({ field: 'email', message: 'メールアドレスは必須です' });
    } else if (!isValidEmail(profile.email)) {
      errors.push({ field: 'email', message: '有効なメールアドレスを入力してください' });
    }
  }

  // displayNameのバリデーション
  if (profile.displayName !== undefined && profile.displayName.length > 100) {
    errors.push({ field: 'displayName', message: '表示名は100文字以内で入力してください' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// CreateSessionRequestのバリデーション
export const validateCreateSessionRequest = (request: CreateSessionRequest): ValidationResult => {
  const errors: ValidationError[] = [];

  // titleのバリデーション
  if (!request.title.trim()) {
    errors.push({ field: 'title', message: 'タイトルは必須です' });
  } else if (request.title.length > 200) {
    errors.push({ field: 'title', message: 'タイトルは200文字以内で入力してください' });
  }

  // temperatureのバリデーション
  if (request.temperature !== undefined) {
    if (request.temperature < 0.0 || request.temperature > 1.0) {
      errors.push({ field: 'temperature', message: 'temperatureは0.0から1.0の間で設定してください' });
    }
  }

  // maxTokensのバリデーション
  if (request.maxTokens !== undefined) {
    if (request.maxTokens < 1 || request.maxTokens > 100000) {
      errors.push({ field: 'maxTokens', message: 'maxTokensは1から100000の間で設定してください' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// SendMessageRequestのバリデーション
export const validateSendMessageRequest = (request: SendMessageRequest): ValidationResult => {
  const errors: ValidationError[] = [];

  // sessionIdのバリデーション
  if (!request.sessionId.trim()) {
    errors.push({ field: 'sessionId', message: 'セッションIDは必須です' });
  }

  // contentのバリデーション
  if (!request.content.trim()) {
    errors.push({ field: 'content', message: 'メッセージ内容は必須です' });
  } else if (request.content.length > 10000) {
    errors.push({ field: 'content', message: 'メッセージ内容は10000文字以内で入力してください' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// UpdateProfileRequestのバリデーション
export const validateUpdateProfileRequest = (request: UpdateProfileRequest): ValidationResult => {
  const errors: ValidationError[] = [];

  // displayNameのバリデーション
  if (request.displayName !== undefined && request.displayName.length > 100) {
    errors.push({ field: 'displayName', message: '表示名は100文字以内で入力してください' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// メールアドレスの形式チェック
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// スキーマの整合性チェック
export const validateSchemaConsistency = (): ValidationResult => {
  const errors: ValidationError[] = [];

  // ここでスキーマ全体の整合性をチェック
  // 例: 外部キーの存在確認、インデックスの重複チェックなど

  return {
    isValid: errors.length === 0,
    errors
  };
};

// バリデーションエラーメッセージの日本語化
export const getValidationErrorMessage = (errors: ValidationError[]): string => {
  if (errors.length === 0) return '';
  
  return errors.map(error => `${error.field}: ${error.message}`).join('\n');
};

// テストデータの生成
export const generateTestData = () => {
  const testSession: CreateSessionRequest = {
    title: 'テストセッション',
    model: 'claude-3-sonnet-20240229-v1:0',
    temperature: 0.7,
    maxTokens: 4096,
  };

  const testMessage: SendMessageRequest = {
    sessionId: 'test-session-id',
    content: 'これはテストメッセージです。',
    model: 'claude-3-sonnet-20240229-v1:0',
  };

  const testProfile: UpdateProfileRequest = {
    displayName: 'テストユーザー',
    avatar: 'https://example.com/avatar.jpg',
    preferences: {
      theme: 'dark',
      language: 'ja',
    },
  };

  return {
    testSession,
    testMessage,
    testProfile,
  };
};
