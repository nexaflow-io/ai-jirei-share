import { redirect } from 'next/navigation';
import { RealtimeDashboard } from '@/components/dashboard/RealtimeDashboard';
import { createServerClient } from '@/lib/supabase/server';
import { 
  Building2, 
  User, 
  Calendar,
  TrendingUp
} from 'lucide-react';

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
  const aiQuestions = aiQuestionsDetailData ? aiQuestionsDetailData.map((item: any) => ({
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
    publishedCases: casesData?.filter((c: any) => c.is_published)?.length || 0,
    totalViews: viewersData?.length || 0,
    totalInquiries: inquiriesData?.length || 0,
    totalAiQuestions: aiQuestionsCountData?.length || 0
  };

  // 現在の日時を取得
  const currentDate = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
  
  return (
    <div className="min-h-screen">
      {/* ヘッダーセクション */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">ダッシュボード</h1>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  {currentDate}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* ウェルカムカード */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 sm:p-8">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  おかえりなさい！
                </h2>
                <div className="space-y-1">
                  <div className="flex items-center text-gray-700">
                    <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="font-semibold">{userData.tenants.name}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{userData.full_name}さん</span>
                  </div>
                </div>
                <p className="text-gray-600 mt-3 text-sm sm:text-base">
                  本日も施工事例の管理と営業活動の効率化をサポートします。
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* リアルタイムダッシュボード */}
        <RealtimeDashboard 
          initialStats={stats}
          initialAiQuestions={aiQuestions}
          tenantId={userData.tenant_id}
        />
      </div>
    </div>
  );
}