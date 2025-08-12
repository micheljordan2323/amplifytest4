"use client";

import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import type { 
  ChatSession, 
  Message, 
  UserProfile, 
  CreateSessionRequest, 
  SendMessageRequest, 
  UpdateProfileRequest 
} from "@/types/chat";

const client = generateClient<Schema>();

// チャットセッション関連の操作
export const chatSessionOperations = {
  // セッション一覧を取得
  async listSessions(userId: string): Promise<ChatSession[]> {
    try {
      const { data: sessions, errors } = await client.models.ChatSession.list({
        filter: { userId: { eq: userId } },
        sort: { field: 'lastMessageAt', direction: 'desc' }
      });
      
      if (errors) {
        console.error('セッション一覧取得エラー:', errors);
        throw new Error('セッション一覧の取得に失敗しました');
      }
      
      return sessions || [];
    } catch (error) {
      console.error('セッション一覧取得エラー:', error);
      throw error;
    }
  },

  // セッションを作成
  async createSession(request: CreateSessionRequest, userId: string): Promise<ChatSession> {
    try {
      const { data: session, errors } = await client.models.ChatSession.create({
        title: request.title,
        userId,
        model: request.model || 'claude-3-sonnet-20240229-v1:0',
        temperature: request.temperature || 0.7,
        maxTokens: request.maxTokens || 4096,
        messageCount: 0,
        isArchived: false,
        lastMessageAt: new Date().toISOString(),
      });
      
      if (errors) {
        console.error('セッション作成エラー:', errors);
        throw new Error('セッションの作成に失敗しました');
      }
      
      if (!session) {
        throw new Error('セッションの作成に失敗しました');
      }
      
      return session;
    } catch (error) {
      console.error('セッション作成エラー:', error);
      throw error;
    }
  },

  // セッションを取得
  async getSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const { data: session, errors } = await client.models.ChatSession.get({
        id: sessionId
      });
      
      if (errors) {
        console.error('セッション取得エラー:', errors);
        throw new Error('セッションの取得に失敗しました');
      }
      
      return session || null;
    } catch (error) {
      console.error('セッション取得エラー:', error);
      throw error;
    }
  },

  // セッションを更新
  async updateSession(sessionId: string, updates: Partial<ChatSession>): Promise<ChatSession> {
    try {
      const { data: session, errors } = await client.models.ChatSession.update({
        id: sessionId,
        ...updates,
      });
      
      if (errors) {
        console.error('セッション更新エラー:', errors);
        throw new Error('セッションの更新に失敗しました');
      }
      
      if (!session) {
        throw new Error('セッションの更新に失敗しました');
      }
      
      return session;
    } catch (error) {
      console.error('セッション更新エラー:', error);
      throw error;
    }
  },

  // セッションを削除
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const { errors } = await client.models.ChatSession.delete({
        id: sessionId
      });
      
      if (errors) {
        console.error('セッション削除エラー:', errors);
        throw new Error('セッションの削除に失敗しました');
      }
    } catch (error) {
      console.error('セッション削除エラー:', error);
      throw error;
    }
  },
};

