'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { usePageData } from '@/hooks/usePageData';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  company_name: string;
  full_name: string;
  position: string | null;
  phone: string | null;
  case_id: string;
  tenant_id: string;
  created_at: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  marketing_emails: boolean;
  security_alerts: boolean;
  weekly_reports: boolean;
}

interface SecuritySettings {
  two_factor_enabled: boolean;
  login_alerts: boolean;
  session_timeout: number;
}

const fetchUserData = async () => {
  const supabase = createClient();
  
  // 現在のユーザー情報を取得
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('ユーザー情報の取得に失敗しました');

  // プロフィール情報を取得
  const { data: profile, error: profileError } = await supabase
    .from('viewers')
    .select('*')
    .eq('email', user.email || '')
    .single();

  if (profileError) throw new Error('プロフィール情報の取得に失敗しました');

  return {
    profile,
    notifications: {
      email_notifications: true,
      marketing_emails: false,
      security_alerts: true,
      weekly_reports: true
    } as NotificationSettings,
    security: {
      two_factor_enabled: false,
      login_alerts: true,
      session_timeout: 30
    } as SecuritySettings
  };
};

export default function SettingsPage() {
  const { data, loading, error, refetch } = usePageData({
    fetchFn: fetchUserData,
    initialData: null
  });

  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    profile: {
      id: '',
      email: '',
      company_name: '',
      full_name: '',
      position: '',
      phone: '',
      case_id: '',
      tenant_id: '',
      created_at: ''
    },
    notifications: {
      email_notifications: true,
      marketing_emails: false,
      security_alerts: true,
      weekly_reports: true
    },
    security: {
      two_factor_enabled: false,
      login_alerts: true,
      session_timeout: 30
    }
  });

  // データが読み込まれたらフォームデータを更新
  if (data && Object.keys(formData.profile).length === 0) {
    setFormData({
      profile: data.profile,
      notifications: data.notifications,
      security: data.security
    });
  }

  const handleSave = async () => {
    if (!data) return;
    
    try {
      setSaving(true);
      const supabase = createClient();

      if (activeTab === 'profile') {
        const { error } = await supabase
          .from('viewers')
          .update({
            company_name: formData.profile.company_name,
            full_name: formData.profile.full_name,
            position: formData.profile.position,
            phone: formData.profile.phone,
          })
          .eq('id', formData.profile.id);

        if (error) throw error;
      }

      // 通知設定とセキュリティ設定は実際のテーブルがないため、
      // ここではローカル状態のみ更新
      
      await refetch();
      alert('設定が保存されました');
    } catch (error) {
      console.error('Settings save error:', error);
      alert('設定の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="設定を読み込み中..." />;
  }

  if (error) {
    return (
      <ErrorState 
        message={error}
        onRetry={refetch}
      />
    );
  }

  if (!data) return null;

  const tabs = [
    { id: 'profile', label: 'プロフィール', icon: User },
    { id: 'notifications', label: '通知設定', icon: Bell },
    { id: 'security', label: 'セキュリティ', icon: Shield }
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <PageHeader
          title="設定"
          subtitle="アカウント設定と環境設定を管理"
          icon={Settings}
        />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* サイドバー */}
          <div className="lg:w-64">
            <Card className="bg-white shadow-sm border">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* メインコンテンツ */}
          <div className="flex-1">
            <Card className="bg-white shadow-sm border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {(() => {
                    const Icon = tabs.find(tab => tab.id === activeTab)?.icon || Settings;
                    return <Icon className="h-5 w-5" />;
                  })()}
                  <span>{tabs.find(tab => tab.id === activeTab)?.label}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="company_name">会社名 *</Label>
                        <Input
                          id="company_name"
                          value={formData.profile.company_name || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            profile: { ...prev.profile, company_name: e.target.value }
                          }))}
                          placeholder="株式会社サンプル"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="full_name">氏名 *</Label>
                        <Input
                          id="full_name"
                          value={formData.profile.full_name || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            profile: { ...prev.profile, full_name: e.target.value }
                          }))}
                          placeholder="山田 太郎"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="position">役職</Label>
                        <Input
                          id="position"
                          value={formData.profile.position || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            profile: { ...prev.profile, position: e.target.value }
                          }))}
                          placeholder="営業部長"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">電話番号</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.profile.phone || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            profile: { ...prev.profile, phone: e.target.value }
                          }))}
                          placeholder="03-1234-5678"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">メールアドレス</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.profile.email || ''}
                          disabled
                          className="bg-gray-50"
                        />
                        <p className="text-xs text-gray-500">メールアドレスは変更できません</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">メール通知</h4>
                          <p className="text-sm text-gray-500">重要な更新をメールで受け取る</p>
                        </div>
                        <Switch
                          checked={formData.notifications.email_notifications}
                          onCheckedChange={(checked) => setFormData(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, email_notifications: checked }
                          }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">マーケティングメール</h4>
                          <p className="text-sm text-gray-500">新機能やキャンペーン情報を受け取る</p>
                        </div>
                        <Switch
                          checked={formData.notifications.marketing_emails}
                          onCheckedChange={(checked) => setFormData(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, marketing_emails: checked }
                          }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">セキュリティアラート</h4>
                          <p className="text-sm text-gray-500">不審なアクティビティを検出した際の通知</p>
                        </div>
                        <Switch
                          checked={formData.notifications.security_alerts}
                          onCheckedChange={(checked) => setFormData(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, security_alerts: checked }
                          }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">週次レポート</h4>
                          <p className="text-sm text-gray-500">アクティビティの週次サマリーを受け取る</p>
                        </div>
                        <Switch
                          checked={formData.notifications.weekly_reports}
                          onCheckedChange={(checked) => setFormData(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, weekly_reports: checked }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">二要素認証</h4>
                          <p className="text-sm text-gray-500">アカウントのセキュリティを強化</p>
                        </div>
                        <Switch
                          checked={formData.security.two_factor_enabled}
                          onCheckedChange={(checked) => setFormData(prev => ({
                            ...prev,
                            security: { ...prev.security, two_factor_enabled: checked }
                          }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">ログインアラート</h4>
                          <p className="text-sm text-gray-500">新しいデバイスからのログインを通知</p>
                        </div>
                        <Switch
                          checked={formData.security.login_alerts}
                          onCheckedChange={(checked) => setFormData(prev => ({
                            ...prev,
                            security: { ...prev.security, login_alerts: checked }
                          }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="session_timeout">セッションタイムアウト（分）</Label>
                        <Input
                          id="session_timeout"
                          type="number"
                          min="5"
                          max="120"
                          value={formData.security.session_timeout}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            security: { ...prev.security, session_timeout: parseInt(e.target.value) || 30 }
                          }))}
                        />
                        <p className="text-xs text-gray-500">5分から120分の間で設定してください</p>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-4">パスワード変更</h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current_password">現在のパスワード</Label>
                          <div className="relative">
                            <Input
                              id="current_password"
                              type={showPassword ? "text" : "password"}
                              placeholder="現在のパスワードを入力"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="new_password">新しいパスワード</Label>
                          <Input
                            id="new_password"
                            type={showPassword ? "text" : "password"}
                            placeholder="新しいパスワードを入力"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirm_password">パスワード確認</Label>
                          <Input
                            id="confirm_password"
                            type={showPassword ? "text" : "password"}
                            placeholder="新しいパスワードを再入力"
                          />
                        </div>

                        <Button variant="outline" className="w-full">
                          パスワードを変更
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-6 border-t">
                  <Button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? '保存中...' : '設定を保存'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
