import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShareButton } from '@/components/ShareButton';

export const metadata = {
  title: '事例詳細 | AI事例シェア',
  description: 'AI事例シェアの施工事例詳細',
};

export default async function CaseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerClient();
  
  // セッション確認
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return notFound();
  }
  
  // ユーザーのテナントIDを取得
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', session.user.id)
    .single();
    
  if (userError || !userData) {
    console.error('ユーザー情報取得エラー:', userError);
    return notFound();
  }
  
  // 事例データを取得
  const { data: caseData, error: caseError } = await supabase
    .from('construction_cases')
    .select(`
      id,
      name,
      category,
      description,
      solution,
      result,
      is_published,
      created_at,
      updated_at,
      users (
        id,
        email,
        full_name
      )
    `)
    .eq('id', params.id)
    .eq('tenant_id', userData.tenant_id)
    .single();
    
  if (caseError || !caseData) {
    console.error('事例取得エラー:', caseError);
    return notFound();
  }
  
  // 事例の画像を取得
  const { data: imageData, error: imageError } = await supabase
    .from('case_images')
    .select('id, image_url')
    .eq('case_id', params.id)
    .order('display_order', { ascending: true });
    
  if (imageError) {
    console.error('画像取得エラー:', imageError);
  }
  
  // 閲覧者数を取得
  const { count: viewerCount, error: viewerError } = await supabase
    .from('viewers')
    .select('id', { count: 'exact', head: true })
    .eq('case_id', params.id);
    
  if (viewerError) {
    console.error('閲覧者数取得エラー:', viewerError);
  }
  
  // アクセスログ数を取得
  const { count: accessCount, error: accessError } = await supabase
    .from('access_logs')
    .select('id', { count: 'exact', head: true })
    .eq('case_id', params.id);
    
  if (accessError) {
    console.error('アクセスログ取得エラー:', accessError);
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{caseData.name}</h1>
        <div className="flex space-x-2">
          <Link href={`/dashboard/cases/${params.id}/edit`}>
            <Button variant="outline">編集</Button>
          </Link>
          <ShareButton caseId={params.id} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* 事例情報 */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">カテゴリ</h3>
                  <p>{caseData.category}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">課題・問題点</h3>
                  <p className="whitespace-pre-line">{caseData.description}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">工夫・解決策</h3>
                  <p className="whitespace-pre-line">{caseData.solution}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">結果・成果</h3>
                  <p className="whitespace-pre-line">{caseData.result}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* 画像ギャラリー */}
          {imageData && imageData.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">施工写真</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imageData.map((image) => (
                    <div key={image.id} className="aspect-square relative rounded-md overflow-hidden">
                      <Image
                        src={image.image_url}
                        alt="施工写真"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* サイドバー情報 */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">事例情報</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">ステータス</h4>
                  <div className="mt-1">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      caseData.is_published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {caseData.is_published ? '公開中' : '非公開'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">作成者</h4>
                  <p>{Array.isArray(caseData.users) 
                    ? (caseData.users[0]?.full_name || caseData.users[0]?.email || '不明')
                    : (caseData.users?.full_name || caseData.users?.email || '不明')}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">作成日</h4>
                  <p>{new Date(caseData.created_at).toLocaleDateString('ja-JP')}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">最終更新</h4>
                  <p>
                    {formatDistanceToNow(new Date(caseData.updated_at), {
                      addSuffix: true,
                      locale: ja,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">アクセス統計</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">閲覧者数</h4>
                  <p className="text-2xl font-bold">{viewerCount || 0}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">アクセス数</h4>
                  <p className="text-2xl font-bold">{accessCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
