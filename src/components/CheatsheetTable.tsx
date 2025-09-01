import { useState } from "react";
import { CheatsheetTable as TableType } from "@/types/cheatsheet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GripVertical, Trash2, Edit, Save, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { parseMarkdownTable } from "@/utils/markdown";

interface CheatsheetTableProps {
  table: TableType;
  onDelete: (id: string) => void;
  onUpdate: (table: TableType) => void;
  isDragging?: boolean;
}

export function CheatsheetTable({
  table,
  onDelete,
  onUpdate,
  isDragging,
}: CheatsheetTableProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

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

  const dataRows = table.rows;

  const handleEdit = () => {
    // Convert table back to markdown for editing
    let markdown = `| ${table.title} |\n`;
    markdown += `| ${dataRows[0].map(() => "--------").join(" | ")} |\n`;
    dataRows.forEach((row) => {
      markdown += `| ${row.join(" | ")} |\n`;
    });

    setEditContent(markdown);
    setIsEditing(true);
  };

  const handleSave = () => {
    try {
      const updatedTable = parseMarkdownTable(editContent);
      if (updatedTable) {
        onUpdate({
          ...table,
          title: updatedTable.title,
          rows: updatedTable.rows,
          columnCount: updatedTable.columnCount,
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error parsing markdown:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent("");
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`relative group transition-all duration-200 print-table print:border-0 print:shadow-none ${
        isCurrentlyDragging ? "dragging shadow-lg" : "hover:shadow-md"
      }`}
    >
      <div className="flex items-center justify-between p-3 border-b no-print bg-gray-100">
        <div className="flex items-center gap-2">
          <div
            className="drag-handle cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-md uppercase">{table.title}</h3>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(table.id)}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600"
              >
                <Save className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="print:p-0">
        {isEditing ? (
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[150px] font-mono text-sm"
            placeholder="Edit your markdown table here..."
          />
        ) : (
          <table className="cheatsheet-table w-full print:mb-0 mb-5 ">
            <thead className="hidden print:table-header-group">
              <tr>
                <th
                  colSpan={table.columnCount}
                  className="text-center font-bold bg-gray-100 uppercase px-2 py-1"
                >
                  {table.title}
                </th>
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="text-sm">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}
