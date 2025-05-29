import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: '問い合わせ一覧 | AI事例シェア',
  description: 'AI事例シェアの問い合わせ一覧ページ',
};

export default async function InquiriesPage() {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">問い合わせ一覧</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600 mb-4">現在、このページは準備中です。</p>
        <p className="text-gray-600">今後のアップデートをお待ちください。</p>
      </div>
    </div>
  );
}
