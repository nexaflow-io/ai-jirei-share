import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';
import CaseList from '@/components/CaseList';

export const metadata = {
  title: '事例一覧 | AI事例シェア',
  description: 'AI事例シェアの施工事例一覧',
};

export default async function CasesPage() {
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
  
  // 事例一覧を取得（関連データも一括取得で最適化）
  const { data: casesData, error: casesError } = await supabase
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
    `)
    .eq('tenant_id', userData.tenant_id)
    .order('updated_at', { ascending: false });
    
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
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">施工事例一覧</h1>
        <Link href="/cases/new">
          <Button>新規事例作成</Button>
        </Link>
      </div>
      
      <CaseList cases={cases || []} />
    </div>
  );
}
