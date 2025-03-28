// APIキーは環境変数から取得
export const getApiKey = (): string | null => {
  return import.meta.env.VITE_OPENAI_API_KEY || null;
};

export const hasApiKey = (): boolean => {
  return !!getApiKey();
}; 