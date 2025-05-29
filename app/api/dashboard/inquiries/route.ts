import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

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
      return NextResponse.json(
        { error: 'ユーザー情報の取得に失敗しました' },
        { status: 404 }
      );
    }

    // 問い合わせ一覧を取得
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
        construction_cases (
          id,
          name,
          category
        ),
        viewers (
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
        { error: '問い合わせの取得に失敗しました' },
        { status: 500 }
      );
    }

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
      { error: '問い合わせ一覧の取得中にエラーが発生しました' },
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
      return NextResponse.json(
        { error: 'ユーザー情報の取得に失敗しました' },
        { status: 404 }
      );
    }

    // ステータス更新
    const { data: updatedInquiry, error: updateError } = await supabase
      .from('inquiries')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', inquiryId)
      .eq('tenant_id', userData.tenant_id)
      .select()
      .single();

    if (updateError) {
      console.error('ステータス更新エラー:', updateError);
      return NextResponse.json(
        { error: 'ステータスの更新に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      inquiry: updatedInquiry 
    });

  } catch (error: any) {
    console.error('ステータス更新エラー:', error);
    return NextResponse.json(
      { error: 'ステータス更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
