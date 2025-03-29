import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle, GripVertical } from 'lucide-react';
import { StructureField, DataType } from '../types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface StructureEditorProps {
  structure: StructureField[];
  setStructure: React.Dispatch<React.SetStateAction<StructureField[]>>;
}

interface ValidationError {
  index: number;
  message: string;
}

// ドラッグ可能なフィールドコンポーネント
function SortableField({ field, index, updateField, removeField, error }: {
  field: StructureField;
  index: number;
  updateField: (index: number, field: Partial<StructureField>) => void;
  removeField: (index: number) => void;
  error?: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex gap-4 items-start bg-white p-2 rounded-lg">
      <div className="cursor-move text-gray-400 hover:text-gray-600" {...attributes} {...listeners}>
        <GripVertical size={20} />
      </div>
      <div className="flex-1">
        <input
          type="text"
          value={field.name}
          onChange={(e) => updateField(index, { name: e.target.value })}
          placeholder="フィールド名"
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          value={field.description || ''}
          onChange={(e) => updateField(index, { description: e.target.value })}
          placeholder="フィールドの説明（AIへの指示）"
          className="w-full mt-2 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 text-sm"
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
  );
}

export default function StructureEditor({ structure, setStructure }: StructureEditorProps) {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = structure.findIndex((item) => item.name === active.id);
      const newIndex = structure.findIndex((item) => item.name === over.id);
      
      setStructure(arrayMove(structure, oldIndex, newIndex));
    }
  };

  const addField = () => {
    setStructure([...structure, { name: '', type: 'string', description: '' }]);
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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">データ構造の定義</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
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
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            エクスポート
          </button>
          <label className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
            インポート
            <input
              type="file"
              accept=".json"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (e) => {
                  try {
                    const importedStructure = JSON.parse(e.target?.result as string);
                    if (Array.isArray(importedStructure) && importedStructure.every(field => 
                      typeof field.name === 'string' && 
                      ['string', 'date', 'number'].includes(field.type)
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
              }}
              className="hidden"
            />
          </label>
        </div>
      </div>
      
      <div className="space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={structure.map(item => item.name)}
            strategy={verticalListSortingStrategy}
          >
            {structure.map((field, index) => (
              <SortableField
                key={field.name || index}
                field={field}
                index={index}
                updateField={updateField}
                removeField={removeField}
                error={errors.find(e => e.index === index)?.message}
              />
            ))}
          </SortableContext>
        </DndContext>
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