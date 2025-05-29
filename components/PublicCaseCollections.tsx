'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, ChevronRight, Loader2 } from 'lucide-react';

type Tenant = {
  id: string;
  name: string;
};

export function PublicCaseCollections() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/public-tenants');
        
        if (!response.ok) {
          throw new Error('テナント情報の取得に失敗しました');
        }
        
        const data = await response.json();
        setTenants(data);
      } catch (err) {
        console.error('テナント取得エラー:', err);
        setError('施工会社情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTenants();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
        <p className="mt-2 text-gray-600">施工会社情報を読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-600 text-center">
        <p>{error}</p>
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-gray-600">公開されている事例集はありません</p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-center mb-8">公開事例集</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tenants.map((tenant) => (
          <Link 
            href={`/cases/${tenant.id}`} 
            key={tenant.id}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-600 mr-4">
                <Building2 size={20} />
              </div>
              <div>
                <h4 className="text-lg font-semibold">{tenant.name}</h4>
                <p className="text-sm text-gray-500">施工事例集</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}
