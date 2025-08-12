import { NextRequest, NextResponse } from 'next/server';
import { invokeChat, invokeChatStream } from '@/lib/bedrock/client';
import { getCurrentUser } from 'aws-amplify/auth';
import { chatSessionOperations, messageOperations, updateUsageStats } from '@/lib/database';
import type { ChatAPIRequest } from '@/lib/bedrock/types';

// 通常のチャット応答
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // リクエストボディの解析
    const body: ChatAPIRequest = await request.json();
    
    // バリデーション
    if (!body.sessionId || !body.message || !body.model) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています' },
        { status: 400 }
      );
    }

    // セッションの存在確認
    const session = await chatSessionOperations.getSession(body.sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'セッションが見つかりません' },
        { status: 404 }
      );
    }

    // セッションの所有者確認
    if (session.userId !== user.userId) {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      );
    }

    // ユーザーメッセージを保存
    const userMessage = await messageOperations.createMessage(
      {
        sessionId: body.sessionId,
        content: body.message,
      },
      user.userId,
      'user'
    );

    // Bedrock APIを呼び出し
    const bedrockResponse = await invokeChat({
      ...body,
      systemPrompt: session.systemPrompt,
    });

    // アシスタントメッセージを保存
    const assistantMessage = await messageOperations.createMessage(
      {
        sessionId: body.sessionId,
        content: bedrockResponse.content,
      },
      user.userId,
      'assistant',
      {
        model: bedrockResponse.model,
        tokens: bedrockResponse.tokens,
        finishReason: bedrockResponse.finishReason,
      }
    );

    // セッションを更新
    await chatSessionOperations.updateSession(body.sessionId, {
      lastMessageAt: new Date().toISOString(),
      messageCount: session.messageCount + 2,
    });

    // 使用統計を更新
    await updateUsageStats(
      user.userId,
      2, // メッセージ数
      bedrockResponse.tokens // トークン数
    );

    return NextResponse.json({
      success: true,
      data: {
        userMessage,
        assistantMessage,
        usage: {
          tokens: bedrockResponse.tokens,
          model: bedrockResponse.model,
        },
      },
    });

  } catch (error) {
    console.error('チャットAPIエラー:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: '内部サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// ストリーミングチャット応答
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const message = searchParams.get('message');
    const model = searchParams.get('model');
    const temperature = searchParams.get('temperature');
    const maxTokens = searchParams.get('maxTokens');

    // バリデーション
    if (!sessionId || !message || !model) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています' },
        { status: 400 }
      );
    }

    // セッションの存在確認
    const session = await chatSessionOperations.getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'セッションが見つかりません' },
        { status: 404 }
      );
    }

    // セッションの所有者確認
    if (session.userId !== user.userId) {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      );
    }

    // ユーザーメッセージを保存
    const userMessage = await messageOperations.createMessage(
      {
        sessionId,
        content: message,
      },
      user.userId,
      'user'
    );

    // ストリーミングレスポンスの設定
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let assistantContent = '';
          let totalTokens = 0;

          // Bedrock APIストリーミング呼び出し
          const bedrockRequest: ChatAPIRequest = {
            sessionId,
            message,
            model,
            temperature: temperature ? parseFloat(temperature) : undefined,
            maxTokens: maxTokens ? parseInt(maxTokens) : undefined,
            systemPrompt: session.systemPrompt,
          };

          for await (const chunk of invokeChatStream(bedrockRequest)) {
            if (chunk.type === 'content' && chunk.content) {
              assistantContent += chunk.content;
              
              // ストリーミングデータを送信
              const data = `data: ${JSON.stringify({
                type: 'content',
                content: chunk.content,
                sessionId,
              })}\n\n`;
              
              controller.enqueue(encoder.encode(data));
            } else if (chunk.type === 'usage' && chunk.usage) {
              totalTokens = chunk.usage.outputTokens;
            } else if (chunk.type === 'error') {
              const errorData = `data: ${JSON.stringify({
                type: 'error',
                error: chunk.error,
                sessionId,
              })}\n\n`;
              
              controller.enqueue(encoder.encode(errorData));
              break;
            } else if (chunk.type === 'done') {
              // アシスタントメッセージを保存
              if (assistantContent) {
                await messageOperations.createMessage(
                  {
                    sessionId,
                    content: assistantContent,
                  },
                  user.userId,
                  'assistant',
                  {
                    model,
                    tokens: totalTokens,
                    finishReason: 'stop',
                  }
                );

                // セッションを更新
                await chatSessionOperations.updateSession(sessionId, {
                  lastMessageAt: new Date().toISOString(),
                  messageCount: session.messageCount + 2,
                });

                // 使用統計を更新
                await updateUsageStats(
                  user.userId,
                  2, // メッセージ数
                  totalTokens // トークン数
                );
              }

              const doneData = `data: ${JSON.stringify({
                type: 'done',
                sessionId,
              })}\n\n`;
              
              controller.enqueue(encoder.encode(doneData));
              break;
            }
          }
        } catch (error) {
          console.error('ストリーミングエラー:', error);
          
          const errorData = `data: ${JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'ストリーミングエラーが発生しました',
            sessionId,
          })}\n\n`;
          
          controller.enqueue(encoder.encode(errorData));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });

  } catch (error) {
    console.error('ストリーミングチャットAPIエラー:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: '内部サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
