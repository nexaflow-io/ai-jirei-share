import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

// キャッシュ無効化
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // 現在のユーザーの認証状態を確認
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('認証エラー:', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ユーザーのテナント情報を取得（キャッシュ効率化）
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tenantError) {
      console.error('テナント取得エラー:', tenantError);
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }
    
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // 閲覧者情報を効率的に取得（必要最小限のデータのみ）
    const { data: viewers, error: viewersError } = await supabase
      .from('viewers')
      .select(`
        id,
        company_name,
        position,
        full_name,
        email,
        phone,
        created_at,
        construction_cases!inner(
          name
        )
      `)
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false })
      .limit(100); // 最大100件に制限

    if (viewersError) {
      console.error('閲覧者データ取得エラー:', viewersError);
      return NextResponse.json({ 
        error: 'Failed to fetch viewers',
        details: viewersError.message 
      }, { status: 500 });
    }

    if (!viewers || viewers.length === 0) {
      return NextResponse.json({ 
        viewers: [],
        message: 'No viewers found'
      });
    }

    // 閲覧者IDのリストを取得
    const viewerIds = viewers.map(v => v.id);

    // アクセスログとAI質問を並列で取得（パフォーマンス向上）
    const [accessLogsResult, aiQuestionsResult] = await Promise.all([
      supabase
        .from('access_logs')
        .select('viewer_id, accessed_at')
        .in('viewer_id', viewerIds)
        .order('accessed_at', { ascending: false }),
      supabase
        .from('ai_questions')
        .select('viewer_id, question, created_at')
        .in('viewer_id', viewerIds)
        .order('created_at', { ascending: false })
    ]);

    if (accessLogsResult.error) {
      console.error('アクセスログ取得エラー:', accessLogsResult.error);
    }
    
    if (aiQuestionsResult.error) {
      console.error('AI質問取得エラー:', aiQuestionsResult.error);
    }

    // データを効率的にマッピング
    const accessLogsByViewer = new Map();
    const aiQuestionsByViewer = new Map();

    // アクセスログをグループ化
    if (accessLogsResult.data) {
      accessLogsResult.data.forEach(log => {
        if (!accessLogsByViewer.has(log.viewer_id)) {
          accessLogsByViewer.set(log.viewer_id, []);
        }
        accessLogsByViewer.get(log.viewer_id).push({
          accessed_at: log.accessed_at
        });
      });
    }

    // AI質問をグループ化
    if (aiQuestionsResult.data) {
      aiQuestionsResult.data.forEach(question => {
        if (!aiQuestionsByViewer.has(question.viewer_id)) {
          aiQuestionsByViewer.set(question.viewer_id, []);
        }
        aiQuestionsByViewer.get(question.viewer_id).push({
          question: question.question,
          created_at: question.created_at
        });
      });
    }

    // 閲覧者データを拡張
    const enrichedViewers = viewers.map(viewer => ({
      ...viewer,
      access_logs: accessLogsByViewer.get(viewer.id) || [],
      ai_questions: aiQuestionsByViewer.get(viewer.id) || []
    }));

    // 関心度でソート（アクセス回数 + AI質問数）
    const sortedViewers = enrichedViewers.sort((a, b) => {
      const scoreA = a.access_logs.length + (a.ai_questions.length * 2); // AI質問により高い重み
      const scoreB = b.access_logs.length + (b.ai_questions.length * 2);
      return scoreB - scoreA;
    });

    return NextResponse.json({ 
      viewers: sortedViewers,
      total: sortedViewers.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('予期しないエラー:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    }, { status: 500 });
  }
}
