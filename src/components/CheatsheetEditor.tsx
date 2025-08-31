import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CheatsheetTable } from './CheatsheetTable';
import { AddTableDialog } from './AddTableDialog';
import { Cheatsheet, CheatsheetTable as TableType } from '@/types/cheatsheet';
import { Download, Copy, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cheatsheetToMarkdown } from '@/utils/markdown';

interface CheatsheetEditorProps {
  cheatsheet: Cheatsheet;
  onUpdate: (cheatsheet: Cheatsheet) => void;
}

export function CheatsheetEditor({ cheatsheet, onUpdate }: CheatsheetEditorProps) {
  const { toast } = useToast();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = cheatsheet.tables.findIndex((table) => table.id === active.id);
      const newIndex = cheatsheet.tables.findIndex((table) => table.id === over.id);

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
      tables: cheatsheet.tables.filter(table => table.id !== tableId),
      updatedAt: new Date(),
    });
  };

  const updateTable = (updatedTable: TableType) => {
    const tableIndex = cheatsheet.tables.findIndex(table => table.id === updatedTable.id);
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

  const updateField = (field: keyof Cheatsheet, value: any) => {
    onUpdate({
      ...cheatsheet,
      [field]: value,
      updatedAt: new Date(),
    });
  };

  const exportToMarkdown = () => {
    const markdown = cheatsheetToMarkdown(cheatsheet);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cheatsheet.name.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Exported',
      description: 'Cheatsheet exported as markdown file',
    });
  };

  const copyToClipboard = () => {
    const markdown = cheatsheetToMarkdown(cheatsheet);
    navigator.clipboard.writeText(markdown).then(() => {
      toast({
        title: 'Copied',
        description: 'Cheatsheet copied to clipboard as markdown',
      });
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Cheatsheet Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={cheatsheet.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Enter cheatsheet name"
              />
            </div>
            <div>
              <Label htmlFor="columns">Columns</Label>
              <Select 
                value={cheatsheet.columns.toString()} 
                onValueChange={(value) => updateField('columns', parseInt(value))}
              >
                <SelectTrigger id="columns">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={cheatsheet.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Brief description of the cheatsheet"
              className="min-h-[80px]"
            />
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            <AddTableDialog onAddTable={addTable} />
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={exportToMarkdown} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" onClick={copyToClipboard} className="gap-2">
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Print-optimized layout */}
      <div className={`grid gap-4 print:gap-2 ${
        cheatsheet.columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
      } print:text-xs`}>
        {cheatsheet.tables.length > 0 ? (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext 
              items={cheatsheet.tables.map(table => table.id)}
              strategy={verticalListSortingStrategy}
            >
              {cheatsheet.tables.map((table) => (
                <CheatsheetTable
                  key={table.id}
                  table={table}
                  onDelete={deleteTable}
                  onUpdate={updateTable}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No tables added yet</p>
                <AddTableDialog onAddTable={addTable} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}