'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, User, Send, MessageSquare, Shield, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChat } from 'ai/react';

interface AiChatWidgetProps {
  caseId: string;
  viewerId?: string;
  tenantId?: string;
  isFloating?: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// フロントエンド入力検証
const validateInput = (input: string): { isValid: boolean; error?: string } => {
  if (!input.trim()) {
    return { isValid: false, error: '質問を入力してください' };
  }
  
  if (input.length > 1000) {
    return { isValid: false, error: '質問は1000文字以内で入力してください' };
  }
  
  // 基本的な危険パターンをチェック
  const dangerousPatterns = [
    /ignore\s+previous\s+instructions/i,
    /you\s+are\s+now\s+/i,
    /system\s+override/i,
    /reveal\s+prompt/i,
    /<script/i,
    /<iframe/i
  ];
  
  const hasDangerousPattern = dangerousPatterns.some(pattern => pattern.test(input));
  if (hasDangerousPattern) {
    return { 
      isValid: false, 
      error: '申し訳ございませんが、その内容の質問はお受けできません' 
    };
  }
  
  return { isValid: true };
};

export default function AiChatWidget({ 
  caseId, 
  viewerId, 
  tenantId, 
  isFloating = false 
}: AiChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(!isFloating);
  const [inputError, setInputError] = useState<string>('');
  const [securityWarning, setSecurityWarning] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/ai',
    body: {
      caseId,
      viewerId,
      tenantId,
    },
    onError: (error) => {
      console.error('AI Chat Error:', error);
      
      // セキュリティ関連エラーの処理
      if (error.message.includes('運用ガイドライン')) {
        setSecurityWarning('セキュリティ上の理由でその質問はお受けできません');
      } else if (error.message.includes('確認中')) {
        setSecurityWarning('質問の内容を確認中です。しばらくお待ちください');
      } else if (error.message.includes('アクセス権限')) {
        setSecurityWarning('この事例にアクセスする権限がありません');
      }
    },
    onFinish: () => {
      setInputError('');
      setSecurityWarning('');
    }
  });

  // メッセージが更新されたら最下部にスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // セキュリティ警告をクリア
  useEffect(() => {
    if (securityWarning) {
      const timer = setTimeout(() => {
        setSecurityWarning('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [securityWarning]);

  const handleSecureSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 入力検証
    const validation = validateInput(input);
    if (!validation.isValid) {
      setInputError(validation.error || '');
      return;
    }
    
    setInputError('');
    setSecurityWarning('');
    handleSubmit(e);
  };

  const handleInputChangeWithValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // リアルタイム検証
    if (value.length > 1000) {
      setInputError('質問は1000文字以内で入力してください');
    } else {
      setInputError('');
    }
    
    handleInputChange(e);
  };

  if (isFloating && !isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`${
      isFloating 
        ? 'fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]' 
        : 'w-full h-[600px]'
    }`}>
      <Card className="h-full flex flex-col shadow-xl">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="w-5 h-5 text-blue-600" />
              AI建設アシスタント
              <Shield className="w-4 h-4 text-green-600" />
            </CardTitle>
            {isFloating && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            )}
          </div>
          {securityWarning && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">{securityWarning}</span>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-4 min-h-0">
          {/* メッセージ表示エリア */}
          <div className={`flex-1 overflow-y-auto space-y-4 mb-4 ${
            isFloating ? 'max-h-[400px]' : ''
          }`}>
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm">
                  この建設事例について何でもお聞きください。<br />
                  安全なAIシステムで回答いたします。
                </p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex gap-2 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {message.role === 'user' ? (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    ) : (
                      <div className="text-sm">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 ml-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 ml-2">{children}</ol>,
                            li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
                            h1: ({ children }) => <h1 className="text-base font-bold mb-2 text-gray-900">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-sm font-bold mb-2 text-gray-900">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 text-gray-900">{children}</h3>,
                            code: ({ children }) => <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                            pre: ({ children }) => <pre className="bg-gray-200 p-2 rounded text-xs overflow-x-auto font-mono">{children}</pre>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                            blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-3 italic text-gray-700">{children}</blockquote>
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* 入力フォーム */}
          <div className="flex-shrink-0">
            <form onSubmit={handleSecureSubmit} className="space-y-2">
              {inputError && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                  {inputError}
                </div>
              )}
              
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={handleInputChangeWithValidation}
                  placeholder="建設事例について質問してください..."
                  disabled={isLoading}
                  className="flex-1"
                  maxLength={1000}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !input.trim() || !!inputError}
                  className="px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{input.length}/1000文字</span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  セキュリティ保護済み
                </span>
              </div>
            </form>

            {error && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                エラーが発生しました: {error.message}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
