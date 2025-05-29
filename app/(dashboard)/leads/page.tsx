'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Filter,
  Mail,
  Phone,
  Building2,
  Calendar,
  Eye,
  Star,
  TrendingUp,
  Clock,
  ExternalLink,
  AlertCircle,
  Bot
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow, format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Lead {
  id: string;
  company_name: string;
  full_name: string;
  position: string;
  email: string;
  phone: string;
  created_at: string;
  last_accessed_at: string;
  access_count: number;
  ai_question_count: number;
  interest_level: 'high' | 'medium' | 'low';
  last_viewed_case: string;
  last_ai_question: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'company' | 'access_count' | 'interest'>('recent');

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    filterAndSortLeads();
  }, [leads, searchTerm, filterLevel, sortBy]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      // 閲覧者データとアクセスログ、AI質問を取得
      const { data: viewers, error: viewersError } = await supabase
        .from('viewers')
        .select(`
          id,
          company_name,
          full_name,
          position,
          email,
          phone,
          created_at
        `);

      if (viewersError) throw viewersError;

      // 各閲覧者のアクセス統計とAI質問統計を取得
      const leadsWithStats = await Promise.all(
        (viewers || []).map(async (viewer) => {
          // アクセスログの統計
          const { data: accessLogs } = await supabase
            .from('access_logs')
            .select('accessed_at, construction_cases(name)')
            .eq('viewer_id', viewer.id)
            .order('accessed_at', { ascending: false });

          // AI質問の統計
          const { data: aiQuestions } = await supabase
            .from('ai_questions')
            .select('question, created_at')
            .eq('viewer_id', viewer.id)
            .order('created_at', { ascending: false });

          const accessCount = accessLogs?.length || 0;
          const aiQuestionCount = aiQuestions?.length || 0;
          
          // 関心度の計算
          let interestLevel: 'high' | 'medium' | 'low' = 'low';
          if (accessCount >= 5 || aiQuestionCount >= 3) {
            interestLevel = 'high';
          } else if (accessCount >= 2 || aiQuestionCount >= 1) {
            interestLevel = 'medium';
          }

          return {
            ...viewer,
            access_count: accessCount,
            ai_question_count: aiQuestionCount,
            interest_level: interestLevel,
            last_accessed_at: accessLogs?.[0]?.accessed_at || viewer.created_at,
            last_viewed_case: accessLogs?.[0]?.construction_cases?.name || '',
            last_ai_question: aiQuestions?.[0]?.question || ''
          };
        })
      );

      setLeads(leadsWithStats);
    } catch (error) {
      console.error('Leads fetch error:', error);
      setError('リードデータの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortLeads = () => {
    let filtered = leads;

    // 検索フィルター
    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 関心度フィルター
    if (filterLevel !== 'all') {
      filtered = filtered.filter(lead => lead.interest_level === filterLevel);
    }

    // ソート
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'company':
          return a.company_name.localeCompare(b.company_name);
        case 'access_count':
          return b.access_count - a.access_count;
        case 'interest':
          const interestOrder = { high: 3, medium: 2, low: 1 };
          return interestOrder[b.interest_level] - interestOrder[a.interest_level];
        case 'recent':
        default:
          return new Date(b.last_accessed_at).getTime() - new Date(a.last_accessed_at).getTime();
      }
    });

    setFilteredLeads(filtered);
  };

  const getInterestBadge = (level: 'high' | 'medium' | 'low') => {
    const config = {
      high: { label: '高関心', className: 'bg-red-100 text-red-800 border-red-200' },
      medium: { label: '中関心', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      low: { label: '低関心', className: 'bg-gray-100 text-gray-800 border-gray-200' }
    };
    return config[level];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">リードデータを読み込み中...</span>
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
                onClick={fetchLeads} 
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
                <Users className="h-6 w-6 mr-2 text-blue-600" />
                リード管理
              </h1>
              <p className="text-gray-600 mt-1">見込み客の詳細情報と営業活動の管理</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">総リード数</p>
              <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
            </div>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white shadow-sm border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">高関心リード</p>
                  <p className="text-2xl font-bold text-red-600">
                    {leads.filter(l => l.interest_level === 'high').length}
                  </p>
                </div>
                <Star className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">中関心リード</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {leads.filter(l => l.interest_level === 'medium').length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">低関心リード</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {leads.filter(l => l.interest_level === 'low').length}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">AI質問総数</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {leads.reduce((sum, l) => sum + l.ai_question_count, 0)}
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
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="会社名、担当者名、メールアドレスで検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">すべての関心度</option>
                  <option value="high">高関心</option>
                  <option value="medium">中関心</option>
                  <option value="low">低関心</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="recent">最新アクセス順</option>
                  <option value="interest">関心度順</option>
                  <option value="access_count">アクセス数順</option>
                  <option value="company">会社名順</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* リード一覧 */}
        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              リード一覧 ({filteredLeads.length}件)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => {
                  const interestBadge = getInterestBadge(lead.interest_level);
                  return (
                    <div key={lead.id} className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <Building2 className="h-5 w-5 text-gray-400" />
                            <h3 className="text-lg font-semibold text-gray-900">{lead.company_name}</h3>
                            <Badge className={interestBadge.className}>
                              {interestBadge.label}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">担当者情報</p>
                              <p className="font-medium text-gray-900">{lead.full_name}</p>
                              <p className="text-sm text-gray-600">{lead.position}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">連絡先</p>
                              <div className="flex items-center space-x-4">
                                <a 
                                  href={`mailto:${lead.email}`}
                                  className="flex items-center text-blue-600 hover:text-blue-800"
                                >
                                  <Mail className="h-4 w-4 mr-1" />
                                  <span className="text-sm">{lead.email}</span>
                                </a>
                                {lead.phone && (
                                  <a 
                                    href={`tel:${lead.phone}`}
                                    className="flex items-center text-green-600 hover:text-green-800"
                                  >
                                    <Phone className="h-4 w-4 mr-1" />
                                    <span className="text-sm">{lead.phone}</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">アクセス統計</p>
                              <div className="flex items-center space-x-2">
                                <Eye className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">{lead.access_count} 回</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">AI質問数</p>
                              <div className="flex items-center space-x-2">
                                <Bot className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-medium">{lead.ai_question_count} 件</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">最終アクセス</p>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-600" />
                                <span className="text-sm">
                                  {formatDistanceToNow(new Date(lead.last_accessed_at), { 
                                    addSuffix: true, 
                                    locale: ja 
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>

                          {lead.last_viewed_case && (
                            <div className="mb-2">
                              <p className="text-sm text-gray-600">最後に閲覧した事例</p>
                              <p className="text-sm font-medium text-gray-900">{lead.last_viewed_case}</p>
                            </div>
                          )}

                          {lead.last_ai_question && (
                            <div>
                              <p className="text-sm text-gray-600">最新のAI質問</p>
                              <p className="text-sm text-gray-900 line-clamp-2">{lead.last_ai_question}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm || filterLevel !== 'all' 
                      ? '検索条件に一致するリードが見つかりません' 
                      : 'リードがまだありません'
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
