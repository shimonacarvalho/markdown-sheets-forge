import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Cheatsheet } from '@/types/cheatsheet';
import { Plus, Search, Eye, Copy, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CheatsheetLibraryProps {
  cheatsheets: Cheatsheet[];
  onSelect: (cheatsheet: Cheatsheet) => void;
  onCreate: () => void;
  onDuplicate: (cheatsheet: Cheatsheet) => void;
  onDelete: (id: string) => void;
}

export function CheatsheetLibrary({ 
  cheatsheets, 
  onSelect, 
  onCreate, 
  onDuplicate, 
  onDelete 
}: CheatsheetLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredCheatsheets = cheatsheets.filter(sheet =>
    sheet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sheet.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDuplicate = (cheatsheet: Cheatsheet, e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate(cheatsheet);
    toast({
      title: 'Duplicated',
      description: `"${cheatsheet.name}" has been duplicated`,
    });
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      onDelete(id);
      toast({
        title: 'Deleted',
        description: `"${name}" has been deleted`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Cheatsheet Generator</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your printable reference sheets
          </p>
        </div>
        <Button onClick={onCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Cheatsheet
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search cheatsheets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Cheatsheets Grid */}
      {filteredCheatsheets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCheatsheets.map((cheatsheet) => (
            <Card 
              key={cheatsheet.id} 
              className="cursor-pointer hover:shadow-md transition-shadow group"
              onClick={() => onSelect(cheatsheet)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{cheatsheet.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {cheatsheet.description || 'No description'}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-2 flex-shrink-0">
                    {cheatsheet.columns} cols
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {cheatsheet.tables.length} tables
                    </div>
                    <div>
                      {new Date(cheatsheet.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(cheatsheet);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDuplicate(cheatsheet, e)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(cheatsheet.id, cheatsheet.name, e)}
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : cheatsheets.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No cheatsheets yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first cheatsheet to get started
            </p>
            <Button onClick={onCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Cheatsheet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}