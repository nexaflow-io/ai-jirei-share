'use client';

import { useState, useEffect } from 'react';
import { User, Plus, Mail, Shield, Users } from 'lucide-react';

interface UserTenant {
  id: string;
  role: string;
  created_at: string;
  user_id: string;
  users: {
    id: string;
    email: string;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
}

export default function TeamPage() {
  const [members, setMembers] = useState<UserTenant[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      const response = await fetch('/api/team/members');
      if (!response.ok) {
        throw new Error('Failed to fetch team data');
      }
      
      const data = await response.json();
      setMembers(data.members || []);
      setInvitations(data.invitations || []);
    } catch (error) {
      console.error('Error loading team data:', error);
      setError('チームデータの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setInviteLoading(true);

    try {
      const response = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '招待の送信に失敗しました');
      }

      const result = await response.json();
      setSuccess(`招待を送信しました: ${result.inviteUrl}`);
      setInviteEmail('');
      loadTeamData(); // データを再読み込み

    } catch (error: any) {
      setError(error.message || '招待の送信に失敗しました');
    } finally {
      setInviteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">チーム管理</h1>
        <p className="text-gray-600">メンバーの管理と新規招待を行えます</p>
      </div>

      {/* 招待フォーム */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          新しいメンバーを招待
        </h2>
        
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="example@company.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                役割
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="member">メンバー</option>
                <option value="admin">管理者</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={inviteLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
          >
            <Mail className="w-4 h-4 mr-2" />
            {inviteLoading ? '送信中...' : '招待を送信'}
          </button>
        </form>
      </div>

      {/* メンバー一覧 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            メンバー一覧 ({members.length}人)
          </h2>
        </div>
        
        <div className="divide-y">
          {members.map((member) => (
            <div key={member.id} className="p-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div className="ml-4">
                  <div className="font-medium text-gray-900">
                    {member.users.email}
                  </div>
                  <div className="text-sm text-gray-500">
                    参加日: {new Date(member.created_at).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  member.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {member.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                  {member.role === 'admin' ? '管理者' : 'メンバー'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 招待一覧 */}
      {invitations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border mt-8">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              招待一覧 ({invitations.length}件)
            </h2>
          </div>
          
          <div className="divide-y">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="p-6 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">
                    {invitation.email}
                  </div>
                  <div className="text-sm text-gray-500">
                    招待日: {new Date(invitation.created_at).toLocaleDateString('ja-JP')}
                    {invitation.accepted_at && (
                      <span className="ml-2 text-green-600">
                        (受諾済み: {new Date(invitation.accepted_at).toLocaleDateString('ja-JP')})
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    invitation.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {invitation.role === 'admin' ? '管理者' : 'メンバー'}
                  </span>
                  
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    invitation.accepted_at
                      ? 'bg-green-100 text-green-800'
                      : new Date(invitation.expires_at) > new Date()
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {invitation.accepted_at 
                      ? '受諾済み' 
                      : new Date(invitation.expires_at) > new Date()
                      ? '招待中'
                      : '期限切れ'
                    }
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
