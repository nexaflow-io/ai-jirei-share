'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { StatsCard } from '@/components/ui/stats-card';
import { usePageData } from '@/hooks/usePageData';
import { 
  Users, 
  Eye, 
  FileText, 
  MessageSquare, 
  TrendingUp,
  ArrowUpRight,
  Clock,
  Bot,
  Building2,
  BarChart3
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface DashboardStats {
  totalViewers: number;
  totalAccessLogs: number;
  totalCases: number;
  totalInquiries: number;
  totalAiQuestions: number;
  recentViewers: any[];
  topCases: any[];
  recentAiQuestions: any[];
}

const fetchDashboardData = async (): Promise<DashboardStats> => {
  const supabase = createClient();

  // 並列でデータを取得
  const [
    viewersResult,
    accessLogsResult,
    casesResult,
    inquiriesResult,
    aiQuestionsResult,
    recentViewersResult,
    topCasesResult,
    recentAiQuestionsResult
  ] = await Promise.all([
    supabase.from('viewers').select('id', { count: 'exact', head: true }),
    supabase.from('access_logs').select('id', { count: 'exact', head: true }),
    supabase.from('construction_cases').select('id', { count: 'exact', head: true }),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }),
    supabase.from('ai_questions').select('id', { count: 'exact', head: true }),
    supabase
      .from('viewers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('access_logs')
      .select(`
        case_id,
        construction_cases!inner(id, name, category)
      `)
      .limit(100),
    supabase
      .from('ai_questions')
      .select(`
        id,
        question,
        answer,
        model_used,
        created_at,
        viewer:viewers(company_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5)
  ]);

  // エラーチェック
  const results = [
    viewersResult, accessLogsResult, casesResult, inquiriesResult, 
    aiQuestionsResult, recentViewersResult, topCasesResult, recentAiQuestionsResult
  ];
  
  for (const result of results) {
    if (result.error) throw new Error(result.error.message);
  }

  // 人気の事例を計算
  const caseViewCounts = new Map();
  (topCasesResult.data || []).forEach((log: any) => {
    if (log.construction_cases) {
      const caseId = log.construction_cases.id;
      const caseName = log.construction_cases.name;
      if (caseViewCounts.has(caseId)) {
        caseViewCounts.get(caseId).view_count++;
      } else {
        caseViewCounts.set(caseId, {
          id: caseId,
          name: caseName,
          view_count: 1
        });
      }
    }
  });

  const topCases = Array.from(caseViewCounts.values())
    .sort((a: any, b: any) => b.view_count - a.view_count)
    .slice(0, 5);

  return {
    totalViewers: viewersResult.count || 0,
    totalAccessLogs: accessLogsResult.count || 0,
    totalCases: casesResult.count || 0,
    totalInquiries: inquiriesResult.count || 0,
    totalAiQuestions: aiQuestionsResult.count || 0,
    recentViewers: recentViewersResult.data || [],
    topCases,
    recentAiQuestions: recentAiQuestionsResult.data || []
  };
};

export default function DashboardPage() {
  const { data: stats, loading, error, refetch } = usePageData({
    fetchFn: fetchDashboardData
  });

  if (loading) {
    return <LoadingState message="ダッシュボードデータを読み込み中..." />;
  }

  if (error) {
    return (
      <ErrorState 
        message={error}
        onRetry={refetch}
      />
    );
  }

  if (!stats) {
    return <ErrorState message="データが見つかりません" />;
  }

  const currentDate = new Date();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          title="ダッシュボード"
          subtitle={`${format(currentDate, 'yyyy年M月d日 EEEE', { locale: ja })} の営業状況`}
          icon={BarChart3}
        />

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatsCard
            title="総閲覧者数"
            value={stats.totalViewers}
            icon={Users}
            description="累計の閲覧者数"
          />
          <StatsCard
            title="アクセスログ"
            value={stats.totalAccessLogs}
            icon={Eye}
            description="総アクセス数"
          />
          <StatsCard
            title="事例数"
            value={stats.totalCases}
            icon={FileText}
            description="公開中の事例"
          />
          <StatsCard
            title="問い合わせ数"
            value={stats.totalInquiries}
            icon={MessageSquare}
            description="受信した問い合わせ"
          />
          <StatsCard
            title="AI質問数"
            value={stats.totalAiQuestions}
            icon={Bot}
            description="AI質問の総数"
          />
        </div>

        {/* 最新の閲覧者 */}
        <Card className="bg-white shadow-sm border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                最新の閲覧者
              </div>
              <Link href="/leads">
                <Button variant="outline" size="sm">
                  すべて見る
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentViewers.length > 0 ? (
                stats.recentViewers.map((viewer) => (
                  <div key={viewer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{viewer.company_name}</p>
                        <p className="text-sm text-gray-600">{viewer.full_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">
                        {formatDistanceToNow(new Date(viewer.created_at), { 
                          addSuffix: true, 
                          locale: ja 
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-4">閲覧者がまだいません</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 人気事例 */}
        <Card className="bg-white shadow-sm border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                人気事例
              </div>
              <Link href="/viewer-analysis">
                <Button variant="outline" size="sm">
                  分析を見る
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topCases.length > 0 ? (
                stats.topCases.map((caseItem, index) => (
                  <div key={caseItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <p className="font-medium text-gray-900 truncate">{caseItem.name}</p>
                    </div>
                    <Badge variant="outline">
                      {caseItem.view_count} ビュー
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-4">データがまだありません</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 最新のAI質問 */}
        <Card className="bg-white shadow-sm border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
              <div className="flex items-center">
                <Bot className="h-5 w-5 mr-2 text-red-600" />
                最新のAI質問
              </div>
              <Link href="/ai-questions">
                <Button variant="outline" size="sm">
                  すべて見る
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentAiQuestions.length > 0 ? (
                stats.recentAiQuestions.map((question) => (
                  <div key={question.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2 line-clamp-2">
                          {question.question}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Building2 className="h-3 w-3" />
                          <span>{question.viewer.company_name}</span>
                          <span>•</span>
                          <span>{question.viewer.full_name}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xs text-gray-600">
                          {formatDistanceToNow(new Date(question.created_at), { 
                            addSuffix: true, 
                            locale: ja 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-4">AI質問がまだありません</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}