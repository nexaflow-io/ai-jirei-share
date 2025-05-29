'use client';

import { useEffect, useState } from 'react';
import { AccessLogger } from './AccessLogger';

interface CaseDetailClientProps {
  caseId: string;
  tenantId: string;
}

export function CaseDetailClient({ caseId, tenantId }: CaseDetailClientProps) {
  const [viewerId, setViewerId] = useState<string | null>(null);

  useEffect(() => {
    // LocalStorageから閲覧者情報を取得
    const getViewerInfo = () => {
      try {
        const storedInfo = localStorage.getItem('viewer_info');
        if (storedInfo) {
          const viewerInfo = JSON.parse(storedInfo);
          // 24時間以内に入力された情報であれば利用
          const timestamp = new Date(viewerInfo.timestamp);
          const now = new Date();
          const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff < 24 && viewerInfo.viewer_id) {
            setViewerId(viewerInfo.viewer_id);
          }
        }
      } catch (error) {
        console.error('閲覧者情報の取得エラー:', error);
      }
    };

    getViewerInfo();
  }, []);

  // viewerIdがある場合のみAccessLoggerを表示
  if (!viewerId) {
    return null;
  }

  return (
    <AccessLogger
      caseId={caseId}
      tenantId={tenantId}
      viewerId={viewerId}
    />
  );
}
