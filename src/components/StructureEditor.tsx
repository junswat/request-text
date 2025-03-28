import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { StructureField, DataType } from '../types';

interface StructureEditorProps {
  structure: StructureField[];
  setStructure: React.Dispatch<React.SetStateAction<StructureField[]>>;
}

interface ValidationError {
  index: number;
  message: string;
}

export default function StructureEditor({ structure, setStructure }: StructureEditorProps) {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const validateFieldName = (name: string, index: number): string | null => {
    if (!name.trim()) {
      return 'フィールド名は必須です';
    }
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      return 'フィールド名は英数字とアンダースコアのみ使用できます。最初の文字は英字またはアンダースコアである必要があります。';
    }
    const duplicateIndex = structure.findIndex((field, i) => i !== index && field.name === name);
    if (duplicateIndex !== -1) {
      return 'このフィールド名は既に使用されています';
    }
    return null;
  };

  const addField = () => {
    setStructure([...structure, { name: '', type: 'string' }]);
    setErrors([]);
  };

  const removeField = (index: number) => {
    setStructure(structure.filter((_, i) => i !== index));
    setErrors(errors.filter(error => error.index !== index));
  };

  const updateField = (index: number, field: Partial<StructureField>) => {
    setStructure(
      structure.map((item, i) => (i === index ? { ...item, ...field } : item))
    );

    if ('name' in field) {
      const error = validateFieldName(field.name || '', index);
      setErrors((prev: ValidationError[]) => {
        const newErrors = prev.filter(e => e.index !== index);
        if (error) {
          newErrors.push({ index, message: error });
        }
        return newErrors;
      });
    }
  };

  const exportStructure = () => {
    const jsonString = JSON.stringify(structure, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'structure.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importStructure = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const importedStructure = JSON.parse(e.target?.result as string) as StructureField[];
        if (Array.isArray(importedStructure) && importedStructure.every(field => 
          typeof field.name === 'string' && 
          ['string', 'date', 'number', 'boolean'].includes(field.type)
        )) {
          setStructure(importedStructure);
          setErrors([]);
        } else {
          alert('無効な構造データです');
        }
      } catch (error) {
        alert('JSONファイルの解析に失敗しました');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">データ構造の定義</h2>
        <div className="flex gap-2">
          <button
            onClick={exportStructure}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            エクスポート
          </button>
          <label className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
            インポート
            <input
              type="file"
              accept=".json"
              onChange={importStructure}
              className="hidden"
            />
          </label>
        </div>
      </div>
      
      <div className="space-y-4">
        {structure.map((field, index) => (
          <div key={index} className="space-y-1">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => updateField(index, { name: e.target.value })}
                  placeholder="フィールド名"
                  className={`w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    errors.some(e => e.index === index) ? 'border-red-500' : ''
                  }`}
                />
                {errors.some(e => e.index === index) && (
                  <div className="flex items-center text-red-500 text-sm mt-1">
                    <AlertCircle size={16} className="mr-1" />
                    {errors.find(e => e.index === index)?.message}
                  </div>
                )}
              </div>
              <select
                value={field.type}
                onChange={(e) => updateField(index, { type: e.target.value as DataType })}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="string">文字列</option>
                <option value="date">日付</option>
                <option value="number">数値</option>
                <option value="boolean">真偽値</option>
              </select>
              <button
                onClick={() => removeField(index)}
                className="p-2 text-gray-400 hover:text-red-500"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addField}
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <Plus size={20} className="mr-2" />
        フィールドを追加
      </button>
    </div>
  );
}