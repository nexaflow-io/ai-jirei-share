import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// キャッシュ無効化
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // 認証チェック
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // ユーザーのテナントIDを取得
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', session.user.id)
      .single();

    if (userError || !userData) {
      console.error('ユーザー情報取得エラー:', userError);
      return NextResponse.json(
        { error: 'ユーザー情報の取得に失敗しました' },
        { status: 404 }
      );
    }

    console.log('テナントID:', userData.tenant_id);

    // 問い合わせ一覧を取得（関連テーブルとの結合を修正）
    const { data: inquiries, error: inquiriesError } = await supabase
      .from('inquiries')
      .select(`
        id,
        subject,
        message,
        status,
        created_at,
        case_id,
        viewer_id,
        tenant_id,
        construction_cases!inner (
          id,
          name,
          category
        ),
        viewers!inner (
          id,
          company_name,
          full_name,
          email,
          phone,
          position
        )
      `)
      .eq('tenant_id', userData.tenant_id)
      .order('created_at', { ascending: false });

    if (inquiriesError) {
      console.error('問い合わせ取得エラー:', inquiriesError);
      return NextResponse.json(
        { error: `問い合わせの取得に失敗しました: ${inquiriesError.message}` },
        { status: 500 }
      );
    }

    console.log('取得した問い合わせ数:', inquiries?.length || 0);

    // 統計情報を取得
    const totalInquiries = inquiries?.length || 0;
    const newInquiries = inquiries?.filter(inquiry => inquiry.status === 'new').length || 0;
    const inProgressInquiries = inquiries?.filter(inquiry => inquiry.status === 'in_progress').length || 0;
    const completedInquiries = inquiries?.filter(inquiry => inquiry.status === 'completed').length || 0;

    return NextResponse.json({
      inquiries: inquiries || [],
      stats: {
        total: totalInquiries,
        new: newInquiries,
        inProgress: inProgressInquiries,
        completed: completedInquiries
      }
    });

  } catch (error: any) {
    console.error('問い合わせ一覧取得エラー:', error);
    return NextResponse.json(
      { error: `問い合わせ一覧の取得中にエラーが発生しました: ${error.message}` },
      { status: 500 }
    );
  }
}

// 問い合わせステータス更新
export async function PATCH(req: NextRequest) {
  try {
    const { inquiryId, status } = await req.json();

    if (!inquiryId || !status) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    
    // 認証チェック
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // ユーザーのテナントIDを取得
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', session.user.id)
      .single();

    if (userError || !userData) {
      console.error('ユーザー情報取得エラー:', userError);
      return NextResponse.json(
        { error: 'ユーザー情報の取得に失敗しました' },
        { status: 404 }
      );
    }

    console.log('ステータス更新:', { inquiryId, status, tenantId: userData.tenant_id });

    // ステータス更新
    const { data: updatedInquiry, error: updateError } = await supabase
      .from('inquiries')
      .update({ status })
      .eq('id', inquiryId)
      .eq('tenant_id', userData.tenant_id)
      .select()
      .single();

    if (updateError) {
      console.error('ステータス更新エラー:', updateError);
      return NextResponse.json(
        { error: `ステータスの更新に失敗しました: ${updateError.message}` },
        { status: 500 }
      );
    }

    if (!updatedInquiry) {
      return NextResponse.json(
        { error: '指定された問い合わせが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      inquiry: updatedInquiry 
    });

  } catch (error: any) {
    console.error('ステータス更新エラー:', error);
    return NextResponse.json(
      { error: `ステータス更新中にエラーが発生しました: ${error.message}` },
      { status: 500 }
    );
  }
}
