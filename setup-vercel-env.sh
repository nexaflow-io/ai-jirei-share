#!/bin/bash

# .env.localから環境変数を読み込んでVercelに設定するスクリプト
while IFS= read -r line || [ -n "$line" ]; do
  # コメント行や空行をスキップ
  if [[ ! $line =~ ^# && -n $line ]]; then
    # 環境変数名と値を分離
    key=$(echo $line | cut -d= -f1)
    value=$(echo $line | cut -d= -f2-)
    
    # 環境変数を設定（本番環境用）
    echo "Setting $key for production..."
    echo $value | vercel env add $key production
    
    # 環境変数を設定（プレビュー環境用）
    echo "Setting $key for preview..."
    echo $value | vercel env add $key preview
    
    # 環境変数を設定（開発環境用）
    echo "Setting $key for development..."
    echo $value | vercel env add $key development
  fi
done < .env.local

echo "環境変数の設定が完了しました。"
echo "変更を反映するには 'vercel deploy --prod' を実行してください。"
