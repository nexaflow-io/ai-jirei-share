import { Metadata } from 'next';
import SecurityTestDashboard from '@/components/SecurityTestDashboard';

export const metadata: Metadata = {
  title: 'セキュリティテスト | AI事例シェア',
  description: 'AIチャット機能のセキュリティテストダッシュボード',
};

export default function SecurityTestPage() {
  // 本番環境では表示しない
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            セキュリティテスト
          </h1>
          <p className="text-gray-600">
            このページは開発環境でのみ利用可能です。
          </p>
        </div>
      </div>
    );
  }

  return <SecurityTestDashboard />;
}
