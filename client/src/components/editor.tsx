import React, { useState, useEffect } from "react";
import { Note, Folder } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate, formatTime, getWordCount } from "@/lib/markdown";
import {
  ChevronLeft,
  Trash2,
  Share,
  MoreVertical,
  Tag,
  FolderClosed,
  Copy,
  FileDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EditorProps {
  note: Note;
  folders: Folder[];
  onNoteChange: (note: Partial<Note>) => void;
  onDeleteNote: (id: number) => void;
  onToggleNoteList: () => void;
  isMobile: boolean;
}

export default function Editor({
  note,
  folders,
  onNoteChange,
  onDeleteNote,
  onToggleNoteList,
  isMobile,
}: EditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  
  // Update local state when note changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.id, note.title, note.content]);
  
  // Debounce title changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== note.title) {
        onNoteChange({ title });
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [title, note.title, onNoteChange]);
  
  // Debounce content changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content !== note.content) {
        onNoteChange({ content });
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [content, note.content, onNoteChange]);
  
  // Move note to different folder
  const moveToFolder = (folderId: number) => {
    onNoteChange({ folderId });
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Editor Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-3 flex justify-between items-center">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="md:block lg:hidden mr-2"
            onClick={onToggleNoteList}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-medium text-gray-900 dark:text-gray-100 border-none focus-visible:ring-0 px-0 text-base"
            placeholder="Note title..."
          />
        </div>
        <div className="flex space-x-1">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Note</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this note? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDeleteNote(note.id)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="ghost" size="icon">
            <Share className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Tag className="h-4 w-4 mr-2" />
                Add Tags
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <FolderClosed className="h-4 w-4 mr-2" />
                <span className="mr-2">Move to Folder</span>
                <DropdownMenu>
                  <DropdownMenuTrigger className="ml-auto">
                    <ChevronLeft className="h-4 w-4 rotate-180" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {folders.map(folder => (
                      <DropdownMenuItem 
                        key={folder.id}
                        onClick={() => moveToFolder(folder.id)}
                      >
                        <i className={`fas ${folder.icon} mr-2`}></i>
                        {folder.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="text-red-600 dark:text-red-400"
                onSelect={() => onDeleteNote(note.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden divide-x divide-gray-200 dark:divide-gray-700">
        <ScrollArea className="w-full p-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full p-0 border-0 bg-transparent focus-visible:ring-0 resize-none font-mono text-gray-800 dark:text-gray-200"
            placeholder="Start writing with Markdown..."
          />
        </ScrollArea>
      </div>
      
      {/* Status Bar */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
        <div>
          Last updated: {formatDate(note.updatedAt)} {formatTime(note.updatedAt)}
        </div>
        <div>
          <span>{getWordCount(note.content)}</span> words | 
          <span className="ml-1">{note.content.length}</span> characters
        </div>
      </div>
    </div>
  );
}
