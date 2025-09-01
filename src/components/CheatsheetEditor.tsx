import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CheatsheetTable } from "./CheatsheetTable";
import { EditorCard } from "./EditorCard";
import { Cheatsheet, CheatsheetTable as TableType } from "@/types/cheatsheet";

interface CheatsheetEditorProps {
  cheatsheet: Cheatsheet;
  onUpdate: (cheatsheet: Cheatsheet) => void;
}

export function CheatsheetEditor({
  cheatsheet,
  onUpdate,
}: CheatsheetEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = cheatsheet.tables.findIndex(
        (table) => table.id === active.id
      );
      const newIndex = cheatsheet.tables.findIndex(
        (table) => table.id === over.id
      );

      const newTables = arrayMove(cheatsheet.tables, oldIndex, newIndex);

      onUpdate({
        ...cheatsheet,
        tables: newTables,
        updatedAt: new Date(),
      });
    }
  };

  const addTable = (table: TableType) => {
    onUpdate({
      ...cheatsheet,
      tables: [...cheatsheet.tables, table],
      updatedAt: new Date(),
    });
  };

  const deleteTable = (tableId: string) => {
    onUpdate({
      ...cheatsheet,
      tables: cheatsheet.tables.filter((table) => table.id !== tableId),
      updatedAt: new Date(),
    });
  };

  const updateTable = (updatedTable: TableType) => {
    const tableIndex = cheatsheet.tables.findIndex(
      (table) => table.id === updatedTable.id
    );
    if (tableIndex >= 0) {
      const newTables = [...cheatsheet.tables];
      newTables[tableIndex] = updatedTable;
      onUpdate({
        ...cheatsheet,
        tables: newTables,
        updatedAt: new Date(),
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-0 space-y-2">
      {/* Print-only header */}
      <div className="hidden print:block print:mb-0">
        <h1 className="text-2xl font-bold mb-0">{cheatsheet.name}</h1>
        {cheatsheet.description && (
          <p className="text-muted-foreground">{cheatsheet.description}</p>
        )}
      </div>

      {/* EditorCard only visible in editor view */}
      <EditorCard
        cheatsheet={cheatsheet}
        onUpdate={onUpdate}
        onAddTable={addTable}
      />

      {/* Cheatsheet tables*/}
      <div
        className={`gap-4 print:gap-4 print:text-xs print:w-full ${
          cheatsheet.columns === 2
            ? "columns-2 md:columns-2 print:columns-2"
            : "columns-2 md:columns-3 print:columns-3"
        }`}
      >
        {cheatsheet.tables.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[]}
          >
            <SortableContext
              items={cheatsheet.tables.map((table) => table.id)}
              strategy={verticalListSortingStrategy}
            >
              {cheatsheet.tables.map((table) => (
                <div
                  key={table.id}
                  className="break-inside-avoid mb-4 print:mb-4"
                >
                  <CheatsheetTable
                    table={table}
                    onDelete={deleteTable}
                    onUpdate={updateTable}
                  />
                </div>
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
