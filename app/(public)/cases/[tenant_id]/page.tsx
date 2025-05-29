'use client';

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { ViewerInfoForm } from '@/components/ViewerInfoForm';

type CasesPageProps = {
  params: { tenant_id: string };
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
          .eq('id', params.tenant_id)
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
          .eq('tenant_id', params.tenant_id)
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
  }, [params.tenant_id, router, supabase]);
  
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
          tenantId={params.tenant_id} 
          onComplete={handleViewerFormComplete} 
        />
      </div>
    );
  }
  
  // 事例一覧の表示
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{tenantData?.name}の施工事例集</h1>
        <p className="text-gray-600">
          当社の施工事例をご覧いただけます。詳細を見るには各事例をクリックしてください。
        </p>
      </div>
      
      {casesWithImages.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-medium text-gray-700">公開されている事例はありません</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {casesWithImages.map((caseItem) => (
            <Link href={`/case/${caseItem.id}`} key={caseItem.id}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <div className="relative w-full h-48 overflow-hidden">
                  {caseItem.thumbnail ? (
                    <Image
                      src={caseItem.thumbnail}
                      alt={caseItem.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">画像なし</span>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{caseItem.name}</CardTitle>
                  {caseItem.category && (
                    <CardDescription>
                      カテゴリ: {caseItem.category}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {caseItem.description || '説明なし'}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(caseItem.updated_at), {
                      addSuffix: true,
                      locale: ja,
                    })}
                  </span>
                  <Button variant="outline" size="sm">詳細を見る</Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
