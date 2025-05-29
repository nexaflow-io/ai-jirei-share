// サンプル画像をアップロードするスクリプト
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

// 画像ファイルパス
const imagePaths = {
  exterior: '/tmp/sample-images/exterior1.jpg',
  waterproof: '/tmp/sample-images/waterproof1.jpg',
  factory: '/tmp/sample-images/factory1.jpg'
};

// バケットの存在確認と作成
async function ensureBucketExists(bucketName) {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets.some(bucket => bucket.name === bucketName);
  
  if (!bucketExists) {
    console.log(`Creating bucket: ${bucketName}`);
    await supabase.storage.createBucket(bucketName, {
      public: true
    });
  } else {
    console.log(`Bucket already exists: ${bucketName}`);
  }
}

// 画像をアップロード
async function uploadImage(bucketName, filePath, caseId) {
  const fileName = path.basename(filePath);
  const fileExt = path.extname(fileName);
  const storagePath = `${caseId}/${Date.now()}${fileExt}`;
  
  console.log(`Uploading ${fileName} to ${bucketName}/${storagePath}`);
  
  const fileBuffer = fs.readFileSync(filePath);
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, fileBuffer, {
      contentType: 'image/jpeg',
      upsert: true
    });
    
  if (error) {
    console.error('Upload error:', error);
    return null;
  }
  
  // 公開URLを取得
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(storagePath);
    
  console.log('Upload successful. Public URL:', urlData.publicUrl);
  
  return {
    path: storagePath,
    url: urlData.publicUrl
  };
}

// データベースに画像情報を登録
async function saveImageToDatabase(caseId, imagePath, imageUrl) {
  const { data, error } = await supabase
    .from('case_images')
    .insert({
      case_id: caseId,
      tenant_id: '8d8be1ca-0adf-4299-90e5-f019a38444aa',
      image_url: imageUrl,
      image_path: imagePath,
      display_order: 0
    });
    
  if (error) {
    console.error('Database insert error:', error);
    return;
  }
  
  console.log('Image info saved to database');
}

// メイン処理
async function main() {
  try {
    // バケットの確認と作成
    await ensureBucketExists('case-images');
    
    // 外壁塗装の画像をアップロード
    const exteriorImage = await uploadImage('case-images', imagePaths.exterior, caseIds.exterior);
    if (exteriorImage) {
      await saveImageToDatabase(caseIds.exterior, exteriorImage.path, exteriorImage.url);
    }
    
    // 防水工事の画像をアップロード
    const waterproofImage = await uploadImage('case-images', imagePaths.waterproof, caseIds.waterproof);
    if (waterproofImage) {
      await saveImageToDatabase(caseIds.waterproof, waterproofImage.path, waterproofImage.url);
    }
    
    // 工場改修の画像をアップロード
    const factoryImage = await uploadImage('case-images', imagePaths.factory, caseIds.factory);
    if (factoryImage) {
      await saveImageToDatabase(caseIds.factory, factoryImage.path, factoryImage.url);
    }
    
    console.log('All images uploaded successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
