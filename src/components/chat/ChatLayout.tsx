import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { SessionList } from './SessionList';
import { ChatMessages } from './ChatMessages';
import { MessageInput } from './MessageInput';
import type { ChatSession, Message } from '@/types/chat';

interface ChatLayoutProps {
  sessions: ChatSession[];
  currentSession?: ChatSession | null;
  messages: Message[];
  isLoading?: boolean;
  error?: string | null;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => void;
  onDeleteSession?: (sessionId: string) => void;
  onArchiveSession?: (sessionId: string) => void;
  onSendMessage: (message: string) => void;
  onEditMessage?: (messageId: string, content: string) => void;
  onDeleteMessage?: (messageId: string) => void;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({
  sessions,
  currentSession,
  messages,
  isLoading = false,
  error = null,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onArchiveSession,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex bg-background">
      {/* サイドバー */}
      <div
        className={cn(
          'flex flex-col w-80 border-r border-border bg-background transition-transform duration-300 ease-in-out',
          !sidebarOpen && '-translate-x-full'
        )}
      >
        <SessionList
          sessions={sessions}
          currentSessionId={currentSession?.id}
          onSelectSession={onSelectSession}
          onCreateSession={onCreateSession}
          onDeleteSession={onDeleteSession}
          onArchiveSession={onArchiveSession}
          isLoading={isLoading}
        />
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-muted transition-colors lg:hidden"
              aria-label="メニュー"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {currentSession?.title || 'チャット'}
              </h1>
              {currentSession && (
                <p className="text-sm text-muted-foreground">
                  {currentSession.messageCount} メッセージ
                  {currentSession.model && ` • ${currentSession.model}`}
                </p>
              )}
            </div>
          </div>

          {/* ヘッダーアクション */}
          <div className="flex items-center gap-2">
            {currentSession && (
              <>
                <button
                  onClick={() => onArchiveSession?.(currentSession.id)}
                  className="p-2 rounded-md hover:bg-muted transition-colors"
                  aria-label={currentSession.isArchived ? 'アーカイブ解除' : 'アーカイブ'}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => onDeleteSession?.(currentSession.id)}
                  className="p-2 rounded-md hover:bg-muted transition-colors text-destructive"
                  aria-label="削除"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* メッセージエリア */}
        <div className="flex-1 flex flex-col min-h-0">
          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            error={error}
            onEditMessage={onEditMessage}
            onDeleteMessage={onDeleteMessage}
          />
          
          {/* メッセージ入力 */}
          {currentSession && (
            <MessageInput
              onSend={onSendMessage}
              disabled={isLoading}
              loading={isLoading}
            />
          )}
        </div>
      </div>

      {/* モバイルオーバーレイ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export { ChatLayout };
