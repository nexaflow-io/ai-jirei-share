"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

interface CopyCollectionLinkButtonProps {
  url: string;
}

export default function CopyCollectionLinkButton({ url }: CopyCollectionLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("URLコピーエラー", err);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} disabled={copied}>
      {copied ? (
        <>
          <Check size={16} className="mr-1 text-green-600" /> コピーしました
        </>
      ) : (
        <>
          <Copy size={16} className="mr-1" /> 事例集URLをコピー
        </>
      )}
    </Button>
  );
}
