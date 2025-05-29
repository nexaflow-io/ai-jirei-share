import * as z from 'zod';

// 事例フォームのスキーマ
export const caseSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, { message: '工事名は必須です' })
    .max(100, { message: '工事名は100文字以内で入力してください' }),
  category: z
    .string()
    .min(1, { message: 'カテゴリは必須です' })
    .max(50, { message: 'カテゴリは50文字以内で入力してください' }),
  description: z
    .string()
    .min(1, { message: '課題・問題点は必須です' })
    .max(1000, { message: '課題・問題点は1000文字以内で入力してください' }),
  solution: z
    .string()
    .min(1, { message: '工夫・解決策は必須です' })
    .max(1000, { message: '工夫・解決策は1000文字以内で入力してください' }),
  result: z
    .string()
    .min(1, { message: '結果・成果は必須です' })
    .max(1000, { message: '結果・成果は1000文字以内で入力してください' }),
  is_published: z.boolean().optional().default(false),
});

// 事例フォームの型定義
export type CaseFormValues = z.infer<typeof caseSchema>;
