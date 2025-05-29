import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Camera, 
  Share2, 
  Bot, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Star,
  ArrowRight,
  Zap,
  Shield,
  BarChart3
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">AI事例シェア</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/auth/login"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              ログイン
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* ヒーローセクション */}
        <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative max-w-7xl mx-auto py-12 px-4 sm:py-20 sm:px-6 lg:py-32 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-4 sm:mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  眠っている施工写真が
                </span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  営業担当者に変わる
                </span>
              </h2>
              <p className="mt-4 sm:mt-6 max-w-3xl mx-auto text-lg sm:text-xl md:text-2xl text-gray-600 leading-relaxed px-2">
                施工写真をアップロードするだけで、<br className="hidden sm:block" />
                <span className="font-semibold text-blue-600">元請けから自動でアポイントが入る仕組み</span>を作りませんか？
              </p>
              
              {/* サービス概要 */}
              <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto px-2">
                <div className="text-center p-4 sm:p-6 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm">
                  <div className="text-2xl sm:text-3xl mb-2">📸</div>
                  <div className="text-base sm:text-lg font-semibold text-gray-900">写真をアップロード</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">眠っている写真が営業ツールに</div>
                </div>
                <div className="text-center p-4 sm:p-6 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm">
                  <div className="text-2xl sm:text-3xl mb-2">🔗</div>
                  <div className="text-base sm:text-lg font-semibold text-gray-900">URLを元請けに送信</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">美しい事例集を自動生成・共有</div>
                </div>
                <div className="text-center p-4 sm:p-6 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm sm:col-span-2 md:col-span-1">
                  <div className="text-2xl sm:text-3xl mb-2">📞</div>
                  <div className="text-base sm:text-lg font-semibold text-gray-900">アポイントが自動で入る</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">興味を持った元請けから連絡</div>
                </div>
              </div>

              <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200"
                >
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  無料で新規開拓を始める
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-lg border-2 border-gray-300 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                >
                  仕組みを見る
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 課題セクション */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
                新規元請け開拓、こんなことで困っていませんか？
              </h3>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                多くの施工会社が抱える新規開拓の課題
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <div className="bg-red-50 border border-red-200 p-4 sm:p-6 rounded-xl">
                <div className="text-red-600 mb-3 sm:mb-4">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">営業担当者を雇う余裕がない</h4>
                <p className="text-sm sm:text-base text-gray-600">「営業を採用したいけど、給料や教育コストを考えると踏み切れない」</p>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 p-4 sm:p-6 rounded-xl">
                <div className="text-orange-600 mb-3 sm:mb-4">
                  <Clock className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">営業活動する時間がない</h4>
                <p className="text-sm sm:text-base text-gray-600">「現場で忙しくて、新規開拓に時間を割けない。でも売上は伸ばしたい」</p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 p-4 sm:p-6 rounded-xl sm:col-span-2 lg:col-span-1">
                <div className="text-yellow-600 mb-3 sm:mb-4">
                  <Camera className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">施工写真が活用できていない</h4>
                <p className="text-sm sm:text-base text-gray-600">「良い施工写真がたくさんあるのに、営業に活かせていない」</p>
              </div>
            </div>
          </div>
        </section>

        {/* サービスの仕組み */}
        <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
                AI事例シェアの仕組み
              </h3>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                眠っている施工写真が24時間365日働く営業担当者に変わる仕組み
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:gap-12 xl:gap-16">
              {/* ステップ1 */}
              <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                <div className="w-full lg:w-1/2">
                  <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl border border-gray-100">
                    <div className="flex items-center mb-4 sm:mb-6">
                      <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white mr-3 sm:mr-4">
                        <span className="text-base sm:text-lg font-bold">1</span>
                      </div>
                      <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">施工写真をアップロード</h4>
                    </div>
                    <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                      スマホで撮った施工写真をドラッグ&ドロップするだけ。
                      <span className="font-semibold text-blue-600">眠っている写真が営業ツール</span>に変わります。
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm sm:text-base text-gray-700">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                        簡単アップロード（ドラッグ&ドロップ）
                      </li>
                      <li className="flex items-center text-sm sm:text-base text-gray-700">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                        自動で美しい事例集を生成
                      </li>
                      <li className="flex items-center text-sm sm:text-base text-gray-700">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                        工事内容や金額も自動で整理
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full lg:w-1/2">
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-6 sm:p-8 rounded-2xl">
                    <div className="text-center text-gray-600">
                      <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">📸</div>
                      <p className="text-base sm:text-lg font-semibold">写真をアップロード</p>
                      <p className="text-xs sm:text-sm mt-2">5分で美しい事例集が完成</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ステップ2 */}
              <div className="flex flex-col lg:flex-row-reverse items-center gap-6 lg:gap-8">
                <div className="w-full lg:w-1/2">
                  <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl border border-gray-100">
                    <div className="flex items-center mb-4 sm:mb-6">
                      <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white mr-3 sm:mr-4">
                        <span className="text-base sm:text-lg font-bold">2</span>
                      </div>
                      <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">URLを元請けに送信</h4>
                    </div>
                    <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                      生成された事例集のURLを元請けにメールやLINEで送信。
                      <span className="font-semibold text-indigo-600">営業資料作成は不要</span>です。
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm sm:text-base text-gray-700">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                        メール・LINE・チラシで簡単共有
                      </li>
                      <li className="flex items-center text-sm sm:text-base text-gray-700">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                        スマホで見やすいデザイン
                      </li>
                      <li className="flex items-center text-sm sm:text-base text-gray-700">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                        営業資料作成時間ゼロ
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full lg:w-1/2">
                  <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-6 sm:p-8 rounded-2xl">
                    <div className="text-center text-gray-600">
                      <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">🔗</div>
                      <p className="text-base sm:text-lg font-semibold">URLを送信</p>
                      <p className="text-xs sm:text-sm mt-2">営業資料作成不要</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ステップ3 */}
              <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                <div className="w-full lg:w-1/2">
                  <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl border border-gray-100">
                    <div className="flex items-center mb-4 sm:mb-6">
                      <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white mr-3 sm:mr-4">
                        <span className="text-base sm:text-lg font-bold">3</span>
                      </div>
                      <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">興味関心をトラッキング</h4>
                    </div>
                    <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                      どの事例を何分見たか、どこに興味を持ったかを自動で分析。
                      <span className="font-semibold text-purple-600">営業トークの準備</span>ができます。
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm sm:text-base text-gray-700">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                        閲覧時間・興味のある事例を分析
                      </li>
                      <li className="flex items-center text-sm sm:text-base text-gray-700">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                        本気度を数値で判定
                      </li>
                      <li className="flex items-center text-sm sm:text-base text-gray-700">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                        効果的な営業トークが準備できる
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full lg:w-1/2">
                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 sm:p-8 rounded-2xl">
                    <div className="text-center text-gray-600">
                      <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">📊</div>
                      <p className="text-base sm:text-lg font-semibold">興味関心を分析</p>
                      <p className="text-xs sm:text-sm mt-2">営業しやすくなる</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ステップ4 */}
              <div className="flex flex-col lg:flex-row-reverse items-center gap-6 lg:gap-8">
                <div className="w-full lg:w-1/2">
                  <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl border border-gray-100">
                    <div className="flex items-center mb-4 sm:mb-6">
                      <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white mr-3 sm:mr-4">
                        <span className="text-base sm:text-lg font-bold">4</span>
                      </div>
                      <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">アポイントが自動で入る</h4>
                    </div>
                    <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                      興味を持った元請けから自動で連絡が入ります。
                      <span className="font-semibold text-green-600">待ってるだけでアポイント獲得</span>。
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm sm:text-base text-gray-700">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                        本気度の高いお客様のみ
                      </li>
                      <li className="flex items-center text-sm sm:text-base text-gray-700">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                        営業採用・育成不要
                      </li>
                      <li className="flex items-center text-sm sm:text-base text-gray-700">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                        24時間365日営業活動
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full lg:w-1/2">
                  <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-6 sm:p-8 rounded-2xl">
                    <div className="text-center text-gray-600">
                      <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">📞</div>
                      <p className="text-base sm:text-lg font-semibold">アポイント獲得</p>
                      <p className="text-xs sm:text-sm mt-2">待ってるだけで連絡が入る</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 効果セクション */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
                こんな効果が得られる
              </h3>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                施工会社の新規開拓を支援する、AI事例シェアの効果
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-2">📈</div>
                <div className="text-sm sm:text-base text-gray-700 font-medium">売上アップ</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">新規開拓の成功率向上</div>
              </div>
              
              <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 mb-2">🕒</div>
                <div className="text-sm sm:text-base text-gray-700 font-medium">営業時間の短縮</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">自動化された営業活動</div>
              </div>
              
              <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-600 mb-2">📊</div>
                <div className="text-sm sm:text-base text-gray-700 font-medium">データ分析</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">効果的な営業戦略の策定</div>
              </div>
              
              <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-600 mb-2">🚀</div>
                <div className="text-sm sm:text-base text-gray-700 font-medium">成長の加速</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">新規開拓の成功によるビジネス成長</div>
              </div>
            </div>
          </div>
        </section>

        {/* お客様の声 */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
                新規開拓に成功した施工会社の声
              </h3>
              <p className="text-lg sm:text-xl text-gray-600 px-4">
                同じ悩みを抱えていた施工会社が手に入れた新しい営業スタイル
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed">
                  「営業担当者を雇う余裕がなくて困っていましたが、写真をアップロードするだけで
                  元請けから連絡が入るようになりました。月3件の新規案件を獲得できて、
                  売上が30%アップしました。」
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-semibold text-gray-900">田中様</div>
                    <div className="text-xs sm:text-sm text-gray-600">株式会社田中工務店 代表取締役</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed">
                  「現場で忙しくて営業活動ができませんでしたが、
                  今では24時間365日営業してくれています。
                  トラッキング機能で相手の興味がわかるので、営業がとても楽になりました。」
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-semibold text-gray-900">佐藤様</div>
                    <div className="text-xs sm:text-sm text-gray-600">佐藤建設 代表取締役</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg border border-gray-100 md:col-span-2 lg:col-span-1">
                <div className="flex items-center mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed">
                  「眠っていた施工写真が営業の武器になりました。
                  元請けから『こんな工事もできるんですね』と連絡が入り、
                  新しい分野の仕事も受注できるようになりました。」
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-semibold text-gray-900">山田様</div>
                    <div className="text-xs sm:text-sm text-gray-600">山田リフォーム 代表取締役</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA セクション */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 px-2">
              もう新規開拓の悩みを終わらせましょう
            </h3>
            <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 leading-relaxed px-2">
              施工会社の新規開拓を支援する、AI事例シェアを無料で始めてみませんか？
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-4">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-blue-600 shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transform hover:scale-105 transition-all duration-200"
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                無料で新規開拓を始める
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 text-blue-100 px-4">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="text-sm sm:text-base">完全無料で開始</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="text-sm sm:text-base">30日間返金保証</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="text-sm sm:text-base">今すぐ使える</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-1 sm:col-span-2 md:col-span-2">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                  <Building2 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <h4 className="text-lg sm:text-xl font-bold">AI事例シェア</h4>
              </div>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                施工会社の新規開拓を支援する、AI事例シェア。
                自動化された営業活動で、売上を伸ばしましょう。
              </p>
            </div>
            
            <div>
              <h5 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">サービス</h5>
              <ul className="space-y-1 sm:space-y-2 text-gray-400">
                <li><Link href="#" className="text-sm sm:text-base hover:text-white transition-colors">事例集作成</Link></li>
                <li><Link href="#" className="text-sm sm:text-base hover:text-white transition-colors">URL共有</Link></li>
                <li><Link href="#" className="text-sm sm:text-base hover:text-white transition-colors">AI質問機能</Link></li>
                <li><Link href="#" className="text-sm sm:text-base hover:text-white transition-colors">分析レポート</Link></li>
              </ul>
            </div>
            
            <div>
              <h5 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">サポート</h5>
              <ul className="space-y-1 sm:space-y-2 text-gray-400">
                <li><Link href="#" className="text-sm sm:text-base hover:text-white transition-colors">ヘルプセンター</Link></li>
                <li><Link href="#" className="text-sm sm:text-base hover:text-white transition-colors">お問い合わせ</Link></li>
                <li><Link href="#" className="text-sm sm:text-base hover:text-white transition-colors">プライバシーポリシー</Link></li>
                <li><Link href="#" className="text-sm sm:text-base hover:text-white transition-colors">利用規約</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400">
            <p className="text-sm sm:text-base">&copy; 2024 AI事例シェア. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}