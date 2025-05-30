import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import InviteForm from './InviteForm';

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  
  const supabase = createAdminClient();

  // 招待情報を取得
  const { data: invitation, error } = await supabase
    .from('invitations')
    .select(`
      *,
      tenants (
        id,
        name
      )
    `)
    .eq('token', token)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              招待が無効です
            </h1>
            <p className="text-gray-600">
              この招待リンクは無効か、期限切れです。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            招待を受諾
          </h1>
          <p className="text-gray-600">
            <span className="font-semibold">{invitation.tenants?.name}</span>
            への招待です
          </p>
        </div>
        
        <InviteForm 
          invitation={invitation}
          token={token}
        />
      </div>
    </div>
  );
}
