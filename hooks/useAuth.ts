'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const supabase = createClient();

  // ユーザーセッションの監視
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        
        const { data: authListener } = supabase.auth.onAuthStateChange(
          (event, session) => {
            setUser(session?.user || null);
          }
        );

        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // サインアップ（テナント作成含む）
  const signUp = async (email: string, password: string, fullName: string, companyName: string) => {
    try {
      setLoading(true);

      // ステップ1: ユーザー登録
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName
          }
        }
      });

      if (authError) throw authError;

      // ステップ2: テナント作成と紐付け
      const { data, error } = await supabase.rpc('create_tenant_and_user', {
        user_id: authData.user!.id,
        user_email: email,
        user_full_name: fullName,
        tenant_name: companyName
      });

      if (error) throw error;

      // ダッシュボードへリダイレクト（より確実な方法）
      window.location.href = '/dashboard';
      return { success: true, data };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // ログイン
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // ダッシュボードへリダイレクト（複数の方法を試行）
      console.log('認証成功、リダイレクト処理を開始します');
      
      // 方法1: window.location.href（最も確実な方法）
      window.location.href = '/dashboard';
      
      // 方法2: タイムアウト後に再試行
      setTimeout(() => {
        console.log('リダイレクト再試行');
        window.location.replace('/dashboard');
      }, 500);
      
      // 方法3: さらにタイムアウト後に再試行
      setTimeout(() => {
        console.log('リダイレクト最終試行');
        document.location.href = '/dashboard';
      }, 1000);
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // ログアウト
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // ログインページへリダイレクト
      router.push('/auth/login');
      return { success: true };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut
  };
} 