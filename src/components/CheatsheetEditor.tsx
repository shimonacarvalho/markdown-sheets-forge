import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheatsheetTable } from "./CheatsheetTable";
import { AddTableDialog } from "./AddTableDialog";
import { Cheatsheet, CheatsheetTable as TableType } from "@/types/cheatsheet";
import { Download, Copy, Printer, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  cheatsheetToMarkdown,
  parseMarkdownTable,
  parseCheatsheetFromMarkdown,
} from "@/utils/markdown";

interface CheatsheetEditorProps {
  cheatsheet: Cheatsheet;
  onUpdate: (cheatsheet: Cheatsheet) => void;
}

export function CheatsheetEditor({
  cheatsheet,
  onUpdate,
}: CheatsheetEditorProps) {
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

  const updateField = (field: keyof Cheatsheet, value: any) => {
    onUpdate({
      ...cheatsheet,
      [field]: value,
      updatedAt: new Date(),
    });
  };

  const exportToMarkdown = () => {
    const markdown = cheatsheetToMarkdown(cheatsheet);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cheatsheet.name.replace(/\s+/g, "-").toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: "Cheatsheet exported as markdown file",
    });
  };

  const copyToClipboard = () => {
    const markdown = cheatsheetToMarkdown(cheatsheet);
    navigator.clipboard.writeText(markdown).then(() => {
      toast({
        title: "Copied",
        description: "Cheatsheet copied to clipboard as markdown",
      });
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importContent, setImportContent] = useState("");

  const handleImport = () => {
    try {
      const result = parseCheatsheetFromMarkdown(importContent);

      if (!result) {
        toast({
          title: "Error",
          description: "No valid cheatsheet found in the imported content",
          variant: "destructive",
        });
        return;
      }

      // Update the cheatsheet
      onUpdate({
        ...cheatsheet,
        name: result.name,
        description: result.description,
        tables: result.tables,
        updatedAt: new Date(),
      });

      setIsImportOpen(false);
      setImportContent("");

      toast({
        title: "Imported",
        description: `Successfully imported ${result.tables.length} tables`,
      });
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Error",
        description: "Failed to import cheatsheet. Please check the format.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-0 space-y-2">
      {/* Print-only header */}
      <div className="hidden print:block print:mb-6">
        <h1 className="text-2xl font-bold mb-2">{cheatsheet.name}</h1>
        {cheatsheet.description && (
          <p className="text-muted-foreground">{cheatsheet.description}</p>
        )}
      </div>

      {/* Header */}
      <Card className="no-print">
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
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Enter cheatsheet name"
              />
            </div>
            <div>
              <Label htmlFor="columns">Columns</Label>
              <Select
                value={cheatsheet.columns.toString()}
                onValueChange={(value) =>
                  updateField("columns", parseInt(value))
                }
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
              onChange={(e) => updateField("description", e.target.value)}
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
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Import Cheatsheet</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="import-content">
                      Paste your cheatsheet markdown here
                    </Label>
                    <Textarea
                      id="import-content"
                      value={importContent}
                      onChange={(e) => setImportContent(e.target.value)}
                      placeholder="Paste the markdown content from a copied cheatsheet..."
                      className="min-h-[300px] font-mono text-sm"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsImportOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleImport}>Import</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              onClick={copyToClipboard}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Print-optimized layout */}
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
