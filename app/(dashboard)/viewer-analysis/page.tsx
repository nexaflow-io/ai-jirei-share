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
  Clock,
  Calendar,
  Building2,
  Star,
  Activity,
  Target,
  Filter,
  Download
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow, format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
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
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
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

      // 基本統計の取得
      const [viewersResult, accessLogsResult] = await Promise.all([
        supabase
          .from('viewers')
          .select('*, construction_cases(name), tenants(name)')
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('access_logs')
          .select('*, viewers(company_name), construction_cases(name)')
          .gte('created_at', startDate.toISOString())
      ]);

      if (viewersResult.error) throw viewersResult.error;
      if (accessLogsResult.error) throw accessLogsResult.error;

      const viewers = viewersResult.data || [];
      const accessLogs = accessLogsResult.data || [];

      // 統計データの計算
      const totalViewers = viewers.length;
      const totalViews = accessLogs.length;
      const averageViewsPerViewer = totalViewers > 0 ? totalViews / totalViewers : 0;

      // 会社別統計
      const companyStats = new Map();
      viewers.forEach(viewer => {
        const company = viewer.company_name;
        if (!companyStats.has(company)) {
          companyStats.set(company, { viewer_count: 0, total_views: 0 });
        }
        companyStats.get(company).viewer_count++;
      });

      accessLogs.forEach(log => {
        const company = log.viewers?.company_name;
        if (company && companyStats.has(company)) {
          companyStats.get(company).total_views++;
        }
      });

      const topCompanies = Array.from(companyStats.entries())
        .map(([company_name, stats]) => ({ company_name, ...stats }))
        .sort((a, b) => b.total_views - a.total_views)
        .slice(0, 10);

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
        .slice(0, 10);

      // 日別統計
      const dailyStats = new Map();
      const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
      
      dateRange.forEach(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
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
      console.error('分析データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">分析データを読み込めませんでした</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">閲覧者分析</h1>
          <p className="text-gray-600 mt-2">閲覧者の行動パターンと関心度を分析</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex rounded-lg border">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="rounded-none first:rounded-l-lg last:rounded-r-lg"
              >
                {range === '7d' ? '7日間' : range === '30d' ? '30日間' : '90日間'}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            エクスポート
          </Button>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総閲覧者数</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalViewers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総閲覧数</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalViews}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">平均閲覧数/人</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.averageViewsPerViewer.toFixed(1)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">高関心度</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.interestLevels.high}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 関心度分布 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            関心度分布
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
                <span className="font-medium">高関心度（5回以上閲覧）</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-red-600 mr-2">{analytics.interestLevels.high}</span>
                <span className="text-gray-600">人</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                <span className="font-medium">中関心度（2-4回閲覧）</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-yellow-600 mr-2">{analytics.interestLevels.medium}</span>
                <span className="text-gray-600">人</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                <span className="font-medium">低関心度（1回閲覧）</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-green-600 mr-2">{analytics.interestLevels.low}</span>
                <span className="text-gray-600">人</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 人気企業ランキング */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              人気企業ランキング
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topCompanies.map((company, index) => (
                <div key={company.company_name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{company.company_name}</p>
                      <p className="text-sm text-gray-600">{company.viewer_count}人の閲覧者</p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {company.total_views}回閲覧
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 人気事例ランキング */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              人気事例ランキング
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topCases.map((caseItem, index) => (
                <div key={caseItem.case_name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{caseItem.case_name}</p>
                      <p className="text-sm text-gray-600">{caseItem.unique_viewers}人が閲覧</p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {caseItem.view_count}回
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 日別アクティビティ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            日別アクティビティ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.dailyViews.slice(-7).map((day) => (
              <div key={day.date} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="font-medium">{format(new Date(day.date), 'M月d日(E)', { locale: ja })}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">
                    <Eye className="w-3 h-3 mr-1" />
                    {day.views}回閲覧
                  </Badge>
                  <Badge variant="outline">
                    <Users className="w-3 h-3 mr-1" />
                    {day.unique_viewers}人
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
