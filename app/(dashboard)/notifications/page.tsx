'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Users, 
  Eye,
  Settings,
  Save,
  Smartphone,
  Clock,
  Star,
  AlertCircle
} from 'lucide-react';

interface NotificationSettings {
  email: {
    newViewer: boolean;
    aiQuestion: boolean;
    highInterest: boolean;
    dailySummary: boolean;
    weeklySummary: boolean;
  };
  push: {
    newViewer: boolean;
    aiQuestion: boolean;
    highInterest: boolean;
  };
  frequency: {
    immediate: boolean;
    hourly: boolean;
    daily: boolean;
  };
  thresholds: {
    highInterestViews: number;
    dailyViewerLimit: number;
  };
  emailAddress: string;
}

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      newViewer: true,
      aiQuestion: true,
      highInterest: true,
      dailySummary: false,
      weeklySummary: true,
    },
    push: {
      newViewer: false,
      aiQuestion: true,
      highInterest: true,
    },
    frequency: {
      immediate: true,
      hourly: false,
      daily: false,
    },
    thresholds: {
      highInterestViews: 5,
      dailyViewerLimit: 10,
    },
    emailAddress: 'admin@example.com',
  });

  const [saving, setSaving] = useState(false);

  const updateEmailSetting = (key: keyof NotificationSettings['email'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      email: { ...prev.email, [key]: value }
    }));
  };

  const updatePushSetting = (key: keyof NotificationSettings['push'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      push: { ...prev.push, [key]: value }
    }));
  };

  const updateFrequency = (key: keyof NotificationSettings['frequency']) => {
    setSettings(prev => ({
      ...prev,
      frequency: {
        immediate: key === 'immediate',
        hourly: key === 'hourly',
        daily: key === 'daily',
      }
    }));
  };

  const updateThreshold = (key: keyof NotificationSettings['thresholds'], value: number) => {
    setSettings(prev => ({
      ...prev,
      thresholds: { ...prev.thresholds, [key]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // ここで設定をサーバーに保存
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模擬的な保存処理
      console.log('設定を保存しました:', settings);
    } catch (error) {
      console.error('設定保存エラー:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">通知設定</h1>
          <p className="text-gray-600 mt-2">重要なイベントの通知設定を管理</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? '保存中...' : '設定を保存'}
        </Button>
      </div>

      {/* メール通知設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            メール通知
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="email-address">通知先メールアドレス</Label>
            <Input
              id="email-address"
              type="email"
              value={settings.emailAddress}
              onChange={(e) => setSettings(prev => ({ ...prev, emailAddress: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">新規閲覧者登録</p>
                  <p className="text-sm text-gray-600">新しい閲覧者が登録された時</p>
                </div>
              </div>
              <Switch
                checked={settings.email.newViewer}
                onCheckedChange={(checked: boolean) => updateEmailSetting('newViewer', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">AI質問投稿</p>
                  <p className="text-sm text-gray-600">閲覧者がAIに質問した時</p>
                </div>
              </div>
              <Switch
                checked={settings.email.aiQuestion}
                onCheckedChange={(checked: boolean) => updateEmailSetting('aiQuestion', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium">高関心度閲覧者</p>
                  <p className="text-sm text-gray-600">閲覧回数が設定値を超えた時</p>
                </div>
              </div>
              <Switch
                checked={settings.email.highInterest}
                onCheckedChange={(checked: boolean) => updateEmailSetting('highInterest', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium">日次サマリー</p>
                  <p className="text-sm text-gray-600">1日の活動をまとめて送信</p>
                </div>
              </div>
              <Switch
                checked={settings.email.dailySummary}
                onCheckedChange={(checked: boolean) => updateEmailSetting('dailySummary', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium">週次サマリー</p>
                  <p className="text-sm text-gray-600">1週間の活動をまとめて送信</p>
                </div>
              </div>
              <Switch
                checked={settings.email.weeklySummary}
                onCheckedChange={(checked: boolean) => updateEmailSetting('weeklySummary', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* プッシュ通知設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="w-5 h-5 mr-2" />
            プッシュ通知
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium">新規閲覧者登録</p>
                <p className="text-sm text-gray-600">新しい閲覧者が登録された時</p>
              </div>
            </div>
            <Switch
              checked={settings.push.newViewer}
              onCheckedChange={(checked: boolean) => updatePushSetting('newViewer', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium">AI質問投稿</p>
                <p className="text-sm text-gray-600">閲覧者がAIに質問した時</p>
              </div>
            </div>
            <Switch
              checked={settings.push.aiQuestion}
              onCheckedChange={(checked: boolean) => updatePushSetting('aiQuestion', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Star className="w-5 h-5 text-red-500" />
              <div>
                <p className="font-medium">高関心度閲覧者</p>
                <p className="text-sm text-gray-600">閲覧回数が設定値を超えた時</p>
              </div>
            </div>
            <Switch
              checked={settings.push.highInterest}
              onCheckedChange={(checked: boolean) => updatePushSetting('highInterest', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 通知頻度設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            通知頻度
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="immediate"
                name="frequency"
                checked={settings.frequency.immediate}
                onChange={() => updateFrequency('immediate')}
                className="w-4 h-4 text-blue-600"
              />
              <Label htmlFor="immediate" className="flex-1">
                <div>
                  <p className="font-medium">即座に通知</p>
                  <p className="text-sm text-gray-600">イベント発生時にすぐに通知</p>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="hourly"
                name="frequency"
                checked={settings.frequency.hourly}
                onChange={() => updateFrequency('hourly')}
                className="w-4 h-4 text-blue-600"
              />
              <Label htmlFor="hourly" className="flex-1">
                <div>
                  <p className="font-medium">1時間ごと</p>
                  <p className="text-sm text-gray-600">1時間分のイベントをまとめて通知</p>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="daily"
                name="frequency"
                checked={settings.frequency.daily}
                onChange={() => updateFrequency('daily')}
                className="w-4 h-4 text-blue-600"
              />
              <Label htmlFor="daily" className="flex-1">
                <div>
                  <p className="font-medium">1日1回</p>
                  <p className="text-sm text-gray-600">1日分のイベントをまとめて通知</p>
                </div>
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 閾値設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            通知条件設定
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="high-interest-threshold">高関心度の閾値（閲覧回数）</Label>
            <Input
              id="high-interest-threshold"
              type="number"
              min="1"
              max="50"
              value={settings.thresholds.highInterestViews}
              onChange={(e) => updateThreshold('highInterestViews', parseInt(e.target.value) || 5)}
              className="mt-1 w-32"
            />
            <p className="text-sm text-gray-600 mt-1">
              この回数以上閲覧した閲覧者を高関心度として通知
            </p>
          </div>

          <div>
            <Label htmlFor="daily-viewer-limit">日次通知の上限（新規閲覧者数）</Label>
            <Input
              id="daily-viewer-limit"
              type="number"
              min="1"
              max="100"
              value={settings.thresholds.dailyViewerLimit}
              onChange={(e) => updateThreshold('dailyViewerLimit', parseInt(e.target.value) || 10)}
              className="mt-1 w-32"
            />
            <p className="text-sm text-gray-600 mt-1">
              1日にこの人数を超える新規閲覧者がいた場合は特別通知
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 注意事項 */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-orange-900 mb-2">通知設定について</h3>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• 通知設定の変更は即座に反映されます</li>
                <li>• メール通知にはメールアドレスの確認が必要です</li>
                <li>• プッシュ通知はブラウザの許可が必要です</li>
                <li>• 高頻度の通知は重要な情報を見逃す可能性があります</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
