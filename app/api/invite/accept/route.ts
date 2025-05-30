import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token, userId } = await request.json();

    if (!token || !userId) {
      return NextResponse.json(
        { error: 'Token and userId are required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 招待情報を取得
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 400 }
      );
    }

    // ユーザーとテナントの関係を作成
    const { error: userTenantError } = await supabase
      .from('user_tenants')
      .insert({
        user_id: userId,
        tenant_id: invitation.tenant_id,
        role: invitation.role
      });

    if (userTenantError) {
      console.error('User tenant creation error:', userTenantError);
      return NextResponse.json(
        { error: 'Failed to create user tenant relationship' },
        { status: 500 }
      );
    }

    // 招待を受諾済みにマーク
    const { error: updateError } = await supabase
      .from('invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);

    if (updateError) {
      console.error('Invitation update error:', updateError);
      // ユーザーとテナントの関係は作成済みなので、エラーログのみ
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation accepted successfully'
    });

  } catch (error) {
    console.error('Invite accept API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
