import { createServerClient } from '@/lib/supabase/server';
import InquiriesTable from '@/components/dashboard/InquiriesTable';
import { MessageSquare, TrendingUp, Clock } from 'lucide-react';
import { redirect } from 'next/navigation';

export const metadata = {
  title: '問い合わせ一覧 | AI事例シェア',
  description: 'AI事例シェアの問い合わせ一覧ページ',
};

export default async function InquiriesPage() {
  console.log('=== InquiriesPage開始 ===');
  
  const supabase = createServerClient();
  
  try {
    console.log('セッション取得開始...');
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    console.log('セッション取得結果:', session ? 'セッション有り' : 'セッション無し');
    
    if (!session) {
      console.log('セッションが見つかりません - ログインページにリダイレクト');
      redirect('/auth/login');
    }

    console.log('ユーザーID:', session.user.id);
    console.log('ユーザー情報取得開始...');

    // ユーザーのテナントIDを取得
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tenant_id, tenants(name)')
      .eq('id', session.user.id)
      .single();
      
    console.log('ユーザー情報取得結果:', { userData, userError });
      
    if (userError) {
      console.error('ユーザー情報取得エラー:', userError);
      return (
        <div className="p-6">
          <div className="bg-red-50 text-red-500 p-4 rounded-md">
            <h3 className="font-bold mb-2">ユーザー情報取得エラー</h3>
            <p>エラー詳細: {userError.message}</p>
            <p>エラーコード: {userError.code}</p>
            <p className="mt-2">再度ログインしてください。</p>
          </div>
        </div>
      );
    }
    
    if (!userData) {
      console.error('ユーザーデータが見つかりません');
      return (
        <div className="p-6">
          <div className="bg-red-50 text-red-500 p-4 rounded-md">
            <h3 className="font-bold mb-2">ユーザーデータエラー</h3>
            <p>ユーザー情報が見つかりません。管理者にお問い合わせください。</p>
          </div>
        </div>
      );
    }

    console.log('ユーザーデータ取得成功:', { 
      tenantId: userData.tenant_id, 
      tenantName: userData.tenants?.name 
    });
    
    console.log('UIレンダリング開始...');

    return (
      <div className="min-h-screen bg-gray-50">
        {/* ヘッダーセクション */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">問い合わせ一覧</h1>
                  <p className="text-sm text-gray-600">
                    {userData.tenants?.name || '会社名未設定'}の問い合わせを管理
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* ウェルカムカード */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">問い合わせ管理</h2>
                <p className="text-blue-100">
                  お客様からの問い合わせを効率的に管理し、迅速な対応でビジネスチャンスを逃しません。
                </p>
              </div>
              <div className="hidden md:flex space-x-6">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-200" />
                  <div className="text-sm text-blue-100">成約率向上</div>
                </div>
                <div className="text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-blue-200" />
                  <div className="text-sm text-blue-100">迅速対応</div>
                </div>
                <div className="text-center">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-200" />
                  <div className="text-sm text-blue-100">一元管理</div>
                </div>
              </div>
            </div>
          </div>

          {/* 問い合わせテーブル */}
          <InquiriesTable />
        </div>
      </div>
    );
  } catch (error: any) {
    console.error('問い合わせページエラー:', error);
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          <h3 className="font-bold mb-2">ページエラー</h3>
          <p>エラー詳細: {error?.message || 'エラーが発生しました'}</p>
          <p className="mt-2">再度ログインしてください。</p>
        </div>
      </div>
    );
  }
}
