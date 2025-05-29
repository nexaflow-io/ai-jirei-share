'use client';

import React from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Building2, Mail, Phone, Calendar, Eye, MessageSquare } from 'lucide-react';

interface Viewer {
  id: string;
  company_name: string;
  position: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  construction_cases: { name: string } | null;
  access_logs: { accessed_at: string }[];
  ai_questions: { question: string; created_at: string }[];
}

interface ViewersTableProps {
  viewers: Viewer[];
}

export function ViewersTable({ viewers }: ViewersTableProps) {
  const getLastAccess = (accessLogs: { accessed_at: string }[]) => {
    if (!accessLogs || accessLogs.length === 0) return null;
    const sortedLogs = accessLogs.sort((a, b) => 
      new Date(b.accessed_at).getTime() - new Date(a.accessed_at).getTime()
    );
    return sortedLogs[0].accessed_at;
  };

  const getAccessCount = (accessLogs: { accessed_at: string }[]) => {
    return accessLogs ? accessLogs.length : 0;
  };

  const getQuestionCount = (aiQuestions: { question: string; created_at: string }[]) => {
    return aiQuestions ? aiQuestions.length : 0;
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <CardTitle className="flex items-center text-xl font-bold text-gray-900">
          <Users className="w-6 h-6 mr-2 text-blue-600" />
          閲覧者一覧
          <Badge variant="secondary" className="ml-3">
            {viewers.length}人
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {viewers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-center">
              まだ閲覧者がいません
            </p>
            <p className="text-sm text-gray-400 text-center mt-1">
              事例集のURLが共有されると、ここに閲覧者情報が表示されます
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
                        <Building2 className="w-4 h-4 mr-2" />
                        会社・担当者
                      </div>
                    </th>
                    <th className="text-left font-semibold text-gray-700 py-4 px-6">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        連絡先
                      </div>
                    </th>
                    <th className="text-left font-semibold text-gray-700 py-4 px-6">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        最終アクセス
                      </div>
                    </th>
                    <th className="text-left font-semibold text-gray-700 py-4 px-6">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-2" />
                        アクセス状況
                      </div>
                    </th>
                    <th className="text-left font-semibold text-gray-700 py-4 px-6">
                      <div className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        興味・関心
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {viewers.map((viewer, index) => {
                    const lastAccess = getLastAccess(viewer.access_logs);
                    const accessCount = getAccessCount(viewer.access_logs);
                    const questionCount = getQuestionCount(viewer.ai_questions);
                    
                    return (
                      <tr 
                        key={viewer.id} 
                        className={`hover:bg-gray-50/50 transition-colors border-b border-gray-100 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        }`}
                      >
                        <td className="py-4 px-6">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {viewer.company_name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {viewer.position} - {viewer.full_name}
                                </div>
                              </div>
                            </div>
                            {viewer.construction_cases && (
                              <div className="ml-5">
                                <Badge variant="outline" className="text-xs">
                                  {viewer.construction_cases.name}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-700">
                              <Mail className="w-3 h-3 mr-2 text-gray-400" />
                              <a 
                                href={`mailto:${viewer.email}`}
                                className="hover:text-blue-600 transition-colors"
                              >
                                {viewer.email}
                              </a>
                            </div>
                            <div className="flex items-center text-sm text-gray-700">
                              <Phone className="w-3 h-3 mr-2 text-gray-400" />
                              <a 
                                href={`tel:${viewer.phone}`}
                                className="hover:text-blue-600 transition-colors"
                              >
                                {viewer.phone}
                              </a>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm">
                            {lastAccess ? (
                              <>
                                <div className="font-medium text-gray-900">
                                  {format(new Date(lastAccess), 'M月d日', { locale: ja })}
                                </div>
                                <div className="text-gray-500">
                                  {format(new Date(lastAccess), 'HH:mm', { locale: ja })}
                                </div>
                              </>
                            ) : (
                              <span className="text-gray-400">未アクセス</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-1 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">
                                {accessCount}回
                              </span>
                            </div>
                            {accessCount > 0 && (
                              <Badge 
                                variant={accessCount >= 3 ? "default" : accessCount >= 2 ? "secondary" : "outline"}
                                className="text-xs"
                              >
                                {accessCount >= 3 ? "高関心" : accessCount >= 2 ? "中関心" : "低関心"}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-2">
                            {questionCount > 0 ? (
                              <div className="flex items-center space-x-2">
                                <MessageSquare className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-medium text-green-700">
                                  {questionCount}件の質問
                                </span>
                                <Badge variant="success" className="text-xs">
                                  積極的
                                </Badge>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <MessageSquare className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">
                                  質問なし
                                </span>
                              </div>
                            )}
                            
                            {/* 最新の質問を表示 */}
                            {viewer.ai_questions && viewer.ai_questions.length > 0 && (
                              <div className="mt-2">
                                <div className="text-xs text-gray-500 mb-1">最新の質問:</div>
                                <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded border line-clamp-2">
                                  {viewer.ai_questions[0].question}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
