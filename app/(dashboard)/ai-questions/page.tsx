'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar } from '@/components/ui/filter-bar';
import { usePageData } from '@/hooks/usePageData';
import { useState, useMemo } from 'react';
import { Bot, Calendar, Building2, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface AiQuestion {
  id: string;
  question: string;
  answer: string;
  model_used: string;
  case_id: string | null;
  tenant_id: string;
  created_at: string;
  construction_cases?: {
    title: string;
  } | null;
}

const fetchAiQuestions = async (): Promise<AiQuestion[]> => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('ai_questions')
    .select(`
      id,
      question,
      answer,
      model_used,
      case_id,
      tenant_id,
      created_at
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  
  // 事例情報を別途取得
  const questionsWithCases = await Promise.all((data || []).map(async (question) => {
    if (question.case_id) {
      const { data: caseData } = await supabase
        .from('construction_cases')
        .select('title')
        .eq('id', question.case_id)
        .single();
      
      return {
        ...question,
        construction_cases: caseData || null
      } as AiQuestion;
    }
    
    return {
      ...question,
      construction_cases: null
    } as AiQuestion;
  }));

  return questionsWithCases;
};

const useFilters = (data: AiQuestion[] | undefined) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    model: 'all',
    company: 'all'
  });
  const [sortBy, setSortBy] = useState('newest');

  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter(item => {
      // 検索フィルター
      const searchMatch = !searchTerm || 
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase());

      // モデルフィルター
      const modelMatch = filters.model === 'all' || item.model_used === filters.model;

      // 会社フィルター
      const companyMatch = filters.company === 'all' || 
        (item.construction_cases?.title || '').includes(filters.company);

      return searchMatch && modelMatch && companyMatch;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'company':
          const aTitle = a.construction_cases?.title || '';
          const bTitle = b.construction_cases?.title || '';
          return aTitle.localeCompare(bTitle);
        default:
          return 0;
      }
    });
  }, [data, searchTerm, filters, sortBy]);

  return {
    filteredData,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    sortBy,
    setSortBy
  };
};

export default function AiQuestionsPage() {
  const { data: questions, loading, error, refetch } = usePageData({
    fetchFn: fetchAiQuestions,
    initialData: []
  });

  const {
    filteredData,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    sortBy,
    setSortBy
  } = useFilters(questions || []);

  if (loading) {
    return <LoadingState message="AI質問データを読み込み中..." />;
  }

  if (error) {
    return <ErrorState message="AI質問データの読み込みに失敗しました" onRetry={refetch} />;
  }

  const uniqueModels = Array.from(new Set(questions?.map(q => q.model_used) || []));
  const uniqueCompanies = Array.from(new Set(
    questions?.map(q => q.construction_cases?.title).filter((title): title is string => Boolean(title)) || []
  ));

  const filterOptions = [
    {
      label: 'モデル',
      value: filters.model || 'all',
      options: [
        { value: 'all', label: 'すべて' },
        ...uniqueModels.map(model => ({ value: model, label: model }))
      ],
      onChange: (value: string) => setFilters({ ...filters, model: value })
    },
    {
      label: '会社',
      value: filters.company || 'all',
      options: [
        { value: 'all', label: 'すべて' },
        ...uniqueCompanies.map(company => ({ value: company, label: company }))
      ],
      onChange: (value: string) => setFilters({ ...filters, company: value })
    },
    {
      label: '並び順',
      value: sortBy,
      options: [
        { value: 'newest', label: '新しい順' },
        { value: 'oldest', label: '古い順' },
        { value: 'company', label: '会社順' }
      ],
      onChange: setSortBy
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          title="AI質問分析"
          subtitle="閲覧者からのAI質問とその回答を分析"
          icon={Bot}
        />

        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="質問や回答を検索..."
          filters={filterOptions}
        />

        <div className="grid gap-6">
          {filteredData.length > 0 ? (
            filteredData.map((question) => (
              <Card key={question.id} className="bg-white shadow-sm border">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                        {question.question}
                      </CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Building2 className="h-4 w-4" />
                          <span>{question.construction_cases?.title}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDistanceToNow(new Date(question.created_at), { 
                              addSuffix: true, 
                              locale: ja 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-4">
                      {question.model_used}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">AI回答</h4>
                    <p className="text-gray-700 leading-relaxed">{question.answer}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-white shadow-sm border">
              <CardContent className="p-12 text-center">
                <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm || Object.values(filters).some(f => f && f !== 'all') 
                    ? '検索条件に一致するAI質問が見つかりません' 
                    : 'AI質問がまだありません'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
