import * as z from 'zod';

// お問い合わせフォームのスキーマ
export const inquirySchema = z.object({
  name: z
    .string()
    .min(1, { message: 'お名前は必須です' })
    .max(100, { message: 'お名前は100文字以内で入力してください' }),
  company: z
    .string()
    .min(1, { message: '会社名は必須です' })
    .max(100, { message: '会社名は100文字以内で入力してください' }),
  position: z
    .string()
    .min(1, { message: '役職は必須です' })
    .max(50, { message: '役職は50文字以内で入力してください' }),
  email: z
    .string()
    .min(1, { message: 'メールアドレスは必須です' })
    .email({ message: '有効なメールアドレスを入力してください' }),
  phone: z
    .string()
    .min(1, { message: '電話番号は必須です' })
    .max(20, { message: '電話番号は20文字以内で入力してください' }),
  message: z
    .string()
    .min(1, { message: 'お問い合わせ内容は必須です' })
    .max(1000, { message: 'お問い合わせ内容は1000文字以内で入力してください' }),
  consent: z
    .boolean()
    .refine((val) => val === true, {
      message: 'プライバシーポリシーに同意する必要があります',
    }),
});

// お問い合わせフォームの型定義
export type InquiryFormValues = z.infer<typeof inquirySchema>;
