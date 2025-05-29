'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  User, 
  Building2, 
  Shield, 
  Bell, 
  Database,
  Key,
  Mail,
  Phone,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  // 追加フィールド（実際のテーブルにない場合はローカル状態で管理）
  company_name?: string;
  position?: string;
  phone?: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  new_inquiries: boolean;
  ai_questions: boolean;
  weekly_reports: boolean;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    new_inquiries: true,
    ai_questions: true,
    weekly_reports: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // プロフィール情報を取得（実際のテーブル構造に合わせて調整）
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Profile fetch error:', error);
      } else if (userData) {
        setProfile(userData);
      } else {
        // ユーザーデータが存在しない場合のデフォルト値
        setProfile({
          id: session.user.id,
          email: session.user.email || '',
          full_name: null,
          role: '',
          tenant_id: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Settings fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      const supabase = createClient();

      // usersテーブルの実際のフィールドのみ更新
      const { error } = await supabase
        .from('users')
        .update({
          full_name: profile.full_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'プロフィールを更新しました' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ type: 'error', text: 'プロフィールの更新に失敗しました' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      setSaving(true);
      // 通知設定の更新ロジック（実装に応じて調整）
      setMessage({ type: 'success', text: '通知設定を更新しました' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Notification update error:', error);
      setMessage({ type: 'error', text: '通知設定の更新に失敗しました' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">設定を読み込み中...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Settings className="h-6 w-6 mr-2 text-gray-600" />
                設定
              </h1>
              <p className="text-gray-600 mt-1">アカウント情報と通知設定の管理</p>
            </div>
            {message && (
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">{message.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* プロフィール設定 */}
        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              プロフィール情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, email: e.target.value } : null)}
                    className="pl-10"
                    disabled
                  />
                </div>
                <p className="text-xs text-gray-500">メールアドレスは変更できません</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">氏名</Label>
                <Input
                  id="full_name"
                  value={profile?.full_name || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                  placeholder="山田 太郎"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name">会社名</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="company_name"
                    value={profile?.company_name || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, company_name: e.target.value } : null)}
                    className="pl-10"
                    placeholder="株式会社サンプル"
                    disabled
                  />
                </div>
                <p className="text-xs text-gray-500">会社名は現在編集できません</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">役職</Label>
                <Input
                  id="position"
                  value={profile?.position || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, position: e.target.value } : null)}
                  placeholder="営業部長"
                  disabled
                />
                <p className="text-xs text-gray-500">役職は現在編集できません</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="phone">電話番号</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="phone"
                    value={profile?.phone || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                    className="pl-10"
                    placeholder="03-1234-5678"
                    disabled
                  />
                </div>
                <p className="text-xs text-gray-500">電話番号は現在編集できません</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleProfileUpdate}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? '保存中...' : 'プロフィールを保存'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 通知設定 */}
        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-orange-600" />
              通知設定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">メール通知</p>
                  <p className="text-sm text-gray-600">重要な更新をメールで受け取る</p>
                </div>
                <Switch
                  checked={notifications.email_notifications}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, email_notifications: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">新規問い合わせ通知</p>
                  <p className="text-sm text-gray-600">新しい問い合わせが届いた時に通知</p>
                </div>
                <Switch
                  checked={notifications.new_inquiries}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, new_inquiries: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">AI質問通知</p>
                  <p className="text-sm text-gray-600">新しいAI質問が投稿された時に通知</p>
                </div>
                <Switch
                  checked={notifications.ai_questions}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, ai_questions: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">週次レポート</p>
                  <p className="text-sm text-gray-600">週次アクティビティレポートを受け取る</p>
                </div>
                <Switch
                  checked={notifications.weekly_reports}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, weekly_reports: checked }))
                  }
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleNotificationUpdate}
                disabled={saving}
                variant="outline"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? '保存中...' : '通知設定を保存'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* セキュリティ設定 */}
        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-red-600" />
              セキュリティ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">APIキー</p>
                  <p className="text-sm text-gray-600">外部システム連携用のAPIキー</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value="sk-1234567890abcdef1234567890abcdef"
                      readOnly
                      className="w-64 pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button variant="outline" size="sm">
                    <Key className="h-4 w-4 mr-2" />
                    再生成
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">パスワード変更</p>
                  <p className="text-sm text-gray-600">定期的なパスワード変更を推奨します</p>
                </div>
                <Button variant="outline">
                  パスワードを変更
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* システム情報 */}
        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-green-600" />
              システム情報
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">アカウント作成日</p>
                <p className="text-lg font-semibold text-gray-900">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ja-JP') : '-'}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">最終更新日</p>
                <p className="text-lg font-semibold text-gray-900">
                  {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString('ja-JP') : '-'}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">アカウント状態</p>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  アクティブ
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
