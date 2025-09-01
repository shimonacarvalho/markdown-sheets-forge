import { CheatsheetTable, Cheatsheet } from '@/types/cheatsheet';

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

export function cheatsheetToMarkdown(cheatsheet: Cheatsheet): string {
  let markdown = `# ${cheatsheet.name}\n\n`;
  
  if (cheatsheet.description) {
    markdown += `${cheatsheet.description}\n\n`;
  }
  
  cheatsheet.tables.forEach((table: CheatsheetTable) => {
    markdown += tableToMarkdown(table) + '\n';
  });
  
  return markdown;
}

export function parseCheatsheetFromMarkdown(markdown: string): { name: string; description: string; tables: CheatsheetTable[] } | null {
  try {
    const lines = markdown.trim().split('\n');
    if (lines.length === 0) return null;

    // Parse the cheatsheet header
    let name = 'Imported Cheatsheet';
    let description = '';
    let currentIndex = 0;

    // Check for title
    if (lines[0].startsWith('# ')) {
      name = lines[0].substring(2).trim();
      currentIndex = 1;
    }

    // Check for description (lines after title until first table)
    const descriptionLines = [];
    while (currentIndex < lines.length && !lines[currentIndex].startsWith('|')) {
      const line = lines[currentIndex].trim();
      if (line) {
        descriptionLines.push(line);
      }
      currentIndex++;
    }
    description = descriptionLines.join('\n');

    // Parse tables
    const tables: CheatsheetTable[] = [];
    let tableContent = '';
    
    for (let i = currentIndex; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('|')) {
        tableContent += line + '\n';
      } else if (tableContent.trim()) {
        // End of table, parse it
        const table = parseMarkdownTable(tableContent.trim());
        if (table) {
          tables.push(table);
        }
        tableContent = '';
      }
    }
    
    // Parse last table if exists
    if (tableContent.trim()) {
      const table = parseMarkdownTable(tableContent.trim());
      if (table) {
        tables.push(table);
      }
    }

    if (tables.length === 0) return null;

    return { name, description, tables };
  } catch (error) {
    console.error('Error parsing cheatsheet from markdown:', error);
    return null;
  }
}