'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUploader } from '@/components/ImageUploader';

import { caseSchema, type CaseFormValues } from '@/lib/validations/case';

type CaseFormProps = {
  initialData?: CaseFormValues;
  isEditing?: boolean;
};

export function CaseForm({ initialData, isEditing = false }: CaseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const router = useRouter();
  const supabase = createClient();

  // デフォルト値を定義
  const defaultValues: CaseFormValues = {
    name: '',
    description: '',
    solution: '',
    result: '',
    category: '',
    is_published: false,
  };

  const form = useForm({
    resolver: zodResolver(caseSchema),
    defaultValues: initialData || defaultValues,
  });

  const onSubmit = async (data: CaseFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // ユーザー情報を取得
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('認証されていません');
      }

      // ユーザーのテナントIDを取得
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        throw new Error('ユーザー情報の取得に失敗しました');
      }

      // 事例データを作成または更新
      let caseId: string;
      
      if (isEditing && initialData?.id) {
        // 事例更新
        const { error: updateError } = await supabase
          .from('construction_cases')
          .update({
            name: data.name,
            description: data.description,
            solution: data.solution,
            result: data.result,
            category: data.category,
            is_published: data.is_published,
            updated_at: new Date().toISOString(),
          })
          .eq('id', initialData.id);

        if (updateError) throw updateError;
        caseId = initialData.id;
      } else {
        // 新規事例作成
        const { data: caseData, error: insertError } = await supabase
          .from('construction_cases')
          .insert({
            tenant_id: userData.tenant_id,
            user_id: user.id,
            name: data.name,
            description: data.description,
            solution: data.solution,
            result: data.result,
            category: data.category,
            is_published: data.is_published,
          })
          .select('id')
          .single();

        if (insertError || !caseData) {
          throw new Error('事例の作成に失敗しました');
        }
        
        caseId = caseData.id;
      }

      // 画像のアップロード処理
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${caseId}/${Date.now()}.${fileExt}`;
          const filePath = `case-images/${fileName}`;

          // Storageに画像をアップロード
          const { error: uploadError } = await supabase.storage
            .from('case-images')
            .upload(filePath, file);

          if (uploadError) {
            console.error('画像アップロードエラー:', uploadError);
            continue;
          }

          // 画像のURLを取得
          const { data: urlData } = supabase.storage
            .from('case-images')
            .getPublicUrl(filePath);

          // 画像情報をデータベースに保存
          await supabase.from('case_images').insert({
            case_id: caseId,
            tenant_id: userData.tenant_id,
            image_url: urlData.publicUrl,
            image_path: filePath,
            display_order: i,
          });
        }
      }

      // 事例一覧ページにリダイレクト
      router.push('/cases');
      router.refresh();
    } catch (err: any) {
      console.error('事例保存エラー:', err);
      setError(err.message || '事例の保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? '事例を編集' : '新しい事例を作成'}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>工事名</FormLabel>
                  <FormControl>
                    <Input placeholder="〇〇ビル外壁塗装工事" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>カテゴリ</FormLabel>
                  <FormControl>
                    <Input placeholder="外壁塗装・防水工事など" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>課題・問題点</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="工事前の状況や課題について説明してください"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="solution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>工夫・解決策</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="どのような工夫や解決策を提供したか説明してください"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="result"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>結果・成果</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="工事の結果や成果について説明してください"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>施工写真</FormLabel>
              <ImageUploader
                maxFiles={10}
                onImagesChange={setImages}
                existingImages={[]}
              />
              <p className="text-xs text-muted-foreground">
                最大10枚まで、1枚あたり5MB以下のJPEG、PNG形式
              </p>
            </div>

            <FormField
              control={form.control}
              name="is_published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </FormControl>
                  <FormLabel className="font-normal">公開する</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? '保存中...'
                  : isEditing
                  ? '更新する'
                  : '作成する'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
