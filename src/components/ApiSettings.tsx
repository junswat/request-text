import React, { useState, useEffect } from 'react';
import { Save, TestTube, AlertCircle } from 'lucide-react';
import { getApiKey, setApiKey, removeApiKey } from '../utils/api';
import { analyzeText } from '../utils/openai';

export default function ApiSettings() {
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedApiKey = getApiKey();
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const saveApiKey = () => {
    try {
      setApiKey(apiKey);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('APIキーの保存に失敗しました');
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setErrorMessage(null);
    try {
      // テスト用の簡単な分析を実行
      await analyzeText('テストテキスト', [
        { name: 'test', type: 'string' }
      ]);
      setTestResult('success');
    } catch (error) {
      setTestResult('error');
      setErrorMessage(error instanceof Error ? error.message : '接続テストに失敗しました');
    } finally {
      setTesting(false);
    }
  };

  const clearApiKey = () => {
    removeApiKey();
    setApiKey('');
    setTestResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">OpenAI API設定</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
            APIキー
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="OpenAI APIキーを入力してください"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {errorMessage && (
          <div className="flex items-center text-red-500 text-sm">
            <AlertCircle size={16} className="mr-1" />
            {errorMessage}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={saveApiKey}
            disabled={!apiKey.trim()}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            <Save size={20} className="mr-2" />
            APIキーを保存
          </button>
          
          <button
            onClick={testConnection}
            disabled={!apiKey.trim() || testing}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
          >
            <TestTube size={20} className="mr-2" />
            {testing ? 'テスト中...' : '接続テスト'}
          </button>
        </div>

        {testResult && (
          <div
            className={`mt-4 p-4 rounded-md ${
              testResult === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {testResult === 'success'
              ? '接続テストが成功しました！'
              : '接続テストに失敗しました。APIキーを確認してください。'}
          </div>
        )}

        {getApiKey() && (
          <button
            onClick={clearApiKey}
            className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            APIキーを削除
          </button>
        )}
      </div>
    </div>
  );
}