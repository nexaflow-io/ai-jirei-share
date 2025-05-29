import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { RealtimeDashboard } from '@/components/dashboard/RealtimeDashboard';

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
  
  // 統計情報取得
  const { data: casesData } = await supabase
    .from('construction_cases')
    .select('id, is_published')
    .eq('tenant_id', userData.tenant_id);
    
  const { data: viewersData } = await supabase
    .from('viewers')
    .select('id')
    .eq('tenant_id', userData.tenant_id);
    
  const { data: inquiriesData } = await supabase
    .from('inquiries')
    .select('id')
    .eq('tenant_id', userData.tenant_id);
    
  const { data: aiQuestionsCountData } = await supabase
    .from('ai_questions')
    .select('id')
    .eq('tenant_id', userData.tenant_id);
  
  // AI質問履歴を取得
  const { data: aiQuestionsDetailData, error: aiQuestionsError } = await supabase
    .from('ai_questions')
    .select(`
      id,
      case_id,
      question,
      answer,
      model_used,
      created_at,
      construction_cases (name)
    `)
    .eq('tenant_id', userData.tenant_id)
    .order('created_at', { ascending: false })
    .limit(10);
    
  // 型変換を行い、model_usedをmodelにマッピング
  const aiQuestions = aiQuestionsDetailData ? aiQuestionsDetailData.map(item => ({
    id: item.id,
    case_id: item.case_id,
    question: item.question,
    answer: item.answer,
    model: item.model_used, // model_usedをmodelにマッピング
    created_at: item.created_at,
    construction_cases: item.construction_cases
  })) : [];
  
  const stats = {
    totalCases: casesData?.length || 0,
    publishedCases: casesData?.filter(c => c.is_published)?.length || 0,
    totalViews: viewersData?.length || 0,
    totalInquiries: inquiriesData?.length || 0,
    totalAiQuestions: aiQuestionsCountData?.length || 0
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
      
      {/* リアルタイムダッシュボード */}
      <RealtimeDashboard 
        initialStats={stats} 
        initialAiQuestions={aiQuestions || []} 
        tenantId={userData.tenant_id} 
      />
      
      <div className="bg-white p-4 rounded-lg shadow mt-6">
        <h2 className="text-lg font-semibold mb-4">クイックアクション</h2>
        <div className="flex flex-wrap gap-2">
          <a href="/cases/new" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            新しい事例を追加
          </a>
        </div>
      </div>
    </div>
  );
} 