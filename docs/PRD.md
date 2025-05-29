# PRD: AI事例シェア

## 📋 目次
1. [プロダクト概要](#1-プロダクト概要)
2. [機能要件](#2-機能要件)
3. [非機能要件](#3-非機能要件)
4. [ユーザーフロー](#4-ユーザーフロー)
5. [成功指標](#5-成功指標)
6. [技術要件](#6-技術要件)
7. [やらないこと](#7-やらないこと重要)
8. [開発計画](#8-開発計画)
9. [マルチテナント設計](#9-マルチテナント設計)
10. [技術設計詳細](#10-技術設計詳細)
11. [開発タスク](#11-開発タスク詳細9時間)
12. [デプロイ・運用](#12-デプロイ運用)
13. [デザインシステム](#13-デザインシステムコンポーネント設計)

---

## 1. プロダクト概要

### 🎯 プロダクトビジョン
**AI事例シェア：事例集URLを送るだけで、確度の高いリードが獲得できる施工会社の営業革命ツール**

### 💡 解決する問題
| 対象 | 現在の課題 | 解決後の状態 |
|------|-----------|-------------|
| **施工会社** | 営業効率が悪く、確度の低い飛び込み営業に時間を浪費 | AI事例シェアで事例集URL共有により確度の高いリードのみに営業集中 |
| **元請け** | 施工会社の実力がわからず、技術的な質問もすぐに聞けない | 24時間いつでも事例確認・AI質問で即座に疑問解決 |

### 👥 ターゲットユーザー
- **💰 課金者**: 施工会社（塗装、防水、電気工事など専門工事会社）
- **👤 利用者**: 元請け企業（ゼネコン、建設会社、工務店）

### 🚀 核心価値提案
**「AI事例シェアで事例集URLを送るだけで、確度の高いリードが獲得できる」**

---

## 2. 機能要件

### 📸 2.1 事例集作成機能

#### 2.1.1 写真アップロード
- **機能**: 施工写真を1タップでアップロード
- **対応形式**: JPEG, PNG
- **最大サイズ**: 10MB/枚
- **最大枚数**: 10枚/事例
- **実装**: react-dropzone + Supabase Storage

#### 2.1.2 事例情報入力（手動入力）
- **入力項目**:
  - 工事名
  - 課題・問題点
  - 工夫・解決策
  - 結果・成果
- **回答形式**: テキスト入力（各項目500文字以内）
- **実装**: react-hook-form + zod

#### 2.1.3 事例集表示
- **構造**: 「課題→工夫→結果」の流れで表示
- **出力**: Webページ形式
- **実装**: shadcn/ui Card + 画像ギャラリー

### 🔗 2.2 URL発行・共有機能

#### 2.2.1 URL自動生成
- **URL形式**: `https://domain.com/case/[unique-id]`
- **MVP**: まずは1つのURL共有のみ
- **実装**: UUID生成 + Next.js動的ルート

#### 2.2.2 URL共有
- **共有方法**: URLコピーボタンのみ
- **実装**: navigator.clipboard API

### 👤 2.3 元請け情報取得機能（重要）

#### 2.3.1 個人情報入力フォーム（必須）
- **表示タイミング**: URL初回アクセス時（必須）
- **入力項目**:
  - 会社名（必須）
  - 役職（必須）
  - 氏名（必須）
  - メールアドレス（必須）
  - 電話番号（必須）
- **バリデーション**: 全項目入力必須、メール形式チェック
- **実装**: react-hook-form + zod + localStorage

### 📊 2.4 閲覧トラッキング機能

#### 2.4.1 アクセス記録
- **記録項目**:
  - 👤 誰が見たか（元請け情報）
  - ⏰ いつ見たか（アクセス時間）
  - 🔢 何回見たか（アクセス回数）
  - 👀 どの事例に興味を持ったか（スクロール位置、クリック）
- **実装**: Supabase access_logs テーブル

### 🤖 2.5 AI質問機能（Vercel AI SDK）

#### 2.5.1 軽い質問（AIチャット）
- **機能**: 元請けが事例に関する軽い質問をAIに投稿
- **質問例**:
  - うちの案件でも同じ工法でできる？
  - 工期はどのくらい？
  - この工法の耐用年数は？
- **技術**: Vercel AI SDK + OpenAI GPT-4o-mini
- **実装**: `useChat`フック + ストリーミング回答
- **記録**: ai_questions テーブル（トラッキング用）
- **📧 メール送信**: なし（施工会社はダッシュボードで確認）

#### 2.5.2 問い合わせ（CV導線）
- **機能**: 本格的な相談・見積もり依頼
- **表示**: AI回答後に「担当者に詳しく相談する」ボタン
- **問い合わせ例**:
  - 見積もりをお願いします
  - 詳しく相談したいです
  - 類似案件の実績を教えてください
- **記録**: inquiries テーブル
- **📧 メール送信**: あり（施工会社に即座に通知）

### 📈 2.6 効果実感ダッシュボード

#### 2.6.1 主要指標表示（Recharts + shadcn/ui）
- **表示項目**:
  - 🔗 URL共有数
  - 👥 閲覧者数（個人情報入力者数）
  - 💬 AI質問数（軽い質問）
  - 📞 問い合わせ数（CV導線）
- **実装**: StatsCards コンポーネント（Card + 数値 + アイコン）
- **チャート**: Recharts LineChart（アクセス推移）

#### 2.6.2 詳細トラッキング（効率化）
- **閲覧者一覧**:
  - 会社名、担当者名、連絡先
  - 最終アクセス時間（date-fns でフォーマット）
  - アクセス回数
  - 興味のある事例
  - AI質問履歴（軽い質問）
  - 問い合わせ履歴（CV導線）
- **実装**: ViewerTable コンポーネント（shadcn/ui Table + Badge）

#### 2.6.3 リアルタイム更新（Supabase Realtime）
- **更新頻度**: リアルタイム（Supabase Realtime）
- **自動更新**: 5秒間隔（react-query）
- **📧 メール送信**: 問い合わせ時のみ（AI質問時は送信なし）
- **実装時間**: 15分（既存コンポーネント活用）

---

## 3. 非機能要件

### ⚡ 3.1 パフォーマンス
- **ページ読み込み時間**: 3秒以内
- **画像表示**: 2秒以内
- **AI回答時間**: ストリーミング形式でリアルタイム

### 🔒 3.2 セキュリティ
- **個人情報保護**: SSL暗号化
- **データ保存**: Supabase暗号化保存
- **アクセス制御**: Supabase Row Level Security
- **URL保護**: 個人情報入力必須でアクセス制御

### 🔄 3.3 可用性
- **稼働率**: 99.9%以上（Supabase保証）
- **メンテナンス**: Supabase管理

---

## 4. ユーザーフロー

### 🏗️ 4.1 施工会社フロー
```
1. Supabase認証でログイン
2. 施工写真アップロード
3. 事例情報を手動入力
4. 事例集確認・編集
5. URL発行
6. 元請けにURL共有（コピー&ペースト）
7. ダッシュボードで効果確認
8. 確度の高いリードに営業アプローチ
```

### 🏢 4.2 元請けフロー
```
1. URLアクセス
2. 📝 個人情報入力（必須・初回のみ）
   - 会社名、役職、氏名、メール、電話番号
   - 全項目入力しないと事例を閲覧できない
3. 📖 事例集閲覧
4. 💬 軽い質問: AIチャットで疑問を解決（メール送信なし）
5. 📞 本格検討: 問い合わせフォームで相談（メール送信あり）
```

---

## 5. 成功指標

### 🎯 5.1 検証する仮説
**「AI事例シェアで事例集URLを共有すれば、興味のある元請けが個人情報を入力してでも閲覧し、確度の高いリードが獲得できる」**

### 📊 5.2 成功基準
**URL共有10件 → 閲覧3件 → 問い合わせ1件**

### 📈 5.3 測定指標
- URL共有数
- **個人情報入力率**（最重要指標）
- 閲覧時間
- AI質問数（軽い質問・トラッキングのみ）
- 問い合わせ数（CV導線・メール送信あり）
- 受注率

---

## 6. 技術要件

### 🛠️ 6.1 技術スタック（最適化版）
| 分野 | 技術 | 理由 |
|------|------|------|
| **フロントエンド** | Next.js 14 (App Router) | 最新のReact機能、優れたパフォーマンス |
| **AI機能** | Vercel AI SDK + OpenAI GPT-4o-mini | ストリーミング対応、コスト効率 |
| **データベース** | Supabase PostgreSQL | リアルタイム、認証、ストレージ統合 |
| **認証** | Supabase Auth | 簡単実装、セキュア |
| **ストレージ** | Supabase Storage | 画像最適化、CDN |
| **メール送信** | Resend | 高い到達率、簡単API |
| **ホスティング** | Vercel | Next.js最適化、自動デプロイ |

### 📦 6.2 主要ライブラリ
```json
{
  "ai": "Vercel AI SDK + @ai-sdk/openai",
  "ui": "@radix-ui/react-* + tailwindcss + shadcn/ui",
  "database": "@supabase/supabase-js",
  "forms": "react-hook-form + zod",
  "email": "resend",
  "state": "zustand",
  "upload": "react-dropzone",
  "charts": "recharts (最も人気・簡単導入)",
  "dates": "date-fns",
  "data": "@tanstack/react-query"
}
```

---

## 7. やらないこと（重要）

### ❌ 削除された機能
- 事例作成AIアシスタント（ChatGPTで代替可能）
- QRコード生成
- 複雑な検索機能
- 社内ワークフロー
- 権限管理
- レポート機能
- API連携
- プレゼン機能
- 営業管理機能
- アクセス時のメール送信（質問投稿時のみ送信）
- 滞在時間測定（意味がないため）
- ブラウザプッシュ通知（実用的でないため）

### 🎯 一点集中
**AI事例シェアで事例集URL共有による確度の高いリード獲得のみ**

---

## 8. 開発計画

### 🚀 MVP開発計画（1日/9時間）

| Phase | 機能 | 時間 | 優先度 |
|-------|------|------|--------|
| **Phase 1** | 基盤構築 | 3時間 | 🔴 必須 |
| **Phase 2** | 事例管理 | 2.5時間 | 🔴 必須 |
| **Phase 3** | 元請け機能 | 2時間 | 🔴 必須 |
| **Phase 4** | AI・問い合わせ | 1時間 | 🟡 重要 |
| **Phase 5** | ダッシュボード | 30分 | 🟢 推奨 |

### 🎯 目標
**1日（9時間）でMVPを完成させ、仮説を検証する**

### ⚡ 効率化のポイント
- Recharts（24.8K stars）で15分チャート実装
- shadcn/ui既存コンポーネント最大活用
- Supabase Realtimeで自動更新
- react-queryで5秒間隔データ取得

---

## 9. マルチテナント設計

### 🏢 9.1 テナント概念
- **1テナント = 1施工会社**
- **テナント管理者 = 施工会社の代表者**
- **テナントメンバー = 施工会社の従業員**（MVP では1人のみ）

### 🗄️ 9.2 データベース設計（マルチテナント対応）

#### 主要テーブル構成
```sql
-- 🏢 Tenants table (施工会社)
CREATE TABLE tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, -- 会社名
  subdomain TEXT UNIQUE, -- 将来のサブドメイン機能用（オプション）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 👤 Users table (Supabase Authと連携)
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

-- 🏗️ Construction Cases table (事例)
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

-- 📸 Case Images table (事例画像)
CREATE TABLE case_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES construction_cases(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- テナント分離
  image_url TEXT NOT NULL,
  image_path TEXT NOT NULL, -- Supabase Storage path
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 👥 Viewers table (閲覧者・元請け)
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

-- 📊 Access Logs table (アクセスログ)
CREATE TABLE access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES construction_cases(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES viewers(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- テナント分離
  user_agent TEXT,
  ip_address INET,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 💬 AI Questions table (軽い質問・トラッキング用)
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

-- 📞 Inquiries table (問い合わせ・CV導線)
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
```

#### 🔒 RLS ポリシー（Supabaseベストプラクティス）

```sql
-- 1. すべてのテーブルでRLSを有効化
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- 2. Tenants テーブル：ユーザーは自分のテナントのみアクセス可能
CREATE POLICY "Users can access own tenant" ON tenants
  FOR ALL USING (
    id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- 3. Users テーブル：ユーザーは自分のテナント内のユーザーのみアクセス可能
CREATE POLICY "Users can access same tenant users" ON users
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- 4. Construction Cases テーブル：テナント分離
CREATE POLICY "Users can access own tenant cases" ON construction_cases
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- 5. Case Images テーブル：テナント分離
CREATE POLICY "Users can access own tenant case images" ON case_images
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- 6. Viewers テーブル：テナント分離
CREATE POLICY "Users can access own tenant viewers" ON viewers
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- 7. Access Logs テーブル：テナント分離
CREATE POLICY "Users can access own tenant access logs" ON access_logs
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- 8. AI Questions テーブル：テナント分離
CREATE POLICY "Users can access own tenant ai questions" ON ai_questions
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- 9. Inquiries テーブル：テナント分離
CREATE POLICY "Users can access own tenant inquiries" ON inquiries
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- 10. 公開事例へのアクセス（認証不要）
CREATE POLICY "Public can view published cases" ON construction_cases
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public can view published case images" ON case_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM construction_cases 
      WHERE id = case_images.case_id AND is_published = true
    )
  );
```

### 🔐 9.3 認証フロー（Supabaseベストプラクティス）

#### サインアップフロー
```typescript
// 1. ユーザーサインアップ + テナント作成
const signUpWithTenant = async (email: string, password: string, companyName: string) => {
  // Step 1: Supabase Auth でユーザー作成
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        company_name: companyName
      }
    }
  });

  if (authError) throw authError;

  // Step 2: データベーストランザクションでテナントとユーザー作成
  const { data, error } = await supabase.rpc('create_tenant_and_user', {
    user_id: authData.user?.id,
    user_email: email,
    user_full_name: fullName,
    tenant_name: companyName
  });

  return { data, error };
};
```

#### データベース関数（トランザクション保証）
```sql
-- テナントとユーザーを安全に作成する関数
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
  -- Step 1: テナント作成
  INSERT INTO tenants (name) 
  VALUES (tenant_name) 
  RETURNING id INTO new_tenant_id;

  -- Step 2: ユーザー作成
  INSERT INTO users (id, tenant_id, email, full_name, role) 
  VALUES (user_id, new_tenant_id, user_email, user_full_name, 'admin');

  -- 結果を返す
  SELECT json_build_object(
    'tenant_id', new_tenant_id,
    'user_id', user_id,
    'success', true
  ) INTO result;

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- エラー時はロールバック
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;
```

### 🛡️ 9.4 セキュリティベストプラクティス

#### API Key管理
```typescript
// 環境変数の適切な設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // サーバーサイドのみ

// クライアントサイド
export const supabase = createClientComponentClient({
  supabaseUrl,
  supabaseKey: supabaseAnonKey
});

// サーバーサイド（API Routes）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
```

#### 認証ミドルウェア
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });

  // セッション確認
  const { data: { session } } = await supabase.auth.getSession();

  // 保護されたルートのチェック
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // テナント情報の確認
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

#### ストレージセキュリティ
```sql
-- Storage policies for case images
CREATE POLICY "Authenticated users can upload case images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'case-images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = (
      SELECT tenant_id::text FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view own tenant case images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'case-images' AND
    (storage.foldername(name))[1] = (
      SELECT tenant_id::text FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Public can view published case images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'case-images' AND
    EXISTS (
      SELECT 1 FROM construction_cases 
      WHERE is_published = true 
      AND id::text = (storage.foldername(name))[2]
    )
  );
```

### 🌐 9.5 URL構造とアクセス制御
- **施工会社側**: `/dashboard/*`（認証必須・テナント分離）
- **元請け側**: `/case/[case-id]`（個人情報入力必須・公開事例のみ）
- **管理**: `/admin/*`（将来の管理機能用）

---

## 10. 技術設計詳細

### 🛠️ 10.1 技術スタック詳細

#### フロントエンド
```json
{
  "framework": "Next.js 14 (App Router)",
  "styling": "Tailwind CSS + shadcn/ui",
  "forms": "react-hook-form + zod",
  "state": "Zustand",
  "ui-components": "shadcn/ui + Radix UI",
  "icons": "Lucide React",
  "file-upload": "react-dropzone",
  "data-fetching": "@tanstack/react-query"
}
```

#### バックエンド・インフラ
```json
{
  "database": "Supabase PostgreSQL",
  "auth": "Supabase Auth",
  "storage": "Supabase Storage",
  "realtime": "Supabase Realtime",
  "ai": "Vercel AI SDK + OpenAI",
  "email": "Resend",
  "hosting": "Vercel",
  "monitoring": "Vercel Analytics"
}
```

### 📁 10.2 プロジェクト構造

```
src/
├── app/                    # App Router
│   ├── (auth)/            # 認証グループ
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/       # ダッシュボードグループ
│   │   ├── dashboard/
│   │   ├── cases/
│   │   └── settings/
│   ├── case/              # 公開事例ページ（個人情報入力必須）
│   │   └── [id]/
│   ├── api/               # API Routes
│   │   ├── auth/
│   │   ├── cases/
│   │   ├── questions/
│   │   └── chat/          # AI Chat API
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/            # 再利用可能コンポーネント
│   ├── ui/               # shadcn/ui コンポーネント
│   ├── forms/            # フォームコンポーネント
│   ├── layout/           # レイアウトコンポーネント
│   └── features/         # 機能別コンポーネント
├── lib/                  # ユーティリティ
│   ├── supabase/
│   ├── validations/
│   ├── utils.ts
│   └── constants.ts
├── hooks/                # カスタムフック
├── stores/               # Zustand ストア
└── types/                # TypeScript型定義
```

### 🔐 10.3 アクセス制御の実装

#### 元請け側事例閲覧フロー
```typescript
// app/case/[id]/page.tsx
export default function CaseViewPage({ params }: { params: { id: string } }) {
  const [hasSubmittedInfo, setHasSubmittedInfo] = useState(false)
  const [caseData, setCaseData] = useState(null)

  // 個人情報入力済みかチェック
  useEffect(() => {
    const checkViewerInfo = async () => {
      const viewerId = localStorage.getItem(`viewer_${params.id}`)
      if (viewerId) {
        setHasSubmittedInfo(true)
        // 事例データを取得
        const { data } = await supabase
          .from('construction_cases')
          .select('*')
          .eq('id', params.id)
          .single()
        setCaseData(data)
      }
    }
    checkViewerInfo()
  }, [params.id])

  if (!hasSubmittedInfo) {
    return <ViewerInfoForm caseId={params.id} onSubmit={setHasSubmittedInfo} />
  }

  return <CaseView case={caseData} />
}
```

### 🤖 10.4 AI Chat API実装

```typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages, caseId, viewerId } = await req.json();

  // 事例情報を取得してコンテキストに含める
  const { data: caseData } = await supabase
    .from('construction_cases')
    .select('name, description, category')
    .eq('id', caseId)
    .single();

  const systemPrompt = `
あなたは施工事例について質問に答えるAIアシスタントです。

事例情報：
- 工事名：${caseData?.name}
- 説明：${caseData?.description}
- 工事種別：${caseData?.category}

この事例について質問に答えてください。
具体的な金額や詳細な見積もりについては「担当者にお問い合わせください」と案内してください。
回答は簡潔で分かりやすくしてください。
`;

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    messages,
    system: systemPrompt,
    onFinish: async (completion) => {
      // AI質問と回答を記録（トラッキング用・メール送信なし）
      await supabase.from('ai_questions').insert({
        case_id: caseId,
        viewer_id: viewerId,
        question: messages[messages.length - 1].content,
        answer: completion.text,
        created_at: new Date().toISOString()
      });
    }
  });

  return result.toDataStreamResponse();
}
```

### 📧 10.5 メール送信システム

```typescript
// lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendInquiryNotification({
  to, caseTitle, viewerName, viewerCompany, subject, message, caseUrl
}: InquiryNotificationParams) {
  return await resend.emails.send({
    from: 'noreply@yourdomain.com',
    to,
    subject: `[AI事例シェア] ${caseTitle}に問い合わせが投稿されました`,
    html: `
      <h2>新しい問い合わせが投稿されました</h2>
      <p><strong>事例:</strong> ${caseTitle}</p>
      <p><strong>問い合わせ者:</strong> ${viewerName} (${viewerCompany})</p>
      <p><strong>件名:</strong> ${subject}</p>
      <p><strong>内容:</strong> ${message}</p>
      <a href="${caseUrl}">事例を確認する</a>
    `
  })
}
```

---

## 11. 開発タスク詳細（9時間）

### 🔴 Phase 1: 基盤構築（3時間）
| タスク | 時間 | 詳細 |
|--------|------|------|
| **プロジェクト初期設定** | 1時間 | Next.js + TypeScript + Tailwind CSS<br>shadcn/ui セットアップ<br>Supabase 設定 |
| **認証・テナント機能** | 1時間 | Supabase Auth 設定<br>サインアップフロー（テナント作成含む）<br>ミドルウェア実装 |
| **データベース設計** | 1時間 | テーブル作成<br>RLS ポリシー設定<br>初期データ投入 |

### 🔴 Phase 2: 事例管理機能（2.5時間）
| タスク | 時間 | 詳細 |
|--------|------|------|
| **事例作成機能** | 1.5時間 | フォーム作成（react-hook-form + zod）<br>画像アップロード（react-dropzone）<br>API実装 |
| **事例一覧・詳細** | 1時間 | 一覧表示<br>詳細表示<br>URL生成・共有機能 |

### 🔴 Phase 3: 元請け機能（2時間）
| タスク | 時間 | 詳細 |
|--------|------|------|
| **閲覧者情報取得** | 1時間 | 個人情報入力フォーム<br>バリデーション<br>データ保存 |
| **事例閲覧・トラッキング** | 1時間 | 事例表示ページ<br>アクセスログ記録<br>基本的なトラッキング |

### 🟡 Phase 4: AI・問い合わせ機能（1時間）
| タスク | 時間 | 詳細 |
|--------|------|------|
| **AI質問機能** | 30分 | Vercel AI SDK実装（`useChat`フック）<br>ストリーミング回答<br>事例情報をコンテキストに含める<br>AI質問履歴の記録（トラッキング用・メール送信なし） |
| **問い合わせ機能・メール送信** | 30分 | 問い合わせフォーム実装<br>Resend設定<br>問い合わせ時のメール送信<br>問い合わせ履歴の記録<br>ダッシュボードでの確認 |

### 🟢 Phase 5: ダッシュボード効率化（30分）
| タスク | 時間 | 詳細 |
|--------|------|------|
| **軽量トラッキング実装** | 15分 | Recharts導入（最も人気・簡単）<br>基本統計カード（shadcn/ui Card + 数値表示）<br>リアルタイム更新（Supabase Realtime） |
| **効率的ダッシュボード** | 15分 | StatsCards コンポーネント（URL共有数、閲覧者数、質問数、問い合わせ数）<br>ViewerTable コンポーネント（閲覧者一覧・最終アクセス・質問履歴）<br>自動更新（5秒間隔） |

---

## 12. デプロイ・運用

### 🔧 12.1 環境変数
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Resend
RESEND_API_KEY=your_resend_api_key

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 🚀 12.2 デプロイ手順
1. **Vercel にプロジェクト接続**
2. **環境変数設定**
3. **Supabase 本番環境設定**
4. **カスタムドメイン設定**（必要に応じて）

### 📊 12.3 監視・分析
- **Vercel Analytics**（基本的なアクセス解析）
- **Supabase Dashboard**（データベース監視）
- **エラー監視**（Vercel の標準機能）

---

## 13. デザインシステム・コンポーネント設計

### 🎨 13.1 デザインシステム基盤

#### カラーパレット（shadcn/ui デフォルト）
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --muted: 210 40% 96%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.5rem;
}
```

#### タイポグラフィ
```css
.text-display-1 { @apply text-4xl font-bold tracking-tight; }
.text-heading-1 { @apply text-2xl font-semibold; }
.text-heading-2 { @apply text-xl font-semibold; }
.text-body { @apply text-base; }
.text-caption { @apply text-sm text-muted-foreground; }
```

### 🧩 13.2 必要なshadcn/uiコンポーネント

```bash
# 必須コンポーネントのみインストール
npx shadcn-ui@latest add button card input label textarea
npx shadcn-ui@latest add form badge avatar table tabs
npx shadcn-ui@latest add dialog alert toast
```

### 📱 13.3 レスポンシブ設計

```css
/* Tailwind CSS標準ブレークポイント */
.stats-grid {
  @apply grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4;
}

.case-grid {
  @apply grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3;
}
```

### ✨ 13.4 アニメーション

```css
.card-hover {
  @apply transition-shadow duration-200 hover:shadow-md;
}

.button-press {
  @apply transition-transform duration-75 active:scale-95;
}

.loading {
  @apply animate-pulse;
}
```

---

## 🎯 まとめ

### ✅ 実装完了後の状態
1. **施工会社**: AI事例シェアで事例集URLを送るだけで確度の高いリード獲得
2. **元請け**: 24時間いつでも事例確認・AI質問で即座に疑問解決
3. **リアルタイム効果実感**: 美しいダッシュボードで営業効果を即座に確認

### 🚀 次のステップ
1. **MVP検証**: 1つの事例集URL共有で効果測定
2. **仮説検証**: 個人情報入力率・問い合わせ率の測定
3. **スケール**: 効果が実証されたら機能拡張

**目標**: 1日（9時間）でMVPを完成させ、施工会社の営業革命を実現する 