'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Play, 
  RefreshCw, 
  Download,
  Eye,
  Activity,
  Target
} from 'lucide-react';

interface TestResult {
  pattern: string;
  category: string;
  detected: boolean;
  response?: string;
  timestamp: string;
}

interface SecurityReport {
  summary: {
    totalTests: number;
    detectedAttacks: number;
    missedAttacks: number;
    detectionRate: number;
  };
  byCategory: Record<string, {
    total: number;
    detected: number;
    missed: number;
    detectionRate: number;
  }>;
  failedTests: Array<{
    pattern: string;
    category: string;
    response?: string;
  }>;
}

interface SecurityStatus {
  riskScore: number;
  status: string;
  recommendations: string[];
  incidents: {
    injectionAttempts: number;
    highRiskContent: number;
    approvalRequired: number;
    outputFiltered: number;
  };
}

export default function SecurityTestDashboard() {
  const [testResults, setTestResults] = useState<SecurityReport | null>(null);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [availablePatterns, setAvailablePatterns] = useState<string[]>([]);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);

  // 利用可能なテストパターンを取得
  useEffect(() => {
    fetchAvailablePatterns();
    fetchSecurityStatus();
  }, []);

  const fetchAvailablePatterns = async () => {
    try {
      const response = await fetch('/api/security-test?action=get_test_patterns');
      const data = await response.json();
      if (data.success) {
        setAvailablePatterns(data.patterns);
      }
    } catch (error) {
      console.error('パターン取得エラー:', error);
    }
  };

  const fetchSecurityStatus = async () => {
    try {
      const response = await fetch('/api/security-test?action=get_security_status');
      const data = await response.json();
      if (data.success) {
        setSecurityStatus(data.report);
      }
    } catch (error) {
      console.error('セキュリティ状態取得エラー:', error);
    }
  };

  const runSecurityTest = async (testType: string = 'all') => {
    setIsRunning(true);
    try {
      const response = await fetch('/api/security-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'run_injection_tests',
          testType: testType === 'all' ? undefined : testType
        })
      });

      const data = await response.json();
      if (data.success) {
        setTestResults(data.report);
        await fetchSecurityStatus(); // セキュリティ状態を更新
      } else {
        console.error('テスト実行エラー:', data.error);
      }
    } catch (error) {
      console.error('テスト実行エラー:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const exportResults = () => {
    if (!testResults) return;
    
    const exportData = {
      timestamp: new Date().toISOString(),
      testResults,
      securityStatus
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-test-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryDisplayName = (category: string) => {
    const names: Record<string, string> = {
      directInjection: '直接インジェクション',
      encodingAttacks: 'エンコーディング攻撃',
      htmlInjection: 'HTMLインジェクション',
      markdownInjection: 'マークダウンインジェクション',
      roleChange: 'ロール変更攻撃',
      informationExtraction: '情報抽出攻撃',
      bypassAttempts: '制限回避攻撃',
      indirectInjection: '間接インジェクション',
      socialEngineering: 'ソーシャルエンジニアリング'
    };
    return names[category] || category;
  };

  return (
    <div className="space-y-6 p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" />
            セキュリティテストダッシュボード
          </h1>
          <p className="text-gray-600 mt-2">
            AIチャット機能のプロンプトインジェクション対策をテストします
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => fetchSecurityStatus()}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            更新
          </Button>
          {testResults && (
            <Button
              onClick={exportResults}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              結果をエクスポート
            </Button>
          )}
        </div>
      </div>

      {/* 開発環境警告 */}
      <Alert>
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          このダッシュボードは開発環境でのみ利用可能です。本番環境では表示されません。
        </AlertDescription>
      </Alert>

      {/* セキュリティ状態概要 */}
      {securityStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4" />
                リスクスコア
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityStatus.riskScore.toFixed(1)}</div>
              <Badge className={getStatusColor(securityStatus.status)}>
                {securityStatus.status.toUpperCase()}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                インジェクション試行
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityStatus.incidents.injectionAttempts}</div>
              <p className="text-xs text-gray-600">過去24時間</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Eye className="w-4 h-4" />
                高リスクコンテンツ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityStatus.incidents.highRiskContent}</div>
              <p className="text-xs text-gray-600">検出数</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4" />
                フィルタ済み出力
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityStatus.incidents.outputFiltered}</div>
              <p className="text-xs text-gray-600">ブロック数</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* テスト実行コントロール */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            セキュリティテスト実行
          </CardTitle>
          <CardDescription>
            プロンプトインジェクション攻撃パターンをテストして、セキュリティ対策の効果を確認します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              onClick={() => runSecurityTest('all')}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isRunning ? 'テスト実行中...' : '全テスト実行'}
            </Button>
            {availablePatterns.map(pattern => (
              <Button
                key={pattern}
                onClick={() => runSecurityTest(pattern)}
                disabled={isRunning}
                variant="outline"
                size="sm"
              >
                {getCategoryDisplayName(pattern)}
              </Button>
            ))}
          </div>
          {isRunning && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              セキュリティテストを実行中です...
            </div>
          )}
        </CardContent>
      </Card>

      {/* テスト結果 */}
      {testResults && (
        <div className="space-y-4">
          {/* 結果サマリー */}
          <Card>
            <CardHeader>
              <CardTitle>テスト結果サマリー</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{testResults.summary.totalTests}</div>
                  <div className="text-sm text-gray-600">総テスト数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{testResults.summary.detectedAttacks}</div>
                  <div className="text-sm text-gray-600">検出成功</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{testResults.summary.missedAttacks}</div>
                  <div className="text-sm text-gray-600">検出失敗</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{testResults.summary.detectionRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">検出率</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* カテゴリ別結果 */}
          <Card>
            <CardHeader>
              <CardTitle>カテゴリ別結果</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(testResults.byCategory).map(([category, stats]) => (
                  <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{getCategoryDisplayName(category)}</div>
                      <div className="text-sm text-gray-600">
                        {stats.total}件のテスト
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">{stats.detected}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-red-600">{stats.missed}</span>
                      </div>
                      <Badge variant={stats.detectionRate >= 90 ? 'default' : 'destructive'}>
                        {stats.detectionRate.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 失敗したテスト */}
          {testResults.failedTests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  検出に失敗したテスト ({testResults.failedTests.length}件)
                </CardTitle>
                <CardDescription>
                  これらの攻撃パターンは検出されませんでした。セキュリティ対策の強化が必要です。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {testResults.failedTests.map((test, index) => (
                    <div key={index} className="border border-red-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="destructive" className="text-xs">
                          {getCategoryDisplayName(test.category)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedTest(expandedTest === `failed-${index}` ? null : `failed-${index}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-sm font-mono bg-gray-50 p-2 rounded">
                        {test.pattern}
                      </div>
                      {expandedTest === `failed-${index}` && test.response && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>応答:</strong> {test.response}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 推奨事項 */}
      {securityStatus && securityStatus.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>セキュリティ推奨事項</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {securityStatus.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
