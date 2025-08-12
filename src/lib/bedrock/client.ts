import { BedrockRuntimeClient, InvokeModelCommand, InvokeModelWithResponseStreamCommand } from '@aws-sdk/client-bedrock-runtime';
import type {
  BedrockChatRequest,
  BedrockChatResponse,
  BedrockStreamResponse,
  ChatAPIRequest,
  ChatAPIResponse,
  ChatStreamResponse,
  ModelConfig,
  SUPPORTED_MODELS,
  BedrockAPIError,
  RateLimitError,
  AuthenticationError,
  ModelError,
} from './types';

// Bedrock APIクライアントの設定
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  maxAttempts: 3,
  requestHandler: {
    httpOptions: {
      timeout: 30000, // 30秒
    },
  },
});

// レート制限管理
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async checkLimit(): Promise<boolean> {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
}

const rateLimiter = new RateLimiter();

// エラーハンドリング
function handleBedrockError(error: any): never {
  if (error.name === 'ThrottlingException') {
    throw new RateLimitError();
  }
  
  if (error.name === 'UnauthorizedOperation' || error.name === 'AccessDenied') {
    throw new AuthenticationError();
  }
  
  if (error.name === 'ValidationException' || error.name === 'ModelStreamErrorException') {
    throw new ModelError(error.message);
  }
  
  throw new BedrockAPIError(
    error.message || 'Bedrock APIでエラーが発生しました',
    error.name,
    error.$metadata?.httpStatusCode
  );
}

// モデル設定の取得
export function getModelConfig(modelId: string): ModelConfig {
  const model = SUPPORTED_MODELS.find(m => m.id === modelId);
  if (!model) {
    throw new ModelError(`サポートされていないモデル: ${modelId}`);
  }
  return model;
}

// 通常のチャット応答
export async function invokeChat(request: ChatAPIRequest): Promise<ChatAPIResponse> {
  // レート制限チェック
  if (!(await rateLimiter.checkLimit())) {
    throw new RateLimitError();
  }

  try {
    const modelConfig = getModelConfig(request.model);
    
    const bedrockRequest: BedrockChatRequest = {
      messages: [
        ...(request.systemPrompt ? [{ role: 'system' as const, content: request.systemPrompt }] : []),
        { role: 'user' as const, content: request.message }
      ],
      model: request.model,
      temperature: request.temperature ?? modelConfig.defaultTemperature,
      maxTokens: request.maxTokens ?? modelConfig.maxTokens,
      anthropicVersion: 'bedrock-2023-05-31',
    };

    const command = new InvokeModelCommand({
      modelId: request.model,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(bedrockRequest),
    });

    const response = await bedrockClient.send(command);
    
    if (!response.body) {
      throw new ModelError('レスポンスボディが空です');
    }

    const responseText = await response.body.transformToString();
    const bedrockResponse: BedrockChatResponse = JSON.parse(responseText);

    return {
      content: bedrockResponse.content[0]?.text || '',
      tokens: bedrockResponse.usage.outputTokens,
      model: request.model,
      finishReason: bedrockResponse.finishReason,
      sessionId: request.sessionId,
    };

  } catch (error) {
    handleBedrockError(error);
  }
}

// ストリーミングチャット応答
export async function* invokeChatStream(request: ChatAPIRequest): AsyncGenerator<ChatStreamResponse> {
  // レート制限チェック
  if (!(await rateLimiter.checkLimit())) {
    throw new RateLimitError();
  }

  try {
    const modelConfig = getModelConfig(request.model);
    
    const bedrockRequest: BedrockChatRequest = {
      messages: [
        ...(request.systemPrompt ? [{ role: 'system' as const, content: request.systemPrompt }] : []),
        { role: 'user' as const, content: request.message }
      ],
      model: request.model,
      temperature: request.temperature ?? modelConfig.defaultTemperature,
      maxTokens: request.maxTokens ?? modelConfig.maxTokens,
      anthropicVersion: 'bedrock-2023-05-31',
    };

    const command = new InvokeModelWithResponseStreamCommand({
      modelId: request.model,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(bedrockRequest),
    });

    const response = await bedrockClient.send(command);
    
    if (!response.body) {
      throw new ModelError('レスポンスボディが空です');
    }

    const stream = response.body;
    let usage: any = null;

    for await (const chunk of stream) {
      if (chunk.chunk?.bytes) {
        const chunkText = new TextDecoder().decode(chunk.chunk.bytes);
        const lines = chunkText.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              yield {
                type: 'done',
                sessionId: request.sessionId,
              };
              return;
            }
            
            try {
              const bedrockResponse: BedrockStreamResponse = JSON.parse(data);
              
              if (bedrockResponse.type === 'content_block_delta' && bedrockResponse.delta) {
                yield {
                  type: 'content',
                  content: bedrockResponse.delta.text,
                  sessionId: request.sessionId,
                };
              } else if (bedrockResponse.type === 'message_stop') {
                if (bedrockResponse.usage) {
                  usage = bedrockResponse.usage;
                  yield {
                    type: 'usage',
                    usage: bedrockResponse.usage,
                    sessionId: request.sessionId,
                  };
                }
              }
            } catch (parseError) {
              console.error('ストリームデータのパースエラー:', parseError);
            }
          }
        }
      }
    }

  } catch (error) {
    yield {
      type: 'error',
      error: error instanceof Error ? error.message : 'ストリーミングエラーが発生しました',
      sessionId: request.sessionId,
    };
    handleBedrockError(error);
  }
}

// トークン数の概算計算（簡易版）
export function estimateTokenCount(text: string): number {
  // 日本語と英語の混在を考慮した概算
  const japaneseChars = (text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g) || []).length;
  const englishWords = text.split(/\s+/).filter(word => /^[a-zA-Z]+$/.test(word)).length;
  const otherChars = text.length - japaneseChars;
  
  // 日本語文字は約1トークン、英語は約1.3トークン、その他は約0.75トークン
  return Math.ceil(japaneseChars + englishWords * 1.3 + otherChars * 0.75);
}

// クライアントのエクスポート
export { bedrockClient };
