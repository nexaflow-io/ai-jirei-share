import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // 公開事例がある施工会社（テナント）のみを取得
    const { data, error } = await supabase
      .from('tenants')
      .select(`
        id,
        name,
        construction_cases!inner (
          id
        )
      `)
      .eq('construction_cases.is_published', true)
      .order('name', { ascending: true });
    
    if (error) {
      console.error('テナント取得エラー:', error);
      return NextResponse.json(
        { error: 'テナント情報の取得に失敗しました' },
        { status: 500 }
      );
    }
    
    // 重複を除去（同じテナントが複数の公開事例を持っている場合）
    const uniqueTenants = Array.from(
      new Map(data.map(item => [item.id, { id: item.id, name: item.name }])).values()
    );
    
    return NextResponse.json(uniqueTenants);
  } catch (error) {
    console.error('予期せぬエラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
