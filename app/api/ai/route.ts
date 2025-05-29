import { createServerClient } from '@/lib/supabase/server';
import { openai, createPrompt } from '@/lib/openai';
// OpenAIStreamとStreamingTextResponseを使用せず、標準的なレスポンス方法に変更
import { NextRequest, NextResponse } from 'next/server';
import { addDays } from 'date-fns';

// エッジランタイムは使用しない
// export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    // リクエストボディからデータを取得
    const { caseId, question, viewerId } = await req.json();

    // Supabaseクライアントを作成
    const supabase = createServerClient();

    // 事例データを取得
    const { data: caseData, error: caseError } = await supabase
      .from('construction_cases')
      .select('*')
      .eq('id', caseId)
      .single();

    if (caseError || !caseData) {
      return new Response(JSON.stringify({ error: '事例が見つかりません' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // 閲覧者IDが提供されている場合、質問制限とレート制限をチェック
    if (viewerId) {
      // 1. レート制限チェック（30秒に1回まで）
      const thirtySecondsAgo = new Date();
      thirtySecondsAgo.setSeconds(thirtySecondsAgo.getSeconds() - 30);
      
      const { data: recentQuestions, error: recentError } = await supabase
        .from('ai_questions')
        .select('created_at')
        .eq('viewer_id', viewerId)
        .gte('created_at', thirtySecondsAgo.toISOString())
        .order('created_at', { ascending: false });
        
      if (recentQuestions && recentQuestions.length > 0) {
        return new Response(JSON.stringify({ 
          error: 'レート制限を超えています。30秒後に再度お試しください。' 
        }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      // 2. 日次質問制限チェック（1日10回まで）
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: todayQuestions, error: countError } = await supabase
        .from('ai_questions')
        .select('id', { count: 'exact' })
        .eq('viewer_id', viewerId)
        .gte('created_at', today.toISOString());
        
      if (todayQuestions && todayQuestions.length >= 10) {
        return new Response(JSON.stringify({ 
          error: '本日の質問回数制限（10回）に達しました。明日以降に再度お試しください。' 
        }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // OpenAIのレスポンスを生成（ストリーミングなし）
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: '建設業界の専門AIアシスタントとして回答します。' },
        { role: 'user', content: createPrompt(caseData, question) },
      ],
      stream: false,
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    // AIの回答を取得
    const aiResponse = response.choices[0]?.message?.content || '回答を生成できませんでした。';

    // AI質問をデータベースに保存
    try {
      await supabase.from('ai_questions').insert({
        case_id: caseId,
        tenant_id: caseData.tenant_id,
        viewer_id: viewerId,
        question: question,
        answer: aiResponse,
        model: 'gpt-4o-mini',
      });
    } catch (error) {
      console.error('AI質問の保存に失敗しました:', error);
    }

    // JSON形式でレスポンスを返す
    return NextResponse.json({
      answer: aiResponse,
      timestamp: new Date().toISOString(),
      rateLimit: {
        limit: 10,
        remaining: viewerId ? 9 : 10, // 正確な値は計算していない
        reset: addDays(new Date(), 1).toISOString()
      }
    });
  } catch (error) {
    console.error('AIエラー:', error);
    return NextResponse.json(
      { error: 'AIリクエストの処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
