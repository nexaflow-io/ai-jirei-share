import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { CaseForm } from '@/components/forms/CaseForm';

export const metadata = {
  title: '事例編集 | AI事例シェア',
  description: 'AI事例シェアで施工事例を編集します',
};

export default async function EditCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServerClient();
  
  // セッション確認
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return notFound();
  }
  
  // ユーザーのテナントIDを取得
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', session.user.id)
    .single();
    
  if (userError || !userData) {
    console.error('ユーザー情報取得エラー:', userError);
    return notFound();
  }
  
  // 事例データを取得
  const { data: caseData, error: caseError } = await supabase
    .from('construction_cases')
    .select(`
      id,
      name,
      category,
      description,
      solution,
      result,
      is_published
    `)
    .eq('id', id)
    .eq('tenant_id', userData.tenant_id)
    .single();
    
  if (caseError || !caseData) {
    console.error('事例取得エラー:', caseError);
    return notFound();
  }
  
  // 事例の画像を取得
  const { data: imageData, error: imageError } = await supabase
    .from('case_images')
    .select('id, image_url')
    .eq('case_id', id)
    .order('display_order', { ascending: true });
    
  if (imageError) {
    console.error('画像取得エラー:', imageError);
  }
  
  const existingImages = imageData
    ? imageData.map(img => ({
        id: img.id,
        url: img.image_url,
      }))
    : [];
  
  // nullの可能性のあるフィールドに空文字列を設定して型エラーを解消
  const formData = {
    id: caseData.id,
    name: caseData.name,
    category: caseData.category || '',
    description: caseData.description || '',
    solution: caseData.solution || '',
    result: caseData.result || '',
    is_published: caseData.is_published
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">事例編集</h1>
      <CaseForm
        initialData={formData}
        isEditing={true}
      />
    </div>
  );
}
