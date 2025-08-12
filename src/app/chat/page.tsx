"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { SessionModal } from '@/components/chat/SessionModal';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/Button';

// 認証チェックコンポーネント
const AuthCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-muted-foreground mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            認証が必要です
          </h2>
          <p className="text-muted-foreground mb-6">
            チャット機能を利用するには、ログインしてください。
          </p>
          <Button onClick={() => window.location.href = '/'}>
            ログインページに戻る
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// チャット機能コンポーネント
const ChatApp: React.FC = () => {
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const {
    sessions,
    currentSession,
    messages,
    isLoading,
    error,
    createSession,
    selectSession,
    sendMessage,
    deleteSession,
    archiveSession,
    deleteMessage,
  } = useChat();

  const handleCreateSession = async (request: any) => {
    try {
      await createSession(request);
    } catch (error) {
      console.error('セッション作成エラー:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('このセッションを削除しますか？この操作は元に戻せません。')) {
      try {
        await deleteSession(sessionId);
      } catch (error) {
        console.error('セッション削除エラー:', error);
      }
    }
  };

  const handleArchiveSession = async (sessionId: string) => {
    try {
      await archiveSession(sessionId);
    } catch (error) {
      console.error('セッションアーカイブエラー:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (confirm('このメッセージを削除しますか？')) {
      try {
        await deleteMessage(messageId);
      } catch (error) {
        console.error('メッセージ削除エラー:', error);
      }
    }
  };

  return (
    <>
      <ChatLayout
        sessions={sessions}
        currentSession={currentSession}
        messages={messages}
        isLoading={isLoading}
        error={error}
        onSelectSession={selectSession}
        onCreateSession={() => setIsSessionModalOpen(true)}
        onDeleteSession={handleDeleteSession}
        onArchiveSession={handleArchiveSession}
        onSendMessage={handleSendMessage}
        onDeleteMessage={handleDeleteMessage}
      />

      <SessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        onSubmit={handleCreateSession}
        isLoading={isLoading}
      />
    </>
  );
};

// メインページコンポーネント
const ChatPage: React.FC = () => {
  return (
    <AuthCheck>
      <ChatProvider>
        <ChatApp />
      </ChatProvider>
    </AuthCheck>
  );
};

export default ChatPage;
