import { createAdminClient } from '@/lib/supabase/server';
import { sendInquiryNotification } from '@/lib/email';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    console.log('問い合わせAPI開始');
    
    // リクエストボディからデータを取得
    const { 
      caseId, 
      tenantId, 
      name, 
      company, 
      position,
      email, 
      phone, 
      message 
    } = await req.json();

    console.log('受信データ:', { caseId, tenantId, name, company, position, email, phone, message });

    // 必須パラメータの検証
    if (!caseId || !tenantId || !name || !company || !position || !email || !message) {
      console.log('必須パラメータ不足:', { caseId, tenantId, name, company, position, email, message });
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      );
    }

    // Supabaseクライアントを作成
    const supabase = createAdminClient();
    console.log('Supabaseクライアント作成完了');

    // 事例データを取得
    const { data: caseData, error: caseError } = await supabase
      .from('construction_cases')
      .select(`
        id,
        name,
        tenant_id,
        tenants (
          id,
          name
        ),
        users (
          id,
          email,
          full_name
        )
      `)
      .eq('id', caseId)
      .single();

    console.log('事例データ取得結果:', { caseData, caseError });

    if (caseError || !caseData) {
      console.error('事例データ取得エラー:', caseError);
      return NextResponse.json(
        { error: '事例が見つかりません' },
        { status: 404 }
      );
    }

    // viewerIDを生成
    const viewerId = crypto.randomUUID();

    // 閲覧者情報を先に保存
    const { error: viewerError } = await supabase
      .from('viewers')
      .insert({
        id: viewerId,
        case_id: caseId,
        tenant_id: tenantId,
        company_name: company,
        full_name: name,
        email,
        phone,
        position: position
      })
      .select('id')
      .single();

    if (viewerError) {
      console.error('閲覧者情報保存エラー:', viewerError);
      return NextResponse.json(
        { error: '閲覧者情報の保存に失敗しました' },
        { status: 500 }
      );
    }

    console.log('閲覧者情報保存完了');

    // 問い合わせデータを保存
    const { data: inquiryData, error: insertError } = await supabase
      .from('inquiries')
      .insert({
        case_id: caseId,
        tenant_id: tenantId,
        viewer_id: viewerId,
        subject: `${caseData.name}に関するお問い合わせ`,
        message: `お名前: ${name}\n会社名: ${company}\n役職: ${position}\nメール: ${email}\n電話番号: ${phone || '未入力'}\n\n${message}`,
        status: 'new'
      })
      .select()
      .single();

    console.log('問い合わせデータ保存結果:', { inquiryData, insertError });

    if (insertError) {
      console.error('問い合わせ保存エラー:', insertError);
      return NextResponse.json(
        { error: '問い合わせの保存に失敗しました' },
        { status: 500 }
      );
    }

    // メール送信
    if (caseData.users?.email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-jirei-share.vercel.app';
      const caseUrl = `${appUrl}/dashboard/cases/${caseId}`;

      await sendInquiryNotification({
        to: caseData.users.email,
        caseTitle: caseData.name,
        viewerName: name,
        viewerCompany: company,
        subject: `${caseData.name}に関するお問い合わせ`,
        message: `
お名前: ${name}
会社名: ${company}
役職: ${position}
メール: ${email}
電話番号: ${phone || '未入力'}

${message}
        `,
        caseUrl
      });

      console.log('メール送信完了');
    }

    return NextResponse.json({ success: true, data: inquiryData });
  } catch (error: any) {
    console.error('問い合わせ処理エラー:', error);
    return NextResponse.json(
      { error: error.message || '問い合わせ処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
