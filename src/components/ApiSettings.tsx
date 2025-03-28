import React, { useState } from 'react';
import { Save, TestTube } from 'lucide-react';

export default function ApiSettings() {
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const saveApiKey = () => {
    // TODO: Implement secure API key storage
    localStorage.setItem('openai_api_key', apiKey);
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      // TODO: Implement API connection test
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTestResult('success');
    } catch (error) {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">OpenAI API Settings</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
            API Key
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your OpenAI API key"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={saveApiKey}
            disabled={!apiKey.trim()}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            <Save size={20} className="mr-2" />
            Save API Key
          </button>
          
          <button
            onClick={testConnection}
            disabled={!apiKey.trim() || testing}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
          >
            <TestTube size={20} className="mr-2" />
            {testing ? 'Testing...' : 'Test Connection'}
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
              ? 'Connection test successful!'
              : 'Connection test failed. Please check your API key.'}
          </div>
        )}
      </div>
    </div>
  );
}