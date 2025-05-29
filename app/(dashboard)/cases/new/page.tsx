import { CaseForm } from '@/components/forms/CaseForm';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: '新規事例作成 | AI事例シェア',
  description: 'AI事例シェアで新しい施工事例を作成します',
};

export default async function NewCasePage() {
  const supabase = createServerClient();
  
  // セッション確認
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth/login');
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">新規事例作成</h1>
      <CaseForm />
    </div>
  );
}
