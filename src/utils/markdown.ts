import { CheatsheetTable } from '@/types/cheatsheet';

export function parseMarkdownTable(markdown: string): CheatsheetTable | null {
  // Split markdown into lines and filter out empty lines
  const lines = markdown.trim().split('\n').filter(line => line.trim());
  
  if (lines.length < 2) return null;
  
  // Extract title from first line (if it's a header)
  let title = '';
  let startIndex = 0;
  
  if (lines[0].startsWith('|') && lines[0].endsWith('|')) {
    const firstRow = lines[0].split('|').map(cell => cell.trim()).filter(cell => cell);
    if (firstRow.length === 1) {
      title = firstRow[0];
      startIndex = 1;
    }
  }
  
  // Find separator line (contains dashes)
  const separatorIndex = lines.findIndex((line, index) => 
    index >= startIndex && line.includes('-') && line.includes('|')
  );
  
  if (separatorIndex === -1) return null;
    
  // Parse data rows
  const dataRows: string[][] = [];
  const columnCount = lines[separatorIndex].split('|').length;
  for (let i = separatorIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.includes('|')) continue;
    
    const cells = line.split('|')
      .map(cell => cell.trim())
      .filter(cell => cell);
    
    if (cells.length > 0) {
      dataRows.push(cells);
    }

  }
    
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    title: title || 'Untitled Table',
    rows: dataRows,
    columnCount: columnCount
  };
}

export function tableToMarkdown(table: CheatsheetTable): string {
  if (table.rows.length === 0) return '';
  
  let markdown = `| ${table.title} |\n`;
  
  const dataRows = table.rows;
  
  
  // Add separator
  const separator = Array(table.columnCount).fill('--------').join(' | ');
  markdown += `| ${separator} |\n`;
  
  // Add data rows
  dataRows.forEach(row => {
    markdown += `| ${row.join(' | ')} |\n`;
  });
  
  return markdown;
}

export function cheatsheetToMarkdown(cheatsheet: any): string {
  let markdown = `# ${cheatsheet.name}\n\n`;
  
  if (cheatsheet.description) {
    markdown += `${cheatsheet.description}\n\n`;
  }
  
  cheatsheet.tables.forEach((table: CheatsheetTable) => {
    markdown += tableToMarkdown(table) + '\n';
  });
  
  return markdown;
}