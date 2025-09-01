import { useState } from "react";
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
import { AddTableDialog } from "./AddTableDialog";
import { Cheatsheet, CheatsheetTable as TableType } from "@/types/cheatsheet";
import { Download, Copy, Printer, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  cheatsheetToMarkdown,
  parseCheatsheetFromMarkdown,
} from "@/utils/markdown";

interface EditorCardProps {
  cheatsheet: Cheatsheet;
  onUpdate: (cheatsheet: Cheatsheet) => void;
  onAddTable: (table: TableType) => void;
}

export function EditorCard({
  cheatsheet,
  onUpdate,
  onAddTable,
}: EditorCardProps) {
  const { toast } = useToast();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importContent, setImportContent] = useState("");

  const updateField = (field: keyof Cheatsheet, value: string | number) => {
    onUpdate({
      ...cheatsheet,
      [field]: value,
      updatedAt: new Date(),
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
    <div className="pb-2.5 no-print">
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
            <AddTableDialog onAddTable={onAddTable} />
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
    </div>
  );
}
