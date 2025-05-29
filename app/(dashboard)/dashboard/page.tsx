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
  TrendingDown,
  ArrowUpRight,
  Clock,
  Target,
  Bot,
  Building2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface DashboardStats {
  totalViewers: number;
  totalAccessLogs: number;
  totalCases: number;
  totalInquiries: number;
  recentViewers: any[];
  topCases: any[];
  recentActivities: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalViewers: 0,
    totalAccessLogs: 0,
    totalCases: 0,
    totalInquiries: 0,
    recentViewers: [],
    topCases: [],
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const supabase = createClient();

      // 基本統計を取得
      const [
        { count: viewersCount },
        { count: accessLogsCount },
        { count: casesCount },
        { count: inquiriesCount }
      ] = await Promise.all([
        supabase.from('viewers').select('*', { count: 'exact', head: true }),
        supabase.from('access_logs').select('*', { count: 'exact', head: true }),
        supabase.from('construction_cases').select('*', { count: 'exact', head: true }),
        supabase.from('inquiries').select('*', { count: 'exact', head: true })
      ]);

      // 最近の閲覧者を取得
      const { data: recentViewers } = await supabase
        .from('viewers')
        .select(`
          *,
          construction_cases(name),
          tenants(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // 人気事例を取得（アクセス数順）
      const { data: topCases } = await supabase
        .from('construction_cases')
        .select(`
          *,
          access_logs(count),
          tenants(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // 最近のアクティビティを取得
      const { data: recentActivities } = await supabase
        .from('access_logs')
        .select(`
          *,
          viewers(company_name, full_name),
          construction_cases(name),
          tenants(name)
        `)
        .order('accessed_at', { ascending: false })
        .limit(10);

      setStats({
        totalViewers: viewersCount || 0,
        totalAccessLogs: accessLogsCount || 0,
        totalCases: casesCount || 0,
        totalInquiries: inquiriesCount || 0,
        recentViewers: recentViewers || [],
        topCases: topCases || [],
        recentActivities: recentActivities || []
      });
    } catch (error) {
      console.error('ダッシュボードデータ取得エラー:', error);
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

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">営業ダッシュボード</h1>
          <p className="text-gray-600 mt-2">施工事例の閲覧状況と営業活動の概要</p>
        </div>
        <div className="flex space-x-4">
          <Button asChild>
            <Link href="/cases/new">
              <FileText className="w-4 h-4 mr-2" />
              新規事例追加
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">総閲覧者数</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.totalViewers}</div>
            <p className="text-xs text-blue-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              見込み客の数
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">総アクセス数</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.totalAccessLogs}</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              事例閲覧回数
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">公開事例数</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats.totalCases}</div>
            <p className="text-xs text-purple-600 flex items-center mt-1">
              <Building2 className="w-3 h-3 mr-1" />
              営業資料
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">問い合わせ数</CardTitle>
            <MessageSquare className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{stats.totalInquiries}</div>
            <p className="text-xs text-orange-600 flex items-center mt-1">
              <Target className="w-3 h-3 mr-1" />
              商談機会
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 最近の閲覧者 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">最近の閲覧者</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/leads">
                すべて見る
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentViewers.length > 0 ? (
                stats.recentViewers.map((viewer) => (
                  <div key={viewer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{viewer.full_name}</div>
                      <div className="text-sm text-gray-600">{viewer.company_name}</div>
                      <div className="text-xs text-gray-500">
                        {viewer.construction_cases?.name} - {viewer.tenants?.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(viewer.created_at), { 
                          addSuffix: true, 
                          locale: ja 
                        })}
                      </div>
                      <Badge variant="outline" className="mt-1">
                        {viewer.position}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">閲覧者がまだいません</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 最近のアクティビティ */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">最近のアクティビティ</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/analytics">
                詳細分析
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <Eye className="w-4 h-4 text-blue-600 mt-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {activity.viewers?.company_name} - {activity.viewers?.full_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        「{activity.construction_cases?.name}」を閲覧
                      </div>
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDistanceToNow(new Date(activity.accessed_at), { 
                          addSuffix: true, 
                          locale: ja 
                        })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">アクティビティがまだありません</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 人気事例 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">人気の施工事例</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/cases">
              事例管理
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.topCases.length > 0 ? (
              stats.topCases.map((caseItem) => (
                <div key={caseItem.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 line-clamp-2">{caseItem.name}</h3>
                    <Badge variant="secondary">
                      {Array.isArray(caseItem.access_logs) ? caseItem.access_logs.length : 0} 回
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{caseItem.tenants?.name}</p>
                  <div className="text-xs text-gray-500">
                    作成: {formatDistanceToNow(new Date(caseItem.created_at), { 
                      addSuffix: true, 
                      locale: ja 
                    })}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4 col-span-full">事例がまだありません</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}