'use client';

import React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

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

import { inquirySchema, type InquiryFormValues } from '@/lib/validations/inquiry';

type InquiryFormProps = {
  caseId: string;
  caseName: string;
  tenantId: string;
  tenantName: string;
};

export function InquiryForm({ caseId, caseName, tenantId, tenantName }: InquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: '',
      company: '',
      email: '',
      phone: '',
      message: '',
      consent: false,
    },
  });

  const onSubmit = async (data: InquiryFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // お問い合わせデータを保存
      const { error: insertError } = await supabase
        .from('inquiries')
        .insert({
          case_id: caseId,
          tenant_id: tenantId,
          viewer_id: crypto.randomUUID(), // 仮のviewer_idを生成
          subject: `${caseName}に関するお問い合わせ`,
          message: `お名前: ${data.name}\n会社名: ${data.company}\nメール: ${data.email}\n電話番号: ${data.phone}\n\n${data.message}`,
          status: 'new'
        });

      if (insertError) {
        throw insertError;
      }

      // 送信成功
      setSuccess(true);
      form.reset();
    } catch (err: any) {
      console.error('お問い合わせ送信エラー:', err);
      setError(err.message || 'お問い合わせの送信に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>お問い合わせありがとうございます</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="mb-4">
              お問い合わせを受け付けました。担当者から折り返しご連絡いたします。
            </p>
            <Button onClick={() => router.push(`/case/${caseId}`)}>
              事例ページに戻る
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>お問い合わせフォーム</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="font-medium">お問い合わせ内容</h3>
          <p className="text-sm text-gray-500">
            「{caseName}」に関するお問い合わせを{tenantName}にお送りします。
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>お名前</FormLabel>
                  <FormControl>
                    <Input placeholder="山田 太郎" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>会社名</FormLabel>
                  <FormControl>
                    <Input placeholder="株式会社〇〇" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>メールアドレス</FormLabel>
                    <FormControl>
                      <Input placeholder="example@example.com" type="email" {...field} />
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
                    <FormLabel>電話番号</FormLabel>
                    <FormControl>
                      <Input placeholder="03-1234-5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>お問い合わせ内容</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="この事例について詳しく知りたいです。資料をいただけますか？"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="consent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-normal">
                      <span>
                        <a
                          href="/privacy-policy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline"
                        >
                          プライバシーポリシー
                        </a>
                        に同意します
                      </span>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? '送信中...' : 'お問い合わせを送信する'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
