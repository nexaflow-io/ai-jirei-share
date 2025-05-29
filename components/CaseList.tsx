'use client';

import { useState, useMemo, memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Copy, Edit, Eye, EyeOff, Trash2 } from 'lucide-react';

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

type CaseListProps = {
  cases: Case[];
};

const CaseList = memo(({ cases }: CaseListProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      
      // 事例の削除
      const { error } = await supabase
        .from('construction_cases')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // 画面を更新
      router.refresh();
    } catch (error) {
      console.error('削除エラー:', error);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const copyShareLink = async (id: string) => {
    try {
      setIsCopying(true);
      setCopiedId(id);
      
      const shareUrl = `${window.location.origin}/case/${id}`;
      await navigator.clipboard.writeText(shareUrl);
      
      // 2秒後にコピー状態をリセット
      setTimeout(() => {
        setCopiedId(null);
        setIsCopying(false);
      }, 2000);
    } catch (error) {
      console.error('URLコピーエラー:', error);
      setIsCopying(false);
      setCopiedId(null);
    }
  };

  // メモ化されたケースリストレンダリング
  const renderedCases = useMemo(() => {
    return cases.map((caseItem) => (
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
          {formatDistanceToNow(new Date(caseItem.updated_at), {
            addSuffix: true,
            locale: ja,
          })}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex justify-end space-x-2">
            <CopyCollectionLinkButton url={`${window.location.origin}/case-collections/${caseItem.id}`}/>
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
    ));
  }, [cases, isCopying, copiedId]);

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
    <div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  工事名
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  カテゴリ
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  画像
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  閲覧数
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  更新日
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {renderedCases}
            </tbody>
          </table>
        </div>
      </div>

      {/* 削除確認ダイアログ */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>事例を削除しますか？</DialogTitle>
            <DialogDescription>
              この操作は元に戻せません。事例に関連するすべてのデータ（画像、閲覧履歴など）も削除されます。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              disabled={isDeleting}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={isDeleting}
            >
              {isDeleting ? '削除中...' : '削除する'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default CaseList;
