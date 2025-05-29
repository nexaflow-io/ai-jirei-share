'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import { Database } from '@/types/supabase';

type Tenant = Database['public']['Tables']['tenants']['Row'];
type TenantUser = Database['public']['Tables']['users']['Row'];

export function useTenant() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenantUsers, setTenantUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const supabase = createClient();

  // テナント情報の取得
  useEffect(() => {
    const fetchTenantData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // ユーザーのテナントIDを取得
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('tenant_id')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;

        if (!userData?.tenant_id) {
          setLoading(false);
          return;
        }

        // テナント情報を取得
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', userData.tenant_id)
          .single();

        if (tenantError) throw tenantError;

        // テナントに所属するユーザー一覧を取得
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .eq('tenant_id', userData.tenant_id);

        if (usersError) throw usersError;

        setTenant(tenantData);
        setTenantUsers(usersData || []);
      } catch (error) {
        console.error('Fetch tenant error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData();
  }, [user]);

  // ユーザー招待（今後の拡張用）
  const inviteUser = async (email: string, role: string = 'member') => {
    if (!tenant) return { success: false, error: 'テナント情報がありません' };

    try {
      // この部分は将来的に実装
      // 今はダミーの成功レスポンスを返す
      return { success: true };
    } catch (error: any) {
      console.error('Invite user error:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    tenant,
    tenantUsers,
    loading,
    inviteUser
  };
} 