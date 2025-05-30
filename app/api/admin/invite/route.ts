import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email, role = 'member' } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const supabase = createServerComponentClient({ cookies });
    const adminClient = createAdminClient();

    // 現在のユーザーを取得
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ユーザーのテナントIDを取得
    const { data: userTenant, error: tenantError } = await supabase
      .from('user_tenants')
      .select('tenant_id, role')
      .eq('user_id', user.id)
      .single();

    if (tenantError || !userTenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // 管理者権限チェック
    if (userTenant.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // 招待トークンを生成
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7日間有効

    // 招待レコードを作成
    const { data: invitation, error } = await adminClient
      .from('invitations')
      .insert({
        email,
        tenant_id: userTenant.tenant_id,
        role,
        token,
        expires_at: expiresAt.toISOString(),
        invited_by: null // 運営側の招待の場合はnull
      })
      .select()
      .single();

    if (error) {
      console.error('Invitation creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      );
    }

    // 招待メール送信（実装は後で）
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;
    
    console.log(`Invitation created for ${email}: ${inviteUrl}`);

    return NextResponse.json({
      success: true,
      inviteUrl,
      invitation
    });

  } catch (error) {
    console.error('Invite API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
