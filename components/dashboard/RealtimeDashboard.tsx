'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent } from '@/components/ui/card';
import { AiQuestionsTable } from './AiQuestionsTable';
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
  case_id: string;
  question: string;
  answer: string;
  model: string;
  created_at: string;
  construction_cases: { name: string } | null;
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
  const supabase = createClientComponentClient();

  useEffect(() => {
    // 統計情報を定期的に更新
    const statsInterval = setInterval(async () => {
      try {
        // 事例数
        const { data: casesData } = await supabase
          .from('construction_cases')
          .select('id, is_published')
          .eq('tenant_id', tenantId);
        
        // 閲覧数
        const { data: viewersData } = await supabase
          .from('viewers')
          .select('id')
          .eq('tenant_id', tenantId);
        
        // 問い合わせ数
        const { data: inquiriesData } = await supabase
          .from('inquiries')
          .select('id')
          .eq('tenant_id', tenantId);
        
        // AI質問数
        const { data: aiQuestionsData } = await supabase
          .from('ai_questions')
          .select('id')
          .eq('tenant_id', tenantId);
        
        setStats({
          totalCases: casesData?.length || 0,
          publishedCases: casesData?.filter((c: any) => c.is_published)?.length || 0,
          totalViews: viewersData?.length || 0,
          totalInquiries: inquiriesData?.length || 0,
          totalAiQuestions: aiQuestionsData?.length || 0,
        });
      } catch (error) {
        console.error('統計情報の更新に失敗しました:', error);
      }
    }, 30000); // 30秒ごとに更新

    // AI質問のリアルタイム更新
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
        async (payload) => {
          // 新しいAI質問が追加されたら、最新のAI質問リストを取得
          const { data } = await supabase
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
          
          if (data) {
            // 型変換を行い、model_usedをmodelにマッピング
            const formattedData = data.map((item: any) => ({
              id: item.id,
              case_id: item.case_id,
              question: item.question,
              answer: item.answer,
              model: item.model_used,
              created_at: item.created_at,
              construction_cases: item.construction_cases
            }));
            
            setAiQuestions(formattedData);
            
            // 統計情報も更新
            setStats(prev => ({
              ...prev,
              totalAiQuestions: prev.totalAiQuestions + 1
            }));
          }
        }
      )
      .subscribe();
    
    // クリーンアップ関数
    return () => {
      clearInterval(statsInterval);
      supabase.removeChannel(aiQuestionsSubscription);
    };
  }, [supabase, tenantId]);

  const statCards = [
    {
      title: '総事例数',
      value: stats.totalCases,
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      description: '登録済み施工事例'
    },
    {
      title: '公開事例数',
      value: stats.publishedCases,
      icon: Globe,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100',
      description: '公開中の事例'
    },
    {
      title: '総閲覧数',
      value: stats.totalViews,
      icon: Eye,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      description: 'ページビュー数'
    },
    {
      title: '問い合わせ数',
      value: stats.totalInquiries,
      icon: MessageSquare,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100',
      description: '受信した問い合わせ'
    },
    {
      title: 'AI質問数',
      value: stats.totalAiQuestions,
      icon: Bot,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'from-indigo-50 to-indigo-100',
      description: 'AI による質問回答'
    }
  ];

  return (
    <div className="space-y-8">
      {/* 統計カード */}
      <div>
        <div className="flex items-center mb-6">
          <TrendingUp className="w-6 h-6 text-gray-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">統計情報</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {statCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={`absolute inset-0 bg-gradient-to-br ${card.bgColor} opacity-50`} />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {card.value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">
                      {card.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {card.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      
      {/* AI質問履歴 */}
      <div>
        <div className="flex items-center mb-6">
          <Zap className="w-6 h-6 text-gray-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">最近のAI質問</h2>
        </div>
        <AiQuestionsTable aiQuestions={aiQuestions} />
      </div>
    </div>
  );
}
