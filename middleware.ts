import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req: request, res: response });

  // セッション確認
  const { data: { session } } = await supabase.auth.getSession();

  // 保護されたルートのチェック
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // テナント情報の確認
    const { data: user } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', session.user.id)
      .single();

    if (!user?.tenant_id) {
      return NextResponse.redirect(new URL('/auth/signup', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*']
}; 