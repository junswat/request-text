import React from 'react';
import { hasApiKey } from '../utils/api';

export default function ApiSettings() {
  const hasKey = hasApiKey();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">API設定</h2>
      {hasKey ? (
        <div className="text-green-600">
          APIキーが設定されています。
        </div>
      ) : (
        <div className="text-red-600">
          APIキーが設定されていません。管理者に連絡してください。
        </div>
      )}
    </div>
  );
}