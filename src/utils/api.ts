const API_KEY_STORAGE_KEY = 'openai_api_key';

export const getApiKey = (): string | null => {
  return import.meta.env.VITE_OPENAI_API_KEY || null;
};

export const setApiKey = (apiKey: string): void => {
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
};

export const removeApiKey = (): void => {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
};

export const hasApiKey = (): boolean => {
  return !!getApiKey();
}; 