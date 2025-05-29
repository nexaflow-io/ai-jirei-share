import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // 現在のユーザーの認証状態を確認
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ユーザーのテナント情報を取得
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // 閲覧者情報を取得（関連データも含む）
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
        ),
        access_logs(
          accessed_at
        ),
        ai_questions(
          question,
          created_at
        )
      `)
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false });

    if (viewersError) {
      console.error('Error fetching viewers:', viewersError);
      return NextResponse.json({ error: 'Failed to fetch viewers' }, { status: 500 });
    }

    // AI質問を作成日時でソート
    const processedViewers = viewers?.map((viewer: any) => ({
      ...viewer,
      ai_questions: viewer.ai_questions?.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ) || []
    })) || [];

    return NextResponse.json({ viewers: processedViewers });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
