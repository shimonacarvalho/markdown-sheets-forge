import { CheatsheetTable as TableType } from '@/types/cheatsheet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CheatsheetTableProps {
  table: TableType;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

export function CheatsheetTable({ table, onDelete, isDragging }: CheatsheetTableProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: sortableIsDragging,
  } = useSortable({ id: table.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCurrentlyDragging = isDragging || sortableIsDragging;

  if (table.rows.length === 0) return null;

  const [headers, ...dataRows] = table.rows;

  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      className={`relative group transition-all duration-200 print-table ${
        isCurrentlyDragging ? 'dragging shadow-lg' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between p-3 border-b no-print">
        <div className="flex items-center gap-2">
          <div 
            className="drag-handle"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <h3 className="font-medium text-sm">{table.title}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(table.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="p-3">
        <table className="cheatsheet-table">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}