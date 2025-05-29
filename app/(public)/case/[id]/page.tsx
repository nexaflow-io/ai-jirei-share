import { notFound } from 'next/navigation';
import Image from 'next/image';
import { createServerClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { Card, CardContent } from '@/components/ui/card';
import { AiChatWrapper } from '@/components/ai/AiChatWrapper';

type CasePageProps = {
  params: { id: string };
};

export default async function CasePage({ params }: CasePageProps) {
  const supabase = createServerClient();
  const headersList = headers();
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
    .eq('id', params.id)
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
    .eq('case_id', params.id)
    .order('display_order', { ascending: true });
    
  if (imageError) {
    console.error('画像取得エラー:', imageError);
  }
  
  // 閲覧者情報を記録（IPアドレスとユーザーエージェントから一意に識別）
  const viewerHash = Buffer.from(`${ip}:${userAgent}`).toString('base64');
  
  const { data: existingViewer, error: viewerCheckError } = await supabase
    .from('viewers')
    .select('id')
    .eq('case_id', params.id)
    .eq('viewer_hash', viewerHash)
    .maybeSingle();
    
  if (viewerCheckError) {
    console.error('閲覧者チェックエラー:', viewerCheckError);
  }
  
  let viewerId = existingViewer?.id;
  
  // 新規閲覧者の場合は記録
  if (!existingViewer) {
    // 閲覧者情報をデータベースに保存
    // 注：実際のアプリケーションでは、ここでフォームから入力された情報を使用します
    // このサンプルコードでは仮のデータを使用しています
    const { data: newViewer, error: createViewerError } = await supabase
      .from('viewers')
      .insert({
        case_id: params.id,
        tenant_id: caseData.tenant_id,
        company_name: '株式会社サンプル',
        position: '部長',
        full_name: 'サンプル太郎',
        email: 'sample@example.com',
        phone: '03-1234-5678'
      })
      .select('id')
      .single();
      
    if (createViewerError) {
      console.error('閲覧者記録エラー:', createViewerError);
    } else {
      viewerId = newViewer.id;
    }
  }
  
  // アクセスログを記録
  if (viewerId) {
    await supabase
      .from('access_logs')
      .insert({
        case_id: params.id,
        tenant_id: caseData.tenant_id,
        viewer_id: viewerId,
        referer: referer,
      });
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
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* 会社情報 */}
        <div className="mb-8 flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-blue-600 font-bold">{caseData.tenants?.name?.charAt(0) || 'C'}</span>
          </div>
          <div>
            <p className="font-semibold">{caseData.tenants?.name || '施工会社'}</p>
            <p className="text-sm text-gray-600">{caseData.users?.full_name || '担当者'}</p>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-6">{caseData.name}</h1>
        
        <div className="mb-4">
          <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
            {caseData.category}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* 画像ギャラリー */}
            {imageData && imageData.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">施工写真</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {imageData.map((image) => (
                    <div key={image.id} className="aspect-square relative rounded-lg overflow-hidden shadow-md">
                      <Image
                        src={image.image_url}
                        alt="施工写真"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 事例詳細 */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">課題・問題点</h3>
                    <p className="whitespace-pre-line text-gray-700">{caseData.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">工夫・解決策</h3>
                    <p className="whitespace-pre-line text-gray-700">{caseData.solution}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">結果・成果</h3>
                    <p className="whitespace-pre-line text-gray-700">{caseData.result}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* サイドバー */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">担当者情報</h3>
                <div className="space-y-3">
                  {caseData.users?.full_name && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">担当者</h4>
                      <p>{caseData.users.full_name}</p>
                    </div>
                  )}
                  
                  {/* 所属情報はテナント名を使用 */}
                  {caseData.tenants?.name && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">所属</h4>
                      <p>{caseData.tenants.name}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">公開日</h4>
                    <p>{new Date(caseData.created_at).toLocaleDateString('ja-JP')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* AIチャット機能 */}
            <div className="mb-6">
              <AiChatWrapper caseId={params.id} viewerId={viewerId} />
            </div>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">お問い合わせ</h3>
                <p className="text-sm text-gray-600 mb-4">
                  この事例について詳しく知りたい方は、お気軽にお問い合わせください。
                </p>
                <a
                  href={`/inquiry/${params.id}`}
                  className="block w-full py-2 px-4 bg-primary text-white text-center rounded-md hover:bg-primary/90 transition-colors"
                >
                  お問い合わせする
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
