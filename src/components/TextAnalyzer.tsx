import React, { useState } from 'react';
import { Send, Copy, Check } from 'lucide-react';
import { StructureField, AnalysisResult } from '../types';

interface TextAnalyzerProps {
  structure: StructureField[];
}

export default function TextAnalyzer({ structure }: TextAnalyzerProps) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const analyzeText = async () => {
    setLoading(true);
    try {
      // TODO: Implement OpenAI API call
      const mockResult: AnalysisResult = {
        fields: structure.reduce((acc, field) => ({
          ...acc,
          [field.name]: 'Sample value'
        }), {}),
        memo: input
      };
      setResult(mockResult);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFieldValue = (fieldName: string, value: string) => {
    if (!result) return;
    setResult({
      ...result,
      fields: {
        ...result.fields,
        [fieldName]: value
      }
    });
  };

  const copyToClipboard = async () => {
    if (!result) return;
    
    try {
      // Create a tab-separated string of field values
      const fieldValues = structure
        .map(field => result.fields[field.name])
        .join('\t');
      
      await navigator.clipboard.writeText(fieldValues);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Input Text</h2>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your text here..."
          className="w-full h-64 p-4 border rounded-md focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={analyzeText}
          disabled={loading || !input.trim()}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {loading ? (
            'Analyzing...'
          ) : (
            <>
              <Send size={20} className="mr-2" />
              Analyze
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Analysis Result</h2>
          {result && (
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {copied ? (
                <>
                  <Check size={16} className="mr-2 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} className="mr-2" />
                  Copy Values
                </>
              )}
            </button>
          )}
        </div>
        {result ? (
          <div className="space-y-4">
            {structure.map((field) => (
              <div key={field.name} className="border-b pb-2">
                <div className="text-sm text-gray-500">{field.name}</div>
                <input
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={result.fields[field.name]}
                  onChange={(e) => updateFieldValue(field.name, e.target.value)}
                  className="w-full mt-1 px-2 py-1 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                />
              </div>
            ))}
            <div>
              <div className="text-sm text-gray-500">Original Text (Memo)</div>
              <div className="mt-1 text-gray-700">{result.memo}</div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            Analysis results will appear here
          </div>
        )}
      </div>
    </div>
  );
}