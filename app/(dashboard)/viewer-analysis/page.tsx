'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye,
  Building2,
  Activity,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow, format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface AnalyticsData {
  totalViewers: number;
  totalViews: number;
  averageViewsPerViewer: number;
  topCompanies: Array<{
    company_name: string;
    viewer_count: number;
    total_views: number;
  }>;
  topCases: Array<{
    case_name: string;
    view_count: number;
    unique_viewers: number;
  }>;
  dailyViews: Array<{
    date: string;
    views: number;
    unique_viewers: number;
  }>;
  interestLevels: {
    high: number;
    medium: number;
    low: number;
  };
}

export default function ViewerAnalysisPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      // 期間の計算
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      // 基本統計の取得 - accessed_atフィールドを使用
      const [viewersResult, accessLogsResult] = await Promise.all([
        supabase
          .from('viewers')
          .select('id, company_name, full_name, created_at')
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('access_logs')
          .select(`
            id,
            viewer_id,
            case_id,
            accessed_at,
            viewers(company_name, full_name),
            construction_cases(name)
          `)
          .gte('accessed_at', startDate.toISOString())
      ]);

      if (viewersResult.error) {
        console.error('Viewers query error:', viewersResult.error);
        throw new Error('閲覧者データの取得に失敗しました');
      }
      
      if (accessLogsResult.error) {
        console.error('Access logs query error:', accessLogsResult.error);
        throw new Error('アクセスログの取得に失敗しました');
      }

      const viewers = viewersResult.data || [];
      const accessLogs = accessLogsResult.data || [];

      // 統計データの計算
      const totalViewers = viewers.length;
      const totalViews = accessLogs.length;
      const averageViewsPerViewer = totalViewers > 0 ? Math.round((totalViews / totalViewers) * 10) / 10 : 0;

      // 会社別統計
      const companyStats = new Map();
      viewers.forEach(viewer => {
        const company = viewer.company_name || '不明';
        if (!companyStats.has(company)) {
          companyStats.set(company, { viewer_count: 0, total_views: 0 });
        }
        companyStats.get(company).viewer_count++;
      });

      accessLogs.forEach(log => {
        const company = log.viewers?.company_name || '不明';
        if (companyStats.has(company)) {
          companyStats.get(company).total_views++;
        }
      });

      const topCompanies = Array.from(companyStats.entries())
        .map(([company_name, stats]) => ({ company_name, ...stats }))
        .sort((a, b) => b.total_views - a.total_views)
        .slice(0, 5);

      // 事例別統計
      const caseStats = new Map();
      accessLogs.forEach(log => {
        const caseName = log.construction_cases?.name || '不明';
        if (!caseStats.has(caseName)) {
          caseStats.set(caseName, { view_count: 0, viewers: new Set() });
        }
        caseStats.get(caseName).view_count++;
        if (log.viewer_id) {
          caseStats.get(caseName).viewers.add(log.viewer_id);
        }
      });

      const topCases = Array.from(caseStats.entries())
        .map(([case_name, stats]) => ({
          case_name,
          view_count: stats.view_count,
          unique_viewers: stats.viewers.size
        }))
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, 5);

      // 日別統計（過去7日間）
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(format(date, 'yyyy-MM-dd'));
      }

      const dailyStats = new Map();
      last7Days.forEach(dateStr => {
        dailyStats.set(dateStr, { views: 0, viewers: new Set() });
      });

      accessLogs.forEach(log => {
        const dateStr = format(new Date(log.accessed_at), 'yyyy-MM-dd');
        if (dailyStats.has(dateStr)) {
          dailyStats.get(dateStr).views++;
          if (log.viewer_id) {
            dailyStats.get(dateStr).viewers.add(log.viewer_id);
          }
        }
      });

      const dailyViews = Array.from(dailyStats.entries())
        .map(([date, stats]) => ({
          date,
          views: stats.views,
          unique_viewers: stats.viewers.size
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // 関心度レベル
      const viewerAccessCounts = new Map();
      accessLogs.forEach(log => {
        if (log.viewer_id) {
          viewerAccessCounts.set(
            log.viewer_id, 
            (viewerAccessCounts.get(log.viewer_id) || 0) + 1
          );
        }
      });

      const interestLevels = {
        high: Array.from(viewerAccessCounts.values()).filter(count => count >= 5).length,
        medium: Array.from(viewerAccessCounts.values()).filter(count => count >= 2 && count < 5).length,
        low: Array.from(viewerAccessCounts.values()).filter(count => count < 2).length
      };

      setAnalytics({
        totalViewers,
        totalViews,
        averageViewsPerViewer,
        topCompanies,
        topCases,
        dailyViews,
        interestLevels
      });

    } catch (error) {
      console.error('Analytics fetch error:', error);
      setError(error instanceof Error ? error.message : '分析データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case '7d': return '過去7日間';
      case '30d': return '過去30日間';
      case '90d': return '過去90日間';
      default: return '過去30日間';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">分析データを読み込み中...</span>
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
                onClick={fetchAnalytics} 
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

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">分析データがありません</p>
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
                閲覧者分析
              </h1>
              <p className="text-gray-600 mt-1">サイト訪問者の行動分析と統計情報</p>
            </div>
            <div className="flex space-x-2">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                  className="text-sm"
                >
                  {getTimeRangeLabel(range)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* 基本統計 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white shadow-sm border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">総閲覧者数</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalViewers}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalViews}</p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">平均ページビュー</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.averageViewsPerViewer}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">高関心度ユーザー</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.interestLevels.high}</p>
                </div>
                <Activity className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 関心度レベル */}
        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">関心度レベル分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">{analytics.interestLevels.high}</div>
                <div className="text-sm text-red-700">高関心度 (5回以上)</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">{analytics.interestLevels.medium}</div>
                <div className="text-sm text-yellow-700">中関心度 (2-4回)</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-600">{analytics.interestLevels.low}</div>
                <div className="text-sm text-gray-700">低関心度 (1回)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 上位企業 */}
          <Card className="bg-white shadow-sm border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                アクティブ企業 TOP5
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topCompanies.map((company, index) => (
                  <div key={company.company_name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900">{company.company_name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{company.total_views} ビュー</div>
                      <div className="text-xs text-gray-600">{company.viewer_count} 人</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 人気事例 */}
          <Card className="bg-white shadow-sm border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Eye className="h-5 w-5 mr-2 text-green-600" />
                人気事例 TOP5
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topCases.map((caseItem, index) => (
                  <div key={caseItem.case_name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900 truncate">{caseItem.case_name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{caseItem.view_count} ビュー</div>
                      <div className="text-xs text-gray-600">{caseItem.unique_viewers} 人</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 日別アクティビティ */}
        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-600" />
              過去7日間のアクティビティ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.dailyViews.map((day) => (
                <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900">
                    {format(new Date(day.date), 'M月d日(E)', { locale: ja })}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{day.views} ビュー</div>
                      <div className="text-xs text-gray-600">{day.unique_viewers} ユニークユーザー</div>
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (day.views / Math.max(...analytics.dailyViews.map(d => d.views))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
