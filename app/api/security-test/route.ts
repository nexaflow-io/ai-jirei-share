import { NextRequest, NextResponse } from 'next/server';
import { PromptInjectionFilter, OutputValidator, HITLController } from '@/lib/prompt-security';
import { SecurityTester, INJECTION_TEST_PATTERNS, SecurityAuditLogger, SecurityMetrics } from '@/lib/security-tests';

/**
 * セキュリティテスト用APIエンドポイント
 * 開発環境でのみ利用可能
 */

export async function POST(request: NextRequest) {
  // 開発環境でのみ実行を許可
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'セキュリティテストは開発環境でのみ利用可能です' },
      { status: 403 }
    );
  }

  try {
    const { action, testType } = await request.json();

    switch (action) {
      case 'run_injection_tests':
        return await runInjectionTests(testType);
      
      case 'test_single_pattern':
        const { pattern, category } = await request.json();
        return await testSinglePattern(pattern, category);
      
      case 'get_security_report':
        return await getSecurityReport();
      
      case 'clear_test_results':
        return await clearTestResults();
      
      default:
        return NextResponse.json(
          { error: '不正なアクションです' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('セキュリティテストエラー:', error);
    return NextResponse.json(
      { error: 'セキュリティテストの実行中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * プロンプトインジェクションテストを実行
 */
async function runInjectionTests(testType?: string) {
  const filter = new PromptInjectionFilter();
  const outputValidator = new OutputValidator();
  const hitlController = new HITLController();
  const tester = new SecurityTester();
  const auditLogger = SecurityAuditLogger.getInstance();

  // テスト関数を定義
  const testFunction = async (input: string): Promise<{ detected: boolean; response?: string }> => {
    try {
      // 入力検証（インジェクション攻撃検出）
      const isInjection = filter.detectInjection(input);
      if (isInjection) {
        auditLogger.log('injection_attempt', {
          input,
          reason: 'プロンプトインジェクション攻撃を検出',
          riskScore: 10
        });
        return { detected: true, response: '入力検証で検出: プロンプトインジェクション攻撃' };
      }

      // 高リスクコンテンツチェック
      const isHighRisk = filter.detectHighRisk(input);
      if (isHighRisk) {
        auditLogger.log('high_risk_content', {
          input,
          riskScore: 8,
          reasons: ['高リスクコンテンツ']
        });
        return { detected: true, response: '高リスクコンテンツとして検出' };
      }

      // 人間による承認が必要かチェック
      const requiresApproval = hitlController.requiresApproval(input);
      if (requiresApproval) {
        auditLogger.log('approval_required', {
          input,
          reason: '人間による承認が必要'
        });
        return { detected: true, response: '人間による承認が必要なコンテンツとして検出' };
      }

      // 模擬AI応答（実際のAI呼び出しは行わない）
      const mockResponse = `これは「${input}」に対する模擬AI応答です。`;

      // 出力検証
      const isValidOutput = outputValidator.validateOutput(mockResponse);
      if (!isValidOutput) {
        auditLogger.log('output_filtered', {
          input,
          output: mockResponse,
          reason: '出力検証で問題を検出'
        });
        return { detected: true, response: '出力検証で検出: 問題のある応答' };
      }

      return { detected: false, response: mockResponse };
    } catch (error) {
      console.error('テスト実行エラー:', error);
      return { detected: false, response: `テスト実行エラー: ${error instanceof Error ? error.message : '不明なエラー'}` };
    }
  };

  // 指定されたテストタイプまたは全テストを実行
  if (testType && INJECTION_TEST_PATTERNS[testType as keyof typeof INJECTION_TEST_PATTERNS]) {
    const patterns = INJECTION_TEST_PATTERNS[testType as keyof typeof INJECTION_TEST_PATTERNS];
    for (const pattern of patterns) {
      await tester.testPattern(pattern, testType, testFunction);
    }
  } else {
    await tester.runAllTests(testFunction);
  }

  const report = tester.generateReport();

  return NextResponse.json({
    success: true,
    testType: testType || 'all',
    report,
    timestamp: new Date().toISOString()
  });
}

/**
 * 単一パターンのテスト
 */
async function testSinglePattern(pattern: string, category: string) {
  const filter = new PromptInjectionFilter();
  const outputValidator = new OutputValidator();
  const hitlController = new HITLController();

  try {
    // 入力検証（インジェクション攻撃検出）
    const isInjection = filter.detectInjection(pattern);
    
    // 高リスクコンテンツチェック
    const isHighRisk = filter.detectHighRisk(pattern);
    
    // 人間による承認が必要かチェック
    const requiresApproval = hitlController.requiresApproval(pattern);
    
    // 模擬AI応答
    const mockResponse = `これは「${pattern}」に対する模擬AI応答です。`;
    
    // 出力検証
    const isValidOutput = outputValidator.validateOutput(mockResponse);

    const result = {
      pattern,
      category,
      isInjection,
      isHighRisk,
      requiresApproval,
      isValidOutput,
      detected: isInjection || isHighRisk || requiresApproval || !isValidOutput,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * セキュリティレポートを取得
 */
async function getSecurityReport() {
  const auditLogger = SecurityAuditLogger.getInstance();
  const securityReport = SecurityMetrics.generateSecurityReport(auditLogger);
  
  const recentLogs = auditLogger.getRecentLogs(24);
  
  return NextResponse.json({
    success: true,
    report: securityReport,
    recentActivity: {
      totalLogs: recentLogs.length,
      logsByType: {
        injection_attempt: auditLogger.getLogsByType('injection_attempt').length,
        high_risk_content: auditLogger.getLogsByType('high_risk_content').length,
        approval_required: auditLogger.getLogsByType('approval_required').length,
        output_filtered: auditLogger.getLogsByType('output_filtered').length
      }
    },
    timestamp: new Date().toISOString()
  });
}

/**
 * テスト結果をクリア
 */
async function clearTestResults() {
  // 実際のプロダクションでは永続化されたテスト結果をクリア
  return NextResponse.json({
    success: true,
    message: 'テスト結果がクリアされました',
    timestamp: new Date().toISOString()
  });
}

export async function GET(request: NextRequest) {
  // 開発環境でのみ実行を許可
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'セキュリティテストは開発環境でのみ利用可能です' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'get_test_patterns':
      return NextResponse.json({
        success: true,
        patterns: Object.keys(INJECTION_TEST_PATTERNS),
        patternCounts: Object.fromEntries(
          Object.entries(INJECTION_TEST_PATTERNS).map(([key, patterns]) => [key, patterns.length])
        )
      });
    
    case 'get_security_status':
      return await getSecurityReport();
    
    default:
      return NextResponse.json({
        success: true,
        message: 'セキュリティテストAPI',
        availableActions: [
          'run_injection_tests',
          'test_single_pattern', 
          'get_security_report',
          'clear_test_results'
        ],
        availablePatterns: Object.keys(INJECTION_TEST_PATTERNS)
      });
  }
}
