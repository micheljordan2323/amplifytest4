import React from 'react';
import { cn, formatDate } from '@/lib/utils';
import type { Message } from '@/types/chat';

interface MessageItemProps {
  message: Message;
  isLast?: boolean;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isLast = false,
  onEdit,
  onDelete,
}) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  // コードブロックを検出してハイライト
  const renderContent = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // コードブロック前のテキスト
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index),
        });
      }

      // コードブロック
      parts.push({
        type: 'code',
        language: match[1] || 'text',
        content: match[2],
      });

      lastIndex = match.index + match[0].length;
    }

    // 残りのテキスト
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex),
      });
    }

    return parts.length > 0 ? parts : [{ type: 'text', content }];
  };

  const contentParts = renderContent(message.content);

  return (
    <div
      className={cn(
        'group relative px-4 py-3 transition-colors hover:bg-muted/50',
        isLast && 'border-b border-border'
      )}
    >
      <div className="flex gap-3">
        {/* アバター */}
        <div className="flex-shrink-0">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              isUser
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
            )}
          >
            {isUser ? 'U' : 'A'}
          </div>
        </div>

        {/* メッセージコンテンツ */}
        <div className="flex-1 min-w-0">
          {/* ヘッダー */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-foreground">
              {isUser ? 'あなた' : 'アシスタント'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(message.createdAt)}
            </span>
            {message.tokens && (
              <span className="text-xs text-muted-foreground">
                {message.tokens} tokens
              </span>
            )}
          </div>

          {/* メッセージ本文 */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {contentParts.map((part, index) => {
              if (part.type === 'code') {
                return (
                  <pre
                    key={index}
                    className="bg-muted p-3 rounded-md overflow-x-auto text-sm"
                  >
                    <code className={`language-${part.language}`}>
                      {part.content}
                    </code>
                  </pre>
                );
              }
              return (
                <p key={index} className="whitespace-pre-wrap">
                  {part.content}
                </p>
              );
            })}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            {isUser && onEdit && (
              <button
                onClick={() => onEdit(message.id, message.content)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="編集"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(message.id)}
                className="p-1 text-muted-foreground hover:text-destructive transition-colors"
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { MessageItem };
