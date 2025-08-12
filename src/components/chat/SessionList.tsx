import React, { useState } from 'react';
import { cn, formatDate, truncateText } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { ChatSession } from '@/types/chat';

interface SessionListProps {
  sessions: ChatSession[];
  currentSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => void;
  onDeleteSession?: (sessionId: string) => void;
  onArchiveSession?: (sessionId: string) => void;
  isLoading?: boolean;
}

const SessionList: React.FC<SessionListProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onArchiveSession,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // セッションをフィルタリング
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArchived = showArchived ? session.isArchived : !session.isArchived;
    return matchesSearch && matchesArchived;
  });

  const activeSessions = filteredSessions.filter(s => !s.isArchived);
  const archivedSessions = filteredSessions.filter(s => s.isArchived);

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* ヘッダー */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">セッション</h2>
          <Button
            onClick={onCreateSession}
            size="sm"
            className="h-8"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            新規作成
          </Button>
        </div>

        {/* 検索 */}
        <Input
          placeholder="セッションを検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-3"
        />

        {/* アーカイブ切り替え */}
        <div className="flex gap-2">
          <Button
            variant={!showArchived ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowArchived(false)}
            className="flex-1"
          >
            アクティブ ({activeSessions.length})
          </Button>
          <Button
            variant={showArchived ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowArchived(true)}
            className="flex-1"
          >
            アーカイブ ({archivedSessions.length})
          </Button>
        </div>
      </div>

      {/* セッション一覧 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            読み込み中...
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchQuery ? '検索結果が見つかりません' : 'セッションがありません'}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredSessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                isActive={session.id === currentSessionId}
                onSelect={() => onSelectSession(session.id)}
                onDelete={onDeleteSession ? () => onDeleteSession(session.id) : undefined}
                onArchive={onArchiveSession ? () => onArchiveSession(session.id) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
}

const SessionItem: React.FC<SessionItemProps> = ({
  session,
  isActive,
  onSelect,
  onDelete,
  onArchive,
}) => {
  return (
    <div
      className={cn(
        'group relative p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50',
        isActive && 'bg-muted border border-border'
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground mb-1 truncate">
            {session.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{session.messageCount} メッセージ</span>
            <span>•</span>
            <span>{formatDate(session.lastMessageAt || session.createdAt)}</span>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            {onArchive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive();
                }}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={session.isArchived ? 'アーカイブ解除' : 'アーカイブ'}
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
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
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

export { SessionList };
