"use client";

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { CreateSessionRequest } from '@/types/chat';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: CreateSessionRequest) => Promise<void>;
  isLoading?: boolean;
}

const SessionModal: React.FC<SessionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CreateSessionRequest>({
    title: '',
    model: 'claude-3-sonnet-20240229-v1:0',
    temperature: 0.7,
    maxTokens: 4096,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'タイトルは必須です';
    } else if (formData.title.length > 200) {
      newErrors.title = 'タイトルは200文字以内で入力してください';
    }
    
    if (formData.temperature !== undefined && (formData.temperature < 0 || formData.temperature > 1)) {
      newErrors.temperature = 'temperatureは0から1の間で設定してください';
    }
    
    if (formData.maxTokens !== undefined && (formData.maxTokens < 1 || formData.maxTokens > 100000)) {
      newErrors.maxTokens = 'maxTokensは1から100000の間で設定してください';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      // エラーは親コンポーネントで処理される
      console.error('セッション作成エラー:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      model: 'claude-3-sonnet-20240229-v1:0',
      temperature: 0.7,
      maxTokens: 4096,
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof CreateSessionRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="新しいセッションを作成"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* タイトル */}
        <Input
          label="セッションタイトル"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="セッションのタイトルを入力してください"
          error={errors.title}
          required
        />

        {/* モデル選択 */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            モデル
          </label>
          <select
            value={formData.model}
            onChange={(e) => handleInputChange('model', e.target.value)}
            className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="claude-3-sonnet-20240229-v1:0">Claude 3 Sonnet</option>
            <option value="claude-3-haiku-20240307-v1:0">Claude 3 Haiku</option>
            <option value="claude-3-opus-20240229-v1:0">Claude 3 Opus</option>
          </select>
        </div>

        {/* 設定オプション */}
        <div className="grid grid-cols-2 gap-4">
          {/* Temperature */}
          <Input
            label="Temperature"
            type="number"
            step="0.1"
            min="0"
            max="1"
            value={formData.temperature}
            onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
            error={errors.temperature}
            helperText="0: 決定論的、1: 創造的"
          />

          {/* Max Tokens */}
          <Input
            label="Max Tokens"
            type="number"
            min="1"
            max="100000"
            value={formData.maxTokens}
            onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value))}
            error={errors.maxTokens}
            helperText="最大トークン数"
          />
        </div>

        {/* 説明 */}
        <Textarea
          label="説明（オプション）"
          placeholder="セッションの目的や設定について記述してください"
          rows={3}
        />

        {/* アクションボタン */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
          >
            セッションを作成
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export { SessionModal };
