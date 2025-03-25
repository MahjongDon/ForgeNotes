import React from "react";
import { Note, Folder } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { formatDate, getExcerpt } from "@/lib/markdown";
import { X } from "lucide-react";

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
      <div className="border-b border-gray-200 dark:border-gray-700 py-3 px-4 flex items-center justify-between">
        <h2 className="font-medium text-gray-800 dark:text-gray-200">
          {searchQuery ? `Search: "${searchQuery}"` : getFolderName()}
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({notes.length})</span>
        </h2>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        {notes.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <i className="fas fa-search mb-2 text-xl"></i>
            <p>{searchQuery ? "No notes match your search." : "No notes in this folder."}</p>
          </div>
        ) : (
          <ul>
            {notes.map((note) => (
              <li key={note.id}>
                <button
                  onClick={() => {
                    onNoteSelect(note);
                    if (isMobile) onToggle();
                  }}
                  className={`w-full text-left block border-b border-gray-200 dark:border-gray-700 p-3 transition duration-200
                            ${activeNote?.id === note.id 
                              ? "bg-gray-100 dark:bg-gray-800" 
                              : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                >
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{note.title}</h3>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatDate(note.updatedAt)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{getExcerpt(note.content)}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}
