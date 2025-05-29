import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import React from 'react';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI事例シェア - 施工会社の営業支援ツール',
  description: '施工会社が事例集URLを共有して、確度の高いリードを自動獲得できる営業支援ツール',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <div className="flex min-h-full flex-col">{children}</div>
        <Toaster />
      </body>
    </html>
  );
}