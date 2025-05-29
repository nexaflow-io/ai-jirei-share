import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { case_id, tenant_id, viewer_id } = await req.json();

    if (!case_id || !tenant_id || !viewer_id) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // アクセスログを記録
    const { error } = await supabase
      .from('access_logs')
      .insert({
        case_id,
        tenant_id,
        viewer_id,
        user_agent: req.headers.get('user-agent') || null,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
      });

    if (error) {
      console.error('アクセスログ記録エラー:', error);
      return NextResponse.json(
        { error: 'アクセスログの記録に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('アクセスログAPI エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
