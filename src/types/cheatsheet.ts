export interface CheatsheetTable {
  id: string;
  title: string;
  rows: string[][];
  columnCount: number;
}

export interface Cheatsheet {
  id: string;
  name: string;
  description: string;
  columns: number;
  tables: CheatsheetTable[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CheatsheetSettings {
  columns: number;
  fontSize: 'small' | 'medium' | 'large';
}