import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">AI事例シェア</h1>
          <div>
            <Link
              href="/auth/login"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 ml-2"
            >
              ログイン
            </Link>
          </div>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              AI事例シェア
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              施工会社が事例集URLを共有して、確度の高いリードを自動獲得できる営業支援ツール
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/auth/signup"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-blue-700"
              >
                今すぐ始める
              </Link>
            </div>
          </div>

          <div className="mt-20">
            <h3 className="text-2xl font-bold text-center mb-12">主な機能</h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h4 className="text-xl font-semibold mb-2">📸 事例集作成</h4>
                <p className="text-gray-600">
                  施工写真をアップロードし、事例情報を手動入力するだけで、魅力的な事例集を自動生成します。
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h4 className="text-xl font-semibold mb-2">🔗 URL発行・共有</h4>
                <p className="text-gray-600">
                  事例集のURLを自動生成し、元請けに共有するだけで、確度の高いリードを獲得できます。
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h4 className="text-xl font-semibold mb-2">🤖 AI質問機能</h4>
                <p className="text-gray-600">
                  元請けの軽い質問にAIが24時間自動回答。事例情報をコンテキストに含めた回答が可能です。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="mt-2">© 2024 AI事例シェア. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 