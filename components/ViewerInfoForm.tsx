'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

// バリデーションスキーマ
const viewerFormSchema = z.object({
  company_name: z.string().min(1, '会社名を入力してください'),
  position: z.string().min(1, '役職を入力してください'),
  full_name: z.string().min(1, '氏名を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  phone: z.string().min(1, '電話番号を入力してください'),
});

type ViewerFormValues = z.infer<typeof viewerFormSchema>;

type ViewerInfoFormProps = {
  caseId: string;
  tenantId: string;
  onComplete: () => void;
};

export function ViewerInfoForm({ caseId, tenantId, onComplete }: ViewerInfoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();
  
  // フォームの初期化
  const form = useForm<ViewerFormValues>({
    resolver: zodResolver(viewerFormSchema),
    defaultValues: {
      company_name: '',
      position: '',
      full_name: '',
      email: '',
      phone: '',
    },
  });
  
  // フォーム送信処理
  const onSubmit = async (values: ViewerFormValues) => {
    try {
      setIsSubmitting(true);
      console.log('送信開始:', { values, caseId, tenantId });
      
      // データの確認
      if (!tenantId || !caseId) {
        console.error('必要なデータが不足しています:', { tenantId, caseId });
        alert('データが不足しています。ページを再読み込みしてください。');
        return;
      }
      
      // 閲覧者情報をデータベースに保存
      const viewerData = {
        case_id: caseId,
        tenant_id: tenantId,
        company_name: values.company_name,
        position: values.position,
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        created_at: new Date().toISOString()
      };
      
      console.log('送信するデータ:', viewerData);
      
      const { data, error: viewerError } = await supabase
        .from('viewers')
        .insert(viewerData)
        .select('id')
        .single();
      
      if (viewerError) {
        console.error('Supabaseエラー:', viewerError);
        throw new Error(`閲覧者情報の保存に失敗しました: ${viewerError.message}`);
      }
      
      if (!data || !data.id) {
        console.error('データが返されませんでした');
        throw new Error('データが正しく保存されませんでした');
      }
      
      console.log('閲覧者情報保存成功:', data);
      
      // LocalStorageに閲覧者情報を保存（次回以降の入力スキップ用）
      const storageData = {
        ...values,
        id: data.id,
        timestamp: new Date().toISOString(),
      };
      
      localStorage.setItem('viewer_info', JSON.stringify(storageData));
      console.log('localStorageに保存完了');
      
      // アクセスログの記録は必須ではないので、エラーが発生しても続行
      try {
        await supabase
          .from('access_logs')
          .insert({
            case_id: caseId,
            viewer_id: data.id,
            tenant_id: tenantId,
            referer: window.location.href,
          });
        console.log('アクセスログ記録成功');
      } catch (logError) {
        console.error('アクセスログ記録エラー:', logError);
      }
      
      // 完了通知
      console.log('処理完了、コールバック実行');
      onComplete();
    } catch (error) {
      console.error('閲覧者情報送信エラー:', error);
      alert(`情報の送信に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`); 
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">閲覧者情報の入力</h2>
      <p className="text-gray-600 mb-6 text-center">
        事例を閲覧するには、以下の情報を入力してください。
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="company_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>会社名 <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="例：株式会社〇〇建設" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>役職 <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="例：工事部長" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>氏名 <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="例：山田太郎" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>メールアドレス <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="例：taro.yamada@example.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>電話番号 <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="例：03-1234-5678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  送信中...
                </>
              ) : (
                '事例を閲覧する'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
