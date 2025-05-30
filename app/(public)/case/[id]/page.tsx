import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Carousel } from '@/components/ui/carousel';
import { ChevronLeft, Building2, User, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import AiChatWidget from '@/components/AiChatWidget';
import { CaseDetailClient } from '@/components/CaseDetailClient';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CaseViewWrapper } from '@/components/CaseViewWrapper';

type CasePageProps = {
  params: Promise<{ id: string }>;
};

export default async function CasePage({ params }: CasePageProps) {
  const { id } = await params;
  const supabase = createServerClient();
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const referer = headersList.get('referer') || '';
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '';

  // 事例データを取得（公開されている事例のみ）
  const { data: caseData, error: caseError } = await supabase
    .from('construction_cases')
    .select(`
      id,
      tenant_id,
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
      ),
      tenants (
        id,
        name
      )
    `)
    .eq('id', id)
    .eq('is_published', true)
    .single();

  if (caseError || !caseData) {
    console.error('事例取得エラー:', caseError);
    return notFound();
  }

  // 事例の画像を取得
  const { data: imageData, error: imageError } = await supabase
    .from('case_images')
    .select('id, image_url')
    .eq('case_id', id)
    .order('display_order', { ascending: true });

  if (imageError) {
    console.error('画像取得エラー:', imageError);
  }

  // メタデータを設定
  const title = `${caseData.name} | ${caseData.tenants?.name || '施工事例'}`;
  const description = caseData.description ? caseData.description.substring(0, 160) : '施工事例の詳細情報';

  return (
    <>
      <head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        {imageData && imageData.length > 0 && (
          <meta property="og:image" content={imageData[0].image_url} />
        )}
      </head>

      <CaseViewWrapper caseId={caseData.id} tenantId={caseData.tenant_id}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          {/* クライアントサイドアクセスログ記録 */}
          <CaseDetailClient caseId={caseData.id} tenantId={caseData.tenant_id} />
          
          {/* ヘッダー */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
            <div className="container mx-auto px-4 py-4">
              <Link
                href={`/case-collections/${caseData.tenant_id}`}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ChevronLeft size={20} className="mr-1" />
                <span className="font-medium">事例集に戻る</span>
              </Link>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* メインコンテンツ */}
              <div className="lg:col-span-3 space-y-8">
                {/* タイトルセクション */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                        {caseData.name}
                      </h1>
                      <Badge variant="info" className="text-sm">
                        {caseData.category}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDistanceToNow(new Date(caseData.updated_at), {
                          addSuffix: true,
                          locale: ja,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 画像ギャラリー */}
                {imageData && imageData.length > 0 && (
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <Building2 className="w-6 h-6 mr-2 text-blue-600" />
                      施工写真
                    </h2>
                    <Carousel images={imageData} />
                  </div>
                )}

                {/* 事例詳細 */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
                  <div className="prose prose-gray max-w-none">
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
                          <div className="w-2 h-6 bg-red-500 rounded-full mr-3"></div>
                          課題・問題点
                        </h3>
                        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg">
                          <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                            {caseData.description}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
                          <div className="w-2 h-6 bg-yellow-500 rounded-full mr-3"></div>
                          工夫・解決策
                        </h3>
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
                          <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                            {caseData.solution}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
                          <div className="w-2 h-6 bg-green-500 rounded-full mr-3"></div>
                          結果・成果
                        </h3>
                        <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-lg">
                          <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                            {caseData.result}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* サイドバー - Sticky */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  {/* 会社情報カード */}
                  <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg">
                    <CardContent className="p-6">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold shadow-lg">
                          {caseData.tenants?.name?.charAt(0) || 'C'}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {caseData.tenants?.name || '施工会社'}
                        </h3>
                      </div>

                      <div className="space-y-4">
                        {caseData.users?.full_name && (
                          <div className="flex items-center space-x-3">
                            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">担当者</p>
                              <p className="font-medium">{caseData.users.full_name}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center space-x-3">
                          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">公開日</p>
                            <p className="font-medium">
                              {new Date(caseData.created_at).toLocaleDateString('ja-JP')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AIチャットウィジェット */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg overflow-hidden">
                    <AiChatWidget 
                      caseId={id} 
                      tenantId={caseData.tenant_id}
                    />
                  </div>

                  {/* お問い合わせカード */}
                  <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-lg">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold mb-3 flex items-center">
                        <Mail className="w-5 h-5 mr-2" />
                        お問い合わせ
                      </h3>
                      <p className="text-blue-100 mb-4 text-sm leading-relaxed">
                        この事例について詳しく知りたい方は、お気軽にお問い合わせください。
                      </p>
                      <a
                        href={`/inquiry/${id}`}
                        className="block w-full py-3 px-4 bg-white text-blue-600 text-center rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium shadow-sm"
                      >
                        詳細を問い合わせる
                      </a>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CaseViewWrapper>
    </>
  );
}
