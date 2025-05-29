# 🚀 AI事例シェア - 開発タスク管理

**総開発時間**: 9時間（見積もり）  
**開始日**: 未定  
**目標**: 1日でMVP完成

---

## 📊 進捗サマリー

| フェーズ | 状態 | 進捗 | 予定時間 | 実績時間 |
|---------|------|------|----------|----------|
| Phase 1: 基盤構築 | ⏳ 未開始 | 0/3 | 3.0h | - |
| Phase 2: 事例管理機能 | ⏳ 未開始 | 0/2 | 2.5h | - |
| Phase 3: 元請け機能 | ⏳ 未開始 | 0/2 | 2.0h | - |
| Phase 4: AI・問い合わせ機能 | ⏳ 未開始 | 0/2 | 1.0h | - |
| Phase 5: ダッシュボード | ⏳ 未開始 | 0/2 | 0.5h | - |
| **合計** | **⏳ 未開始** | **0/11** | **9.0h** | **0h** |

---

## 🔴 Phase 1: 基盤構築（3時間）

### ✅ 1-1. プロジェクト初期設定（1時間）
- [ ] Next.js 14 + TypeScript + App Router セットアップ
- [ ] Tailwind CSS 設定
- [ ] shadcn/ui セットアップ
  ```bash
  npx shadcn-ui@latest add button card input label textarea
  npx shadcn-ui@latest add form badge avatar table tabs
  npx shadcn-ui@latest add dialog alert toast
  ```
- [ ] Supabase プロジェクト作成・設定
- [ ] 環境変数設定
- [ ] フォルダ構造作成

**詳細要件**:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui コンポーネント

### ✅ 1-2. 認証・テナント機能（1時間）
- [ ] Supabase Auth セットアップ（ベストプラクティス適用）
- [ ] 環境変数の適切な設定（API Key管理）
- [ ] サインアップフロー実装（テナント作成含む）
- [ ] ログインフロー実装
- [ ] 認証ミドルウェア実装（セッション管理）
- [ ] 保護されたルート設定

**セキュリティ要件**:
- API Keyの適切な分離（anon key vs service role key）
- 強力なパスワードポリシー
- メール認証の有効化
- セッション管理とリフレッシュトークン
- CSRF保護

### ✅ 1-3. データベース設計（1時間）
- [ ] テーブル設計・作成（完全なマルチテナント対応）
  - [ ] `tenants` (施工会社)
  - [ ] `users` (Supabase Authと連携・テナント分離)
  - [ ] `construction_cases` (事例・公開状態管理)
  - [ ] `case_images` (事例画像・Storage統合)
  - [ ] `viewers` (閲覧者・元請け・重複防止)
  - [ ] `access_logs` (アクセスログ・IP記録)
  - [ ] `ai_questions` (AI質問・モデル記録)
  - [ ] `inquiries` (問い合わせ・ステータス管理)
- [ ] RLS ポリシー設定（全テーブル・完全テナント分離）
- [ ] データベース関数作成（トランザクション保証）
- [ ] Storage ポリシー設定（画像セキュリティ）
- [ ] 初期データ投入

**セキュリティ要件**:
- すべてのテーブルでRLS有効化
- テナント分離の完全実装
- Storage セキュリティポリシー
- データベース関数でのトランザクション保証

---

## 🔴 Phase 2: 事例管理機能（2.5時間）

### ✅ 2-1. 事例作成機能（1.5時間）
- [ ] 事例作成フォーム設計
- [ ] react-hook-form + zod バリデーション
- [ ] 写真アップロード機能（react-dropzone）
  - [ ] 最大10枚/事例
  - [ ] JPEG・PNG対応
  - [ ] Supabase Storage連携
- [ ] 事例情報入力
  - [ ] 工事名
  - [ ] 課題・問題点
  - [ ] 工夫・解決策
  - [ ] 結果・成果
- [ ] API実装（事例作成）
- [ ] 画像最適化・リサイズ

### ✅ 2-2. 事例一覧・詳細（1時間）
- [ ] 事例一覧ページ
- [ ] 事例詳細ページ
- [ ] 事例編集機能
- [ ] 事例削除機能
- [ ] URL生成機能（UUID）
- [ ] URL共有機能（コピーボタン）
- [ ] 事例プレビュー

---

## 🔴 Phase 3: 元請け機能（2時間）

### ✅ 3-1. 閲覧者情報取得（1時間）
- [ ] 個人情報入力フォーム作成
  - [ ] 会社名（必須）
  - [ ] 役職（必須）
  - [ ] 氏名（必須）
  - [ ] メールアドレス（必須）
  - [ ] 電話番号（必須）
