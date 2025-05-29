import * as z from 'zod';

// サインアップフォームのスキーマ
export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'メールアドレスは必須です' })
    .email({ message: '有効なメールアドレスを入力してください' }),
  password: z
    .string()
    .min(8, { message: 'パスワードは8文字以上である必要があります' })
    .regex(/[A-Z]/, { message: 'パスワードには大文字を含める必要があります' })
    .regex(/[a-z]/, { message: 'パスワードには小文字を含める必要があります' })
    .regex(/[0-9]/, { message: 'パスワードには数字を含める必要があります' }),
  fullName: z
    .string()
    .min(1, { message: '氏名は必須です' }),
  companyName: z
    .string()
    .min(1, { message: '会社名は必須です' }),
});

// ログインフォームのスキーマ
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'メールアドレスは必須です' })
    .email({ message: '有効なメールアドレスを入力してください' }),
  password: z
    .string()
    .min(1, { message: 'パスワードは必須です' }),
});

// サインアップフォームの型定義
export type SignUpFormValues = z.infer<typeof signUpSchema>;

// ログインフォームの型定義
export type SignInFormValues = z.infer<typeof signInSchema>;
