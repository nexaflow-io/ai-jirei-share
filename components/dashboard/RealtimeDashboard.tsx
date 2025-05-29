'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent } from '@/components/ui/card';
import { AiQuestionsTable } from './AiQuestionsTable';
import { ViewersTable } from './ViewersTable';
import { 
  FileText, 
  Eye, 
  MessageSquare, 
  Bot,
  Globe,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';

interface Stats {
  totalCases: number;
  publishedCases: number;
  totalViews: number;
  totalInquiries: number;
  totalAiQuestions: number;
}

interface AiQuestion {
  id: string;
  case_id: string | null;
  question: string;
  answer: string;
  model_used: string;
  created_at: string;
  construction_cases: { name: string } | null;
}

interface Viewer {
  id: string;
  company_name: string;
  position: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  construction_cases: { name: string } | null;
  access_logs: { accessed_at: string }[];
  ai_questions: { question: string; created_at: string }[];
}

interface RealtimeDashboardProps {
  initialStats: Stats;
  initialAiQuestions: AiQuestion[];
  tenantId: string;
}

export function RealtimeDashboard({ 
  initialStats, 
  initialAiQuestions, 
  tenantId 
}: RealtimeDashboardProps) {
  const [stats, setStats] = useState<Stats>(initialStats);
  const [aiQuestions, setAiQuestions] = useState<AiQuestion[]>(initialAiQuestions);
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const supabase = createClientComponentClient();

  // デバウンス用のタイマー
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // 閲覧者データを取得する関数（メモ化）
  const fetchViewers = useCallback(async () => {
    if (isLoading) return; // 既にロード中の場合はスキップ
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/dashboard/viewers', {
        cache: 'no-store', // キャッシュを無効化
      });
      
      if (response.ok) {
        const data = await response.json();
        setViewers(data.viewers || []);
        setLastUpdate(new Date());
      } else {
        console.error('閲覧者データの取得に失敗:', response.status);
      }
    } catch (error) {
      console.error('閲覧者データの取得に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // 統計情報を更新する関数（メモ化・最適化）
  const updateStats = useCallback(async () => {
    if (isLoading) return; // 既にロード中の場合はスキップ
    
    try {
      setIsLoading(true);
      
      // 並列でクエリを実行して高速化
      const [casesResult, viewersResult, inquiriesResult, aiQuestionsResult] = await Promise.all([
        supabase
          .from('construction_cases')
          .select('id, is_published')
          .eq('tenant_id', tenantId),
        supabase
          .from('viewers')
          .select('id')
          .eq('tenant_id', tenantId),
        supabase
          .from('inquiries')
          .select('id')
          .eq('tenant_id', tenantId),
        supabase
          .from('ai_questions')
          .select('id')
          .eq('tenant_id', tenantId)
      ]);

      // エラーチェック
      if (casesResult.error) throw casesResult.error;
      if (viewersResult.error) throw viewersResult.error;
      if (inquiriesResult.error) throw inquiriesResult.error;
      if (aiQuestionsResult.error) throw aiQuestionsResult.error;

      const newStats = {
        totalCases: casesResult.data?.length || 0,
        publishedCases: casesResult.data?.filter((c: any) => c.is_published)?.length || 0,
        totalViews: viewersResult.data?.length || 0,
        totalInquiries: inquiriesResult.data?.length || 0,
        totalAiQuestions: aiQuestionsResult.data?.length || 0,
      };

      setStats(newStats);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('統計情報の更新に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, tenantId, isLoading]);

  // AI質問データを更新する関数（メモ化）
  const updateAiQuestions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ai_questions')
        .select(`
          id,
          case_id,
          question,
          answer,
          model_used,
          created_at,
          construction_cases (name)
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        const formattedQuestions = data.map((item: any) => ({
          id: item.id,
          case_id: item.case_id,
          question: item.question,
          answer: item.answer,
          model_used: item.model_used,
          created_at: item.created_at,
          construction_cases: item.construction_cases
        }));
        setAiQuestions(formattedQuestions);
      }
    } catch (error) {
      console.error('AI質問データの更新に失敗しました:', error);
    }
  }, [supabase, tenantId]);

  // デバウンス付きの更新関数
  const debouncedUpdate = useCallback((updateFn: () => Promise<void>) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    const timer = setTimeout(() => {
      updateFn();
    }, 500); // 500ms のデバウンス
    
    setDebounceTimer(timer);
  }, [debounceTimer]);

  useEffect(() => {
    // 初回データ取得
    fetchViewers();

    // 統計情報を5分ごとに更新（30秒から変更）
    const statsInterval = setInterval(() => {
      updateStats();
    }, 300000); // 5分 = 300,000ms

    // 閲覧者データを10分ごとに更新
    const viewersInterval = setInterval(() => {
      fetchViewers();
    }, 600000); // 10分 = 600,000ms

    // AI質問のリアルタイム更新（デバウンス付き）
    const aiQuestionsSubscription = supabase
      .channel('ai-questions-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_questions',
          filter: `tenant_id=eq.${tenantId}`
        },
        () => {
          // デバウンス付きでAI質問データを更新
          debouncedUpdate(updateAiQuestions);
          // 統計情報も軽量に更新
          debouncedUpdate(updateStats);
        }
      )
      .subscribe();

    // 閲覧者の変更をリアルタイムで監視（デバウンス付き）
    const viewersSubscription = supabase
      .channel('viewers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'viewers',
          filter: `tenant_id=eq.${tenantId}`
        },
        () => {
          // デバウンス付きで閲覧者データを更新
          debouncedUpdate(fetchViewers);
          // 統計情報も軽量に更新
          debouncedUpdate(updateStats);
        }
      )
      .subscribe();

    // クリーンアップ
    return () => {
      clearInterval(statsInterval);
      clearInterval(viewersInterval);
      aiQuestionsSubscription.unsubscribe();
      viewersSubscription.unsubscribe();
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [fetchViewers, updateStats, updateAiQuestions, debouncedUpdate, supabase, tenantId, debounceTimer]);

  // 統計カードのデータをメモ化
  const statsCards = useMemo(() => [
    {
      title: '事例数',
      value: stats.totalCases,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: `公開中: ${stats.publishedCases}件`
    },
    {
      title: '総閲覧数',
      value: stats.totalViews,
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'ユニーク閲覧者数'
    },
    {
      title: 'お問い合わせ',
      value: stats.totalInquiries,
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: '受信した問い合わせ'
    },
    {
      title: 'AI質問数',
      value: stats.totalAiQuestions,
      icon: Bot,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'AIへの質問回数'
    }
  ], [stats]);

  return (
    <div className="space-y-8">
      {/* ヘッダー情報 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <TrendingUp className="w-6 h-6 text-gray-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">統計情報</h2>
          {isLoading && (
            <div className="ml-3 flex items-center text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              更新中...
            </div>
          )}
        </div>
        <div className="text-sm text-gray-500">
          最終更新: {lastUpdate.toLocaleTimeString('ja-JP')}
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${card.bgColor} mb-4`}>
                  <IconComponent className={`w-6 h-6 ${card.color}`} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{card.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI質問履歴 */}
      <div>
        <div className="flex items-center mb-6">
          <Bot className="w-6 h-6 text-gray-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">AI質問履歴</h2>
          <span className="ml-2 text-sm text-gray-500">（最新10件）</span>
        </div>
        <AiQuestionsTable aiQuestions={aiQuestions} />
      </div>

      {/* 閲覧者一覧 */}
      <div>
        <div className="flex items-center mb-6">
          <Users className="w-6 h-6 text-gray-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">閲覧者一覧</h2>
          <span className="ml-2 text-sm text-gray-500">（関心度順）</span>
        </div>
        <ViewersTable viewers={viewers} />
      </div>
    </div>
  );
}
