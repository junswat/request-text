export type DataType = 'string' | 'number' | 'date';

export interface StructureField {
  name: string;
  type: DataType;
  description?: string;
}

export interface AnalysisResult {
  fields: Record<string, any>;
  memo: string;
} 