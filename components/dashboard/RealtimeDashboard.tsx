'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AiQuestionsTable } from './AiQuestionsTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from '@/types/supabase';

type Stats = {
  totalCases: number;
  publishedCases: number;
  totalViews: number;
  totalInquiries: number;
  totalAiQuestions: number;
};

type AiQuestion = {
  id: string;
  case_id: string;
  question: string;
  answer: string;
  created_at: string;
  construction_cases?: {
    name: string;
  };
};

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
  const supabase = createClientComponentClient<Database>();

  // リアルタイム更新のセットアップ
  useEffect(() => {
    // 5秒ごとに統計情報を更新
    const statsInterval = setInterval(async () => {
      // 事例数
      const { data: casesData } = await supabase
        .from('construction_cases')
        .select('id, is_published')
        .eq('tenant_id', tenantId);
      
      // 閲覧者数
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
      
      // 統計情報を更新
      setStats({
        totalCases: casesData?.length || 0,
        publishedCases: casesData?.filter(c => c.is_published)?.length || 0,
        totalViews: viewersData?.length || 0,
        totalInquiries: inquiriesData?.length || 0,
        totalAiQuestions: aiQuestionsData?.length || 0
      });
      
      // AI質問履歴を更新
      const { data: latestAiQuestions } = await supabase
        .from('ai_questions')
        .select(`
          id,
          case_id,
          question,
          answer,
          created_at,
          construction_cases (name)
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (latestAiQuestions) {
        setAiQuestions(latestAiQuestions);
      }
    }, 5000); // 5秒ごとに更新
    
    // Supabase Realtime購読
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
              created_at,
              construction_cases (name)
            `)
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })
            .limit(10);
          
          if (data) {
            setAiQuestions(data);
            
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

  return (
    <div>
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-500">事例数</h3>
            <p className="text-2xl font-bold">{stats.totalCases}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-500">公開事例数</h3>
            <p className="text-2xl font-bold">{stats.publishedCases}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-500">総閲覧数</h3>
            <p className="text-2xl font-bold">{stats.totalViews}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-500">問い合わせ数</h3>
            <p className="text-2xl font-bold">{stats.totalInquiries}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-500">AI質問数</h3>
            <p className="text-2xl font-bold">{stats.totalAiQuestions}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* AI質問履歴 */}
      <div className="mb-6">
        <AiQuestionsTable aiQuestions={aiQuestions} />
      </div>
    </div>
  );
}
