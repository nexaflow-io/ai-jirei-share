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
import { useMemo, memo, useState } from 'react';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Building2, 
  User, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  FileText
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Inquiry {
  id: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  created_at: string;
  case_id: string | null;
  viewer_id: string;
  tenant_id: string;
  viewer: {
    id: string;
    company_name: string;
    full_name: string;
    email: string;
    phone: string;
    position: string;
  } | null;
  construction_case: {
    id: string;
    name: string;
    category: string | null;
  } | null;
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

const fetchInquiries = async (): Promise<Inquiry[]> => {
  const supabase = createClient();
  
  // 効率的なクエリ - JOINを使用してN+1問題を解決
  const { data: inquiriesWithRelations, error } = await supabase
    .from('inquiries')
    .select(`
      *,
      viewers!inquiries_viewer_id_fkey (
        id,
        company_name,
        full_name,
        email,
        phone,
        position
      ),
      construction_cases!inquiries_case_id_fkey (
        id,
        name,
        category
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  // データを効率的に変換
  const inquiries: Inquiry[] = (inquiriesWithRelations || []).map((inquiry) => ({
    id: inquiry.id,
    subject: inquiry.subject,
    message: inquiry.message,
    status: inquiry.status as 'new' | 'read' | 'replied',
    created_at: inquiry.created_at,
    case_id: inquiry.case_id,
    viewer_id: inquiry.viewer_id,
    tenant_id: inquiry.tenant_id,
    viewer: inquiry.viewers || null,
    construction_case: inquiry.construction_cases || null
  }));

  return inquiries;
};

// メモ化された問い合わせカードコンポーネント
const InquiryCard = memo(({ inquiry, onStatusUpdate }: { 
  inquiry: Inquiry; 
  onStatusUpdate: (id: string, status: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            新規
          </Badge>
        );
      case 'read':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            確認済み
          </Badge>
        );
      case 'replied':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            返信済み
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await onStatusUpdate(inquiry.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const truncatedMessage = inquiry.message.length > 150 
    ? inquiry.message.substring(0, 150) + '...'
    : inquiry.message;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* ヘッダー情報 */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold text-gray-900">{inquiry.subject}</h3>
                {getStatusBadge(inquiry.status)}
              </div>
              <p className="text-xs text-gray-500">
                {getFormattedDate(inquiry.created_at)}
              </p>
            </div>
            
            <div className="flex space-x-2">
              {inquiry.status === 'new' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusUpdate('read')}
                  disabled={isUpdating}
                  className="text-xs"
                >
                  確認済みにする
                </Button>
              )}
              {inquiry.status === 'read' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusUpdate('replied')}
                  disabled={isUpdating}
                  className="text-xs"
                >
                  返信済みにする
                </Button>
              )}
            </div>
          </div>

          {/* 顧客情報 */}
          {inquiry.viewer && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{inquiry.viewer.company_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {inquiry.viewer.full_name} ({inquiry.viewer.position})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <a 
                    href={`mailto:${inquiry.viewer.email}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {inquiry.viewer.email}
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <a 
                    href={`tel:${inquiry.viewer.phone}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {inquiry.viewer.phone}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* 事例情報 */}
          {inquiry.construction_case && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-blue-700">
                関連事例: {inquiry.construction_case.name}
                {inquiry.construction_case.category && (
                  <span className="ml-2 text-xs text-blue-600">
                    ({inquiry.construction_case.category})
                  </span>
                )}
              </span>
            </div>
          )}

          {/* メッセージ */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">問い合わせ内容</h4>
              {inquiry.message.length > 150 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {isExpanded ? '折りたたむ' : '全文表示'}
                </Button>
              )}
            </div>
            <div className="text-gray-700 bg-white border rounded-lg p-3 whitespace-pre-wrap">
              {isExpanded ? inquiry.message : truncatedMessage}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

InquiryCard.displayName = 'InquiryCard';

export default function InquiriesPage() {
  const { data: inquiries, loading, error, refetch } = usePageData({
    fetchFn: fetchInquiries,
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
    data: inquiries || [],
    searchFields: ['subject', 'message'],
    filterFunctions: {
      status: (item: Inquiry, value: string) => {
        if (value === 'all') return true;
        return item.status === value;
      },
      hasCase: (item: Inquiry, value: string) => {
        if (value === 'all') return true;
        if (value === 'with_case') return !!item.case_id;
        if (value === 'without_case') return !item.case_id;
        return true;
      },
      period: (item: Inquiry, value: string) => {
        if (value === 'all') return true;
        const now = new Date();
        const inquiryDate = new Date(item.created_at);
        
        switch (value) {
          case 'today':
            return inquiryDate.toDateString() === now.toDateString();
          case 'week':
            return inquiryDate.getTime() > now.getTime() - (7 * 24 * 60 * 60 * 1000);
          case 'month':
            return inquiryDate.getTime() > now.getTime() - (30 * 24 * 60 * 60 * 1000);
          default:
            return true;
        }
      }
    },
    sortFunctions: {
      newest: (a: Inquiry, b: Inquiry) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      oldest: (a: Inquiry, b: Inquiry) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      status: (a: Inquiry, b: Inquiry) => a.status.localeCompare(b.status),
      company: (a: Inquiry, b: Inquiry) => {
        const aCompany = a.viewer?.company_name || '';
        const bCompany = b.viewer?.company_name || '';
        return aCompany.localeCompare(bCompany);
      }
    }
  });

  // ステータス更新関数
  const handleStatusUpdate = async (inquiryId: string, newStatus: string) => {
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status: newStatus })
        .eq('id', inquiryId);

      if (error) throw error;

      // データを再取得
      await refetch();
    } catch (error) {
      console.error('ステータス更新エラー:', error);
      throw error;
    }
  };

  // フィルターオプションの定義
  const filterOptions = [
    {
      label: 'ステータス',
      value: filters.status || 'all',
      options: [
        { value: 'all', label: 'すべて' },
        { value: 'new', label: '新規' },
        { value: 'read', label: '確認済み' },
        { value: 'replied', label: '返信済み' }
      ],
      onChange: (value: string) => setFilter('status', value)
    },
    {
      label: '事例',
      value: filters.hasCase || 'all',
      options: [
        { value: 'all', label: 'すべて' },
        { value: 'with_case', label: '事例あり' },
        { value: 'without_case', label: '事例なし' }
      ],
      onChange: (value: string) => setFilter('hasCase', value)
    },
    {
      label: '期間',
      value: filters.period || 'all',
      options: [
        { value: 'all', label: 'すべて' },
        { value: 'today', label: '今日' },
        { value: 'week', label: '今週' },
        { value: 'month', label: '今月' }
      ],
      onChange: (value: string) => setFilter('period', value)
    },
    {
      label: '並び順',
      value: sortBy || 'newest',
      options: [
        { value: 'newest', label: '新しい順' },
        { value: 'oldest', label: '古い順' },
        { value: 'status', label: 'ステータス順' },
        { value: 'company', label: '会社名順' }
      ],
      onChange: setSortBy
    }
  ];

  // 統計情報をメモ化
  const stats = useMemo(() => {
    if (!inquiries) return { total: 0, new: 0, read: 0, replied: 0, today: 0 };
    
    const now = new Date();
    const today = inquiries.filter(i => 
      new Date(i.created_at).toDateString() === now.toDateString()
    ).length;
    
    const newCount = inquiries.filter(i => i.status === 'new').length;
    const readCount = inquiries.filter(i => i.status === 'read').length;
    const repliedCount = inquiries.filter(i => i.status === 'replied').length;
    
    return {
      total: inquiries.length,
      new: newCount,
      read: readCount,
      replied: repliedCount,
      today
    };
  }, [inquiries]);

  if (loading) {
    return <LoadingState message="問い合わせデータを読み込み中..." />;
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
          title="問い合わせ管理"
          subtitle="お客様からの問い合わせを効率的に管理"
          icon={MessageSquare}
        />

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">総問い合わせ</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">新規</p>
                  <p className="text-2xl font-bold text-red-600">{stats.new}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">確認済み</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.read}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">返信済み</p>
                  <p className="text-2xl font-bold text-green-600">{stats.replied}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">今日の問い合わせ</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.today}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* フィルターバー */}
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filterOptions}
          searchPlaceholder="件名や内容で検索..."
        />

        {/* 問い合わせ一覧 */}
        <div className="space-y-4">
          {filteredData.length > 0 ? (
            filteredData.map((inquiry) => (
              <InquiryCard 
                key={inquiry.id} 
                inquiry={inquiry} 
                onStatusUpdate={handleStatusUpdate}
              />
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || Object.values(filters).some(f => f !== 'all') 
                    ? 'フィルター条件に一致する問い合わせが見つかりません' 
                    : 'まだ問い合わせがありません'
                  }
                </h3>
                <p className="text-gray-500">
                  {searchTerm || Object.values(filters).some(f => f !== 'all')
                    ? '検索条件やフィルターを変更してみてください'
                    : 'お客様から問い合わせがあると、ここに表示されます'
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
