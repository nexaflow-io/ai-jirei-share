'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  BarChart3,
  AlertCircle
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
  recentViewers: Array<{
    id: string;
    company_name: string;
    full_name: string;
    created_at: string;
  }>;
  topCases: Array<{
    id: string;
    name: string;
    view_count: number;
  }>;
  recentAiQuestions: Array<{
    id: string;
    question: string;
    created_at: string;
    viewers: {
      company_name: string;
      full_name: string;
    };
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalViewers: 0,
    totalAccessLogs: 0,
    totalCases: 0,
    totalInquiries: 0,
    totalAiQuestions: 0,
    recentViewers: [],
    topCases: [],
    recentAiQuestions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
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
          .select('id, company_name, full_name, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('access_logs')
          .select('case_id, construction_cases(id, name)')
          .not('construction_cases', 'is', null)
          .order('accessed_at', { ascending: false })
          .limit(100),
        supabase
          .from('ai_questions')
          .select(`
            id,
            question,
            created_at,
            viewers(company_name, full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      // エラーチェック
      if (viewersResult.error) throw viewersResult.error;
      if (accessLogsResult.error) throw accessLogsResult.error;
      if (casesResult.error) throw casesResult.error;
      if (inquiriesResult.error) throw inquiriesResult.error;
      if (aiQuestionsResult.error) throw aiQuestionsResult.error;
      if (recentViewersResult.error) throw recentViewersResult.error;
      if (topCasesResult.error) throw topCasesResult.error;
      if (recentAiQuestionsResult.error) throw recentAiQuestionsResult.error;

      // 人気事例の集計
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
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, 5);

      setStats({
        totalViewers: viewersResult.count || 0,
        totalAccessLogs: accessLogsResult.count || 0,
        totalCases: casesResult.count || 0,
        totalInquiries: inquiriesResult.count || 0,
        totalAiQuestions: aiQuestionsResult.count || 0,
        recentViewers: recentViewersResult.data || [],
        topCases,
        recentAiQuestions: recentAiQuestionsResult.data || []
      });

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setError('ダッシュボードデータの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">ダッシュボードを読み込み中...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">エラーが発生しました</span>
              </div>
              <p className="text-red-600 mt-2">{error}</p>
              <Button 
                onClick={fetchDashboardData} 
                className="mt-4"
                variant="outline"
              >
                再試行
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
                ダッシュボード
              </h1>
              <p className="text-gray-600 mt-1">営業活動の概要と最新の動向</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">最終更新</p>
              <p className="text-sm font-medium text-gray-900">
                {format(new Date(), 'M月d日 HH:mm', { locale: ja })}
              </p>
            </div>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-white shadow-sm border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">総閲覧者数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalViewers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">総ページビュー</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAccessLogs}</p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">事例数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCases}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">問い合わせ</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalInquiries}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">AI質問数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAiQuestions}</p>
                </div>
                <Bot className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        </div>

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
                          <span>{question.viewers?.company_name}</span>
                          <span>•</span>
                          <span>{question.viewers?.full_name}</span>
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