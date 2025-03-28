import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { StructureField, DataType } from '../types';

interface StructureEditorProps {
  structure: StructureField[];
  setStructure: React.Dispatch<React.SetStateAction<StructureField[]>>;
}

export default function StructureEditor({ structure, setStructure }: StructureEditorProps) {
  const addField = () => {
    setStructure([...structure, { name: '', type: 'string' }]);
  };

  const removeField = (index: number) => {
    setStructure(structure.filter((_, i) => i !== index));
  };

  const updateField = (index: number, field: Partial<StructureField>) => {
    setStructure(
      structure.map((item, i) => (i === index ? { ...item, ...field } : item))
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Data Structure Definition</h2>
      
      <div className="space-y-4">
        {structure.map((field, index) => (
          <div key={index} className="flex gap-4 items-center">
            <input
              type="text"
              value={field.name}
              onChange={(e) => updateField(index, { name: e.target.value })}
              placeholder="Field name"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <select
              value={field.type}
              onChange={(e) => updateField(index, { type: e.target.value as DataType })}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="string">String</option>
              <option value="date">Date</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
            </select>
            <button
              onClick={() => removeField(index)}
              className="p-2 text-gray-400 hover:text-red-500"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addField}
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <Plus size={20} className="mr-2" />
        Add Field
      </button>
    </div>
  );
}