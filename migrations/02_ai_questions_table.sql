-- ai_questionsテーブルの作成
CREATE TABLE IF NOT EXISTS public.ai_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.construction_cases(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES public.viewers(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  model VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- RLSポリシーの設定
ALTER TABLE public.ai_questions ENABLE ROW LEVEL SECURITY;

-- テナント所有者のみが自分のテナントのAI質問を閲覧できる
CREATE POLICY "テナント所有者はAI質問を閲覧可能" ON public.ai_questions
  FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM public.tenant_users WHERE tenant_id = ai_questions.tenant_id
  ));

-- インデックスの作成
CREATE INDEX idx_ai_questions_case_id ON public.ai_questions(case_id);
CREATE INDEX idx_ai_questions_tenant_id ON public.ai_questions(tenant_id);
CREATE INDEX idx_ai_questions_viewer_id ON public.ai_questions(viewer_id);
CREATE INDEX idx_ai_questions_created_at ON public.ai_questions(created_at);

-- 更新時にupdated_atを自動更新するトリガー
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.ai_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
