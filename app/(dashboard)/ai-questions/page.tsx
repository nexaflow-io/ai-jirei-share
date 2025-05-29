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
  ChevronUp
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
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'case' | 'company'>('recent');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    filterAndSortQuestions();
  }, [questions, searchTerm, sortBy]);

  const fetchQuestions = async () => {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('ai_questions')
        .select(`
          *,
          viewers(full_name, company_name, email),
          construction_cases(name, category)
        `)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      setQuestions(data || []);
    } catch (error) {
      console.error('AI質問履歴取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortQuestions = () => {
    let filtered = questions.filter(question => 
      question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.viewers?.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.viewers?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (question.construction_cases?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ソート
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'case':
          return (a.construction_cases?.name || '').localeCompare(b.construction_cases?.name || '');
        case 'company':
          return (a.viewers?.company_name || '').localeCompare(b.viewers?.company_name || '');
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

  const getModelBadgeColor = (model: string) => {
    switch (model) {
      case 'gpt-4o-mini':
        return 'bg-blue-100 text-blue-800';
      case 'gpt-4':
        return 'bg-purple-100 text-purple-800';
      case 'gpt-3.5-turbo':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-900">AI質問履歴</h1>
          <p className="text-gray-600 mt-2">閲覧者からのAI質問とその回答を管理</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="px-3 py-1">
            <MessageSquare className="w-4 h-4 mr-1" />
            {filteredQuestions.length} 件
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            エクスポート
          </Button>
        </div>
      </div>

      {/* 検索・フィルター */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="質問内容、会社名、担当者名、事例名で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('recent')}
              >
                <Clock className="w-4 h-4 mr-1" />
                最新順
              </Button>
              <Button
                variant={sortBy === 'case' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('case')}
              >
                <Eye className="w-4 h-4 mr-1" />
                事例順
              </Button>
              <Button
                variant={sortBy === 'company' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('company')}
              >
                <Building2 className="w-4 h-4 mr-1" />
                会社順
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 質問一覧 */}
      <div className="space-y-4">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((question) => {
            const isExpanded = expandedQuestions.has(question.id);
            
            return (
              <Card key={question.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* ヘッダー情報 */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">{question.viewers?.full_name}</span>
                            <Badge variant="outline" className="text-xs">
                              <Building2 className="w-3 h-3 mr-1" />
                              {question.viewers?.company_name}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {format(new Date(question.created_at), 'yyyy/MM/dd HH:mm')}
                            </span>
                            <span className="flex items-center">
                              <Eye className="w-3 h-3 mr-1" />
                              {question.construction_cases?.name}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getModelBadgeColor(question.model_used)}>
                          {question.model_used}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(question.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* 質問内容 */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">質問</p>
                          <p className="text-gray-900">{question.question}</p>
                        </div>
                      </div>
                    </div>

                    {/* 回答内容（展開時のみ表示） */}
                    {isExpanded && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <Bot className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-blue-700 mb-1">AI回答</p>
                            <div className="text-gray-900 whitespace-pre-wrap">{question.answer}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* フッター情報 */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        {formatDistanceToNow(new Date(question.created_at), { 
                          addSuffix: true, 
                          locale: ja 
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        <span>{question.viewers?.email}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">AI質問履歴がありません</h3>
              <p className="text-gray-600">
                {searchTerm ? '検索条件に一致する質問が見つかりません' : 'まだAI質問が投稿されていません'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
