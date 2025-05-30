'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Building2, User, Mail, Phone, Briefcase, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  onComplete: (viewerId: string) => void;
};

export function ViewerInfoForm({ caseId, tenantId, onComplete }: ViewerInfoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
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

  const onSubmit = async (data: ViewerFormValues) => {
    setIsSubmitting(true);
    
    try {
      // 閲覧者情報をデータベースに保存
      const { data: newViewer, error: createViewerError } = await supabase
        .from('viewers')
        .insert({
          case_id: caseId,
          tenant_id: tenantId,
          company_name: data.company_name,
          position: data.position,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
        })
        .select('id')
        .single();
      
      if (createViewerError) {
        console.error('閲覧者記録エラー:', createViewerError);
        throw new Error('閲覧者情報の記録に失敗しました');
      }
      
      // アクセスログを記録
      if (newViewer?.id) {
        const { error: logError } = await supabase
          .from('access_logs')
          .insert({
            case_id: caseId,
            tenant_id: tenantId,
            viewer_id: newViewer.id,
            user_agent: navigator.userAgent,
            ip_address: null, // IPアドレスはサーバーサイドで取得する必要がある
          });
        
        if (logError) {
          console.error('アクセスログ記録エラー:', logError);
        }
      }
      
      // 成功通知
      toast({
        variant: "success",
        title: "登録完了",
        description: "閲覧者情報が正常に登録されました。事例をご覧いただけます。",
      });
      
      // 完了通知
      setTimeout(() => {
        onComplete(newViewer.id);
      }, 1000);
      
    } catch (error) {
      console.error('閲覧者情報送信エラー:', error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: `情報の送信に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              閲覧者情報の入力
            </CardTitle>
            <p className="text-gray-600 text-lg">
              施工事例を閲覧するために、以下の情報をご入力ください
            </p>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* 2カラムレイアウト */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center">
                          <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                          会社名 <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="例：株式会社〇〇建設" 
                            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs mt-1" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center">
                          <Briefcase className="w-4 h-4 mr-2 text-blue-600" />
                          役職 <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="例：工事部長" 
                            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs mt-1" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center">
                          <User className="w-4 h-4 mr-2 text-blue-600" />
                          氏名 <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="例：山田太郎" 
                            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs mt-1" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-blue-600" />
                          メールアドレス <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="例：taro.yamada@example.com" 
                            type="email" 
                            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs mt-1" />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* 電話番号は1カラム */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700 flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-blue-600" />
                        電話番号 <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="例：03-1234-5678" 
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs mt-1" />
                    </FormItem>
                  )}
                />
                
                {/* 送信ボタン */}
                <div className="pt-6">
                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        送信中...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-3 h-5 w-5" />
                        事例を閲覧する
                      </>
                    )}
                  </Button>
                </div>
                
                {/* 注意事項 */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 leading-relaxed">
                    <strong>個人情報の取り扱いについて：</strong>
                    ご入力いただいた情報は、事例閲覧の管理および今後のサービス向上のためにのみ使用いたします。
                    第三者への提供は行いません。
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