- [ ] フォームバリデーション
- [ ] localStorage での状態管理
- [ ] 閲覧者データ保存API
- [ ] アクセス制御（個人情報入力必須）

### ✅ 3-2. 事例閲覧・トラッキング（1時間）
- [ ] 公開事例表示ページ作成
- [ ] 事例画像ギャラリー
- [ ] レスポンシブ対応
- [ ] アクセスログ記録
  - [ ] 誰が見たか
  - [ ] いつ見たか
  - [ ] 何回見たか
  - [ ] どの事例に興味を持ったか
- [ ] 基本的なスクロール追跡

---

## 🟡 Phase 4: AI・問い合わせ機能（1時間）

### ✅ 4-1. AI質問機能（30分）
- [ ] Vercel AI SDK セットアップ
- [ ] OpenAI GPT-4o-mini 設定
- [ ] AI Chat API実装
  - [ ] `useChat` フック使用
  - [ ] ストリーミング回答
  - [ ] 事例情報をコンテキストに含める
- [ ] AI質問コンポーネント
- [ ] AI回答履歴記録（メール送信なし）
- [ ] 質問制限・レート制限

### ✅ 4-2. 問い合わせ機能・メール送信（30分）
- [ ] 問い合わせフォーム作成
- [ ] Resend メール送信設定
- [ ] 問い合わせAPI実装
- [ ] メール送信機能（問い合わせ時のみ）
- [ ] 問い合わせ履歴記録
- [ ] 施工会社への通知メール
- [ ] 自動返信メール

---

## 🟢 Phase 5: ダッシュボード効率化（30分）

### ✅ 5-1. 軽量トラッキング実装（15分）
- [ ] Recharts 導入
- [ ] 基本統計カード作成（shadcn/ui Card）
- [ ] Supabase Realtime 設定
- [ ] リアルタイム更新（5秒間隔）
- [ ] 数値表示（URL共有数、閲覧者数、AI質問数、問い合わせ数）

### ✅ 5-2. 効率的ダッシュボード（15分）
- [ ] StatsCards コンポーネント作成
- [ ] ViewerTable コンポーネント作成
- [ ] 閲覧者一覧表示
- [ ] 最終アクセス時間表示（date-fns）
- [ ] AI質問履歴表示
- [ ] 問い合わせ履歴表示
- [ ] 自動更新機能

---

## 🎯 追加タスク（必要に応じて）

### ✅ 6-1. デプロイ・運用準備
- [ ] 環境変数設定
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `OPENAI_API_KEY`
  - [ ] `RESEND_API_KEY`
  - [ ] `NEXT_PUBLIC_APP_URL`
- [ ] Vercel デプロイ設定
- [ ] Supabase 本番環境設定
- [ ] カスタムドメイン設定
- [ ] エラー監視設定

### ✅ 6-2. テスト・品質保証
- [ ] 基本的な動作テスト
- [ ] レスポンシブテスト
- [ ] 本番環境での動作確認
- [ ] セキュリティチェック
- [ ] パフォーマンステスト

---

## 📝 技術詳細メモ

### データベース設計詳細（Supabaseベストプラクティス）

