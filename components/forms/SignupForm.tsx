'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { signUpSchema, type SignUpFormValues } from '@/lib/validations/auth';

export function SignupForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const { signUp, loading } = useAuth();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      companyName: '',
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    setServerError(null);

    const result = await signUp(data.email, data.password, data.fullName, data.companyName);
    if (!result.success) {
      setServerError(result.error || '登録に失敗しました');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">新規登録</CardTitle>
        <CardDescription className="text-center">アカウントを作成して事例管理を始めましょう</CardDescription>
      </CardHeader>
      
      <CardContent>
        {serverError && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md">
            {serverError}
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メールアドレス</FormLabel>
                  <FormControl>
                    <Input placeholder="example@company.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>氏名</FormLabel>
                  <FormControl>
                    <Input placeholder="山田 太郎" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="companyName"
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
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>パスワード</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    8文字以上で、大文字・小文字・数字を含めてください
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '登録中...' : '登録する'}
            </Button>
          </form>
        </Form>
      </CardContent>
      
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          すでにアカウントをお持ちの場合は{' '}
          <Link href="/auth/login" className="text-primary hover:underline">
            ログイン
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
} 