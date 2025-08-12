# Issue #002: データベーススキーマ設計

## User Story 2.1: チャット機能用データベーススキーマ設計

**As a** 開発者  
**I want to** チャット機能に必要なデータベーススキーマを詳細に設計する  
**So that** 効率的で拡張性のあるデータ構造を実現できる

### Acceptance Criteria:
- [ ] ChatSessionモデルの詳細設計
- [ ] Messageモデルの詳細設計
- [ ] UserProfileモデルの追加設計
- [ ] リレーションシップの定義
- [ ] インデックスとクエリ最適化
- [ ] データ検証ルールの設定

### Tasks:
- [ ] スキーマ定義の詳細化
- [ ] リレーションシップの実装
- [ ] インデックスの追加
- [ ] データ検証ルールの追加
- [ ] 型定義の更新

### Story Points: 8
### Priority: High
### Epic: プロジェクト基盤構築
### Status: Completed
### Assignee: 
### Created: 2024-01-XX

## 詳細設計仕様

### 1. ChatSessionモデル
```typescript
ChatSession: {
  id: string (auto-generated)
  title: string (required, max 200 chars)
  userId: string (required, indexed)
  messageCount: integer (default: 0)
  lastMessageAt: datetime (auto-updated)
  isArchived: boolean (default: false)
  model: string (default: 'claude-3-sonnet-20240229-v1:0')
  temperature: float (default: 0.7, min: 0.0, max: 1.0)
  maxTokens: integer (default: 4096, min: 1, max: 100000)
  createdAt: datetime (auto-generated)
  updatedAt: datetime (auto-updated)
}
```

### 2. Messageモデル
```typescript
Message: {
  id: string (auto-generated)
  sessionId: string (required, indexed, foreign key to ChatSession)
  userId: string (required, indexed)
  content: string (required, max 10000 chars)
  role: enum ['user', 'assistant'] (required)
  tokens: integer (optional)
  model: string (optional, for assistant messages)
  metadata: json (optional, for additional data)
  createdAt: datetime (auto-generated)
  updatedAt: datetime (auto-updated)
}
```

### 3. UserProfileモデル（新規追加）
```typescript
UserProfile: {
  id: string (auto-generated, same as userId)
  email: string (required, unique)
  displayName: string (optional, max 100 chars)
  avatar: string (optional, URL)
  preferences: json (optional, user preferences)
  usageStats: json (optional, usage statistics)
  createdAt: datetime (auto-generated)
  updatedAt: datetime (auto-updated)
}
```

### 4. リレーションシップ
- ChatSession ↔ Message: 1対多
- UserProfile ↔ ChatSession: 1対多
- UserProfile ↔ Message: 1対多

### 5. インデックス戦略
- ChatSession: userId (GSI)
- Message: sessionId (GSI)
- Message: userId (GSI)
- Message: createdAt (GSI, for pagination)

### 6. データ検証ルール
- title: 空文字列禁止、最大200文字
- content: 空文字列禁止、最大10000文字
- temperature: 0.0-1.0の範囲
- maxTokens: 1-100000の範囲
- email: 有効なメールアドレス形式

### 7. 認証・認可ルール
- 所有者のみが自分のデータにアクセス可能
- ChatSession: 作成、読み取り、更新、削除
- Message: 作成、読み取り、更新、削除
- UserProfile: 作成、読み取り、更新（削除は制限）

### Notes:
- パフォーマンス最適化のため、適切なインデックスを設定
- データ整合性を保つため、外部キー制約を実装
- 将来の拡張性を考慮した柔軟なスキーマ設計
- セキュリティを考慮した認証・認可ルール
