import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TextAnalyzer from '../TextAnalyzer';
import { analyzeText } from '../../utils/openai';
import { hasApiKey } from '../../utils/api';
import { StructureField, DataType } from '../../types';

// Mock the API utilities
jest.mock('../../utils/openai');
jest.mock('../../utils/api');

const mockAnalyzeText = analyzeText as jest.MockedFunction<typeof analyzeText>;
const mockHasApiKey = hasApiKey as jest.MockedFunction<typeof hasApiKey>;

describe('TextAnalyzer', () => {
  const mockStructure: StructureField[] = [
    { name: 'title', type: 'string' as DataType },
    { name: 'date', type: 'date' as DataType },
    { name: 'amount', type: 'number' as DataType },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockHasApiKey.mockReturnValue(true);
  });

  it('renders input and result sections', () => {
    render(<TextAnalyzer structure={mockStructure} />);
    
    expect(screen.getByText('入力テキスト')).toBeInTheDocument();
    expect(screen.getByText('分析結果')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('分析するテキストを入力してください...')).toBeInTheDocument();
  });

  it('disables analyze button when input is empty', () => {
    render(<TextAnalyzer structure={mockStructure} />);
    
    const analyzeButton = screen.getByText('分析実行');
    expect(analyzeButton).toBeDisabled();
  });

  it('shows error when API key is not set', async () => {
    mockHasApiKey.mockReturnValue(false);
    render(<TextAnalyzer structure={mockStructure} />);
    
    const textarea = screen.getByPlaceholderText('分析するテキストを入力してください...');
    await act(async () => {
      await userEvent.type(textarea, 'テストテキスト');
    });
    
    const analyzeButton = screen.getByText('分析実行');
    await act(async () => {
      await userEvent.click(analyzeButton);
    });
    
    expect(screen.getByText('APIキーが設定されていません。API設定タブで設定してください。')).toBeInTheDocument();
  });

  it('analyzes text and displays results', async () => {
    const mockResult = {
      fields: {
        title: 'テストタイトル',
        date: '2024-03-28',
        amount: 1000,
      },
      memo: 'テストメモ',
    };
    
    mockAnalyzeText.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve(mockResult), 100);
    }));
    render(<TextAnalyzer structure={mockStructure} />);
    
    const textarea = screen.getByPlaceholderText('分析するテキストを入力してください...');
    await act(async () => {
      await userEvent.type(textarea, 'テストテキスト');
    });
    
    const analyzeButton = screen.getByText('分析実行');
    await act(async () => {
      await userEvent.click(analyzeButton);
    });
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '分析中...' })).toBeInTheDocument();
    }, { timeout: 2000 });
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('テストタイトル')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2024-03-28')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
      expect(screen.getByText('テストメモ')).toBeInTheDocument();
    });
  });

  it('handles API errors', async () => {
    mockAnalyzeText.mockRejectedValue(new Error('APIエラー'));
    render(<TextAnalyzer structure={mockStructure} />);
    
    const textarea = screen.getByPlaceholderText('分析するテキストを入力してください...');
    await act(async () => {
      await userEvent.type(textarea, 'テストテキスト');
    });
    
    const analyzeButton = screen.getByText('分析実行');
    await act(async () => {
      await userEvent.click(analyzeButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('APIエラー')).toBeInTheDocument();
    });
  });

  it('allows editing field values', async () => {
    const mockResult = {
      fields: {
        title: 'テストタイトル',
        date: '2024-03-28',
        amount: 1000,
      },
      memo: 'テストメモ',
    };
    
    mockAnalyzeText.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve(mockResult), 100);
    }));
    render(<TextAnalyzer structure={mockStructure} />);
    
    // 分析を実行
    const textarea = screen.getByPlaceholderText('分析するテキストを入力してください...');
    await act(async () => {
      await userEvent.type(textarea, 'テストテキスト');
    });
    const analyzeButton = screen.getByText('分析実行');
    await act(async () => {
      await userEvent.click(analyzeButton);
    });
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('テストタイトル')).toBeInTheDocument();
    });
    
    // フィールド値を編集
    const titleInput = screen.getByDisplayValue('テストタイトル');
    await act(async () => {
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, '新しいタイトル');
    });
    
    expect(screen.getByDisplayValue('新しいタイトル')).toBeInTheDocument();
  });

  it('copies field values to clipboard', async () => {
    const mockResult = {
      fields: {
        title: 'テストタイトル',
        date: '2024-03-28',
        amount: 1000,
      },
      memo: 'テストメモ',
    };
    
    mockAnalyzeText.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve(mockResult), 100);
    }));
    render(<TextAnalyzer structure={mockStructure} />);
    
    // 分析を実行
    const textarea = screen.getByPlaceholderText('分析するテキストを入力してください...');
    await act(async () => {
      await userEvent.type(textarea, 'テストテキスト');
    });
    const analyzeButton = screen.getByText('分析実行');
    await act(async () => {
      await userEvent.click(analyzeButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('値をコピー')).toBeInTheDocument();
    });
    
    // コピーボタンをクリック
    const copyButton = screen.getByText('値をコピー');
    await act(async () => {
      await userEvent.click(copyButton);
    });
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('テストタイトル\t2024-03-28\t1000');
    expect(screen.getByText('コピー完了')).toBeInTheDocument();
  });
}); 