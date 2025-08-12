"use client";

import { useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChatContext } from '@/contexts/ChatContext';
import type { ChatStreamResponse } from '@/lib/bedrock/types';

export const useChatStream = () => {
  const { user } = useAuth();
  const { dispatch } = useChatContext();
  const abortControllerRef = useRef<AbortController | null>(null);

  // ストリーミングメッセージ送信
  const sendMessageStream = useCallback(async (
    sessionId: string,
    message: string,
    model: string,
    temperature?: number,
    maxTokens?: number
  ) => {
    if (!user) {
      throw new Error('ユーザーが認証されていません');
    }

    // 前のリクエストをキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 新しいAbortControllerを作成
    abortControllerRef.current = new AbortController();

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // ユーザーメッセージを即座に追加（仮のID）
      const tempUserMessageId = `temp-${Date.now()}`;
      const tempUserMessage = {
        id: tempUserMessageId,
        sessionId,
        userId: user.userId,
        content: message,
        role: 'user' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: tempUserMessage });

      // アシスタントメッセージのプレースホルダーを追加
      const tempAssistantMessageId = `temp-assistant-${Date.now()}`;
      const tempAssistantMessage = {
        id: tempAssistantMessageId,
        sessionId,
        userId: user.userId,
        content: '',
        role: 'assistant' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: tempAssistantMessage });

      // ストリーミングAPIを呼び出し
      const params = new URLSearchParams({
        sessionId,
        message,
        model,
        ...(temperature !== undefined && { temperature: temperature.toString() }),
        ...(maxTokens !== undefined && { maxTokens: maxTokens.toString() }),
      });

      const response = await fetch(`/api/chat?${params}`, {
        method: 'GET',
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'ストリーミングAPI呼び出しに失敗しました');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('レスポンスストリームを読み取れません');
      }

      const decoder = new TextDecoder();
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: ChatStreamResponse = JSON.parse(line.slice(6));
              
              if (data.type === 'content' && data.content) {
                assistantContent += data.content;
                
                // アシスタントメッセージを更新
                dispatch({
                  type: 'UPDATE_MESSAGE',
                  payload: {
                    id: tempAssistantMessageId,
                    updates: { content: assistantContent },
                  },
                });
              } else if (data.type === 'error') {
                throw new Error(data.error || 'ストリーミングエラーが発生しました');
              } else if (data.type === 'done') {
                // ストリーミング完了
                return;
              }
            } catch (parseError) {
              console.error('ストリームデータのパースエラー:', parseError);
            }
          }
        }
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // キャンセルされた場合は何もしない
        return;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'ストリーミング送信に失敗しました';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      abortControllerRef.current = null;
    }
  }, [user, dispatch]);

  // ストリーミングをキャンセル
  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    sendMessageStream,
    cancelStream,
  };
};
