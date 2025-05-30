const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestInquiry() {
  try {
    console.log('テストデータ作成開始...');

    // テナントを取得
    const { data: tenants, error: tenantError } = await supabase
      .from('tenants')
      .select('id, name')
      .limit(1);

    if (tenantError || !tenants || tenants.length === 0) {
      console.error('テナント取得エラー:', tenantError);
      return;
    }

    const tenant = tenants[0];
    console.log('使用するテナント:', tenant);

    // 事例を取得
    const { data: cases, error: caseError } = await supabase
      .from('construction_cases')
      .select('id, name')
      .eq('tenant_id', tenant.id)
      .limit(1);

    if (caseError || !cases || cases.length === 0) {
      console.error('事例取得エラー:', caseError);
      return;
    }

    const constructionCase = cases[0];
    console.log('使用する事例:', constructionCase);

    // 閲覧者を取得または作成
    let { data: viewers, error: viewerError } = await supabase
      .from('viewers')
      .select('id, company_name, full_name')
      .eq('tenant_id', tenant.id)
      .limit(1);

    if (viewerError) {
      console.error('閲覧者取得エラー:', viewerError);
      return;
    }

    let viewer;
    if (!viewers || viewers.length === 0) {
      // 閲覧者を作成
      const { data: newViewer, error: createViewerError } = await supabase
        .from('viewers')
        .insert({
          tenant_id: tenant.id,
          company_name: 'テスト建設株式会社',
          full_name: 'テスト 太郎',
          email: 'test@example.com',
          phone: '090-1234-5678',
          position: '営業部長'
        })
        .select()
        .single();

      if (createViewerError) {
        console.error('閲覧者作成エラー:', createViewerError);
        return;
      }
      viewer = newViewer;
    } else {
      viewer = viewers[0];
    }

    console.log('使用する閲覧者:', viewer);

    // 問い合わせを作成
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .insert({
        tenant_id: tenant.id,
        case_id: constructionCase.id,
        viewer_id: viewer.id,
        subject: 'テスト問い合わせ',
        message: 'これはテスト用の問い合わせです。見積もりをお願いします。',
        status: 'new'
      })
      .select()
      .single();

    if (inquiryError) {
      console.error('問い合わせ作成エラー:', inquiryError);
      return;
    }

    console.log('テスト問い合わせ作成成功:', inquiry);

  } catch (error) {
    console.error('エラー:', error);
  }
}

createTestInquiry();
