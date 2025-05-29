-- テナント作成とユーザー紐付け関数
CREATE OR REPLACE FUNCTION public.create_tenant_and_user(
  user_id UUID,
  user_email TEXT,
  user_full_name TEXT,
  tenant_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_tenant_id UUID;
  result JSONB;
BEGIN
  -- トランザクション開始
  BEGIN
    -- テナント作成
    INSERT INTO public.tenants (name)
    VALUES (tenant_name)
    RETURNING id INTO new_tenant_id;
    
    -- ユーザー作成
    INSERT INTO public.users (id, tenant_id, email, full_name, role)
    VALUES (user_id, new_tenant_id, user_email, user_full_name, 'admin');
    
    -- 結果を返す
    result := jsonb_build_object(
      'success', true,
      'tenant_id', new_tenant_id,
      'user_id', user_id
    );
    
    RETURN result;
  EXCEPTION
    WHEN OTHERS THEN
      -- エラー発生時
      result := jsonb_build_object(
        'success', false,
        'error', SQLERRM
      );
      
      RETURN result;
  END;
END;
$$;
