import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/*== STEP 1 ===============================================================
チャット機能用のデータベース設計
- ChatSession: チャットセッション管理
- Message: メッセージ履歴管理
=========================================================================*/
const schema = a.schema({
  ChatSession: a
    .model({
      title: a.string(),
      userId: a.string(),
      messageCount: a.integer(),
    })
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'update', 'delete']),
    ]),

  Message: a
    .model({
      sessionId: a.string(),
      userId: a.string(),
      content: a.string(),
      role: a.enum(['user', 'assistant']),
      tokens: a.integer(),
    })
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'update', 'delete']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});

/*== STEP 2 ===============================================================
フロントエンドコードでData clientを生成してCRUDLリクエストを行う
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // このData clientをCRUDLリクエストに使用
*/

/*== STEP 3 ===============================================================
データベースからレコードを取得してフロントエンドコンポーネントで使用
=========================================================================*/

/* 例: ReactコンポーネントのRETURN文でこのスニペットを使用 */
// const { data: sessions } = await client.models.ChatSession.list()
// const { data: messages } = await client.models.Message.list({ filter: { sessionId: { eq: sessionId } } })

// return <div>{sessions.map(session => <div key={session.id}>{session.title}</div>)}</div>
