'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Building2,
  User,
  BarChart3,
  Users,
  Eye,
  Bot,
  Shield,
  TrendingUp,
  Bell,
  Target
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { signOut, user } = useAuth();

  const handleSignOut = () => {
    signOut();
  };

  const navItems = [
    { 
      name: 'ダッシュボード', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      description: '営業状況の概要',
      category: 'main'
    },
    { 
      name: 'リード管理', 
      href: '/leads', 
      icon: Target,
      description: '見込み客の管理',
      category: 'sales'
    },
    { 
      name: '閲覧者分析', 
      href: '/viewer-analysis', 
      icon: BarChart3,
      description: 'アクセス解析',
      category: 'sales'
    },
    { 
      name: '事例管理', 
      href: '/cases', 
      icon: FileText,
      description: '施工事例の管理',
      category: 'content'
    },
    { 
      name: 'AI質問履歴', 
      href: '/ai-questions', 
      icon: Bot,
      description: 'AI質問の分析',
      category: 'content'
    },
    { 
      name: '問い合わせ', 
      href: '/inquiries', 
      icon: MessageSquare,
      description: 'お客様からの問い合わせ',
      category: 'communication'
    },
    { 
      name: '通知設定', 
      href: '/notifications', 
      icon: Bell,
      description: '通知の設定',
      category: 'communication'
    },
    { 
      name: '設定', 
      href: '/settings', 
      icon: Settings,
      description: 'システム設定',
      category: 'system'
    },
    { 
      name: 'セキュリティ', 
      href: '/security-test', 
      icon: Shield,
      description: 'セキュリティテスト',
      category: 'system'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* モバイルヘッダー */}
      <div className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 lg:hidden sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">AI事例シェア</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* サイドバー（デスクトップ） */}
        <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-white/95 backdrop-blur-sm border-r border-gray-200 shadow-sm">
            {/* ロゴエリア */}
            <div className="px-6 py-6 border-b border-gray-200">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-xl text-gray-900">AI事例シェア</div>
                  <div className="text-sm text-gray-500">管理画面</div>
                </div>
              </Link>
            </div>

            {/* ナビゲーション */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              <div className="text-lg font-bold mb-2">メイン</div>
              {navItems.filter(item => item.category === 'main').map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className={`text-xs ${
                        isActive ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
              <div className="text-lg font-bold mb-2 mt-4">営業支援</div>
              <div className="text-base font-bold mb-2">リード管理</div>
              {navItems.filter(item => item.category === 'sales').map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className={`text-xs ${
                        isActive ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
              <div className="text-base font-bold mb-2 mt-2">コンテンツ管理</div>
              {navItems.filter(item => item.category === 'content').map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className={`text-xs ${
                        isActive ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
              <div className="text-base font-bold mb-2 mt-2">コミュニケーション</div>
              {navItems.filter(item => item.category === 'communication').map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className={`text-xs ${
                        isActive ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
              <div className="text-base font-bold mb-2 mt-2">システム</div>
              {navItems.filter(item => item.category === 'system').map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className={`text-xs ${
                        isActive ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* ユーザー情報とログアウト */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center space-x-3 mb-4 px-2">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {user?.email || 'ユーザー'}
                  </div>
                  <div className="text-xs text-gray-500">管理者</div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                ログアウト
              </button>
            </div>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 flex z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white/95 backdrop-blur-sm">
              {/* モバイルメニューヘッダー */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="font-bold text-lg text-gray-900">AI事例シェア</div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* モバイルナビゲーション */}
              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                <div className="text-lg font-bold mb-2">メイン</div>
                {navItems.filter(item => item.category === 'main').map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className={`mr-3 h-5 w-5 ${
                        isActive ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className={`text-xs ${
                          isActive ? 'text-blue-600' : 'text-gray-400'
                        }`}>
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
                <div className="text-lg font-bold mb-2 mt-4">営業支援</div>
                <div className="text-base font-bold mb-2">リード管理</div>
                {navItems.filter(item => item.category === 'sales').map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className={`mr-3 h-5 w-5 ${
                        isActive ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className={`text-xs ${
                          isActive ? 'text-blue-600' : 'text-gray-400'
                        }`}>
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
                <div className="text-base font-bold mb-2 mt-2">コンテンツ管理</div>
                {navItems.filter(item => item.category === 'content').map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className={`mr-3 h-5 w-5 ${
                        isActive ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className={`text-xs ${
                          isActive ? 'text-blue-600' : 'text-gray-400'
                        }`}>
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
                <div className="text-base font-bold mb-2 mt-2">コミュニケーション</div>
                {navItems.filter(item => item.category === 'communication').map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className={`mr-3 h-5 w-5 ${
                        isActive ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className={`text-xs ${
                          isActive ? 'text-blue-600' : 'text-gray-400'
                        }`}>
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
                <div className="text-base font-bold mb-2 mt-2">システム</div>
                {navItems.filter(item => item.category === 'system').map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className={`mr-3 h-5 w-5 ${
                        isActive ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className={`text-xs ${
                          isActive ? 'text-blue-600' : 'text-gray-400'
                        }`}>
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* モバイルユーザー情報 */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center space-x-3 mb-4 px-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {user?.email || 'ユーザー'}
                    </div>
                    <div className="text-xs text-gray-500">管理者</div>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        )}

        {/* メインコンテンツ */}
        <main className="flex-1 lg:pl-72">
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}