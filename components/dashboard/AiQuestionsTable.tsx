'use client';

import React from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Calendar, Building2 } from 'lucide-react';

interface AiQuestion {
  id: string;
  case_id: string;
  question: string;
  answer: string;
  model: string;
  created_at: string;
  construction_cases: { name: string } | null;
}

interface AiQuestionsTableProps {
  aiQuestions: AiQuestion[];
}

export function AiQuestionsTable({ aiQuestions }: AiQuestionsTableProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-0">
        {aiQuestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-center">
              まだAI質問の履歴がありません
            </p>
            <p className="text-sm text-gray-400 text-center mt-1">
              施工事例ページで質問されると、ここに履歴が表示されます
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200">
                    <th className="text-left font-semibold text-gray-700 py-4 px-6">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        日時
                      </div>
                    </th>
                    <th className="text-left font-semibold text-gray-700 py-4 px-6">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 mr-2" />
                        事例名
                      </div>
                    </th>
                    <th className="text-left font-semibold text-gray-700 py-4 px-6">
                      <div className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        質問内容
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {aiQuestions.map((question, index) => (
                    <tr 
                      key={question.id} 
                      className={`hover:bg-gray-50/50 transition-colors border-b border-gray-100 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {format(new Date(question.created_at), 'M月d日', { locale: ja })}
                          </div>
                          <div className="text-gray-500">
                            {format(new Date(question.created_at), 'HH:mm', { locale: ja })}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          <span className="text-sm font-medium text-gray-900">
                            {question.construction_cases?.name || '事例名不明'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="max-w-md">
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {question.question}
                          </p>
                          {question.model && (
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {question.model}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
