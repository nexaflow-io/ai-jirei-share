import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'ダッシュボード | AI事例シェア',
  description: 'AI事例シェアのダッシュボードです',
};

export default async function DashboardPage() {
  const supabase = createServerClient();
  
  // セッション確認
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth/login');
  }
  
  // ユーザー情報取得
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*, tenants(*)')
    .eq('id', session.user.id)
    .single();
  
  if (userError || !userData) {
    redirect('/auth/signup');
  }
  
  // 統計情報取得（仮）
  const stats = {
    totalCases: 0,
    publishedCases: 0,
    totalViews: 0,
    totalInquiries: 0
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>
      
      <div className="mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">ようこそ</h2>
          <p className="text-gray-600">
            {userData.tenants.name}（{userData.full_name}さん）
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">事例数</h3>
          <p className="text-2xl font-bold">{stats.totalCases}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">公開事例数</h3>
          <p className="text-2xl font-bold">{stats.publishedCases}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">総閲覧数</h3>
          <p className="text-2xl font-bold">{stats.totalViews}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">問い合わせ数</h3>
          <p className="text-2xl font-bold">{stats.totalInquiries}</p>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">最近の活動</h2>
        <p className="text-gray-600">まだ活動記録がありません。</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">クイックアクション</h2>
        <div className="flex flex-wrap gap-2">
          <a href="/dashboard/cases/new" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            新しい事例を追加
          </a>
        </div>
      </div>
    </div>
  );
} 