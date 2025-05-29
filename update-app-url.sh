#!/bin/bash

# 既存の環境変数を削除
echo "development" | vercel env rm NEXT_PUBLIC_APP_URL
echo "preview" | vercel env rm NEXT_PUBLIC_APP_URL
echo "production" | vercel env rm NEXT_PUBLIC_APP_URL

# 新しい値で環境変数を設定
echo "https://ai-jirei-share-a5qdn7sky-nexaflow.vercel.app" | vercel env add NEXT_PUBLIC_APP_URL development
echo "https://ai-jirei-share-a5qdn7sky-nexaflow.vercel.app" | vercel env add NEXT_PUBLIC_APP_URL preview
echo "https://ai-jirei-share-a5qdn7sky-nexaflow.vercel.app" | vercel env add NEXT_PUBLIC_APP_URL production

echo "環境変数の更新が完了しました。"
echo "変更を反映するには 'vercel deploy --prod' を実行してください。"
