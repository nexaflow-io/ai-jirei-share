'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({ 
  title = 'エラーが発生しました',
  message, 
  onRetry,
  retryLabel = '再試行',
  className = '' 
}: ErrorStateProps) {
  return (
    <div className={`min-h-screen bg-gray-50 p-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{title}</span>
            </div>
            <p className="text-red-600 mt-2">{message}</p>
            {onRetry && (
              <Button 
                onClick={onRetry} 
                className="mt-4"
                variant="outline"
              >
                {retryLabel}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
