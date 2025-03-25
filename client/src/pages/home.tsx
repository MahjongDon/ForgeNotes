import React, { useState, useEffect } from "react";
import ThemeToggle from "@/components/ui/theme-toggle";
import Sidebar from "@/components/sidebar";
import NoteList from "@/components/note-list";
import Editor from "@/components/editor";
import Preview from "@/components/preview";
import { Button } from "@/components/ui/button";
import { Note, Folder } from "@/lib/types";
import { useIsMobile as useMobile } from "@/hooks/use-mobile";
import { Flame, List, Plus } from "lucide-react";
import {
  getNotes,
  getFolders,
  getNotesByFolder,
  saveNote,
  updateNote,
  deleteNote,
  searchNotes,
  saveFolder
} from "@/lib/localStorage";

export default function Home() {
  // State for responsive layout
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [noteListOpen, setNoteListOpen] = useState(true);
  
  // Main state
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeFolder, setActiveFolder] = useState<number | null>(null);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Load data on initial render
  useEffect(() => {
    const loadedFolders = getFolders();
    setFolders(loadedFolders);
    
    const loadedNotes = getNotes();
    setNotes(loadedNotes);
    
    if (loadedNotes.length > 0) {
      setActiveNote(loadedNotes[0]);
    }
  }, []);
  
  // Update layout based on screen size
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
      setNoteListOpen(false);
    } else {
      setSidebarOpen(true);
      setNoteListOpen(true);
    }
  }, [isMobile]);
  
  // Filtered notes based on active folder and search
  const getFilteredNotes = () => {
    let filtered = notes;
    
    if (searchQuery) {
      return searchNotes(searchQuery);
    }
    
    if (activeFolder !== null) {
      return getNotesByFolder(activeFolder);
    }
    
    return filtered;
  };
  
  // Create a new note
  const handleCreateNote = () => {
    const newNote = saveNote({
      title: "Untitled Note",
      content: "# Untitled Note\n\nStart writing here...",
      folderId: activeFolder || 1,
    });
    
    setNotes([newNote, ...notes]);
    setActiveNote(newNote);
    setNoteListOpen(false);
  };
  
  // Update a note
  const handleNoteChange = (id: number, updates: Partial<Note>) => {
    const updatedNote = updateNote(id, updates);
    
    if (updatedNote) {
      setNotes(notes.map(note => 
        note.id === id ? updatedNote : note
      ));
      
      if (activeNote?.id === id) {
        setActiveNote(updatedNote);
      }
    }
  };
  
  // Delete a note
  const handleDeleteNote = (id: number) => {
    const success = deleteNote(id);
    
    if (success) {
      const updatedNotes = notes.filter(note => note.id !== id);
      setNotes(updatedNotes);
      
      if (activeNote?.id === id) {
        setActiveNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
      }
    }
  };
  
  // Handle folder selection
  const handleFolderSelect = (folderId: number | null) => {
    setActiveFolder(folderId);
    setSearchQuery("");
    
    // Select first note in the folder
    const folderNotes = folderId === null ? getNotes() : getNotesByFolder(folderId);
    
    if (folderNotes.length > 0) {
      setActiveNote(folderNotes[0]);
    } else {
      setActiveNote(null);
    }
  };
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query) {
      const searchResults = searchNotes(query);
      if (searchResults.length > 0) {
        setActiveNote(searchResults[0]);
      }
    } else {
      const folderNotes = activeFolder === null ? getNotes() : getNotesByFolder(activeFolder);
      if (folderNotes.length > 0) {
        setActiveNote(folderNotes[0]);
      }
    }
  };
  
  // Refresh folders after adding a new one
  const handleFoldersChange = () => {
    setFolders(getFolders());
  };
  
  // Get a note by ID (for backlinking)
  const handleNoteClick = (id: number) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      setActiveNote(note);
      
      // Switch to the right folder
      if (activeFolder !== note.folderId) {
        setActiveFolder(note.folderId);
      }
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 h-screen flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 bg-white dark:bg-gray-900 z-10">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <List className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <Flame className="text-primary-600 dark:text-primary-500 mr-2 h-5 w-5" />
            <h1 className="text-lg font-semibold">ForgeNotes</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            className="hidden md:flex"
            onClick={handleCreateNote}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>New Note</span>
          </Button>
          
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          folders={folders}
          activeFolder={activeFolder}
          onFolderSelect={handleFolderSelect}
          onSearch={handleSearch}
          isMobile={isMobile}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onCreateNote={handleCreateNote}
          onFoldersChange={handleFoldersChange}
        />

        {/* Note List */}
        <NoteList
          notes={getFilteredNotes()}
          activeNote={activeNote}
          activeFolder={activeFolder}
          folders={folders}
          searchQuery={searchQuery}
          onNoteSelect={setActiveNote}
          isMobile={isMobile}
          isOpen={noteListOpen}
          onToggle={() => setNoteListOpen(!noteListOpen)}
        />

        {/* Note Editor/Preview */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900 relative">
          {!activeNote ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 flex-col">
              <i className="fas fa-file-alt text-4xl mb-3"></i>
              <p className="text-lg">Select a note or create a new one</p>
              <Button className="mt-4" onClick={handleCreateNote}>
                <Plus className="h-4 w-4 mr-1.5" />
                <span>New Note</span>
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="h-full w-full">
                <Editor
                  note={activeNote}
                  folders={folders}
                  onNoteChange={(updates) => handleNoteChange(activeNote.id, updates)}
                  onDeleteNote={handleDeleteNote}
                  onToggleNoteList={() => setNoteListOpen(true)}
                  isMobile={isMobile}
                  notes={notes}
                  onNoteClick={handleNoteClick}
                />
              </div>
            </div>
          )}
          
          {/* Mobile Actions */}
          <div className="block md:hidden fixed bottom-4 right-4">
            <Button
              size="icon"
              className="rounded-full w-12 h-12 shadow-lg"
              onClick={handleCreateNote}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Mobile Navigation Toggle */}
          <div className="block md:hidden fixed bottom-4 left-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10 border border-gray-200 dark:border-gray-700"
              onClick={() => setNoteListOpen(!noteListOpen)}
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
