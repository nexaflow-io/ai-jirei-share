import { SignupForm } from '@/components/forms/SignupForm';

export const metadata = {
  title: '新規登録 | AI事例シェア',
  description: 'AI事例シェアの新規登録ページです',
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">AI事例シェア</h1>
        <p className="mt-2 text-gray-600">施工会社のための営業支援ツール</p>
      </div>
      
      <SignupForm />
    </div>
  );
} 