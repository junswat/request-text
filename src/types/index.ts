export type DataType = 'string' | 'date' | 'number' | 'boolean';

export interface StructureField {
  name: string;
  type: DataType;
}

export interface AnalysisResult {
  fields: Record<string, any>;
  memo: string;
}

export interface ApiConfig {
  apiKey: string;
}