# 設計書

## システムアーキテクチャ

### 全体構成
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │────│  AWS Amplify    │────│   AWS Services  │
│   (Frontend)    │    │   (Backend)     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ├── Cognito (認証)
                                ├── Bedrock (AI)
                                └── DynamoDB (データ)
```

### 技術スタック詳細
- **フロントエンド**: Next.js 14, TypeScript, Tailwind CSS
- **バックエンド**: AWS Amplify Gen2
- **認証**: AWS Cognito
- **AI**: Amazon Bedrock (Nova Lite)
- **データベース**: DynamoDB
- **ホスティング**: AWS Amplify Hosting

## データベース設計

### DynamoDB テーブル設計

#### 1. ChatSessions テーブル
```typescript
interface ChatSession {
  id: string;                    // Partition Key
  userId: string;                // Sort Key
  title: string;                 // チャットセッションのタイトル
  createdAt: string;             // 作成日時
  updatedAt: string;             // 更新日時
  messageCount: number;          // メッセージ数
}
```

#### 2. Messages テーブル
```typescript
interface Message {
  sessionId: string;             // Partition Key
  messageId: string;             // Sort Key
  userId: string;                // ユーザーID
  content: string;               // メッセージ内容
  role: 'user' | 'assistant';    // 送信者
  timestamp: string;             // タイムスタンプ
  tokens?: number;               // トークン数（オプション）
}
```

## コンポーネント設計

### 1. 認証コンポーネント
```typescript
// components/auth/
├── AuthProvider.tsx          // 認証コンテキストプロバイダー
├── LoginForm.tsx             // ログインフォーム
├── SignUpForm.tsx            // サインアップフォーム
├── ForgotPasswordForm.tsx    // パスワードリセットフォーム
└── AuthGuard.tsx             // 認証ガード
```

### 2. チャットコンポーネント
```typescript
// components/chat/
├── ChatContainer.tsx         // チャットメインコンテナ
├── ChatInput.tsx             // メッセージ入力
├── ChatMessage.tsx           // 個別メッセージ表示
├── ChatHistory.tsx           // チャット履歴
├── ChatSessionList.tsx       // セッション一覧
└── ChatHeader.tsx            // チャットヘッダー
```

### 3. 共通コンポーネント
```typescript
// components/common/
├── Layout.tsx                // レイアウト
├── Header.tsx                // ヘッダー
├── Loading.tsx               // ローディング
├── ErrorBoundary.tsx         // エラーバウンダリ
└── Button.tsx                // ボタン
```

## API設計

### 1. Amplify Gen2 API Routes

#### 認証関連
```typescript
// app/api/auth/
├── signin/route.ts           // ログイン
├── signup/route.ts           // サインアップ
├── signout/route.ts          // ログアウト
├── forgot-password/route.ts  // パスワードリセット
└── verify/route.ts           // メール認証
```

#### チャット関連
```typescript
// app/api/chat/
├── sessions/route.ts         // セッション管理
├── messages/route.ts         // メッセージ管理
└── bedrock/route.ts          // Bedrock API呼び出し
```

### 2. Bedrock API統合
```typescript
interface BedrockRequest {
  model: 'amazon.nova-lite-1';
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
}

interface BedrockResponse {
  content: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}
```

## ページ設計

### 1. 認証ページ
```typescript
// app/
├── (auth)/
│   ├── signin/page.tsx       // ログインページ
│   ├── signup/page.tsx       // サインアップページ
│   └── forgot-password/page.tsx // パスワードリセットページ
```

### 2. メインページ
```typescript
// app/
├── page.tsx                  // ホームページ（チャット）
├── chat/[sessionId]/page.tsx // チャットセッションページ
└── settings/page.tsx         // 設定ページ
```

## 状態管理設計

### 1. 認証状態
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### 2. チャット状態
```typescript
interface ChatState {
  currentSession: ChatSession | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sessions: ChatSession[];
}
```

## セキュリティ設計

### 1. 認証・認可
- Cognito JWTトークンの検証
- APIルートでの認証チェック
- ユーザー別データアクセス制御

### 2. データ保護
- HTTPS通信の強制
- 環境変数での機密情報管理
- 入力値のサニタイゼーション

### 3. レート制限
- API呼び出しの制限
- Bedrock APIの使用量制限

## UI/UX設計

### 1. デザインシステム
- **カラーパレット**: ダークモード対応
- **タイポグラフィ**: 読みやすいフォント
- **スペーシング**: 一貫した余白
- **アニメーション**: スムーズな遷移

### 2. レスポンシブデザイン
- **モバイル**: 320px以上
- **タブレット**: 768px以上
- **デスクトップ**: 1024px以上

### 3. アクセシビリティ
- ARIA属性の適切な使用
- キーボードナビゲーション対応
- スクリーンリーダー対応

## エラーハンドリング設計

### 1. フロントエンド
- グローバルエラーバウンダリ
- フォームバリデーション
- ネットワークエラー処理

### 2. バックエンド
- API エラーレスポンス
- ログ出力
- 監視・アラート

## パフォーマンス設計

### 1. フロントエンド
- コンポーネントの遅延読み込み
- 画像の最適化
- キャッシュ戦略

### 2. バックエンド
- API レスポンスの最適化
- データベースクエリの最適化
- CDN活用

## 開発・デプロイ設計

### 1. 開発環境
- ローカル開発環境
- テスト環境
- 本番環境

### 2. CI/CD
- GitHub Actions
- 自動テスト
- 自動デプロイ

### 3. 監視
- CloudWatch
- エラー追跡
- パフォーマンス監視 