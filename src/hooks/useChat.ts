"use client";

import { useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChatContext } from '@/contexts/ChatContext';
import { 
  chatSessionOperations, 
  messageOperations, 
  userProfileOperations,
  updateUsageStats 
} from '@/lib/database';
import { validateCreateSessionRequest, validateSendMessageRequest } from '@/lib/schema-validation';
import type { CreateSessionRequest, SendMessageRequest } from '@/types/chat';

export const useChat = () => {
  const { user } = useAuth();
  const { state, dispatch } = useChatContext();

  // 初期データの読み込み
  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = useCallback(async () => {
    if (!user) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // セッション一覧を取得
      const sessions = await chatSessionOperations.listSessions(user.userId);
      dispatch({ type: 'SET_SESSIONS', payload: sessions });

      // ユーザープロフィールを取得または作成
      let profile = await userProfileOperations.getProfile(user.userId);
      if (!profile) {
        profile = await userProfileOperations.createProfile(
          user.userId,
          user.username || '',
          user.username || ''
        );
      }
      dispatch({ type: 'SET_USER_PROFILE', payload: profile });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'データの読み込みに失敗しました';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user, dispatch]);

  // セッション作成
  const createSession = useCallback(async (request: CreateSessionRequest) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    // バリデーション
    const validation = validateCreateSessionRequest(request);
    if (!validation.isValid) {
      throw new Error(validation.errors[0]?.message || '無効なリクエストです');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const session = await chatSessionOperations.createSession(request, user.userId);
      dispatch({ type: 'ADD_SESSION', payload: session });
      dispatch({ type: 'SET_CURRENT_SESSION', payload: session });

      return session;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'セッションの作成に失敗しました';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user, dispatch]);

  // セッション選択
  const selectSession = useCallback(async (sessionId: string) => {
    if (!user) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // セッションを取得
      const session = await chatSessionOperations.getSession(sessionId);
      if (!session) {
        throw new Error('セッションが見つかりません');
      }

      dispatch({ type: 'SET_CURRENT_SESSION', payload: session });

      // メッセージを取得
      const messages = await messageOperations.listMessages(sessionId);
      dispatch({ type: 'SET_MESSAGES', payload: messages });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'セッションの読み込みに失敗しました';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user, dispatch]);

  // メッセージ送信
  const sendMessage = useCallback(async (content: string) => {
    if (!user || !state.currentSession) {
      throw new Error('セッションが選択されていません');
    }

    // バリデーション
    const request: SendMessageRequest = {
      sessionId: state.currentSession.id,
      content,
    };
    const validation = validateSendMessageRequest(request);
    if (!validation.isValid) {
      throw new Error(validation.errors[0]?.message || '無効なメッセージです');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // ユーザーメッセージを作成
      const userMessage = await messageOperations.createMessage(
        request,
        user.userId,
        'user'
      );
      dispatch({ type: 'ADD_MESSAGE', payload: userMessage });

      // Bedrock APIを呼び出し
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: state.currentSession.id,
          message: content,
          model: state.currentSession.model,
          temperature: state.currentSession.temperature,
          maxTokens: state.currentSession.maxTokens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API呼び出しに失敗しました');
      }

      const result = await response.json();
      
      if (result.success && result.data.assistantMessage) {
        dispatch({ type: 'ADD_MESSAGE', payload: result.data.assistantMessage });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'メッセージの送信に失敗しました';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user, state.currentSession, dispatch]);

  // セッション削除
  const deleteSession = useCallback(async (sessionId: string) => {
    if (!user) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      await chatSessionOperations.deleteSession(sessionId);
      dispatch({ type: 'DELETE_SESSION', payload: sessionId });

      // 現在のセッションが削除された場合、最初のセッションを選択
      if (state.currentSession?.id === sessionId) {
        const remainingSessions = state.sessions.filter(s => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          await selectSession(remainingSessions[0].id);
        } else {
          dispatch({ type: 'SET_CURRENT_SESSION', payload: null });
          dispatch({ type: 'SET_MESSAGES', payload: [] });
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'セッションの削除に失敗しました';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user, state.currentSession, state.sessions, dispatch, selectSession]);

  // セッションアーカイブ
  const archiveSession = useCallback(async (sessionId: string) => {
    if (!user) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const session = state.sessions.find(s => s.id === sessionId);
      if (!session) return;

      const updatedSession = await chatSessionOperations.updateSession(sessionId, {
        isArchived: !session.isArchived,
      });
      dispatch({ type: 'UPDATE_SESSION', payload: { id: sessionId, updates: updatedSession } });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'セッションのアーカイブに失敗しました';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user, state.sessions, dispatch]);

  // メッセージ削除
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      await messageOperations.deleteMessage(messageId);
      dispatch({ type: 'DELETE_MESSAGE', payload: messageId });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'メッセージの削除に失敗しました';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user, dispatch]);

  return {
    // 状態
    sessions: state.sessions,
    currentSession: state.currentSession,
    messages: state.messages,
    userProfile: state.userProfile,
    isLoading: state.isLoading,
    error: state.error,

    // アクション
    createSession,
    selectSession,
    sendMessage,
    deleteSession,
    archiveSession,
    deleteMessage,
    loadInitialData,
  };
};
