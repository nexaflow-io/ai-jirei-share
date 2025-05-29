-- テーブル作成とRLSポリシーの設定

-- テナントテーブル
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 事例テーブル
CREATE TABLE IF NOT EXISTS public.construction_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  solution TEXT,
  result TEXT,
  category TEXT,
  is_published BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 事例画像テーブル
CREATE TABLE IF NOT EXISTS public.case_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.construction_cases(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_path TEXT NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 閲覧者テーブル
CREATE TABLE IF NOT EXISTS public.viewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.construction_cases(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- アクセスログテーブル
CREATE TABLE IF NOT EXISTS public.access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.construction_cases(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES public.viewers(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_agent TEXT,
  ip_address TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- AI質問テーブル
CREATE TABLE IF NOT EXISTS public.ai_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.construction_cases(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES public.viewers(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  model_used TEXT DEFAULT 'gpt-4o-mini' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 問い合わせテーブル
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.construction_cases(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES public.viewers(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- RLSポリシーの設定
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- テナントポリシー
CREATE POLICY "テナント管理者のみ表示" ON public.tenants
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE tenant_id = tenants.id AND role = 'admin'
    )
  );

-- ユーザーポリシー
CREATE POLICY "同じテナントのユーザーのみ表示" ON public.users
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE tenant_id = users.tenant_id
    )
  );

-- 事例ポリシー
CREATE POLICY "同じテナントのユーザーのみ表示・編集" ON public.construction_cases
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE tenant_id = construction_cases.tenant_id
    )
  );

-- 事例画像ポリシー
CREATE POLICY "同じテナントのユーザーのみ表示・編集" ON public.case_images
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE tenant_id = case_images.tenant_id
    )
  );

-- 閲覧者ポリシー
CREATE POLICY "同じテナントのユーザーのみ表示" ON public.viewers
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE tenant_id = viewers.tenant_id
    )
  );

-- アクセスログポリシー
CREATE POLICY "同じテナントのユーザーのみ表示" ON public.access_logs
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE tenant_id = access_logs.tenant_id
    )
  );

-- AI質問ポリシー
CREATE POLICY "同じテナントのユーザーのみ表示" ON public.ai_questions
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE tenant_id = ai_questions.tenant_id
    )
  );

-- 問い合わせポリシー
CREATE POLICY "同じテナントのユーザーのみ表示・編集" ON public.inquiries
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE tenant_id = inquiries.tenant_id
    )
  );
