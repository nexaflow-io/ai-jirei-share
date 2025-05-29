-- ストレージセキュリティポリシーの設定
-- テナント分離と適切なアクセス制御を実装

-- 既存のポリシーをクリーンアップ（念のため）
DROP POLICY IF EXISTS "認証済みユーザーのみアップロード可能" ON storage.objects;
DROP POLICY IF EXISTS "同じテナントのユーザーのみ更新可能" ON storage.objects;
DROP POLICY IF EXISTS "同じテナントのユーザーのみ削除可能" ON storage.objects;
DROP POLICY IF EXISTS "公開事例の画像のみ一般アクセス可能" ON storage.objects;
DROP POLICY IF EXISTS "自分のテナントの事例画像は認証済みユーザーが閲覧可能" ON storage.objects;

-- アップロードポリシー（認証済みユーザーのみ）
-- 認証されたユーザーだけが画像をアップロードできるようにする
CREATE POLICY "認証済みユーザーのみアップロード可能" ON storage.objects
  FOR INSERT TO authenticated 
  WITH CHECK (
    bucket_id = 'case-images' AND
    auth.uid() IN (
      SELECT id FROM public.users
    )
  );

-- テナント分離ポリシー（同じテナントのユーザーのみ更新可能）
-- 事例IDからテナントIDを取得して、同じテナントのユーザーのみが更新できるようにする
CREATE POLICY "同じテナントのユーザーのみ更新可能" ON storage.objects
  FOR UPDATE TO authenticated 
  USING (
    bucket_id = 'case-images' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.construction_cases
      WHERE tenant_id IN (
        SELECT tenant_id FROM public.users
        WHERE id = auth.uid()
      )
    )
  );

-- 削除ポリシー（同じテナントのユーザーのみ）
CREATE POLICY "同じテナントのユーザーのみ削除可能" ON storage.objects
  FOR DELETE TO authenticated 
  USING (
    bucket_id = 'case-images' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.construction_cases
      WHERE tenant_id IN (
        SELECT tenant_id FROM public.users
        WHERE id = auth.uid()
      )
    )
  );

-- 公開事例の画像のみ一般アクセス可能
-- 公開されている事例の画像のみ、誰でもアクセスできるようにする
CREATE POLICY "公開事例の画像のみ一般アクセス可能" ON storage.objects
  FOR SELECT 
  USING (
    bucket_id = 'case-images' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.construction_cases
      WHERE is_published = true
    )
  );

-- 自分のテナントの事例画像は認証済みユーザーが閲覧可能
-- 認証されたユーザーは自分のテナントの事例画像を閲覧できるようにする
CREATE POLICY "自分のテナントの事例画像は認証済みユーザーが閲覧可能" ON storage.objects
  FOR SELECT TO authenticated 
  USING (
    bucket_id = 'case-images' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.construction_cases
      WHERE tenant_id IN (
        SELECT tenant_id FROM public.users
        WHERE id = auth.uid()
      )
    )
  );
