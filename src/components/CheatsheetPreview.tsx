import { Cheatsheet } from '@/types/cheatsheet';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';

interface CheatsheetPreviewProps {
  cheatsheet: Cheatsheet;
  onBack: () => void;
}

export function CheatsheetPreview({ cheatsheet, onBack }: CheatsheetPreviewProps) {
  const handlePrint = () => {
    window.print();
  };

  const columnCount = cheatsheet.columns;
  const tablesPerColumn = Math.ceil(cheatsheet.tables.length / columnCount);
  
  const columns: typeof cheatsheet.tables[] = [];
  for (let i = 0; i < columnCount; i++) {
    const start = i * tablesPerColumn;
    const end = start + tablesPerColumn;
    columns.push(cheatsheet.tables.slice(start, end));
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Print Controls */}
      <div className="no-print border-b bg-surface/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Editor
            </Button>
            <div>
              <h1 className="font-semibold">{cheatsheet.name}</h1>
              {cheatsheet.description && (
                <p className="text-sm text-muted-foreground">{cheatsheet.description}</p>
              )}
            </div>
          </div>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Print Content */}
      <div className="print-page max-w-7xl mx-auto p-6">
        {/* Header for print */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2">{cheatsheet.name}</h1>
          {cheatsheet.description && (
            <p className="text-muted-foreground">{cheatsheet.description}</p>
          )}
        </div>

        {/* Tables in columns */}
        <div 
          className={`grid gap-6 ${
            columnCount === 2 ? 'grid-cols-2' : 'grid-cols-3'
          }`}
        >
          {columns.map((columnTables, columnIndex) => (
            <div key={columnIndex} className="space-y-4">
              {columnTables.map((table) => {
                if (table.rows.length === 0) return null;
                
                const [headers, ...dataRows] = table.rows;
                
                return (
                  <div key={table.id} className="break-inside-avoid">
                    <table className="cheatsheet-table text-xs">
                      <thead>
                        <tr>
                          <th colSpan={headers.length} className="text-center font-bold bg-primary/5 border-b-2 border-primary/20 px-2 py-1">
                            {table.title}
                          </th>
                        </tr>
                        <tr>
                          {headers.map((header, index) => (
                            <th key={index} className="px-2 py-1">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dataRows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="px-2 py-0.5">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {cheatsheet.tables.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tables to display</p>
          </div>
        )}
      </div>
    </div>
  );
}