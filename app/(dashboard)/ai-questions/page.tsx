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
  Bot, 
  Building2, 
  Calendar, 
  ChevronDown, 
  ChevronUp,
  User,
  FileText
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface AiQuestion {
  id: string;
  question: string;
  answer: string;
  model_used: string;
  created_at: string;
  case_id: string | null;
  tenant_id: string;
  viewer: {
    id: string;
    company_name: string;
    full_name: string;
  } | null;
  construction_case: {
    id: string;
    name: string;
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

const fetchAiQuestions = async (): Promise<AiQuestion[]> => {
  const supabase = createClient();
  
  // 効率的なクエリ - JOINを使用してN+1問題を解決
  const { data: questionsWithRelations, error } = await supabase
    .from('ai_questions')
    .select(`
      *,
      viewers!ai_questions_viewer_id_fkey (
        id,
        company_name,
        full_name
      ),
      construction_cases!ai_questions_case_id_fkey (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  // データを効率的に変換
  const aiQuestions: AiQuestion[] = (questionsWithRelations || []).map((question) => ({
    ...question,
    viewer: question.viewers || null,
    construction_case: question.construction_cases || null
  }));

  return aiQuestions;
};

// メモ化されたAI質問カードコンポーネント
const AiQuestionCard = memo(({ question }: { question: AiQuestion }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getModelBadgeColor = (model: string) => {
    switch (model.toLowerCase()) {
      case 'gpt-4':
        return 'bg-purple-100 text-purple-800';
      case 'gpt-3.5-turbo':
        return 'bg-blue-100 text-blue-800';
      case 'claude':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const truncatedAnswer = question.answer.length > 200 
    ? question.answer.substring(0, 200) + '...'
    : question.answer;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* ヘッダー情報 */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Bot className="h-5 w-5 text-blue-500" />
              <div>
                <Badge className={getModelBadgeColor(question.model_used)}>
                  {question.model_used}
                </Badge>
                <p className="text-xs text-gray-500 mt-1">
                  {getFormattedDate(question.created_at)}
                </p>
              </div>
            </div>
            
            {question.viewer && (
              <div className="text-right">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Building2 className="h-4 w-4" />
                  <span>{question.viewer.company_name}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                  <User className="h-3 w-3" />
                  <span>{question.viewer.full_name}</span>
                </div>
              </div>
            )}
          </div>

          {/* 事例情報 */}
          {question.construction_case && (
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                事例: {question.construction_case.name}
              </span>
            </div>
          )}

          {/* 質問 */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">質問</h3>
            <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
              {question.question}
            </p>
          </div>

          {/* 回答 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">回答</h3>
              {question.answer.length > 200 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      折りたたむ
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      全文表示
                    </>
                  )}
                </Button>
              )}
            </div>
            <div className="text-gray-700 bg-green-50 p-3 rounded-lg whitespace-pre-wrap">
              {isExpanded ? question.answer : truncatedAnswer}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

AiQuestionCard.displayName = 'AiQuestionCard';

export default function AiQuestionsPage() {
  const { data: aiQuestions, loading, error, refetch } = usePageData({
    fetchFn: fetchAiQuestions,
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
    data: aiQuestions || [],
    searchFields: ['question', 'answer'],
    filterFunctions: {
      model: (item: AiQuestion, value: string) => {
        if (value === 'all') return true;
        return item.model_used.toLowerCase() === value.toLowerCase();
      },
      hasCase: (item: AiQuestion, value: string) => {
        if (value === 'all') return true;
        if (value === 'with_case') return !!item.case_id;
        if (value === 'without_case') return !item.case_id;
        return true;
      },
      period: (item: AiQuestion, value: string) => {
        if (value === 'all') return true;
        const now = new Date();
        const questionDate = new Date(item.created_at);
        
        switch (value) {
          case 'today':
            return questionDate.toDateString() === now.toDateString();
          case 'week':
            return questionDate.getTime() > now.getTime() - (7 * 24 * 60 * 60 * 1000);
          case 'month':
            return questionDate.getTime() > now.getTime() - (30 * 24 * 60 * 60 * 1000);
          default:
            return true;
        }
      }
    },
    sortFunctions: {
      newest: (a: AiQuestion, b: AiQuestion) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      oldest: (a: AiQuestion, b: AiQuestion) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      model: (a: AiQuestion, b: AiQuestion) => a.model_used.localeCompare(b.model_used),
      company: (a: AiQuestion, b: AiQuestion) => {
        const aCompany = a.viewer?.company_name || '';
        const bCompany = b.viewer?.company_name || '';
        return aCompany.localeCompare(bCompany);
      }
    }
  });

  // フィルターオプションの定義
  const filterOptions = [
    {
      label: 'モデル',
      value: filters.model || 'all',
      options: [
        { value: 'all', label: 'すべて' },
        { value: 'gpt-4', label: 'GPT-4' },
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
        { value: 'claude', label: 'Claude' }
      ],
      onChange: (value: string) => setFilter('model', value)
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
        { value: 'model', label: 'モデル順' },
        { value: 'company', label: '会社名順' }
      ],
      onChange: setSortBy
    }
  ];

  // 統計情報をメモ化
  const stats = useMemo(() => {
    if (!aiQuestions) return { total: 0, today: 0, thisWeek: 0, uniqueCompanies: 0 };
    
    const now = new Date();
    const today = aiQuestions.filter(q => 
      new Date(q.created_at).toDateString() === now.toDateString()
    ).length;
    
    const thisWeek = aiQuestions.filter(q => 
      new Date(q.created_at).getTime() > now.getTime() - (7 * 24 * 60 * 60 * 1000)
    ).length;
    
    const uniqueCompanies = new Set(
      aiQuestions
        .filter(q => q.viewer?.company_name)
        .map(q => q.viewer!.company_name)
    ).size;
    
    return {
      total: aiQuestions.length,
      today,
      thisWeek,
      uniqueCompanies
    };
  }, [aiQuestions]);

  if (loading) {
    return <LoadingState message="AI質問データを読み込み中..." />;
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
          title="AI質問履歴"
          subtitle="AIとの対話履歴を管理・分析"
          icon={MessageSquare}
        />

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">総質問数</p>
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
                  <p className="text-sm font-medium text-gray-600">今日の質問</p>
                  <p className="text-2xl font-bold text-green-600">{stats.today}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">今週の質問</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.thisWeek}</p>
                </div>
                <Bot className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">アクティブ企業</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.uniqueCompanies}</p>
                </div>
                <Building2 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* フィルターバー */}
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filterOptions}
          searchPlaceholder="質問内容や回答で検索..."
        />

        {/* AI質問一覧 */}
        <div className="space-y-4">
          {filteredData.length > 0 ? (
            filteredData.map((question) => (
              <AiQuestionCard key={question.id} question={question} />
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || Object.values(filters).some(f => f !== 'all') 
                    ? 'フィルター条件に一致するAI質問が見つかりません' 
                    : 'まだAI質問がありません'
                  }
                </h3>
                <p className="text-gray-500">
                  {searchTerm || Object.values(filters).some(f => f !== 'all')
                    ? '検索条件やフィルターを変更してみてください'
                    : 'ユーザーがAI機能を使用すると、ここに質問履歴が表示されます'
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
