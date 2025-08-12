import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/*== STEP 1 ===============================================================
チャット機能用のデータベース設計
- ChatSession: チャットセッション管理
- Message: メッセージ履歴管理
- UserProfile: ユーザープロフィール管理
=========================================================================*/
const schema = a.schema({
  ChatSession: a
    .model({
      title: a.string().required().maxLength(200),
      userId: a.string().required(),
      messageCount: a.integer().default(0),
      lastMessageAt: a.datetime(),
      isArchived: a.boolean().default(false),
      model: a.string().default('claude-3-sonnet-20240229-v1:0'),
      temperature: a.float().default(0.7).min(0.0).max(1.0),
      maxTokens: a.integer().default(4096).min(1).max(100000),
      messages: a.hasMany('Message'),
      user: a.belongsTo('UserProfile'),
    })
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'update', 'delete']),
    ])
    .index('byUserId', ['userId'])
    .index('byLastMessageAt', ['userId', 'lastMessageAt']),

  Message: a
    .model({
      sessionId: a.string().required(),
      userId: a.string().required(),
      content: a.string().required().maxLength(10000),
      role: a.enum(['user', 'assistant']).required(),
      tokens: a.integer(),
      model: a.string(),
      metadata: a.json(),
      session: a.belongsTo('ChatSession'),
      user: a.belongsTo('UserProfile'),
    })
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'update', 'delete']),
    ])
    .index('bySessionId', ['sessionId'])
    .index('byUserId', ['userId'])
    .index('byCreatedAt', ['sessionId', 'createdAt']),

  UserProfile: a
    .model({
      email: a.string().required(),
      displayName: a.string().maxLength(100),
      avatar: a.string(),
      preferences: a.json(),
      usageStats: a.json(),
      sessions: a.hasMany('ChatSession'),
      messages: a.hasMany('Message'),
    })
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'update']),
    ])
    .index('byEmail', ['email']),
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
// const { data: userProfile } = await client.models.UserProfile.get({ id: userId })

// return <div>{sessions.map(session => <div key={session.id}>{session.title}</div>)}</div>
