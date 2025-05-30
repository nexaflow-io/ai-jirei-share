'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar } from '@/components/ui/filter-bar';
import { usePageData } from '@/hooks/usePageData';
import { useFilters } from '@/hooks/useFilters';
import { useMemo, memo } from 'react';
import { 
  Users, 
  Building2, 
  Mail, 
  Phone, 
  Calendar,
  ExternalLink,
  Eye,
  MessageSquare,
  TrendingUp,
  Activity
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';

interface Lead {
  id: string;
  company_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  position: string | null;
  case_id: string;
  tenant_id: string;
  created_at: string;
  accessed_at: string | null;
  access_count: number;
  inquiry_count: number;
  ai_question_count: number;
}

// 日付フォーマットのキャッシュ
const dateFormatCache = new Map<string, string>();

const getFormattedDate = (dateString: string): string => {
  if (dateFormatCache.has(dateString)) {
    return dateFormatCache.get(dateString)!;
  }
  const formatted = formatDistanceToNow(new Date(dateString), {
    addSuffix: true,
    locale: ja,
  });
  dateFormatCache.set(dateString, formatted);
  return formatted;
};

const fetchLeads = async (): Promise<Lead[]> => {
  const supabase = createClient();
  
  // 効率的なクエリ - JOINを使用してN+1問題を解決
  const { data: viewersWithStats, error } = await supabase
    .from('viewers')
    .select(`
      *,
      access_logs(accessed_at),
      inquiries(id),
      ai_questions(id)
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  // データを効率的に変換
  const leadsWithStats: Lead[] = (viewersWithStats || []).map((viewer) => {
    const accessLogs = viewer.access_logs || [];
    const inquiries = viewer.inquiries || [];
    const aiQuestions = viewer.ai_questions || [];

    return {
      ...viewer,
      access_count: accessLogs.length,
      accessed_at: accessLogs.length > 0 
        ? accessLogs.sort((a: any, b: any) => 
            new Date(b.accessed_at).getTime() - new Date(a.accessed_at).getTime()
          )[0].accessed_at
        : null,
      inquiry_count: inquiries.length,
      ai_question_count: aiQuestions.length
    } as Lead;
  });

  return leadsWithStats;
};

// メモ化されたリードカードコンポーネント
const LeadCard = memo(({ lead }: { lead: Lead }) => {
  const engagementLevel = useMemo(() => {
    const totalActivity = lead.access_count + lead.inquiry_count + lead.ai_question_count;
    if (totalActivity >= 10) return { level: 'high', color: 'bg-green-100 text-green-800', label: '高' };
    if (totalActivity >= 5) return { level: 'medium', color: 'bg-yellow-100 text-yellow-800', label: '中' };
    return { level: 'low', color: 'bg-gray-100 text-gray-800', label: '低' };
  }, [lead.access_count, lead.inquiry_count, lead.ai_question_count]);

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <Building2 className="h-5 w-5 text-gray-400" />
              <div>
                <h3 className="font-semibold text-gray-900">{lead.company_name}</h3>
                <p className="text-sm text-gray-600">{lead.full_name}</p>
                {lead.position && (
                  <p className="text-xs text-gray-500">{lead.position}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{lead.email}</span>
              </div>
              {lead.phone && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{lead.phone}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold text-blue-600">{lead.access_count}</span>
                </div>
                <p className="text-xs text-gray-500">アクセス</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <MessageSquare className="h-4 w-4 text-green-500" />
                  <span className="font-semibold text-green-600">{lead.inquiry_count}</span>
                </div>
                <p className="text-xs text-gray-500">問い合わせ</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <MessageSquare className="h-4 w-4 text-purple-500" />
                  <span className="font-semibold text-purple-600">{lead.ai_question_count}</span>
                </div>
                <p className="text-xs text-gray-500">AI質問</p>
              </div>
            </div>
          </div>
          
          <div className="text-right space-y-2">
            <Badge className={engagementLevel.color}>
              関心度: {engagementLevel.label}
            </Badge>
            <div className="text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>登録: {getFormattedDate(lead.created_at)}</span>
              </div>
              {lead.accessed_at && (
                <div className="flex items-center space-x-1 mt-1">
                  <Eye className="h-3 w-3" />
                  <span>最終: {getFormattedDate(lead.accessed_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

LeadCard.displayName = 'LeadCard';

export default function LeadsPage() {
  const { data: leads, loading, error, refetch } = usePageData({
    fetchFn: fetchLeads,
    initialData: []
  });

  const {
    filteredData,
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    sortBy,
    setSortBy
  } = useFilters({
    data: leads || [],
    searchFields: ['company_name', 'full_name', 'email'],
    filterFunctions: {
      engagement: (item: Lead, value: string) => {
        if (value === 'all') return true;
        const totalActivity = item.access_count + item.inquiry_count + item.ai_question_count;
        const engagementLevel = totalActivity >= 10 ? 'high' : totalActivity >= 5 ? 'medium' : 'low';
        return engagementLevel === value;
      },
      activity: (item: Lead, value: string) => {
        if (value === 'all') return true;
        const isActive = item.accessed_at && 
          new Date(item.accessed_at).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000);
        if (value === 'active') return !!isActive;
        if (value === 'inactive') return !isActive;
        return true;
      }
    },
    sortFunctions: {
      newest: (a: Lead, b: Lead) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      oldest: (a: Lead, b: Lead) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      most_active: (a: Lead, b: Lead) => {
        const aActivity = a.access_count + a.inquiry_count + a.ai_question_count;
        const bActivity = b.access_count + b.inquiry_count + b.ai_question_count;
        return bActivity - aActivity;
      },
      company_name: (a: Lead, b: Lead) => a.company_name.localeCompare(b.company_name)
    }
  });

  // フィルターオプションの定義
  const filterOptions = [
    {
      label: '関心度',
      value: filters.engagement || 'all',
      options: [
        { value: 'all', label: 'すべて' },
        { value: 'high', label: '高' },
        { value: 'medium', label: '中' },
        { value: 'low', label: '低' }
      ],
      onChange: (value: string) => setFilter('engagement', value)
    },
    {
      label: '活動状況',
      value: filters.activity || 'all',
      options: [
        { value: 'all', label: 'すべて' },
        { value: 'active', label: 'アクティブ' },
        { value: 'inactive', label: '非アクティブ' }
      ],
      onChange: (value: string) => setFilter('activity', value)
    },
    {
      label: '並び順',
      value: sortBy || 'newest',
      options: [
        { value: 'newest', label: '登録日（新しい順）' },
        { value: 'oldest', label: '登録日（古い順）' },
        { value: 'most_active', label: '活動度（高い順）' },
        { value: 'company_name', label: '会社名（A-Z）' }
      ],
      onChange: setSortBy
    }
  ];

  // 統計情報をメモ化
  const stats = useMemo(() => {
    if (!leads) return { total: 0, highEngagement: 0, recentActivity: 0 };
    
    const highEngagement = leads.filter(lead => 
      (lead.access_count + lead.inquiry_count + lead.ai_question_count) >= 10
    ).length;
    
    const recentActivity = leads.filter(lead => 
      lead.accessed_at && 
      new Date(lead.accessed_at).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000)
    ).length;
    
    return {
      total: leads.length,
      highEngagement,
      recentActivity
    };
  }, [leads]);

  if (loading) {
    return <LoadingState message="リードデータを読み込み中..." />;
  }

  if (error) {
    return (
      <ErrorState 
        message={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="リード管理"
          subtitle="潜在顧客の活動状況を分析"
          icon={Users}
        />

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">総リード数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">高関心度</p>
                  <p className="text-2xl font-bold text-green-600">{stats.highEngagement}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">最近の活動</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.recentActivity}</p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* フィルターバー */}
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filterOptions}
          searchPlaceholder="会社名、担当者名、メールアドレスで検索..."
        />

        {/* リード一覧 */}
        <div className="space-y-4">
          {filteredData.length > 0 ? (
            filteredData.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || Object.values(filters).some(f => f !== 'all') 
                    ? 'フィルター条件に一致するリードが見つかりません' 
                    : 'まだリードがありません'
                  }
                </h3>
                <p className="text-gray-500">
                  {searchTerm || Object.values(filters).some(f => f !== 'all')
                    ? '検索条件やフィルターを変更してみてください'
                    : '事例を公開して、潜在顧客からのアクセスを待ちましょう'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
