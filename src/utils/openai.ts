import { StructureField } from '../types';
import { getApiKey } from './api';

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}

export const analyzeText = async (
  text: string,
  structure: StructureField[]
): Promise<Record<string, any>> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('APIキーが設定されていません');
  }

  const prompt = createPrompt(text, structure);
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'あなたは与えられたテキストから必要な情報を抽出し、指定された形式でJSONを返すアシスタントです。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'APIリクエストに失敗しました');
  }

  const data: OpenAIResponse = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error('APIからの応答の解析に失敗しました');
  }
};

const createPrompt = (text: string, structure: StructureField[]): string => {
  const fieldsDescription = structure
    .map(field => `- ${field.name} (${field.type})`)
    .join('\n');

  return `以下のテキストから、指定された形式で情報を抽出してください。

テキスト:
${text}

必要な情報:
${fieldsDescription}

以下の形式でJSONを返してください：
{
  "fields": {
    "フィールド名": "抽出した値"
  },
  "memo": "元のテキスト"
}

注意事項：
- 日付は "YYYY-MM-DD" 形式で返してください
- 数値は文字列ではなく数値として返してください
- 真偽値は true/false として返してください
- 抽出できない値は null として返してください`;
}; 