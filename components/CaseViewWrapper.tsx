'use client';

import { useState, useEffect } from 'react';
import { ViewerInfoForm } from './ViewerInfoForm';
import { AccessLogger } from './AccessLogger';
import AiChatWidget from './AiChatWidget';
import { Card, CardContent } from '@/components/ui/card';

interface CaseViewWrapperProps {
  caseId: string;
  tenantId: string;
  children: React.ReactNode;
}

export function CaseViewWrapper({ caseId, tenantId, children }: CaseViewWrapperProps) {
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(true);

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
            setShowForm(false);
          }
        }
      } catch (error) {
        console.error('閲覧者情報の取得エラー:', error);
      }
    };

    getViewerInfo();
  }, []);

  const handleViewerRegistered = (newViewerId: string) => {
    setViewerId(newViewerId);
    setShowForm(false);
    
    // LocalStorageに保存
    const viewerInfo = {
      viewer_id: newViewerId,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('viewer_info', JSON.stringify(viewerInfo));
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
            <ViewerInfoForm 
              caseId={caseId} 
              tenantId={tenantId} 
              onComplete={(newViewerId: string) => handleViewerRegistered(newViewerId)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* アクセスログ記録 */}
      {viewerId && (
        <AccessLogger
          caseId={caseId}
          tenantId={tenantId}
          viewerId={viewerId}
        />
      )}
      
      {/* 事例詳細コンテンツ */}
      {children}
      
      {/* AIチャットウィジェット */}
      {viewerId && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg overflow-hidden">
            <AiChatWidget 
              caseId={caseId} 
              viewerId={viewerId} 
              tenantId={tenantId}
              isFloating={true}
            />
          </div>
        </div>
      )}
    </>
  );
}
