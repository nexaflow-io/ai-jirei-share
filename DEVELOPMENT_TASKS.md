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
- [ ] Supabase Auth 設定
- [ ] サインアップフロー実装
- [ ] ログインフロー実装
- [ ] テナント（施工会社）作成機能
- [ ] 認証ミドルウェア実装
- [ ] 保護されたルート設定

**詳細要件**:
- マルチテナント対応
- 施工会社ごとのデータ分離
- Row Level Security (RLS)

### ✅ 1-3. データベース設計（1時間）
- [ ] テーブル設計・作成
  - [ ] `tenants` (施工会社)
  - [ ] `construction_cases` (事例)
  - [ ] `case_images` (事例画像)
  - [ ] `viewers` (閲覧者)
  - [ ] `access_logs` (アクセスログ)
  - [ ] `ai_questions` (AI質問)
  - [ ] `inquiries` (問い合わせ)
- [ ] RLS ポリシー設定
- [ ] 初期データ投入

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

### 必須パッケージ
```json
{
  "dependencies": {
    "next": "14.x",
    "@supabase/supabase-js": "latest",
    "@supabase/auth-helpers-nextjs": "latest",
    "ai": "latest",
    "@ai-sdk/openai": "latest",
    "resend": "latest",
    "react-hook-form": "latest",
    "@hookform/resolvers": "latest",
    "zod": "latest",
    "react-dropzone": "latest",
    "recharts": "latest",
    "date-fns": "latest",
    "zustand": "latest"
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