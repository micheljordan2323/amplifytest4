import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  maxLength?: number;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled = false,
  loading = false,
  placeholder = 'メッセージを入力してください...',
  maxLength = 10000,
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && !loading) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // テキストエリアの自動リサイズ
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [message]);

  const canSend = message.trim().length > 0 && !disabled && !loading;

  return (
    <form onSubmit={handleSubmit} className="border-t border-border bg-background">
      <div className="p-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              maxLength={maxLength}
              showCharacterCount={true}
              disabled={disabled || loading}
              className="min-h-[44px] max-h-[200px] resize-none"
              rows={1}
            />
          </div>
          <div className="flex-shrink-0">
            <Button
              type="submit"
              disabled={!canSend}
              loading={loading}
              className="h-[44px] px-4"
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
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </Button>
          </div>
        </div>
        
        {/* ヘルプテキスト */}
        <div className="mt-2 text-xs text-muted-foreground">
          Enter で送信、Shift + Enter で改行
        </div>
      </div>
    </form>
  );
};

export { MessageInput };
