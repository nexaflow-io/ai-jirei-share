import Link from 'next/link';
import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">AI事例シェア</h1>
          <div>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              ログイン
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              AI事例シェア
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              施工会社が事例集URLを共有して、確度の高いリードを自動獲得できる営業支援ツール
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                今すぐ始める
              </Link>
            </div>
          </div>

          <div className="mt-24">
            <h3 className="text-2xl font-bold text-center mb-12">主な機能</h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mb-5">
                  <span className="text-2xl">📷</span>
                </div>
                <h4 className="text-xl font-semibold mb-3">事例集作成</h4>
                <p className="text-gray-600 leading-relaxed">
                  施工写真をアップロードし、事例情報を手動入力するだけで、魅力的な事例集を自動生成します。
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 text-indigo-600 mb-5">
                  <span className="text-2xl">🔗</span>
                </div>
                <h4 className="text-xl font-semibold mb-3">URL発行・共有</h4>
                <p className="text-gray-600 leading-relaxed">
                  事例集のURLを自動生成し、元請けに共有するだけで、確度の高いリードを獲得できます。
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-100 text-purple-600 mb-5">
                  <span className="text-2xl">🤖</span>
                </div>
                <h4 className="text-xl font-semibold mb-3">AI質問機能</h4>
                <p className="text-gray-600 leading-relaxed">
                  元請けの軽い質問にAIが24時間自動回答。事例情報をコンテキストに含めた回答が可能です。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; 2024 AI事例シェア. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}