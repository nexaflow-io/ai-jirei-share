'use client';

import React from 'react';
import AiChatWidget from '../AiChatWidget';

interface AiChatWrapperProps {
  caseId: string;
  viewerId?: string;
  caseName?: string;
}

export function AiChatWrapper({ caseId, viewerId, caseName }: AiChatWrapperProps) {
  return (
    <AiChatWidget 
      caseId={caseId} 
      viewerId={viewerId} 
    />
  );
}
