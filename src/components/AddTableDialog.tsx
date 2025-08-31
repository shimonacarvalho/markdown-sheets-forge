import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { parseMarkdownTable } from '@/utils/markdown';
import { CheatsheetTable } from '@/types/cheatsheet';
import { useToast } from '@/hooks/use-toast';

interface AddTableDialogProps {
  onAddTable: (table: CheatsheetTable) => void;
}

export function AddTableDialog({ onAddTable }: AddTableDialogProps) {
  const [open, setOpen] = useState(false);
  const [markdown, setMarkdown] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!markdown.trim()) {
      toast({
        title: 'Error',
        description: 'Please paste markdown table content',
        variant: 'destructive',
      });
      return;
    }

    const table = parseMarkdownTable(markdown);
    if (!table) {
      toast({
        title: 'Invalid Format',
        description: 'Could not parse the markdown table. Please check the format.',
        variant: 'destructive',
      });
      return;
    }

    onAddTable(table);
    setMarkdown('');
    setOpen(false);
    toast({
      title: 'Success',
      description: 'Table added successfully!',
    });
  };

  const exampleMarkdown = `| Python string methods |
| -------- | ------- |
| endswith(sub) | rstrip() |
| lstrip() | split() |
| isalpha() | true if alphabetic |`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Table
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Markdown Table</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="markdown">Paste your markdown table:</Label>
            <Textarea
              id="markdown"
              placeholder={exampleMarkdown}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="min-h-[200px] font-mono text-sm mt-2"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Add Table
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}