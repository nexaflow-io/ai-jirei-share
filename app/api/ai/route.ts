import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createAdminClient } from '@/lib/supabase/server';
import { 
  PromptInjectionFilter, 
  OutputValidator, 
  HITLController,
  generateSecureSystemPrompt
} from '@/lib/prompt-security';

// キャッシュ無効化
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    // リクエストボディからデータを取得
    const requestBody = await req.json();
    console.log('AI API Request Body:', JSON.stringify(requestBody, null, 2));
    
    const { caseId, viewerId, messages, tenantId } = requestBody;

    // messagesから最新のユーザーメッセージを取得
    let question = '';
    if (messages && messages.length > 0) {
      const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
      if (lastUserMessage) {
        question = lastUserMessage.content;
      }
    }

    console.log('Extracted parameters:', {
      caseId: caseId || 'missing',
      tenantId: tenantId || 'missing',
      viewerId: viewerId || 'missing',
      question: question || 'missing',
      messagesLength: messages?.length || 0
    });

    // 必須パラメータの検証
    if (!caseId || !question) {
      console.error('Missing required parameters:', {
        caseId: !!caseId,
        question: !!question,
        tenantId: !!tenantId,
        requestBody: JSON.stringify(requestBody, null, 2)
      });
      
      return new Response(
        JSON.stringify({ 
          error: '必須パラメータが不足しています',
          details: {
            caseId: !caseId ? 'missing' : 'present',
            question: !question ? 'missing' : 'present'
          }
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // セキュリティチェック1: プロンプトインジェクション検出
    if (new PromptInjectionFilter().detectInjection(question)) {
      console.warn('プロンプトインジェクション攻撃を検出:', { 
        question: question.substring(0, 100),
        viewerId,
        caseId,
        timestamp: new Date().toISOString()
      });
      
      return new Response(
        JSON.stringify({ 
          error: '申し訳ございませんが、運用ガイドラインに反するリクエストは処理できません。' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // セキュリティチェック2: 高リスクコンテンツ検出
    if (new PromptInjectionFilter().detectHighRisk(question)) {
      console.warn('高リスクコンテンツを検出:', { 
        question: question.substring(0, 100),
        viewerId,
        caseId,
        timestamp: new Date().toISOString()
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'ご質問の内容を確認中です。しばらくお待ちください。' 
        }),
        { 
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // セキュリティチェック3: 人間による承認が必要かチェック
    if (new HITLController().requiresApproval(question)) {
      console.warn('人間による承認が必要:', { 
        question: question.substring(0, 100),
        viewerId,
        caseId,
        timestamp: new Date().toISOString()
      });
      
      return new Response(
        JSON.stringify({ 
          error: new HITLController().getApprovalMessage()
        }),
        { 
          status: 202,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 入力をサニタイズ
    const sanitizedQuestion = new PromptInjectionFilter().sanitizeInput(question);
    
    // Base64エンコーディングをチェック・デコード
    const processedQuestion = new PromptInjectionFilter().detectAndDecodeBase64(sanitizedQuestion);

    // Supabaseクライアントを作成
    const supabase = createAdminClient();

    // caseIdが"general"の場合は事例集全体への質問として処理
    if (caseId === 'general') {
      // テナントIDが必要
      if (!tenantId) {
        return new Response(
          JSON.stringify({ error: 'テナントIDが必要です' }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // テナントの公開事例を取得
      const { data: tenantCases, error: tenantError } = await supabase
        .from('construction_cases')
        .select('id, name, description, category')
        .eq('tenant_id', tenantId)
        .eq('is_published', true);

      if (tenantError || !tenantCases || tenantCases.length === 0) {
        return new Response(
          JSON.stringify({ error: '公開されている事例が見つかりません' }),
          { 
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // テナント情報を取得
      const { data: tenantData, error: tenantDataError } = await supabase
        .from('tenants')
        .select('name')
        .eq('id', tenantId)
        .single();

      if (tenantDataError || !tenantData) {
        return new Response(
          JSON.stringify({ error: 'テナント情報が見つかりません' }),
          { 
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // 事例集全体のコンテキストを作成
      const casesContext = tenantCases.map(c => 
        `事例名: ${c.name}\nカテゴリ: ${c.category}\n説明: ${c.description}`
      ).join('\n\n');

      // レート制限チェック（事例集用）
      let remainingQuestions = 10;
      if (viewerId) {
        const thirtySecondsAgo = new Date();
        thirtySecondsAgo.setSeconds(thirtySecondsAgo.getSeconds() - 30);
        
        const { count } = await supabase
          .from('ai_questions')
          .select('id', { count: 'exact' })
          .eq('viewer_id', viewerId)
          .gte('created_at', thirtySecondsAgo.toISOString());

        if (count && count >= 10) {
          return new Response(
            JSON.stringify({ error: '質問の頻度が高すぎます。30秒後に再試行してください。' }),
            { 
              status: 429,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      }

      // メッセージ履歴を構築（事例集用）
      const chatMessages = [
        { 
          role: 'system' as const, 
          content: `あなたは建設業界の専門AIアシスタントです。${tenantData.name}の施工事例集について質問に答えてください。

事例集の情報:
${casesContext}

回答時の注意点:
1. この事例集に含まれる事例に関連する内容のみ回答してください
2. 具体的で実用的な情報を提供してください
3. 専門用語は分かりやすく説明してください
4. 回答は簡潔で読みやすくしてください
5. 不明な点は素直に「分からない」と答えてください
6. 事例集全体の傾向や特徴について説明することもできます`
        },
        ...(messages || []),
        { 
          role: 'user' as const, 
          content: processedQuestion 
        }
      ];

      // Vercel AI SDKを使用してストリーミングレスポンスを生成
      const result = await streamText({
        model: openai('gpt-4o-mini'),
        messages: chatMessages,
        temperature: 0.7,
        maxTokens: 1000,
        onFinish: async (result) => {
          console.log('AI応答完了 - 保存処理開始:', {
            viewerId,
            tenantId,
            hasResult: !!result.text,
            resultLength: result.text?.length || 0
          });
          
          if (viewerId && result.text) {
            try {
              const insertData = {
                case_id: '00000000-0000-0000-0000-000000000000', // 事例集全体への質問を示す特別なUUID
                tenant_id: tenantId,
                viewer_id: viewerId,
                question: processedQuestion,
                answer: result.text,
                model_used: 'gpt-4o-mini',
              };
              
              console.log('AI質問保存データ:', insertData);
              
              const { data, error } = await supabase.from('ai_questions').insert(insertData);
              
              if (error) {
                console.error('AI質問保存エラー:', error);
              } else {
                console.log('AI質問保存成功:', data);
              }
            } catch (error) {
              console.error('AI質問の保存に失敗しました:', error);
            }
          } else {
            console.warn('AI質問保存スキップ:', { viewerId, hasResult: !!result.text });
          }
        },
      });

      return result.toDataStreamResponse();
    }

    // 事例データを取得（セキュリティチェック付き）
    const { data: caseData, error: caseError } = await supabase
      .from('construction_cases')
      .select(`
        id, 
        name, 
        description, 
        category, 
        tenant_id, 
        is_published,
        result,
        solution,
        created_at,
        updated_at
      `)
      .eq('id', caseId)
      .eq('tenant_id', tenantId) // テナントIDを必須条件に追加
      .eq('is_published', true) // 公開されている事例のみ
      .single();

    // 事例データの検証（テナント分離の徹底）
    if (caseError || !caseData) {
      console.log('指定されたテナントの事例データが見つかりません:', { 
        caseId, 
        tenantId,
        error: caseError?.message 
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'ご指定の事例が見つかりません。公開されている事例のみアクセス可能です。' 
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const currentCase = caseData;

    // 二重チェック：テナントIDの厳密な検証
    if (currentCase.tenant_id !== tenantId) {
      console.error('テナントID検証エラー:', { 
        requestTenantId: tenantId, 
        caseTenantId: currentCase.tenant_id,
        caseId,
        viewerId,
        timestamp: new Date().toISOString()
      });
      
      // セキュリティインシデントとしてアクセスログに記録
      try {
        await supabase.from('access_logs').insert({
          case_id: caseId,
          tenant_id: tenantId,
          viewer_id: viewerId || 'anonymous',
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
          user_agent: req.headers.get('user-agent'),
          accessed_at: new Date().toISOString()
        });
      } catch (logError) {
        console.error('アクセスログ記録失敗:', logError);
      }
      
      return new Response(
        JSON.stringify({ error: 'アクセス権限がありません' }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 公開状態の確認（情報漏洩防止）
    if (!currentCase.is_published) {
      console.warn('非公開事例へのアクセス試行:', { 
        caseId,
        viewerId,
        tenantId,
        timestamp: new Date().toISOString()
      });
      
      return new Response(
        JSON.stringify({ error: 'この事例は現在公開されていません' }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // テナント情報を取得（コンテキスト用）
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('id, name')
      .eq('id', tenantId)
      .single();

    if (tenantError || !tenantData) {
      console.error('テナント情報取得エラー:', tenantError);
      return new Response(
        JSON.stringify({ error: 'テナント情報が見つかりません' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 限定されたコンテキストを作成（この事例のデータのみ）
    const limitedCaseContext = {
      事例名: currentCase.name,
      カテゴリ: currentCase.category || '未分類',
      説明: currentCase.description || '説明なし',
      結果: currentCase.result || '結果情報なし',
      解決策: currentCase.solution || '解決策情報なし',
      作成日: currentCase.created_at ? new Date(currentCase.created_at).toLocaleDateString('ja-JP') : '不明',
      更新日: currentCase.updated_at ? new Date(currentCase.updated_at).toLocaleDateString('ja-JP') : '不明'
    };

    // 安全なシステムプロンプトを生成
    const secureSystemPrompt = generateSecureSystemPrompt(
      `${tenantData.name}の施工事例専門AIアシスタント`,
      '指定された施工事例についてのみ質問に答えること',
      `【重要な制約】
      1. 以下の施工事例データのみを参照して回答してください
      2. この事例以外の情報を要求された場合は「その質問にはお答えできません」と答えてください
      3. 他の事例や会社の情報については一切言及しないでください
      4. 個人情報や機密情報の開示は絶対に行わないでください
      5. 推測や憶測での回答は避け、データに基づいた回答のみ行ってください
      
      【参照可能な施工事例データ】
      ${JSON.stringify(limitedCaseContext, null, 2)}
      
      【回答方針】
      - 具体的で実用的な情報を提供してください
      - 専門用語は分かりやすく説明してください
      - 回答は簡潔で読みやすくしてください
      - データにない情報は「この事例では公開されていません」と答えてください`
    );

    // 構造化プロンプトを作成
    const finalMessages = [
      { 
        role: 'system' as const, 
        content: secureSystemPrompt
      },
      ...(messages || []),
      { 
        role: 'user' as const, 
        content: processedQuestion 
      }
    ];

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages: finalMessages,
      maxTokens: 1000,
      temperature: 0.3,
      onFinish: async (result) => {
        try {
          // 出力を検証・フィルタリング
          const filteredResponse = new OutputValidator().filterResponse(result.text);
          
          // セキュリティログ
          if (filteredResponse !== result.text) {
            console.warn('応答がフィルタリングされました:', {
              originalLength: result.text.length,
              filteredLength: filteredResponse.length,
              viewerId,
              caseId,
              timestamp: new Date().toISOString()
            });
          }

          // データベースに保存
          console.log('AI応答完了 - 保存処理開始:', {
            viewerId,
            caseId,
            hasResult: !!result.text,
            resultLength: result.text?.length || 0
          });
          
          if (viewerId && result.text) {
            try {
              const insertData = {
                case_id: caseId,
                tenant_id: currentCase.tenant_id,
                viewer_id: viewerId,
                question: processedQuestion,
                answer: filteredResponse,
                model_used: 'gpt-4o-mini',
              };
              
              console.log('AI質問保存データ:', insertData);
              
              const { data, error } = await supabase.from('ai_questions').insert(insertData);
              
              if (error) {
                console.error('AI質問保存エラー:', error);
              } else {
                console.log('AI質問保存成功:', data);
              }
            } catch (error) {
              console.error('AI質問の保存に失敗しました:', error);
            }
          } else {
            console.warn('AI質問保存スキップ:', { viewerId, hasResult: !!result.text });
          }
        } catch (error) {
          console.error('AI質問の保存に失敗しました:', error);
        }
      },
    });

    return result.toDataStreamResponse();

  } catch (error) {
    console.error('AI API エラー:', error);
    
    // セキュリティインシデントログ
    console.error('セキュリティインシデント:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
    });
    
    return new Response(
      JSON.stringify({ 
        error: 'システムエラーが発生しました。しばらく時間をおいてから再度お試しください。' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
