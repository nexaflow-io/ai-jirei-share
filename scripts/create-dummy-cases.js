// ダミーの事例データを作成するスクリプト
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// .env.localから環境変数を読み込む
dotenv.config({ path: '.env.local' });

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// サービスロールキーを使用する
// 注意: サービスロールキーは実験的なデータの挿入にのみ使用し、本番環境では使用しないでください
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('環境変数が設定されていません。.env.localファイルを確認してください。');
  process.exit(1);
}

// サービスロールキーを使用してクライアントを初期化
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// テナントとユーザーの情報
const TENANT_ID = '8d8be1ca-0adf-4299-90e5-f019a38444aa';
const USER_ID = '55fbe135-34fd-4e9a-99d3-a0f3ead3afe2'; // データベースに存在する有効なユーザーID

// ダミー事例データ
const dummyCases = [
  {
    id: 'e2e63bf4-ba98-434a-9da7-f17868de4b9d', // 既存のIDを使用
    name: '築30年マンションの外壁塗装リノベーション',
    description: '築30年の古いマンションの外壁が劣化し、美観が損なわれていました。また、断熱性能も低下しており、居住者からの改善要望が多く寄せられていました。管理組合と協議の上、外壁塗装と断熱改修を含むリノベーションプロジェクトを実施しました。',
    solution: '1. 最新の断熱塗料を使用し、熱反射率を高めることで夏場の室温上昇を抑制\n2. 外壁のひび割れや損傷部分を丁寧に補修し、長期的な耐久性を確保\n3. 居住者の生活への影響を最小限に抑えるため、工事を複数のフェーズに分けて実施\n4. 環境に配慮した低VOC塗料を使用し、居住者の健康と環境への影響を考慮',
    result: '1. 外観が大幅に改善され、マンションの資産価値が向上\n2. 断熱性能が20%向上し、居住者の冷暖房費が平均15%削減\n3. 防水性能も向上し、雨漏りのリスクを低減\n4. 居住者満足度調査で92%が「満足」または「非常に満足」と回答',
    category: 'exterior',
    is_published: true
  },
  {
    id: '7af613ae-b146-438e-be4a-4692aceb761e', // 既存のIDを使用
    name: 'オフィスビルの屋上防水工事',
    description: '築15年のオフィスビルで屋上からの雨漏りが発生し、上階のテナントに被害が出ていました。既存の防水層の劣化が原因であり、早急な対応が求められていました。営業中のビルであるため、テナントへの影響を最小限に抑えながら工事を行う必要がありました。',
    solution: '1. 最新のウレタン防水システムを採用し、耐久性と柔軟性を両立\n2. 工事音や臭いを考慮し、主要な作業を週末に集中して実施\n3. 断熱性能も考慮した防水層の設計により、省エネ効果も付加\n4. 定期点検プログラムを提案し、早期の劣化発見と対応を可能に',
    result: '1. 完全な防水性能を回復し、雨漏りを解消\n2. テナントへの影響を最小限に抑えながら予定通りの工期で完了\n3. 断熱効果により、最上階の空調効率が15%向上\n4. 5年間の保証と定期点検プログラムにより、クライアントに安心を提供',
    category: 'waterproof',
    is_published: true
  },
  {
    id: 'a590143c-46e3-41e8-9bb3-69451e677e32', // 既存のIDを使用
    name: '食品工場の床面改修プロジェクト',
    description: '食品製造工場の床面が長年の使用で劣化し、衛生面と安全面での問題が発生していました。食品安全基準を満たすための改修が急務でしたが、生産ラインを長期間停止させることはできないという制約がありました。',
    solution: '1. 食品工場向けの特殊エポキシ樹脂を使用し、耐薬品性と耐摩耗性を確保\n2. 生産エリアを区分けし、週末と夜間を活用した段階的な施工計画を立案\n3. 抗菌性能を持つ床材を採用し、食品安全性を向上\n4. 床面の勾配を適切に設計し、排水性能を改善',
    result: '1. 食品安全監査の基準をクリアし、認証を更新\n2. 生産ラインの稼働率を90%以上維持しながら工事を完了\n3. 清掃効率が向上し、メンテナンスコストが年間15%削減\n4. 床面の滑り抵抗値が向上し、労働安全性が改善',
    category: 'factory',
    is_published: true
  }
];

// データベースにダミーデータを挿入する関数
async function insertDummyCases() {
  try {
    console.log('ダミー事例データを挿入中...');
    
    for (const caseData of dummyCases) {
      const { id, ...caseFields } = caseData;
      
      // 既存のデータを確認
      const { data: existingCase, error: checkError } = await supabase
        .from('construction_cases')
        .select('id')
        .eq('id', id)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error(`事例 "${caseData.name}" の確認中にエラーが発生しました:`, checkError);
        continue;
      }
      
      if (existingCase) {
        // 既存のデータを更新
        console.log(`事例 "${caseData.name}" を更新します...`);
        const { error: updateError } = await supabase
          .from('construction_cases')
          .update({
            ...caseFields,
            tenant_id: TENANT_ID,
            user_id: USER_ID,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
        
        if (updateError) {
          console.error(`事例 "${caseData.name}" の更新中にエラーが発生しました:`, updateError);
        } else {
          console.log(`事例 "${caseData.name}" を更新しました`);
        }
      } else {
        // 新規データを挿入
        console.log(`事例 "${caseData.name}" を新規作成します...`);
        const { error: insertError } = await supabase
          .from('construction_cases')
          .insert({
            id,
            ...caseFields,
            tenant_id: TENANT_ID,
            user_id: USER_ID
          });
        
        if (insertError) {
          console.error(`事例 "${caseData.name}" の作成中にエラーが発生しました:`, insertError);
        } else {
          console.log(`事例 "${caseData.name}" を作成しました`);
        }
      }
    }
    
    console.log('ダミー事例データの挿入が完了しました');
  } catch (error) {
    console.error('ダミーデータ挿入中にエラーが発生しました:', error);
  }
}

// メイン処理
async function main() {
  try {
    await insertDummyCases();
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

main();
