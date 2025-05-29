// 事例の画像を差し替えるスクリプト
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// .env.localから環境変数を読み込む
dotenv.config({ path: '.env.local' });

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// サービスロールキーを使用する
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

// 事例ID
const caseIds = {
  exterior: 'e2e63bf4-ba98-434a-9da7-f17868de4b9d', // 外壁塗装
  waterproof: '7af613ae-b146-438e-be4a-4692aceb761e', // 防水工事
  factory: 'a590143c-46e3-41e8-9bb3-69451e677e32' // 工場改修
};

// 新しい画像ファイルパス
const newImagePaths = {
  exterior: '/tmp/new-sample-images/exterior1.jpg',
  waterproof: '/tmp/new-sample-images/waterproof1.jpg',
  factory: '/tmp/new-sample-images/factory1.jpg'
};

// 既存の画像を削除して新しい画像をアップロード
async function replaceImage(caseId, newImagePath) {
  try {
    console.log(`事例ID ${caseId} の画像を差し替えます...`);
    
    // 既存の画像情報を取得
    const { data: existingImages, error: fetchError } = await supabase
      .from('case_images')
      .select('*')
      .eq('case_id', caseId);
    
    if (fetchError) {
      console.error(`既存画像の取得エラー: ${fetchError.message}`);
      return;
    }
    
    console.log(`${existingImages.length}件の既存画像が見つかりました`);
    
    // 新しい画像をアップロード
    const fileName = path.basename(newImagePath);
    const fileExt = path.extname(fileName);
    const timestamp = Date.now();
    const storagePath = `${caseId}/${timestamp}${fileExt}`;
    
    console.log(`新しい画像をアップロード中: ${storagePath}`);
    
    const fileBuffer = fs.readFileSync(newImagePath);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('case-images')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      });
    
    if (uploadError) {
      console.error(`画像アップロードエラー: ${uploadError.message}`);
      return;
    }
    
    // 公開URLを取得
    const { data: urlData } = supabase.storage
      .from('case-images')
      .getPublicUrl(storagePath);
    
    if (!urlData || !urlData.publicUrl) {
      console.error('公開URLの取得に失敗しました');
      return;
    }
    
    console.log(`アップロード成功: ${urlData.publicUrl}`);
    
    // 既存の画像レコードを削除して新しいレコードを作成
    if (existingImages.length > 0) {
      // すべての既存画像レコードのIDを取得
      const idsToDelete = existingImages.map(img => img.id);
      
      // 既存のレコードを削除
      const { error: deleteError } = await supabase
        .from('case_images')
        .delete()
        .in('id', idsToDelete);
      
      if (deleteError) {
        console.error(`画像レコード削除エラー: ${deleteError.message}`);
        return;
      }
      
      console.log(`${idsToDelete.length}件の既存画像レコードを削除しました`);
      
      // 新しいレコードを作成
      const { error: insertError } = await supabase
        .from('case_images')
        .insert({
          case_id: caseId,
          tenant_id: '8d8be1ca-0adf-4299-90e5-f019a38444aa',
          image_url: urlData.publicUrl,
          image_path: storagePath,
          display_order: 0
        });
      
      if (insertError) {
        console.error(`新しい画像レコード作成エラー: ${insertError.message}`);
        return;
      }
      
      console.log('新しい画像レコードを作成しました');
    } else {
      // 新しい画像レコードを作成
      const { error: insertError } = await supabase
        .from('case_images')
        .insert({
          case_id: caseId,
          tenant_id: '8d8be1ca-0adf-4299-90e5-f019a38444aa',
          image_url: urlData.publicUrl,
          image_path: storagePath,
          display_order: 0
        });
      
      if (insertError) {
        console.error(`画像レコード作成エラー: ${insertError.message}`);
        return;
      }
      
      console.log('新しい画像レコードを作成しました');
    }
    
    return true;
  } catch (error) {
    console.error(`画像差し替えエラー: ${error.message}`);
    return false;
  }
}

// メイン処理
async function main() {
  try {
    // 外壁塗装の画像を差し替え
    await replaceImage(caseIds.exterior, newImagePaths.exterior);
    
    // 防水工事の画像を差し替え
    await replaceImage(caseIds.waterproof, newImagePaths.waterproof);
    
    // 工場改修の画像を差し替え
    await replaceImage(caseIds.factory, newImagePaths.factory);
    
    console.log('すべての画像の差し替えが完了しました');
  } catch (error) {
    console.error(`エラーが発生しました: ${error.message}`);
  }
}

main();
