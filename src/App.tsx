import React, { useState } from 'react';
import { Settings, FileText, Key } from 'lucide-react';
import StructureEditor from './components/StructureEditor';
import TextAnalyzer from './components/TextAnalyzer';
import ApiSettings from './components/ApiSettings';
import { StructureField } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<'structure' | 'analyze' | 'settings'>('structure');
  const [structure, setStructure] = useState<StructureField[]>([
    { name: 'Title', type: 'string' },
    { name: 'Date', type: 'date' },
    { name: 'Amount', type: 'number' },
    { name: 'IsActive', type: 'boolean' }
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-900">Text Structure Analyzer</h1>
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('structure')}
                className={'px-3 py-2 rounded-md ' + (activeTab === 'structure' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100') + ' flex items-center gap-2'}
              >
                <Settings size={20} />
                Structure
              </button>
              <button
                onClick={() => setActiveTab('analyze')}
                className={'px-3 py-2 rounded-md ' + (activeTab === 'analyze' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100') + ' flex items-center gap-2'}
              >
                <FileText size={20} />
                Analyze
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={'px-3 py-2 rounded-md ' + (activeTab === 'settings' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100') + ' flex items-center gap-2'}
              >
                <Key size={20} />
                API Settings
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'structure' && (
          <StructureEditor structure={structure} setStructure={setStructure} />
        )}
        {activeTab === 'analyze' && (
          <TextAnalyzer structure={structure} />
        )}
        {activeTab === 'settings' && (
          <ApiSettings />
        )}
      </main>
    </div>
  );
}

export default App;