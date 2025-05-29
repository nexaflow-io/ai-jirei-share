import { createServerClient } from '@/lib/supabase/server';
import { openai, createPrompt } from '@/lib/openai';
import { NextRequest, NextResponse } from 'next/server';
import { addDays } from 'date-fns';

// キャッシュ無効化
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    // リクエストボディからデータを取得
    const { caseId, question, viewerId } = await req.json();

    // 必須パラメータの検証
    if (!caseId || !question) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています' },
        { status: 400 }
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
      return NextResponse.json(
        { error: '事例が見つかりません' },
        { status: 404 }
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
        return NextResponse.json({
          error: 'レート制限を超えています。30秒後に再度お試しください。',
          retryAfter: 30
        }, { status: 429 });
      }

      // 日次制限チェック
      if (todayResult.error) {
        console.error('日次制限チェックエラー:', todayResult.error);
      } else if (todayResult.count && todayResult.count >= 10) {
        return NextResponse.json({
          error: '本日の質問回数制限（10回）に達しました。明日以降に再度お試しください。',
          resetTime: addDays(new Date(), 1).toISOString()
        }, { status: 429 });
      }

      // 残り質問数を計算
      remainingQuestions = Math.max(0, 10 - (todayResult.count || 0) - 1);
    }

    // OpenAIのレスポンスを生成
    const startTime = Date.now();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: '建設業界の専門AIアシスタントとして、正確で実用的な回答を提供します。回答は簡潔で分かりやすくしてください。'
        },
        { 
          role: 'user', 
          content: createPrompt(caseData, question) 
        },
      ],
      stream: false,
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    const aiProcessingTime = Date.now() - startTime;
    
    // AIの回答を取得
    const aiResponse = response.choices?.[0]?.message?.content;
    if (!aiResponse) {
      return NextResponse.json(
        { error: 'AI回答の生成に失敗しました' },
        { status: 500 }
      );
    }

    // AI質問をデータベースに保存（非同期で実行、レスポンスをブロックしない）
    if (viewerId) {
      // 保存処理を非同期で実行（await しない）
      supabase.from('ai_questions').insert({
        case_id: caseId,
        tenant_id: caseData.tenant_id,
        viewer_id: viewerId,
        question: question,
        answer: aiResponse,
        model_used: 'gpt-4o-mini',
      }).then(({ error }) => {
        if (error) {
          console.error('AI質問の保存に失敗しました:', error);
        }
      });
    }

    // JSON形式でレスポンスを返す
    return NextResponse.json({
      answer: aiResponse,
      timestamp: new Date().toISOString(),
      processingTime: aiProcessingTime,
      rateLimit: viewerId ? {
        limit: 10,
        remaining: remainingQuestions,
        reset: addDays(new Date(), 1).toISOString()
      } : null
    });

  } catch (error: any) {
    console.error('AIエラー:', error);
    
    // OpenAI APIエラーの場合
    if (error.code === 'rate_limit_exceeded') {
      return NextResponse.json(
        { error: 'AI APIの利用制限に達しました。しばらく後に再度お試しください。' },
        { status: 429 }
      );
    }
    
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'AI APIのクォータが不足しています。管理者にお問い合わせください。' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: 'AIリクエストの処理中にエラーが発生しました',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
