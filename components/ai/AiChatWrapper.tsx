'use client';

import React from 'react';
import { AiChat } from './AiChat';

interface AiChatWrapperProps {
  caseId: string;
  viewerId?: string;
}

export function AiChatWrapper({ caseId, viewerId }: AiChatWrapperProps) {
  return <AiChat caseId={caseId} viewerId={viewerId} />;
}
