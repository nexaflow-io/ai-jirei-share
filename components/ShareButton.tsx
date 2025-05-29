'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type ShareButtonProps = {
  caseId: string;
};

export function ShareButton({ caseId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/case/${caseId}`
    : `/case/${caseId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      
      // 2秒後にコピー状態をリセット
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('URLコピーエラー:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>共有</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>事例を共有</DialogTitle>
          <DialogDescription>
            以下のURLを元請けに共有して、事例を見てもらいましょう。
            閲覧者情報や閲覧履歴は自動的に記録されます。
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input
              readOnly
              value={shareUrl}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              このURLにアクセスすると、事例の詳細が表示されます。
              URLは公開されていませんが、リンクを知っている人は誰でもアクセスできます。
            </p>
          </div>
          <Button
            type="button"
            size="icon"
            onClick={copyToClipboard}
            className="px-3"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="sr-only">URLをコピー</span>
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            閉じる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
