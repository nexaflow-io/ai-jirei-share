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

      if (!response.ok) {
        throw new Error('AI応答の取得に失敗しました');
      }

      const data = await response.json();
      
      // AIの応答を追加
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.answer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI質問エラー:', error);
      // エラーメッセージを追加
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'すみません、エラーが発生しました。しばらくしてからもう一度お試しください。',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-md border border-gray-200">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center text-lg">
          <Avatar className="h-8 w-8 mr-2 bg-white text-blue-600">
            <span className="text-xl">🤖</span>
          </Avatar>
          AI質問機能
        </CardTitle>
      </CardHeader>
      
      <CardContent className={`p-0 transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-96' : 'max-h-20'}`}>
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
