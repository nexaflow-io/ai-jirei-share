import { OpenAI } from 'openai';

// OpenAIクライアントの初期化
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI質問用のプロンプトテンプレート
export const createPrompt = (caseData: any, question: string) => {
  return `
あなたは建設業界の専門AIアシスタントです。以下の工事事例に関する質問に答えてください。

【工事事例情報】
工事名: ${caseData.name}
課題・問題点: ${caseData.description}
工夫・解決策: ${caseData.solution}
結果・成果: ${caseData.result}

【質問】
${question}

回答は簡潔かつ専門的に、日本語で行ってください。
`;
};
