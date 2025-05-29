'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bot, 
  Search, 
  Filter,
  Calendar,
  User,
  Building2,
  MessageSquare,
  Clock,
  TrendingUp,
  Eye,
  Download,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileText
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow, format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface AiQuestion {
  id: string;
  question: string;
  answer: string;
  model_used: string;
  created_at: string;
  viewer_id: string;
  case_id: string | null;
  tenant_id: string;
  viewers: {
    full_name: string;
    company_name: string;
    email: string;
  };
  construction_cases: {
    name: string;
    category: string | null;
  } | null;
}

export default function AiQuestionsPage() {
  const [questions, setQuestions] = useState<AiQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<AiQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModel, setFilterModel] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'company' | 'model'>('recent');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    filterAndSortQuestions();
  }, [questions, searchTerm, filterModel, filterPeriod, sortBy]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const { data, error } = await supabase
        .from('ai_questions')
        .select(`
          id,
          question,
          answer,
          model_used,
          created_at,
          viewer_id,
          case_id,
          tenant_id,
          viewers(full_name, company_name, email),
          construction_cases(name, category)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setQuestions(data || []);
    } catch (error) {
      console.error('AI Questions fetch error:', error);
      setError('AI質問データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortQuestions = () => {
    let filtered = questions;

    // 検索フィルター
    if (searchTerm) {
      filtered = filtered.filter(q =>
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.viewers.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.viewers.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // モデルフィルター
    if (filterModel !== 'all') {
      filtered = filtered.filter(q => q.model_used === filterModel);
    }

    // 期間フィルター
    if (filterPeriod !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filterPeriod) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(q => new Date(q.created_at) >= filterDate);
    }

    // ソート
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'company':
          return a.viewers.company_name.localeCompare(b.viewers.company_name);
        case 'model':
          return a.model_used.localeCompare(b.model_used);
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredQuestions(filtered);
  };

  const toggleExpanded = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const getModelBadge = (model: string) => {
    const config: Record<string, { label: string; className: string }> = {
      'gpt-4o-mini': { label: 'GPT-4o Mini', className: 'bg-green-100 text-green-800 border-green-200' },
      'gpt-4o': { label: 'GPT-4o', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      'gpt-4': { label: 'GPT-4', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      'gpt-3.5-turbo': { label: 'GPT-3.5', className: 'bg-gray-100 text-gray-800 border-gray-200' }
    };
    return config[model] || { label: model, className: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  const uniqueModels = Array.from(new Set(questions.map(q => q.model_used)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">AI質問データを読み込み中...</span>
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
                onClick={fetchQuestions} 
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
                <Bot className="h-6 w-6 mr-2 text-purple-600" />
                AI質問履歴
              </h1>
              <p className="text-gray-600 mt-1">顧客からのAI質問と回答の詳細管理</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">総質問数</p>
              <p className="text-2xl font-bold text-gray-900">{questions.length}</p>
            </div>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white shadow-sm border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">今日の質問</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {questions.filter(q => {
                      const today = new Date();
                      const questionDate = new Date(q.created_at);
                      return questionDate.toDateString() === today.toDateString();
                    }).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">今週の質問</p>
                  <p className="text-2xl font-bold text-green-600">
                    {questions.filter(q => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(q.created_at) >= weekAgo;
                    }).length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">アクティブ企業</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {new Set(questions.map(q => q.viewers.company_name)).size}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">使用モデル</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {uniqueModels.length}
                  </p>
                </div>
                <Bot className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* フィルターとソート */}
        <Card className="bg-white shadow-sm border">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="質問内容、回答、会社名、担当者名で検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterModel}
                  onChange={(e) => setFilterModel(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">すべてのモデル</option>
                  {uniqueModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
                <select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">すべての期間</option>
                  <option value="today">今日</option>
                  <option value="week">今週</option>
                  <option value="month">今月</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="recent">最新順</option>
                  <option value="company">会社名順</option>
                  <option value="model">モデル順</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 質問一覧 */}
        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              質問一覧 ({filteredQuestions.length}件)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((question) => {
                  const modelBadge = getModelBadge(question.model_used);
                  const isExpanded = expandedQuestions.has(question.id);
                  
                  return (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{question.viewers.company_name}</span>
                            <span className="text-gray-600">•</span>
                            <span className="text-gray-600">{question.viewers.full_name}</span>
                            <Badge className={modelBadge.className}>
                              {modelBadge.label}
                            </Badge>
                          </div>
                          
                          {question.construction_cases && (
                            <div className="flex items-center space-x-2 mb-3">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-blue-600">関連事例: {question.construction_cases.name}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {format(new Date(question.created_at), 'M月d日 HH:mm', { locale: ja })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(question.created_at), { 
                              addSuffix: true, 
                              locale: ja 
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <MessageSquare className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-900">質問</span>
                          </div>
                          <p className="text-gray-900 bg-blue-50 p-3 rounded-lg">
                            {question.question}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Bot className="h-4 w-4 text-purple-600" />
                              <span className="text-sm font-medium text-gray-900">AI回答</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(question.id)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-4 w-4 mr-1" />
                                  折りたたむ
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-1" />
                                  展開する
                                </>
                              )}
                            </Button>
                          </div>
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <p className={`text-gray-900 ${!isExpanded ? 'line-clamp-3' : ''}`}>
                              {question.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm || filterModel !== 'all' || filterPeriod !== 'all'
                      ? '検索条件に一致する質問が見つかりません'
                      : 'AI質問がまだありません'
                    }
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
