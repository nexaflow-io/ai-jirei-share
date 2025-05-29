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

// ページを動的にレンダリング（キャッシュ無効化）
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = createServerClient();
  
  try {
    // セッション確認
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      redirect('/auth/login');
    }
    
    // ユーザー情報取得
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, tenant_id, tenants(id, name)')
      .eq('id', session.user.id)
      .single();
    
    if (userError || !userData || !userData.tenant_id) {
      redirect('/auth/signup');
    }
    
    // 統計情報とAI質問履歴を並列で取得（高速化）
    const [casesResult, viewersResult, inquiriesResult, aiQuestionsCountResult, aiQuestionsDetailResult] = await Promise.all([
      supabase
        .from('construction_cases')
        .select('id, is_published')
        .eq('tenant_id', userData.tenant_id),
      supabase
        .from('viewers')
        .select('id')
        .eq('tenant_id', userData.tenant_id),
      supabase
        .from('inquiries')
        .select('id')
        .eq('tenant_id', userData.tenant_id),
      supabase
        .from('ai_questions')
        .select('id')
        .eq('tenant_id', userData.tenant_id),
      supabase
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
        .limit(10)
    ]);

    // エラーチェック
    if (casesResult.error) throw new Error(`事例データの取得に失敗: ${casesResult.error.message}`);
    if (viewersResult.error) throw new Error(`閲覧者データの取得に失敗: ${viewersResult.error.message}`);
    if (inquiriesResult.error) throw new Error(`問い合わせデータの取得に失敗: ${inquiriesResult.error.message}`);
    if (aiQuestionsCountResult.error) throw new Error(`AI質問数の取得に失敗: ${aiQuestionsCountResult.error.message}`);
    if (aiQuestionsDetailResult.error) throw new Error(`AI質問履歴の取得に失敗: ${aiQuestionsDetailResult.error.message}`);
    
    // 型変換を行い、model_usedをmodelにマッピング
    const aiQuestions = aiQuestionsDetailResult.data ? aiQuestionsDetailResult.data.map((item: any) => ({
      id: item.id,
      case_id: item.case_id,
      question: item.question,
      answer: item.answer,
      model: item.model_used, // model_usedをmodelにマッピング
      created_at: item.created_at,
      construction_cases: item.construction_cases
    })) : [];
    
    const stats = {
      totalCases: casesResult.data?.length || 0,
      publishedCases: casesResult.data?.filter((c: any) => c.is_published)?.length || 0,
      totalViews: viewersResult.data?.length || 0,
      totalInquiries: inquiriesResult.data?.length || 0,
      totalAiQuestions: aiQuestionsCountResult.data?.length || 0
    };

    // 現在の日時を取得
    const currentDate = new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* ヘッダーセクション */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">ダッシュボード</h1>
                  <p className="text-sm text-gray-500">{currentDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* ウェルカムカード */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {userData.tenants?.name || '会社名未設定'}
                    </h2>
                    <p className="text-blue-100 flex items-center mt-1">
                      <User className="w-4 h-4 mr-2" />
                      {session.user.email}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-blue-100 mb-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">最終ログイン</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {new Date().toLocaleDateString('ja-JP')}
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
  } catch (error) {
    console.error('ダッシュボードの初期化に失敗:', error);
    
    // エラーページを表示
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              データの読み込みに失敗しました
            </h2>
            <p className="text-gray-600 mb-4">
              しばらく時間をおいてから再度お試しください。
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              再読み込み
            </button>
          </div>
        </div>
      </div>
    );
  }
}