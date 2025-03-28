import { StructureField, AnalysisResult } from '../types';
import { getApiKey } from './api';

export async function analyzeText(text: string, structure: StructureField[]): Promise<AnalysisResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('APIキーが設定されていません');
  }

  const fieldDescriptions = structure.map(field => {
    const description = field.description ? ` (${field.description})` : '';
    return `${field.name}: ${field.type}${description}`;
  }).join('\n');

  const currentYear = new Date().getFullYear();

  const prompt = `
以下のテキストを解析し、指定された構造でJSONデータを生成してください。
日付フィールドは必ずYYYY-MM-DD形式で出力してください。年が明示されていない場合は${currentYear}年と解釈してください。
期間を表す2つの日付がある場合、Date_startとDate_endの両方に年月日を含む完全な日付を設定してください。

解析するテキスト:
${text}

必要なフィールド:
${fieldDescriptions}

注意事項:
- 日付は必ずYYYY-MM-DD形式で出力（例: ${currentYear}-04-15）
- 日付範囲の場合、開始日と終了日を別々のフィールドに分けて出力
- 数値は文字列ではなく数値型で出力
- 抽出できない場合は空文字列や0ではなく、nullを設定
- コードブロックやMarkdown記法は使用せず、純粋なJSONのみを返してください

応答形式:
{
  "fields": {
    [フィールド名]: 値,
    ...
  },
  "memo": "元のテキスト"
}`;

  try {
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
            content: 'あなたは正確なデータ抽出を行うアシスタントです。特に日付や数値の抽出を正確に行います。応答は必ず純粋なJSONのみを返してください。Markdown記法は使用しないでください。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }  // JSON形式の応答を強制
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    // Markdownのコードブロックを削除
    content = content.replace(/```json\n?|\n?```/g, '');

    try {
      const result = JSON.parse(content);

      // 日付フィールドの形式を検証
      structure.forEach(field => {
        if (field.type === 'date' && result.fields[field.name]) {
          const dateStr = result.fields[field.name];
          if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            throw new Error(`Invalid date format for ${field.name}: ${dateStr}`);
          }
        }
      });

      return result;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw content:', content);
      throw new Error('APIからの応答をJSONとして解析できませんでした');
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
} 