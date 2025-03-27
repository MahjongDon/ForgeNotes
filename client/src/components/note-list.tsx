import React from "react";
import { Note, Folder } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/ui/animated-button";
import { formatDate, getExcerpt } from "@/lib/markdown";
import { X, Search as SearchIcon } from "lucide-react";
import { useAnimation } from "@/hooks/use-animation";

interface NoteListProps {
  notes: Note[];
  activeNote: Note | null;
  activeFolder: number | null;
  folders: Folder[];
  searchQuery: string;
  onNoteSelect: (note: Note) => void;
  isMobile: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

export default function NoteList({
  notes,
  activeNote,
  activeFolder,
  folders,
  searchQuery,
  onNoteSelect,
  isMobile,
  isOpen,
  onToggle
}: NoteListProps) {
  // Get folder name for the header
  const getFolderName = () => {
    if (activeFolder === null) return "All Notes";
    const folder = folders.find(f => f.id === activeFolder);
    return folder ? folder.name : "Notes";
  };

  return (
    <div 
      className={`w-72 lg:w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col 
                overflow-hidden bg-white dark:bg-gray-900 h-full transition-all duration-200
                ${isMobile ? "absolute inset-y-0 left-0 z-10" : "relative"}
                ${(isMobile && !isOpen) ? "-translate-x-full" : "translate-x-0"}`}
    >
      <div className="border-b border-gray-200 dark:border-gray-700 py-3 px-4 flex items-center justify-between animate-fade-in">
        <h2 className="font-medium text-gray-800 dark:text-gray-200">
          {searchQuery ? (
            <span className="flex items-center">
              <SearchIcon className="h-4 w-4 mr-1.5 text-primary" />
              <span className="animate-slide-in-right" style={{ animationDelay: '50ms' }}>
                "{searchQuery}"
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 animate-fade-in" style={{ animationDelay: '150ms' }}>
                  ({notes.length})
                </span>
              </span>
            </span>
          ) : (
            <span>
              {getFolderName()}
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({notes.length})</span>
            </span>
          )}
        </h2>
        {isMobile && (
          <AnimatedButton
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="lg:hidden"
            rippleEffect={true}
          >
            <X className="h-4 w-4" />
          </AnimatedButton>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        {notes.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400 animate-fade-in">
            {searchQuery ? (
              <>
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-gray-100 dark:bg-gray-800">
                  <SearchIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="animate-slide-up" style={{ animationDelay: '100ms' }}>No notes match your search.</p>
                <p className="mt-2 text-sm animate-slide-up" style={{ animationDelay: '150ms' }}>Try a different search term</p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-gray-100 dark:bg-gray-800">
                  <i className="fas fa-folder-open text-gray-400 dark:text-gray-500 text-xl"></i>
                </div>
                <p className="animate-slide-up" style={{ animationDelay: '100ms' }}>No notes in this folder.</p>
                <p className="mt-2 text-sm animate-slide-up" style={{ animationDelay: '150ms' }}>Create a new note to get started</p>
              </>
            )}
          </div>
        ) : (
          <ul>
            {notes.map((note, index) => (
              <li 
                key={note.id} 
                className="animate-fade-in" 
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <button
                  onClick={() => {
                    onNoteSelect(note);
                    if (isMobile) onToggle();
                  }}
                  className={`w-full text-left block border-b border-gray-200 dark:border-gray-700 p-3 transition-all duration-200
                            ${activeNote?.id === note.id 
                              ? "bg-gray-100 dark:bg-gray-800 border-l-4 border-l-primary" 
                              : "hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-l-transparent"}`}
                >
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 transition-all duration-200">
                      {note.title}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatDate(note.updatedAt)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2 transition-all duration-200">
                    {getExcerpt(note.content)}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}
