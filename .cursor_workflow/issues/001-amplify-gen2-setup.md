# Issue #001: Amplify Gen2設定

## User Story 1.1: Amplify Gen2設定

**As a** 開発者  
**I want to** Amplify Gen2の設定を完了させる  
**So that** バックエンドサービスを利用できる

### Acceptance Criteria:
- [ ] Amplify Gen2の初期設定
- [ ] Cognito認証の設定
- [ ] DynamoDBテーブルの作成
- [ ] 環境変数の設定

### Tasks:
- [ ] `amplify/backend.ts`の設定
- [ ] `amplify/auth/resource.ts`の設定
- [ ] `amplify/data/resource.ts`の設定
- [ ] 環境変数ファイルの作成

### Story Points: 5
### Priority: High
### Epic: プロジェクト基盤構築
### Status: Open
### Assignee: 
### Created: 2024-01-XX

### Notes:
- 既存のamplifyディレクトリを確認して、必要な設定を追加
- Cognito認証はメールアドレス方式で設定
- DynamoDBテーブルはチャット機能用に設計 