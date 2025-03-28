import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { StructureField, DataType } from '../types';

const STORAGE_KEY = 'structure_settings';

export default function StructureSettings() {
  const [fields, setFields] = useState<StructureField[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // 保存された設定を読み込む
    const savedStructure = localStorage.getItem(STORAGE_KEY);
    if (savedStructure) {
      try {
        setFields(JSON.parse(savedStructure));
      } catch (error) {
        console.error('Failed to load saved structure:', error);
      }
    }
  }, []);

  const addField = () => {
    setFields([...fields, { name: '', type: 'string' }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, field: Partial<StructureField>) => {
    setFields(fields.map((f, i) => i === index ? { ...f, ...field } : f));
  };

  const saveStructure = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save structure:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">構造設定</h2>
      
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={index} className="flex gap-4 items-start">
            <div className="flex-1">
              <input
                type="text"
                value={field.name}
                onChange={(e) => updateField(index, { name: e.target.value })}
                placeholder="フィールド名"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="w-40">
              <select
                value={field.type}
                onChange={(e) => updateField(index, { type: e.target.value as DataType })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              >
                <option value="string">文字列</option>
                <option value="number">数値</option>
                <option value="date">日付</option>
              </select>
            </div>
            <button
              onClick={() => removeField(index)}
              className="p-2 text-red-500 hover:text-red-700"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}

        <div className="flex gap-4">
          <button
            onClick={addField}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus size={20} className="mr-2" />
            フィールドを追加
          </button>

          <button
            onClick={saveStructure}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Save size={20} className="mr-2" />
            {saved ? '保存しました' : '設定を保存'}
          </button>
        </div>
      </div>
    </div>
  );
} 