```sql
-- 🏢 Tenants table (施工会社)
CREATE TABLE tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, -- 会社名
  subdomain TEXT UNIQUE, -- 将来のサブドメイン機能用（オプション）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 👤 Users table (Supabase Authと連携・テナント分離)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'member')), -- MVP では admin のみ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- インデックス
  CONSTRAINT unique_user_per_tenant UNIQUE (id, tenant_id)
);

-- 🏗️ Construction Cases table (事例・公開状態管理)
CREATE TABLE construction_cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 工事名
  description TEXT, -- 課題・問題点
  solution TEXT, -- 工夫・解決策
  result TEXT, -- 結果・成果
  category TEXT, -- 工事種別
  is_published BOOLEAN DEFAULT FALSE, -- 公開状態
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- テナント分離のためのインデックス
  CONSTRAINT fk_case_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_case_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 📸 Case Images table (事例画像・Storage統合)
CREATE TABLE case_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES construction_cases(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- テナント分離
  image_url TEXT NOT NULL,
  image_path TEXT NOT NULL, -- Supabase Storage path
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 👥 Viewers table (閲覧者・元請け・重複防止)
CREATE TABLE viewers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES construction_cases(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- テナント分離
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 同じケースに同じメールアドレスで複数回アクセスを防ぐ
  CONSTRAINT unique_viewer_per_case UNIQUE (case_id, email)
);

-- 📊 Access Logs table (アクセスログ・IP記録)
CREATE TABLE access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES construction_cases(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES viewers(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- テナント分離
  user_agent TEXT,
  ip_address INET,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 💬 AI Questions table (軽い質問・モデル記録)
CREATE TABLE ai_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES construction_cases(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES viewers(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- テナント分離
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  model_used TEXT DEFAULT 'gpt-4o-mini',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📞 Inquiries table (問い合わせ・ステータス管理)
CREATE TABLE inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES construction_cases(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES viewers(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- テナント分離
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔒 RLS ポリシー（全テーブル・完全テナント分離）
-- 1. すべてのテーブルでRLSを有効化
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- 2. テナント分離ポリシー
CREATE POLICY "Users can access own tenant" ON tenants
  FOR ALL USING (id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can access same tenant users" ON users
  FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can access own tenant cases" ON construction_cases
  FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- 3. 公開事例アクセス
CREATE POLICY "Public can view published cases" ON construction_cases
  FOR SELECT USING (is_published = true);

-- 📁 Storage セキュリティポリシー
CREATE POLICY "Authenticated users can upload case images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'case-images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = (
      SELECT tenant_id::text FROM users WHERE id = auth.uid()
    )
  );

-- 🔧 データベース関数（トランザクション保証）
CREATE OR REPLACE FUNCTION create_tenant_and_user(
  user_id UUID,
  user_email TEXT,
  user_full_name TEXT,
  tenant_name TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_tenant_id UUID;
  result JSON;
BEGIN
  -- テナント作成
  INSERT INTO tenants (name) VALUES (tenant_name) RETURNING id INTO new_tenant_id;
  
  -- ユーザー作成
  INSERT INTO users (id, tenant_id, email, full_name, role) 
  VALUES (user_id, new_tenant_id, user_email, user_full_name, 'admin');
  
  -- 結果を返す
  SELECT json_build_object('tenant_id', new_tenant_id, 'user_id', user_id, 'success', true) INTO result;
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
```

### セキュリティ設定詳細

```typescript
// 環境変数設定（.env.local）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key // サーバーサイドのみ
NEXT_PUBLIC_APP_URL=https://yourdomain.com

// Supabase クライアント設定
// クライアントサイド
export const supabase = createClientComponentClient();

// サーバーサイド（API Routes）
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 認証ミドルウェア
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });

  const { data: { session } } = await supabase.auth.getSession();

  // 保護されたルートのチェック
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // テナント確認
    const { data: user } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', session.user.id)
      .single();

    if (!user?.tenant_id) {
      return NextResponse.redirect(new URL('/setup', request.url));
    }
  }

  return response;
}
```

### 必須パッケージ（Supabaseベストプラクティス対応）
```json
{
  "dependencies": {
    "next": "14.x",
    "@supabase/supabase-js": "latest",
    "@supabase/auth-helpers-nextjs": "latest",
    "@supabase/ssr": "latest",
    "ai": "latest",
    "@ai-sdk/openai": "latest",
    "resend": "latest",
    "react-hook-form": "latest",
    "@hookform/resolvers": "latest",
    "zod": "latest",
    "react-dropzone": "latest",
    "recharts": "latest",
    "date-fns": "latest",
    "zustand": "latest",
    "@tanstack/react-query": "latest"
  },
  "devDependencies": {
    "@types/node": "latest",
    "typescript": "latest",
    "tailwindcss": "latest",
    "autoprefixer": "latest",
    "postcss": "latest"
  }
}
```

### フォルダ構造
```
app/
├── (auth)/          # 認証グループ
├── (dashboard)/     # ダッシュボードグループ
├── case/[id]/       # 公開事例ページ
├── api/             # API Routes
components/
├── ui/              # shadcn/ui
├── forms/           # フォーム
├── features/        # 機能別
lib/
hooks/
stores/
types/
```

---

## 🎉 完了基準

**MVP完成の定義**:
1. ✅ 施工会社が事例を作成できる
2. ✅ 事例集URLを発行・共有できる
3. ✅ 元請けが個人情報入力後に事例を閲覧できる
4. ✅ AI質問機能が動作する
5. ✅ 問い合わせ機能とメール送信が動作する
6. ✅ ダッシュボードで効果を確認できる
7. ✅ 本番環境にデプロイ完了

**成功指標**:
- URL共有 → 閲覧 → 問い合わせの流れが機能する
- リアルタイムで効果を実感できる
- 24時間いつでもAI質問に回答できる

---

**最終更新**: [更新日時]  
**担当者**: [担当者名]  
**レビュアー**: [レビュアー名] 