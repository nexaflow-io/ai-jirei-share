'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Loader2, Send } from 'lucide-react';

interface AiChatProps {
  caseId: string;
  viewerId?: string;
}

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export function AiChat({ caseId, viewerId }: AiChatProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'こんにちは！この事例に関する質問があればお気軽にどうぞ。建設業界の専門AIとしてお答えします。',
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // メッセージが追加されたら自動スクロール
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 入力フィールドがフォーカスされたら自動展開
  const handleFocus = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  // 入力変更ハンドラー
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  // 送信ハンドラー
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // ユーザーメッセージを追加
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // APIリクエスト
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input,
          caseId,
          viewerId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // エラーレスポンスの場合
        let errorMsg = 'サーバーエラーが発生しました';
        if (data.error) {
          errorMsg = data.error;
        } else if (response.status === 429) {
          errorMsg = '質問回数制限に達しました。しばらくしてからお試しください。';
        }
        setError(errorMsg);
        throw new Error(errorMsg);
      }
      
      // AIの応答を追加
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.answer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('AI質問エラー:', error);
      // エラーメッセージを追加
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `すみません、エラーが発生しました: ${error.message || 'しばらくしてからもう一度お試しください'}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-md border border-gray-200">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2 bg-white text-blue-600">
              <span className="text-xl">🤖</span>
            </Avatar>
            AI質問機能
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white hover:bg-blue-700"
          >
            {isExpanded ? '折りたたむ' : '展開する'}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className={`p-0 transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-96' : 'max-h-20'}`}>
        {error && (
          <div className="px-4 py-2 bg-red-50 text-red-600 border-b border-red-100">
            <p className="text-sm">{error}</p>
          </div>
        )}
        <div className="p-4 overflow-y-auto max-h-full">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${
                message.role === 'user' 
                  ? 'text-right' 
                  : 'text-left'
              }`}
            >
              <div
                className={`inline-block max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      <CardFooter className="p-4 border-t">
        <form 
          onSubmit={handleSubmit} 
          className="flex w-full items-end gap-2"
        >
          <Textarea
            value={input}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder="質問を入力してください..."
            className="flex-1 min-h-[80px] resize-none"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
