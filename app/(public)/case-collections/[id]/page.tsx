'use client';

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Loader2, Building2, Calendar, User } from 'lucide-react';
import { ViewerInfoForm } from '@/components/ViewerInfoForm';
import AiChatWidget from '@/components/AiChatWidget';

type CasesPageProps = {
  params: { id: string };
};

export default function CasesPage({ params }: CasesPageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenantData, setTenantData] = useState<any>(null);
  const [casesWithImages, setCasesWithImages] = useState<any[]>([]);
  const [showViewerForm, setShowViewerForm] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  // LocalStorageから閲覧者情報を確認
  useEffect(() => {
    const checkViewerInfo = () => {
      const storedInfo = localStorage.getItem('viewer_info');
      if (storedInfo) {
        try {
          const viewerInfo = JSON.parse(storedInfo);
          // 24時間以内に入力された情報であれば再利用
          const timestamp = new Date(viewerInfo.timestamp);
          const now = new Date();
          const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff < 24) {
            setShowViewerForm(false);
          }
        } catch (e) {
          console.error('閲覧者情報の解析エラー:', e);
        }
      }
    };
    
    checkViewerInfo();
  }, []);
  
  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // テナント情報を取得
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('id, name')
          .eq('id', params.id)
          .single();
          
        if (tenantError || !tenantData) {
          console.error('テナント取得エラー:', tenantError);
          router.push('/404');
          return;
        }
        
        setTenantData(tenantData);
        
        // 公開事例一覧を取得
        const { data: casesData, error: casesError } = await supabase
          .from('construction_cases')
          .select(`
            id,
            name,
            category,
            description,
            solution,
            result,
            created_at,
            updated_at,
            users (
              id,
              full_name
            )
          `)
          .eq('tenant_id', params.id)
          .eq('is_published', true)
          .order('updated_at', { ascending: false });
          
        if (casesError) {
          console.error('事例取得エラー:', casesError);
          setError('事例の取得に失敗しました');
          return;
        }
        
        if (!casesData || casesData.length === 0) {
          setCasesWithImages([]);
          setLoading(false);
          return;
        }
        
        // 各事例の最初の画像を取得
        const casesWithImagesPromises = casesData.map(async (caseItem) => {
          const { data: imageData } = await supabase
            .from('case_images')
            .select('image_url')
            .eq('case_id', caseItem.id)
            .order('display_order', { ascending: true })
            .limit(1)
            .single();
            
          return {
            ...caseItem,
            thumbnail: imageData?.image_url || null
          };
        });
        
        const casesWithImagesResult = await Promise.all(casesWithImagesPromises);
        setCasesWithImages(casesWithImagesResult);
      } catch (err) {
        console.error('データ取得エラー:', err);
        setError('データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params.id, router, supabase]);
  
  // 閲覧者情報入力完了時の処理
  const handleViewerFormComplete = () => {
    setShowViewerForm(false);
  };
  
  // ローディング中の表示
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-gray-600">データを読み込み中...</p>
      </div>
    );
  }
  
  // エラー表示
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-6 rounded-lg text-red-600 text-center">
          <p>{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/')}>
            トップページに戻る
          </Button>
        </div>
      </div>
    );
  }
  
  // 閲覧者情報入力フォームの表示
  if (showViewerForm) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">{tenantData?.name}の施工事例集</h1>
          <p className="text-gray-600">
            施工事例をご覧いただくには、以下の情報を入力してください。
          </p>
        </div>
        
        <ViewerInfoForm 
          caseId={casesWithImages[0]?.id || ''} 
          tenantId={params.id} 
          onComplete={handleViewerFormComplete} 
        />
      </div>
    );
  }
  
  // 事例一覧の表示
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* ヒーローセクション */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
              <Building2 className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {tenantData?.name}
            </h1>
            <p className="text-xl text-blue-100 mb-2">施工事例集</p>
            <p className="text-blue-200 max-w-2xl mx-auto">
              当社の施工事例をご覧いただけます。詳細を見るには各事例をクリックしてください。
            </p>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-12">
        {casesWithImages.length === 0 ? (
          <div className="text-center p-16 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-medium text-gray-700 mb-2">公開されている事例はありません</h2>
            <p className="text-gray-500">現在準備中です。しばらくお待ちください。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {casesWithImages.map((caseItem) => (
              <Link href={`/case/${caseItem.id}`} key={caseItem.id}>
                <Card className="group h-full bg-white/70 backdrop-blur-sm border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden">
                  {/* 画像セクション */}
                  <div className="relative">
                    {caseItem.thumbnail ? (
                      <div className="relative w-full h-56 overflow-hidden">
                        <Image
                          src={caseItem.thumbnail}
                          alt={caseItem.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                    ) : (
                      <div className="w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* カテゴリバッジ */}
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-white/90 text-gray-700 shadow-sm">
                        {caseItem.category || '未分類'}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl group-hover:text-blue-600 transition-colors line-clamp-2">
                      {caseItem.name}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pb-4">
                    <p className="line-clamp-3 text-gray-600 leading-relaxed">
                      {caseItem.description || '詳細情報をご覧ください。'}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="pt-0 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      <span>{caseItem.users?.full_name || '担当者'}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>
                        {formatDistanceToNow(new Date(caseItem.updated_at), { 
                          addSuffix: true,
                          locale: ja 
                        })}
                      </span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
        
        {/* フッターアクション */}
        <div className="mt-16 text-center">
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
            className="bg-white/70 backdrop-blur-sm border-white/20 hover:bg-white/90 transition-all duration-300"
          >
            トップページに戻る
          </Button>
        </div>
      </div>
      {tenantData && (
        <AiChatWidget 
          caseId="general" 
          caseName={`${tenantData.name}の事例について`}
          position="bottom-right"
          tenantId={tenantData.id}
        />
      )}
    </div>
  );
}
