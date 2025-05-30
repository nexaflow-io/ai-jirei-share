import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { InquiryForm } from '@/components/forms/InquiryForm';

export const metadata = {
  title: 'お問い合わせ | AI事例シェア',
  description: '施工事例に関するお問い合わせフォーム',
};

export default async function InquiryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = createServerClient();
  
  // 事例データを取得（公開されている事例のみ）
  const { id } = await params;
  const { data: caseData, error: caseError } = await supabase
    .from('construction_cases')
    .select(`
      id,
      tenant_id,
      name,
      tenants (
        id,
        name
      )
    `)
    .eq('id', id)
    .eq('is_published', true)
    .single();
    
  if (caseError || !caseData) {
    console.error('事例取得エラー:', caseError);
    return notFound();
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 text-center">お問い合わせ</h1>
      
      <InquiryForm
        caseId={caseData.id}
        caseName={caseData.name}
        tenantId={caseData.tenant_id}
        tenantName={caseData.tenants?.name || '施工会社'}
      />
    </div>
  );
}
