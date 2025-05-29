'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Filter,
  Mail,
  Phone,
  Building2,
  Calendar,
  Eye,
  Star,
  TrendingUp,
  Clock,
  ExternalLink
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Lead {
  id: string;
  company_name: string;
  full_name: string;
  position: string;
  email: string;
  phone: string;
  created_at: string;
  case_id: string;
  tenant_id: string;
  construction_cases: {
    name: string;
  };
  tenants: {
    name: string;
  };
  access_logs: any[];
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'company' | 'access_count'>('recent');

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    filterAndSortLeads();
  }, [leads, searchTerm, sortBy]);

  const fetchLeads = async () => {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('viewers')
        .select(`
          *,
          construction_cases(name),
          tenants(name),
          access_logs(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLeads(data || []);
    } catch (error) {
      console.error('リード取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortLeads = () => {
    let filtered = leads.filter(lead => 
      lead.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ソート
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'company':
          return a.company_name.localeCompare(b.company_name);
        case 'access_count':
          return (b.access_logs?.length || 0) - (a.access_logs?.length || 0);
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredLeads(filtered);
  };

  const getInterestLevel = (accessCount: number) => {
    if (accessCount >= 5) return { level: 'high', label: '高', color: 'bg-red-100 text-red-800' };
    if (accessCount >= 2) return { level: 'medium', label: '中', color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'low', label: '低', color: 'bg-green-100 text-green-800' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">リード管理</h1>
          <p className="text-gray-600 mt-2">見込み客の情報と関心度を管理</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="px-3 py-1">
            <Users className="w-4 h-4 mr-1" />
            {filteredLeads.length} 件
          </Badge>
        </div>
      </div>

      {/* 検索・フィルター */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="会社名、担当者名、メールアドレスで検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('recent')}
              >
                <Clock className="w-4 h-4 mr-1" />
                最新順
              </Button>
              <Button
                variant={sortBy === 'company' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('company')}
              >
                <Building2 className="w-4 h-4 mr-1" />
                会社名順
              </Button>
              <Button
                variant={sortBy === 'access_count' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('access_count')}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                関心度順
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* リード一覧 */}
      <div className="grid gap-6">
        {filteredLeads.length > 0 ? (
          filteredLeads.map((lead) => {
            const accessCount = lead.access_logs?.length || 0;
            const interestLevel = getInterestLevel(accessCount);
            
            return (
              <Card key={lead.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {lead.full_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{lead.full_name}</h3>
                          <p className="text-gray-600">{lead.position}</p>
                        </div>
                        <Badge className={interestLevel.color}>
                          <Star className="w-3 h-3 mr-1" />
                          関心度: {interestLevel.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center text-gray-600">
                          <Building2 className="w-4 h-4 mr-2" />
                          <span className="text-sm">{lead.company_name}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          <span className="text-sm">{lead.email}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <span className="text-sm">{lead.phone}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span className="text-sm">
                            {formatDistanceToNow(new Date(lead.created_at), { 
                              addSuffix: true, 
                              locale: ja 
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">閲覧事例:</span> {lead.construction_cases?.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">提供元:</span> {lead.tenants?.name}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {accessCount} 回閲覧
                          </Badge>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            詳細
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">リードがありません</h3>
              <p className="text-gray-600">
                {searchTerm ? '検索条件に一致するリードが見つかりません' : 'まだリードが登録されていません'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