// メッセージ関連の操作
export const messageOperations = {
  // メッセージ一覧を取得
  async listMessages(sessionId: string): Promise<Message[]> {
    try {
      const { data: messages, errors } = await client.models.Message.list({
        filter: { sessionId: { eq: sessionId } },
        sort: { field: 'createdAt', direction: 'asc' }
      });
      
      if (errors) {
        console.error('メッセージ一覧取得エラー:', errors);
        throw new Error('メッセージ一覧の取得に失敗しました');
      }
      
      return messages || [];
    } catch (error) {
      console.error('メッセージ一覧取得エラー:', error);
      throw error;
    }
  },

  // メッセージを作成
  async createMessage(request: SendMessageRequest, userId: string, role: 'user' | 'assistant'): Promise<Message> {
    try {
      const { data: message, errors } = await client.models.Message.create({
        sessionId: request.sessionId,
        userId,
        content: request.content,
        role,
        model: request.model,
        tokens: undefined, // 後で計算して更新
      });
      
      if (errors) {
        console.error('メッセージ作成エラー:', errors);
        throw new Error('メッセージの作成に失敗しました');
      }
      
      if (!message) {
        throw new Error('メッセージの作成に失敗しました');
      }
      
      // セッションのメッセージ数を更新
      await chatSessionOperations.updateSession(request.sessionId, {
        messageCount: { increment: 1 },
        lastMessageAt: new Date().toISOString(),
      });
      
      return message;
    } catch (error) {
      console.error('メッセージ作成エラー:', error);
      throw error;
    }
  },

  // メッセージを更新
  async updateMessage(messageId: string, updates: Partial<Message>): Promise<Message> {
    try {
      const { data: message, errors } = await client.models.Message.update({
        id: messageId,
        ...updates,
      });
      
      if (errors) {
        console.error('メッセージ更新エラー:', errors);
        throw new Error('メッセージの更新に失敗しました');
      }
      
      if (!message) {
        throw new Error('メッセージの更新に失敗しました');
      }
      
      return message;
    } catch (error) {
      console.error('メッセージ更新エラー:', error);
      throw error;
    }
  },

  // メッセージを削除
  async deleteMessage(messageId: string): Promise<void> {
    try {
      const { errors } = await client.models.Message.delete({
        id: messageId
      });
      
      if (errors) {
        console.error('メッセージ削除エラー:', errors);
        throw new Error('メッセージの削除に失敗しました');
      }
    } catch (error) {
      console.error('メッセージ削除エラー:', error);
      throw error;
    }
  },
};

// ユーザープロフィール関連の操作
export const userProfileOperations = {
  // プロフィールを取得
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data: profile, errors } = await client.models.UserProfile.get({
        id: userId
      });
      
      if (errors) {
        console.error('プロフィール取得エラー:', errors);
        throw new Error('プロフィールの取得に失敗しました');
      }
      
      return profile || null;
    } catch (error) {
      console.error('プロフィール取得エラー:', error);
      throw error;
    }
  },

  // プロフィールを作成
  async createProfile(userId: string, email: string, displayName?: string): Promise<UserProfile> {
    try {
      const { data: profile, errors } = await client.models.UserProfile.create({
        id: userId,
        email,
        displayName,
        preferences: {},
        usageStats: {
          totalMessages: 0,
          totalTokens: 0,
          sessionsCreated: 0,
          lastActiveAt: new Date().toISOString(),
        },
      });
      
      if (errors) {
        console.error('プロフィール作成エラー:', errors);
        throw new Error('プロフィールの作成に失敗しました');
      }
      
      if (!profile) {
        throw new Error('プロフィールの作成に失敗しました');
      }
      
      return profile;
    } catch (error) {
      console.error('プロフィール作成エラー:', error);
      throw error;
    }
  },

  // プロフィールを更新
  async updateProfile(userId: string, updates: UpdateProfileRequest): Promise<UserProfile> {
    try {
      const { data: profile, errors } = await client.models.UserProfile.update({
        id: userId,
        ...updates,
      });
      
      if (errors) {
        console.error('プロフィール更新エラー:', errors);
        throw new Error('プロフィールの更新に失敗しました');
      }
      
      if (!profile) {
        throw new Error('プロフィールの更新に失敗しました');
      }
      
      return profile;
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      throw error;
    }
  },
};

// 使用統計を更新する関数
export const updateUsageStats = async (userId: string, messageCount: number, tokenCount: number) => {
  try {
    const profile = await userProfileOperations.getProfile(userId);
    if (!profile) return;

    const currentStats = profile.usageStats || {
      totalMessages: 0,
      totalTokens: 0,
      sessionsCreated: 0,
      lastActiveAt: new Date().toISOString(),
    };

    await userProfileOperations.updateProfile(userId, {
      usageStats: {
        ...currentStats,
        totalMessages: currentStats.totalMessages + messageCount,
        totalTokens: currentStats.totalTokens + tokenCount,
        lastActiveAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('使用統計更新エラー:', error);
  }
};
