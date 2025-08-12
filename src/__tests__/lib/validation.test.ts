import {
  validateChatSession,
  validateMessage,
  validateUserProfile,
  validateCreateSessionRequest,
  validateSendMessageRequest,
  validateUpdateProfileRequest,
  isValidEmail,
  getValidationErrorMessage,
} from '@/lib/schema-validation'
import type { ChatSession, Message, UserProfile, CreateSessionRequest, SendMessageRequest, UpdateProfileRequest } from '@/types/chat'

describe('Schema Validation', () => {
  describe('validateChatSession', () => {
    it('validates a valid chat session', () => {
      const session: Partial<ChatSession> = {
        title: 'Test Session',
        userId: 'user-123',
        model: 'claude-3-sonnet-20240229-v1:0',
        temperature: 0.7,
        maxTokens: 4096,
      }

      const result = validateChatSession(session)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('returns error for missing title', () => {
      const session: Partial<ChatSession> = {
        userId: 'user-123',
        model: 'claude-3-sonnet-20240229-v1:0',
      }

      const result = validateChatSession(session)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].field).toBe('title')
      expect(result.errors[0].message).toContain('必須')
    })

    it('returns error for title too long', () => {
      const session: Partial<ChatSession> = {
        title: 'a'.repeat(201),
        userId: 'user-123',
        model: 'claude-3-sonnet-20240229-v1:0',
      }

      const result = validateChatSession(session)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].field).toBe('title')
      expect(result.errors[0].message).toContain('200文字以内')
    })

    it('returns error for invalid temperature', () => {
      const session: Partial<ChatSession> = {
        title: 'Test Session',
        userId: 'user-123',
        model: 'claude-3-sonnet-20240229-v1:0',
        temperature: 1.5,
      }

      const result = validateChatSession(session)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].field).toBe('temperature')
      expect(result.errors[0].message).toContain('0から1の間')
    })

    it('returns error for invalid maxTokens', () => {
      const session: Partial<ChatSession> = {
        title: 'Test Session',
        userId: 'user-123',
        model: 'claude-3-sonnet-20240229-v1:0',
        maxTokens: 0,
      }

      const result = validateChatSession(session)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].field).toBe('maxTokens')
      expect(result.errors[0].message).toContain('1から100000の間')
    })
  })

  describe('validateMessage', () => {
    it('validates a valid message', () => {
      const message: Partial<Message> = {
        sessionId: 'session-123',
        userId: 'user-123',
        content: 'Test message content',
        role: 'user',
      }

      const result = validateMessage(message)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('returns error for missing content', () => {
      const message: Partial<Message> = {
        sessionId: 'session-123',
        userId: 'user-123',
        role: 'user',
      }

      const result = validateMessage(message)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].field).toBe('content')
      expect(result.errors[0].message).toContain('必須')
    })

    it('returns error for content too long', () => {
      const message: Partial<Message> = {
        sessionId: 'session-123',
        userId: 'user-123',
        content: 'a'.repeat(10001),
        role: 'user',
      }

      const result = validateMessage(message)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].field).toBe('content')
      expect(result.errors[0].message).toContain('10000文字以内')
    })

    it('returns error for invalid role', () => {
      const message: Partial<Message> = {
        sessionId: 'session-123',
        userId: 'user-123',
        content: 'Test message',
        role: 'invalid' as any,
      }

      const result = validateMessage(message)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].field).toBe('role')
      expect(result.errors[0].message).toContain('userまたはassistant')
    })
  })

  describe('validateUserProfile', () => {
    it('validates a valid user profile', () => {
      const profile: Partial<UserProfile> = {
        email: 'test@example.com',
        displayName: 'Test User',
      }

      const result = validateUserProfile(profile)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('returns error for invalid email', () => {
      const profile: Partial<UserProfile> = {
        email: 'invalid-email',
        displayName: 'Test User',
      }

      const result = validateUserProfile(profile)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].field).toBe('email')
      expect(result.errors[0].message).toContain('有効なメールアドレス')
    })

    it('returns error for missing email', () => {
      const profile: Partial<UserProfile> = {
        displayName: 'Test User',
      }

      const result = validateUserProfile(profile)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].field).toBe('email')
      expect(result.errors[0].message).toContain('必須')
    })
  })

  describe('validateCreateSessionRequest', () => {
    it('validates a valid create session request', () => {
      const request: CreateSessionRequest = {
        title: 'Test Session',
        model: 'claude-3-sonnet-20240229-v1:0',
        temperature: 0.7,
        maxTokens: 4096,
      }

      const result = validateCreateSessionRequest(request)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('returns error for missing title', () => {
      const request: CreateSessionRequest = {
        model: 'claude-3-sonnet-20240229-v1:0',
        temperature: 0.7,
        maxTokens: 4096,
      }

      const result = validateCreateSessionRequest(request)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].field).toBe('title')
    })
  })

  describe('validateSendMessageRequest', () => {
    it('validates a valid send message request', () => {
      const request: SendMessageRequest = {
        sessionId: 'session-123',
        content: 'Test message',
      }

      const result = validateSendMessageRequest(request)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('returns error for missing sessionId', () => {
      const request: SendMessageRequest = {
        content: 'Test message',
      }

      const result = validateSendMessageRequest(request)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].field).toBe('sessionId')
    })

    it('returns error for missing content', () => {
      const request: SendMessageRequest = {
        sessionId: 'session-123',
      }

      const result = validateSendMessageRequest(request)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].field).toBe('content')
    })
  })

  describe('validateUpdateProfileRequest', () => {
    it('validates a valid update profile request', () => {
      const request: UpdateProfileRequest = {
        displayName: 'Updated Name',
        email: 'updated@example.com',
      }

      const result = validateUpdateProfileRequest(request)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('returns error for invalid email', () => {
      const request: UpdateProfileRequest = {
        displayName: 'Updated Name',
        email: 'invalid-email',
      }

      const result = validateUpdateProfileRequest(request)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].field).toBe('email')
    })
  })

  describe('isValidEmail', () => {
    it('validates correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('user+tag@example.org')).toBe(true)
    })

    it('rejects invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test@example')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('getValidationErrorMessage', () => {
    it('formats single error message', () => {
      const errors = [{ field: 'title', message: 'タイトルは必須です' }]
      const message = getValidationErrorMessage(errors)
      expect(message).toBe('title: タイトルは必須です')
    })

    it('formats multiple error messages', () => {
      const errors = [
        { field: 'title', message: 'タイトルは必須です' },
        { field: 'email', message: '有効なメールアドレスを入力してください' },
      ]
      const message = getValidationErrorMessage(errors)
      expect(message).toBe('title: タイトルは必須です, email: 有効なメールアドレスを入力してください')
    })

    it('returns empty string for no errors', () => {
      const message = getValidationErrorMessage([])
      expect(message).toBe('')
    })
  })
})
