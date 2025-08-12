import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { MessageItem } from './MessageItem';
import type { Message } from '@/types/chat';

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
  error?: string | null;
  onEditMessage?: (messageId: string, content: string) => void;
  onDeleteMessage?: (messageId: string) => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isLoading = false,
  error = null,
  onEditMessage,
  onDeleteMessage,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-destructive mb-2">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            エラーが発生しました
          </h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            会話を開始しましょう
          </h3>
          <p className="text-muted-foreground">
            メッセージを送信して、AIアシスタントと対話を始めてください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-1">
        {messages.map((message, index) => (
          <MessageItem
            key={message.id}
            message={message}
            isLast={index === messages.length - 1}
            onEdit={onEditMessage}
            onDelete={onDeleteMessage}
          />
        ))}
        
        {/* ローディングインジケーター */}
        {isLoading && (
          <div className="px-4 py-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-sm font-medium text-secondary-foreground">
                    A
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">
                    アシスタント
                  </span>
                  <span className="text-xs text-muted-foreground">
                    入力中...
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 自動スクロール用の要素 */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export { ChatMessages };
