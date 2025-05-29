import { createServerClient } from '@/lib/supabase/server';
import { openai, createPrompt } from '@/lib/openai';
import { NextRequest } from 'next/server';
import { addDays } from 'date-fns';
import { streamText } from 'ai';
import { openai as vercelOpenAI } from '@ai-sdk/openai';

// キャッシュ無効化
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    // リクエストボディからデータを取得
    const { caseId, question, viewerId, messages } = await req.json();

    // 必須パラメータの検証
    if (!caseId || !question) {
      return new Response(
        JSON.stringify({ error: '必須パラメータが不足しています' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Supabaseクライアントを作成
    const supabase = createServerClient();

    // 事例データを取得（必要最小限のフィールドのみ）
    const { data: caseData, error: caseError } = await supabase
      .from('construction_cases')
      .select('id, name, description, category, tenant_id')
      .eq('id', caseId)
      .single();

    // 事例データの検証
    if (caseError || !caseData) {
      console.error('事例データ取得エラー:', caseError);
      return new Response(
        JSON.stringify({ error: '事例が見つかりません' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    let remainingQuestions = 10;

    // 閲覧者IDが提供されている場合のレート制限チェック
    if (viewerId) {
      const thirtySecondsAgo = new Date();
      thirtySecondsAgo.setSeconds(thirtySecondsAgo.getSeconds() - 30);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // レート制限チェックを並列実行
      const [recentResult, todayResult] = await Promise.all([
        // 30秒以内の質問チェック
        supabase
          .from('ai_questions')
          .select('id', { count: 'exact' })
          .eq('viewer_id', viewerId)
          .gte('created_at', thirtySecondsAgo.toISOString()),
        // 今日の質問数チェック
        supabase
          .from('ai_questions')
          .select('id', { count: 'exact' })
          .eq('viewer_id', viewerId)
          .gte('created_at', today.toISOString())
      ]);

      // 30秒制限チェック
      if (recentResult.error) {
        console.error('レート制限チェックエラー:', recentResult.error);
      } else if (recentResult.count && recentResult.count > 0) {
        return new Response(
          JSON.stringify({
            error: 'レート制限を超えています。30秒後に再度お試しください。',
            retryAfter: 30
          }),
          { 
            status: 429,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // 日次制限チェック
      if (todayResult.error) {
        console.error('日次制限チェックエラー:', todayResult.error);
      } else if (todayResult.count && todayResult.count >= 10) {
        return new Response(
          JSON.stringify({
            error: '本日の質問回数制限（10回）に達しました。明日以降に再度お試しください。',
            resetTime: addDays(new Date(), 1).toISOString()
          }),
          { 
            status: 429,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // 残り質問数を計算
      remainingQuestions = Math.max(0, 10 - (todayResult.count || 0) - 1);
    }

    // メッセージ履歴を構築
    const chatMessages = [
      { 
        role: 'system' as const, 
        content: `あなたは建設業界の専門AIアシスタントです。以下の施工事例について質問に答えてください。

事例情報:
- 事例名: ${caseData.name}
- カテゴリ: ${caseData.category}
- 説明: ${caseData.description}

回答時の注意点:
1. この事例に関連する内容のみ回答してください
2. 具体的で実用的な情報を提供してください
3. 専門用語は分かりやすく説明してください
4. 回答は簡潔で読みやすくしてください
5. 不明な点は素直に「分からない」と答えてください`
      },
      // 過去のメッセージ履歴があれば追加
      ...(messages || []),
      { 
        role: 'user' as const, 
        content: question 
      }
    ];

    // Vercel AI SDKを使用してストリーミングレスポンスを生成
    const result = await streamText({
      model: vercelOpenAI('gpt-4o-mini'),
      messages: chatMessages,
      temperature: 0.7,
      maxTokens: 1000,
      onFinish: async (result) => {
        // AI質問をデータベースに保存（ストリーミング完了後）
        if (viewerId && result.text) {
          try {
            await supabase.from('ai_questions').insert({
              case_id: caseId,
              tenant_id: caseData.tenant_id,
              viewer_id: viewerId,
              question: question,
              answer: result.text,
              model_used: 'gpt-4o-mini',
            });
          } catch (error) {
            console.error('AI質問の保存に失敗しました:', error);
          }
        }
      },
    });

    // ストリーミングレスポンスを返す
    return result.toDataStreamResponse({
      headers: {
        'X-Rate-Limit-Limit': '10',
        'X-Rate-Limit-Remaining': remainingQuestions.toString(),
        'X-Rate-Limit-Reset': addDays(new Date(), 1).toISOString(),
      },
    });

  } catch (error: any) {
    console.error('AIエラー:', error);
    
    // OpenAI APIエラーの場合
    if (error.code === 'rate_limit_exceeded') {
      return new Response(
        JSON.stringify({ error: 'AI APIの利用制限に達しました。しばらく後に再度お試しください。' }),
        { 
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (error.code === 'insufficient_quota') {
      return new Response(
        JSON.stringify({ error: 'AI APIのクォータが不足しています。管理者にお問い合わせください。' }),
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: 'AIリクエストの処理中にエラーが発生しました',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
