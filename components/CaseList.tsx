'use client';

import { useState, useMemo, memo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Copy, Edit, Eye, EyeOff, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CopyCollectionLinkButton from '@/components/CopyCollectionLinkButton';

type Case = {
  id: string;
  name: string;
  category: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  _count?: {
    case_images: number;
    viewers: number;
    access_logs: number;
  };
};

type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalCount: number;
};

type CaseListProps = {
  cases: Case[];
  pagination?: PaginationInfo;
};

// 日付フォーマットをメモ化する関数
const formatDate = (dateString: string): string => {
  return formatDistanceToNow(new Date(dateString), {
    addSuffix: true,
    locale: ja,
  });
};

// 日付フォーマットのキャッシュ
const dateFormatCache = new Map<string, string>();

const getFormattedDate = (dateString: string): string => {
  if (dateFormatCache.has(dateString)) {
    return dateFormatCache.get(dateString)!;
  }
  const formatted = formatDate(dateString);
  dateFormatCache.set(dateString, formatted);
  return formatted;
};

const CaseList = memo(({ cases, pagination }: CaseListProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // ベースURLを一度だけ取得
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('construction_cases')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('削除エラー:', error);
        alert('削除に失敗しました');
        return;
      }

      router.refresh();
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  }, [supabase, router]);

  const copyShareLink = useCallback(async (id: string) => {
    if (!baseUrl) return;
    
    try {
      setIsCopying(true);
      const url = `${baseUrl}/case/${id}`;
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('コピーエラー:', error);
    } finally {
      setIsCopying(false);
    }
  }, [baseUrl]);

  // ページネーション用のURL生成
  const createPageUrl = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    return `/cases?${params.toString()}`;
  }, [searchParams]);

  // メモ化されたケースリストレンダリング（最適化された依存関係）
  const renderedCases = useMemo(() => {
    if (!baseUrl) return null; // ベースURLが設定されるまで待機
    
    return cases.map((caseItem) => {
      const formattedDate = getFormattedDate(caseItem.updated_at);
      const collectionUrl = `${baseUrl}/case-collections/${caseItem.id}`;
      
      return (
        <tr key={caseItem.id} className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">
              {caseItem.name}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-500">{caseItem.category}</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              caseItem.is_published
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {caseItem.is_published ? '公開中' : '非公開'}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {caseItem._count?.case_images || 0}枚
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {caseItem._count?.viewers || 0}人
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {formattedDate}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex justify-end space-x-2">
              <CopyCollectionLinkButton url={collectionUrl}/>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyShareLink(caseItem.id)}
                disabled={isCopying}
              >
                <Copy size={16} className={copiedId === caseItem.id ? 'text-green-500' : ''} />
                <span className="sr-only">共有</span>
              </Button>
              <Link href={`/cases/${caseItem.id}/edit`}>
                <Button variant="ghost" size="sm">
                  <Edit size={16} />
                  <span className="sr-only">編集</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteId(caseItem.id)}
              >
                <Trash2 size={16} className="text-red-500" />
                <span className="sr-only">削除</span>
              </Button>
            </div>
          </td>
        </tr>
      );
    });
  }, [cases, baseUrl, isCopying, copiedId, copyShareLink]);

  if (cases.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium mb-2">事例がありません</h3>
        <p className="text-gray-500 mb-4">新しい事例を作成して、元請けと共有しましょう</p>
        <Link href="/cases/new">
          <Button>新しい事例を作成</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 将来的な改善案: 大量データ対応 */}
      {/* TODO: 100件以上の場合は仮想化（react-window）またはページネーション実装 */}
      {/* TODO: 検索・フィルタ機能の追加 */}
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  事例名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  カテゴリ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  画像数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  閲覧者数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  更新日時
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {renderedCases}
            </tbody>
          </table>
        </div>
      </div>

      {/* ページネーション */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
          <div className="flex items-center text-sm text-gray-500">
            <span>
              {pagination.totalCount}件中 {((pagination.currentPage - 1) * 20) + 1}-{Math.min(pagination.currentPage * 20, pagination.totalCount)}件を表示
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Link 
              href={createPageUrl(pagination.currentPage - 1)}
              className={!pagination.hasPrevPage ? 'pointer-events-none' : ''}
            >
              <Button 
                variant="outline" 
                size="sm" 
                disabled={!pagination.hasPrevPage}
                className="flex items-center space-x-1"
              >
                <ChevronLeft size={16} />
                <span>前へ</span>
              </Button>
            </Link>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.currentPage - 2 + i;
                }
                
                return (
                  <Link key={pageNum} href={createPageUrl(pageNum)}>
                    <Button
                      variant={pageNum === pagination.currentPage ? "default" : "outline"}
                      size="sm"
                      className="w-10 h-10"
                    >
                      {pageNum}
                    </Button>
                  </Link>
                );
              })}
            </div>
            
            <Link 
              href={createPageUrl(pagination.currentPage + 1)}
              className={!pagination.hasNextPage ? 'pointer-events-none' : ''}
            >
              <Button 
                variant="outline" 
                size="sm" 
                disabled={!pagination.hasNextPage}
                className="flex items-center space-x-1"
              >
                <span>次へ</span>
                <ChevronRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 削除確認ダイアログ */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>事例の削除</DialogTitle>
            <DialogDescription>
              この事例を削除しますか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={isDeleting}
            >
              {isDeleting ? '削除中...' : '削除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

CaseList.displayName = 'CaseList';

export default CaseList;
