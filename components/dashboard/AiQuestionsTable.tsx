'use client';

import React from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type AiQuestion = {
  id: string;
  case_id: string;
  question: string;
  answer: string;
  created_at: string;
  construction_cases?: {
    name: string;
  };
};

interface AiQuestionsTableProps {
  aiQuestions: AiQuestion[];
}

export function AiQuestionsTable({ aiQuestions }: AiQuestionsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI質問履歴</CardTitle>
      </CardHeader>
      <CardContent>
        {aiQuestions.length === 0 ? (
          <p className="text-center text-gray-500 py-4">まだAI質問の履歴がありません</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日時</TableHead>
                  <TableHead>事例名</TableHead>
                  <TableHead>質問</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aiQuestions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell>
                      {format(new Date(question.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                    </TableCell>
                    <TableCell>
                      {question.construction_cases?.name || '不明な事例'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      <span title={question.question}>{question.question}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
