import { Resend } from 'resend';

// Resendクライアントの初期化
const resend = new Resend(process.env.RESEND_API_KEY);

// 問い合わせ通知メールの送信パラメータ
export interface InquiryNotificationParams {
  to: string;           // 送信先メールアドレス（施工会社担当者）
  caseTitle: string;    // 事例タイトル
  viewerName: string;   // 閲覧者名
  viewerCompany: string;// 閲覧者の会社名
  subject: string;      // 問い合わせ件名
  message: string;      // 問い合わせ内容
  caseUrl: string;      // 事例URL
}

/**
 * 問い合わせ通知メールを送信する
 */
export async function sendInquiryNotification({
  to, 
  caseTitle, 
  viewerName, 
  viewerCompany, 
  subject, 
  message, 
  caseUrl
}: InquiryNotificationParams) {
  try {
    const result = await resend.emails.send({
      from: 'AI事例シェア <noreply@nexaflow.jp>',
      to,
      subject: `[AI事例シェア] ${caseTitle}に問い合わせが投稿されました`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">新しい問い合わせが投稿されました</h2>
          
          <div style="margin: 24px 0;">
            <p><strong>事例:</strong> ${caseTitle}</p>
            <p><strong>問い合わせ者:</strong> ${viewerName} (${viewerCompany})</p>
            <p><strong>件名:</strong> ${subject}</p>
            <p><strong>内容:</strong></p>
            <div style="background-color: #f9fafb; padding: 16px; border-radius: 4px; margin: 12px 0;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="margin-top: 32px;">
            <a href="${caseUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">事例を確認する</a>
          </div>
          
          <div style="margin-top: 48px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 16px;">
            <p>このメールはAI事例シェアから自動送信されています。</p>
            <p>© 2025 ネクサフロー株式会社</p>
          </div>
        </div>
      `,
    });
    
    return { success: true, data: result };
  } catch (error) {
    console.error('メール送信エラー:', error);
    return { success: false, error };
  }
}
