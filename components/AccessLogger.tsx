'use client';

import { useEffect } from 'react';

interface AccessLoggerProps {
  caseId: string;
  tenantId: string;
  viewerId: string;
}

export function AccessLogger({ caseId, tenantId, viewerId }: AccessLoggerProps) {
  useEffect(() => {
    const logAccess = async () => {
      try {
        const response = await fetch('/api/access-logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            case_id: caseId,
            tenant_id: tenantId,
            viewer_id: viewerId,
          }),
        });

        if (!response.ok) {
          console.error('アクセスログ記録に失敗しました:', response.statusText);
        }
      } catch (error) {
        console.error('アクセスログ記録エラー:', error);
      }
    };

    // コンポーネントがマウントされた時にアクセスログを記録
    logAccess();
  }, [caseId, tenantId, viewerId]);

  return null; // UIは表示しない
}
