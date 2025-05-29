import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: '設定 | AI事例シェア',
  description: 'AI事例シェアの設定ページ',
};

export default async function SettingsPage() {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">設定</h1>
      <p className="text-gray-600">現在、このページは準備中です。</p>
    </div>
  );
}
