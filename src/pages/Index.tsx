import { useState, useEffect } from 'react';
import { CheatsheetLibrary } from '@/components/CheatsheetLibrary';
import { CheatsheetEditor } from '@/components/CheatsheetEditor';
import { CheatsheetPreview } from '@/components/CheatsheetPreview';
import { Cheatsheet } from '@/types/cheatsheet';
import { useLocalStorage } from '@/hooks/useLocalStorage';

type View = 'library' | 'editor' | 'preview';

const Index = () => {
  const [cheatsheets, setCheatsheets] = useLocalStorage<Cheatsheet[]>('cheatsheets', []);
  const [currentCheatsheet, setCurrentCheatsheet] = useState<Cheatsheet | null>(null);
  const [view, setView] = useState<View>('library');

  // Show auth message for features that require login
  const showAuthMessage = () => {
    alert('Login functionality requires connecting to Supabase. Click the green Supabase button in the top right to set up authentication.');
  };

  const createNewCheatsheet = () => {
    const newSheet: Cheatsheet = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: 'Untitled Cheatsheet',
      description: '',
      columns: 2,
      tables: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setCurrentCheatsheet(newSheet);
    setView('editor');
  };

  const selectCheatsheet = (cheatsheet: Cheatsheet) => {
    setCurrentCheatsheet(cheatsheet);
    setView('editor');
  };

  const duplicateCheatsheet = (cheatsheet: Cheatsheet) => {
    const duplicate: Cheatsheet = {
      ...cheatsheet,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: `${cheatsheet.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setCheatsheets(prev => [...prev, duplicate]);
  };

  const deleteCheatsheet = (id: string) => {
    setCheatsheets(prev => prev.filter(sheet => sheet.id !== id));
    if (currentCheatsheet?.id === id) {
      setCurrentCheatsheet(null);
      setView('library');
    }
  };

  const updateCheatsheet = (updatedSheet: Cheatsheet) => {
    setCurrentCheatsheet(updatedSheet);
    setCheatsheets(prev => {
      const index = prev.findIndex(sheet => sheet.id === updatedSheet.id);
      if (index >= 0) {
        const newSheets = [...prev];
        newSheets[index] = updatedSheet;
        return newSheets;
      } else {
        return [...prev, updatedSheet];
      }
    });
  };

  const goToLibrary = () => {
    setView('library');
    setCurrentCheatsheet(null);
  };

  const goToPreview = () => {
    if (currentCheatsheet) {
      setView('preview');
    }
  };

  const goToEditor = () => {
    setView('editor');
  };

  if (view === 'library') {
    return (
      <CheatsheetLibrary
        cheatsheets={cheatsheets}
        onSelect={selectCheatsheet}
        onCreate={createNewCheatsheet}
        onDuplicate={duplicateCheatsheet}
        onDelete={deleteCheatsheet}
      />
    );
  }

  if (view === 'preview' && currentCheatsheet) {
    return (
      <CheatsheetPreview
        cheatsheet={currentCheatsheet}
        onBack={goToEditor}
      />
    );
  }

  if (view === 'editor' && currentCheatsheet) {
    return (
      <div>
        <div className="border-b bg-surface/50 no-print">
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
            <button 
              onClick={goToLibrary}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Library
            </button>
            <div className="text-sm text-muted-foreground">
              Need to save permanently? 
              <button 
                onClick={showAuthMessage}
                className="text-primary hover:underline ml-1"
              >
                Set up login
              </button>
            </div>
          </div>
        </div>
        <CheatsheetEditor
          cheatsheet={currentCheatsheet}
          onUpdate={updateCheatsheet}
          onPreview={goToPreview}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
      </div>
    </div>
  );
};

export default Index;
