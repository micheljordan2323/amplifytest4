import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ChatProvider } from '@/contexts/ChatContext'

// カスタムレンダラー（プロバイダー付き）
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withAuth?: boolean
  withChat?: boolean
}

const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <ChatProvider>
        {children}
      </ChatProvider>
    </AuthProvider>
  )
}

const AuthOnlyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}

const ChatOnlyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ChatProvider>
      {children}
    </ChatProvider>
  )
}

function customRender(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { withAuth = false, withChat = false, ...renderOptions } = options

  let Wrapper: React.FC<{ children: React.ReactNode }>

  if (withAuth && withChat) {
    Wrapper = AllTheProviders
  } else if (withAuth) {
    Wrapper = AuthOnlyProvider
  } else if (withChat) {
    Wrapper = ChatOnlyProvider
  } else {
    Wrapper = ({ children }) => <>{children}</>
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// テストデータ生成
export const createMockUser = (overrides = {}) => ({
  userId: 'test-user-id',
  username: 'test@example.com',
  email: 'test@example.com',
  ...overrides,
})

export const createMockChatSession = (overrides = {}) => ({
  id: 'test-session-id',
  title: 'Test Session',
  userId: 'test-user-id',
  messageCount: 0,
  lastMessageAt: new Date().toISOString(),
  isArchived: false,
  model: 'claude-3-sonnet-20240229-v1:0',
  temperature: 0.7,
  maxTokens: 4096,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

export const createMockMessage = (overrides = {}) => ({
  id: 'test-message-id',
  sessionId: 'test-session-id',
  userId: 'test-user-id',
  content: 'Test message content',
  role: 'user' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

export const createMockUserProfile = (overrides = {}) => ({
  id: 'test-profile-id',
  email: 'test@example.com',
  displayName: 'Test User',
  avatar: null,
  preferences: {},
  usageStats: {
    totalMessages: 0,
    totalTokens: 0,
    lastUsed: new Date().toISOString(),
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

// 非同期処理の待機
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// フォーム入力のシミュレーション
export const fillForm = async (container: HTMLElement, formData: Record<string, string>) => {
  const { user } = await import('@testing-library/user-event')
  const userEvent = user.setup()

  for (const [name, value] of Object.entries(formData)) {
    const input = container.querySelector(`[name="${name}"]`) as HTMLInputElement
    if (input) {
      await userEvent.type(input, value)
    }
  }
}

// ボタンクリックのシミュレーション
export const clickButton = async (container: HTMLElement, text: string) => {
  const { user } = await import('@testing-library/user-event')
  const userEvent = user.setup()

  const button = container.querySelector(`button:contains("${text}")`) as HTMLButtonElement
  if (button) {
    await userEvent.click(button)
  }
}

// エラーメッセージの検証
export const expectErrorMessage = (container: HTMLElement, message: string) => {
  const errorElement = container.querySelector('[role="alert"]') || 
                      container.querySelector('.error') ||
                      container.querySelector('[data-testid="error"]')
  
  expect(errorElement).toBeInTheDocument()
  expect(errorElement).toHaveTextContent(message)
}

// ローディング状態の検証
export const expectLoadingState = (container: HTMLElement) => {
  const loadingElement = container.querySelector('[data-testid="loading"]') ||
                        container.querySelector('.loading') ||
                        container.querySelector('[aria-busy="true"]')
  
  expect(loadingElement).toBeInTheDocument()
}

// モック関数のリセット
export const resetMocks = () => {
  jest.clearAllMocks()
  jest.resetAllMocks()
}

// テスト用の環境変数設定
export const setTestEnvironment = () => {
  process.env.NODE_ENV = 'test'
  process.env.NEXT_PUBLIC_AMPLIFY_PROJECT_NAME = 'test-project'
  process.env.AWS_REGION = 'us-east-1'
}

// エクスポート
export * from '@testing-library/react'
export { customRender as render }
