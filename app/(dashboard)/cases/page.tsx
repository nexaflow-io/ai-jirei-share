import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { CaseList } from '@/components/CaseList';

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
  
  // 事例一覧を取得
  const { data: casesData, error: casesError } = await supabase
    .from('construction_cases')
    .select(`
      id,
      name,
      category,
      is_published,
      created_at,
      updated_at
    `)
    .eq('tenant_id', userData.tenant_id)
    .order('updated_at', { ascending: false });
    
  // 画像、閲覧者、アクセスログのカウントを別途取得
  const cases = casesData ? await Promise.all(
    casesData.map(async (caseItem) => {
      // 画像数を取得
      const { count: imageCount } = await supabase
        .from('case_images')
        .select('*', { count: 'exact', head: true })
        .eq('case_id', caseItem.id);
        
      // 閲覧者数を取得
      const { count: viewerCount } = await supabase
        .from('viewers')
        .select('*', { count: 'exact', head: true })
        .eq('case_id', caseItem.id);
        
      // アクセスログ数を取得
      const { count: accessCount } = await supabase
        .from('access_logs')
        .select('*', { count: 'exact', head: true })
        .eq('case_id', caseItem.id);
        
      return {
        ...caseItem,
        _count: {
          case_images: imageCount || 0,
          viewers: viewerCount || 0,
          access_logs: accessCount || 0
        }
      };
    })
  ) : [];
    
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
