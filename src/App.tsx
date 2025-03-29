import React, { useState, useEffect } from 'react';
import { Settings, FileText, Key, LogOut } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import StructureEditor from './components/StructureEditor';
import TextAnalyzer from './components/TextAnalyzer';
import ApiSettings from './components/ApiSettings';
import { Login } from './components/Login';
import { AuthCallback } from './components/AuthCallback';
import { PrivateRoute } from './components/PrivateRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StructureField } from './types';

// デフォルトの構造設定
const DEFAULT_STRUCTURE: StructureField[] = [
  { 
    name: 'Title',
    type: 'string',
    description: 'タイトルまたは件名'
  },
  { 
    name: 'Date_start',
    type: 'date',
    description: '開始日（YYYY-MM-DD形式）'
  },
  { 
    name: 'Date_end',
    type: 'date',
    description: '終了日（YYYY-MM-DD形式）'
  },
  { 
    name: 'requester',
    type: 'string',
    description: '依頼者名'
  }
];

// GitHub Pagesのベースパスを考慮したストレージキー
const BASE_PATH = '/request-text';
const STORAGE_KEY = `${BASE_PATH}/text_analyzer_structure`;

function AppContent() {
  const [activeTab, setActiveTab] = useState<'structure' | 'analyze' | 'settings'>('analyze');
  const [structure, setStructure] = useState<StructureField[]>(DEFAULT_STRUCTURE);
  const { signOut } = useAuth();

  // 初回マウント時に保存された設定を読み込む
  useEffect(() => {
    try {
      console.log('Loading structure from:', STORAGE_KEY);
      const savedStructure = localStorage.getItem(STORAGE_KEY);
      console.log('Loaded structure:', savedStructure);
      
      if (savedStructure) {
        const parsed = JSON.parse(savedStructure);
        setStructure(parsed);
        console.log('Successfully loaded and parsed structure');
      } else {
        console.log('No saved structure found, using default');
      }
    } catch (error) {
      console.error('Failed to load saved structure:', error);
      setStructure(DEFAULT_STRUCTURE);
    }
  }, []);

  // structureが変更されたときに自動保存
  useEffect(() => {
    try {
      console.log('Saving structure to:', STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(structure));
      console.log('Successfully saved structure');
    } catch (error) {
      console.error('Failed to save structure:', error);
    }
  }, [structure]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-900">Text Structure Analyzer</h1>
            <nav className="flex space-x-4 items-center">
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
              <button
                onClick={signOut}
                className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <LogOut size={20} />
                ログアウト
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

function App() {
  return (
    <Router basename="/request-text">
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AppContent />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;