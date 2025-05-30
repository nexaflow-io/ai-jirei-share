import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { Button } from '@/components/ui/button';
import CaseList from '@/components/CaseList';
import { LoadingState } from '@/components/ui/loading-state';

export const metadata = {
  title: '事例一覧 | AI事例シェア',
  description: 'AI事例シェアの施工事例一覧',
};

interface CasesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    status?: string;
  }>;
}

async function CasesContent({ searchParams }: CasesPageProps) {
  const params = await searchParams;

  const supabase = createServerClient();
  
  // セッション確認
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth/login');
  }
  
  // ユーザーのテナントIDを取得
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', session.user.id)
    .single();
    
  if (userError || !userData) {
    console.error('ユーザー情報取得エラー:', userError);
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          ユーザー情報の取得に失敗しました。再度ログインしてください。
        </div>
      </div>
    );
  }

  // ページネーション設定
  const page = parseInt(params.page || '1', 10);
  const limit = 20; // 1ページあたりの件数
  const offset = (page - 1) * limit;

  // 検索・フィルタ条件の構築
  let query = supabase
    .from('construction_cases')
    .select(`
      id,
      name,
      category,
      is_published,
      created_at,
      updated_at,
      case_images(id),
      viewers(id),
      access_logs(id)
    `, { count: 'exact' })
    .eq('tenant_id', userData.tenant_id);

  // 検索条件の追加
  if (params.search) {
    query = query.ilike('name', `%${params.search}%`);
  }

  if (params.category) {
    query = query.eq('category', params.category);
  }

  if (params.status) {
    const isPublished = params.status === 'published';
    query = query.eq('is_published', isPublished);
  }

  // ページネーションとソート
  const { data: casesData, error: casesError, count } = await query
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);
    
  // データを整形（N+1クエリ問題を解決）
  const cases = casesData ? casesData.map((caseItem) => ({
    ...caseItem,
    _count: {
      case_images: caseItem.case_images?.length || 0,
      viewers: caseItem.viewers?.length || 0,
      access_logs: caseItem.access_logs?.length || 0
    },
    // 不要な配列データを削除してメモリ使用量を削減
    case_images: undefined,
    viewers: undefined,
    access_logs: undefined
  })) : [];
     
  if (casesError) {
    console.error('事例取得エラー:', casesError);
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          事例の取得に失敗しました。
        </div>
      </div>
    );
  }

  // ページネーション情報
  const totalPages = Math.ceil((count || 0) / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">施工事例一覧</h1>
          <p className="text-sm text-gray-500 mt-1">
            {count || 0}件中 {offset + 1}-{Math.min(offset + limit, count || 0)}件を表示
          </p>
        </div>
        <Link href="/cases/new">
          <Button>新規事例作成</Button>
        </Link>
      </div>
      
      {/* 検索・フィルタ機能（将来実装予定） */}
      {/* TODO: 検索フォーム、カテゴリフィルタ、ステータスフィルタを追加 */}
      
      <CaseList 
        cases={cases || []} 
        pagination={{
          currentPage: page,
          totalPages,
          hasNextPage,
          hasPrevPage,
          totalCount: count || 0
        }}
      />
    </div>
  );
}

export default async function CasesPage(props: CasesPageProps) {
  return (
    <Suspense fallback={<LoadingState message="事例データを読み込み中..." />}>
      <CasesContent {...props} />
    </Suspense>
  );
}
