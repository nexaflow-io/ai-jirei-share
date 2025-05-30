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

export default function CasesPage({ params }: { params: Promise<{ id: string }> }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenantData, setTenantData] = useState<any>(null);
  const [casesWithImages, setCasesWithImages] = useState<any[]>([]);
  const [showViewerForm, setShowViewerForm] = useState(true);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();
  
  // paramsを解決
  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

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

  useEffect(() => {
    const fetchTenantAndCases = async () => {
      if (!resolvedParams?.id) return;
      
      try {
        setLoading(true);
        
        // テナント情報を取得
        const { data: tenant, error: tenantError } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', resolvedParams.id)
          .single();

        if (tenantError) {
          console.error('テナント取得エラー:', tenantError);
          setError('テナント情報の取得に失敗しました');
          return;
        }

        if (!tenant) {
          notFound();
          return;
        }

        setTenantData(tenant);

        // 公開されている事例を取得
        const { data: cases, error: casesError } = await supabase
          .from('construction_cases')
          .select(`
            id,
            name,
            description,
            category,
            created_at,
            updated_at
          `)
          .eq('tenant_id', resolvedParams.id)
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (casesError) {
          console.error('事例取得エラー:', casesError);
          setError('事例の取得に失敗しました');
          return;
        }

        // 各事例の画像を取得
        const casesWithImagesData = await Promise.all(
          (cases || []).map(async (caseItem) => {
            try {
              const { data: images, error: imageError } = await supabase
                .from('case_images')
                .select('id, image_url')
                .eq('case_id', caseItem.id)
                .order('display_order', { ascending: true })
                .limit(1);

              if (imageError) {
                console.error('画像取得エラー:', imageError);
                return { ...caseItem, image: null };
              }

              return {
                ...caseItem,
                image: images && images.length > 0 ? { ...images[0] } : null
              };
            } catch (e) {
              console.error('事例画像取得エラー:', e);
              return { ...caseItem, image: null };
            }
          })
        );

        setCasesWithImages(casesWithImagesData);
      } catch (err) {
        console.error('データ取得エラー:', err);
        setError('データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams) {
      fetchTenantAndCases();
    }
  }, [resolvedParams]);

  const handleViewerFormComplete = (viewerId: string) => {
    setShowViewerForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">エラー</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!tenantData) {
    notFound();
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 閲覧者情報フォーム */}
      {showViewerForm && resolvedParams?.id && (
        <ViewerInfoForm
          caseId={resolvedParams.id}
          tenantId={resolvedParams.id}
          onComplete={handleViewerFormComplete}
        />
      )}

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {tenantData.company_name}の施工事例
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {tenantData.description || '高品質な施工実績をご覧ください'}
          </p>
        </div>

        {/* 事例一覧 */}
        {casesWithImages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">まだ公開されている事例がありません。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {casesWithImages.map((caseItem) => (
              <Card key={caseItem.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-200">
                  {caseItem.image ? (
                    <Image
                      src={caseItem.image.image_url}
                      alt={caseItem.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Building2 className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <CardHeader>
                  <CardTitle className="line-clamp-2">{caseItem.name}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {caseItem.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    {caseItem.category && (
                      <Badge variant="secondary" className="mt-2">
                        {caseItem.category}
                      </Badge>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Link href={`/case/${caseItem.id}`} className="w-full">
                    <Button className="w-full">詳細を見る</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* AIチャットウィジェット */}
        {resolvedParams?.id && (
          <div className="fixed bottom-4 right-4">
            <AiChatWidget 
              caseId={resolvedParams.id} 
              tenantId={resolvedParams.id}
              isFloating={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
