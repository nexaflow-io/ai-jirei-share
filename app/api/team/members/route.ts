import { createAdminClient } from '@/lib/supabase/admin';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
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

    // 同じテナントのメンバー一覧を取得
    const { data: members, error: membersError } = await adminClient
      .from('user_tenants')
      .select('id, role, created_at, user_id')
      .eq('tenant_id', userTenant.tenant_id);

    if (membersError) throw membersError;

    // ユーザー情報を取得
    const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers();
    if (usersError) throw usersError;

    // データを結合
    const membersWithUsers = members?.map(member => ({
      ...member,
      users: {
        id: member.user_id,
        email: usersData.users.find(u => u.id === member.user_id)?.email || 'Unknown'
      }
    })) || [];

    // 招待一覧を取得
    const { data: invitations, error: invitationsError } = await adminClient
      .from('invitations')
      .select('*')
      .eq('tenant_id', userTenant.tenant_id)
      .order('created_at', { ascending: false });

    if (invitationsError) throw invitationsError;

    return NextResponse.json({
      members: membersWithUsers,
      invitations: invitations || []
    });

  } catch (error) {
    console.error('Error fetching team data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
