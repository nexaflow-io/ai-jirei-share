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
import { 
  Users, 
  Building2, 
  Mail, 
  Phone, 
  Calendar,
  ExternalLink,
  Eye,
  MessageSquare
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

const fetchLeads = async (): Promise<Lead[]> => {
  const supabase = createClient();
  
  // 閲覧者データを取得
  const { data: viewers, error: viewersError } = await supabase
    .from('viewers')
    .select('*')
    .order('created_at', { ascending: false });

  if (viewersError) throw new Error(viewersError.message);

  // 各閲覧者の統計情報を並列で取得
  const leadsWithStats = await Promise.all(
    (viewers || []).map(async (viewer) => {
      const [accessResult, inquiryResult, aiQuestionResult] = await Promise.all([
        supabase
          .from('access_logs')
          .select('accessed_at')
          .eq('viewer_id', viewer.id)
          .order('accessed_at', { ascending: false }),
        supabase
          .from('inquiries')
          .select('id', { count: 'exact', head: true })
          .eq('viewer_id', viewer.id),
        supabase
          .from('ai_questions')
          .select('id', { count: 'exact', head: true })
          .eq('viewer_id', viewer.id)
      ]);

      return {
        ...viewer,
        access_count: accessResult.data?.length || 0,
        accessed_at: accessResult.data?.[0]?.accessed_at || null,
        inquiry_count: inquiryResult.count || 0,
        ai_question_count: aiQuestionResult.count || 0
      } as Lead;
    })
  );

  return leadsWithStats;
};

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
      activity: (item, value) => {
        if (value === 'all') return true;
        if (value === 'active') return item.access_count > 0;
        if (value === 'inquired') return item.inquiry_count > 0;
        if (value === 'ai_used') return item.ai_question_count > 0;
        return true;
      }
    },
    sortFunctions: {
      newest: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      oldest: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      company: (a, b) => a.company_name.localeCompare(b.company_name),
      activity: (a, b) => b.access_count - a.access_count,
      recent_access: (a, b) => {
        if (!a.accessed_at && !b.accessed_at) return 0;
        if (!a.accessed_at) return 1;
        if (!b.accessed_at) return -1;
        return new Date(b.accessed_at).getTime() - new Date(a.accessed_at).getTime();
      }
    }
  });

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

  const filterOptions = [
    {
      label: 'アクティビティ',
      value: filters.activity || 'all',
      options: [
        { value: 'all', label: 'すべて' },
        { value: 'active', label: 'アクセス済み' },
        { value: 'inquired', label: '問い合わせ済み' },
        { value: 'ai_used', label: 'AI質問済み' }
      ],
      onChange: (value: string) => setFilter('activity', value)
    },
    {
      label: '並び順',
      value: sortBy || 'newest',
      options: [
        { value: 'newest', label: '新しい順' },
        { value: 'oldest', label: '古い順' },
        { value: 'company', label: '会社名順' },
        { value: 'activity', label: 'アクティビティ順' },
        { value: 'recent_access', label: '最新アクセス順' }
      ],
      onChange: setSortBy
    }
  ];

  const getActivityBadge = (lead: Lead) => {
    if (lead.inquiry_count > 0) {
      return <Badge className="bg-green-100 text-green-800">問い合わせ済み</Badge>;
    }
    if (lead.ai_question_count > 0) {
      return <Badge className="bg-blue-100 text-blue-800">AI質問済み</Badge>;
    }
    if (lead.access_count > 0) {
      return <Badge className="bg-yellow-100 text-yellow-800">アクセス済み</Badge>;
    }
    return <Badge variant="outline">新規</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          title="リード管理"
          subtitle="閲覧者の詳細情報とアクティビティを管理"
          icon={Users}
        />

        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="会社名、担当者名、メールアドレスで検索..."
          filters={filterOptions}
        />

        <div className="grid gap-6">
          {filteredData.length > 0 ? (
            filteredData.map((lead) => (
              <Card key={lead.id} className="bg-white shadow-sm border hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Building2 className="h-5 w-5 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900">{lead.company_name}</h3>
                        {getActivityBadge(lead)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>{lead.full_name}</span>
                            {lead.position && (
                              <>
                                <span>•</span>
                                <span>{lead.position}</span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                              {lead.email}
                            </a>
                          </div>
                          
                          {lead.phone && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Phone className="h-4 w-4" />
                              <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                                {lead.phone}
                              </a>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>登録: {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: ja })}</span>
                          </div>
                          
                          {lead.accessed_at && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Eye className="h-4 w-4" />
                              <span>最終アクセス: {formatDistanceToNow(new Date(lead.accessed_at), { addSuffix: true, locale: ja })}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-600">{lead.access_count} アクセス</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4 text-green-600" />
                          <span className="text-gray-600">{lead.inquiry_count} 問い合わせ</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-600">{lead.ai_question_count} AI質問</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/viewer-analysis?viewer=${lead.id}`}>
                          <ExternalLink className="h-4 w-4 mr-1" />
                          詳細分析
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-white shadow-sm border">
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm || Object.values(filters).some(f => f && f !== 'all') 
                    ? '検索条件に一致するリードが見つかりません' 
                    : 'リードがまだありません'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
