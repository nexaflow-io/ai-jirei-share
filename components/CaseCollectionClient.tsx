'use client';

import { useEffect, useState } from 'react';
import { AccessLogger } from './AccessLogger';

interface CaseCollectionClientProps {
  tenantId: string;
  cases: Array<{ id: string }>;
}

export function CaseCollectionClient({ tenantId, cases }: CaseCollectionClientProps) {
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

  // viewerIdがない場合は何も表示しない
  if (!viewerId) {
    return null;
  }

  return (
    <>
      {/* 各事例に対してアクセスログを記録 */}
      {cases.map((caseItem) => (
        <AccessLogger
          key={caseItem.id}
          caseId={caseItem.id}
          tenantId={tenantId}
          viewerId={viewerId}
        />
      ))}
    </>
  );
}
