import React, { useState, useEffect, useRef } from "react";
import { Note, Folder } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate, formatTime, getWordCount, renderMarkdown, processBacklinks } from "@/lib/markdown";
import { useAnimation } from "@/hooks/use-animation";
import {
  ChevronLeft,
  Trash2,
  Share,
  MoreVertical,
  Tag,
  FolderClosed,
  Copy,
  FileDown,
  Eye,
  Edit,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Extend Window interface to include our custom property
declare global {
  interface Window {
    noteClickHandler?: (id: number) => void;
  }
}

interface EditorProps {
  note: Note;
  folders: Folder[];
  notes: Note[]; // Added for backlink support
  onNoteChange: (note: Partial<Note>) => void;
  onDeleteNote: (id: number) => void;
  onToggleNoteList: () => void;
  isMobile: boolean;
  onNoteClick: (id: number) => void; // Added for backlink support
}

export default function Editor({
  note,
  folders,
  notes,
  onNoteChange,
  onDeleteNote,
  onToggleNoteList,
  isMobile,
  onNoteClick,
}: EditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [activeTab, setActiveTab] = useState<string>("preview");
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Update local state when note changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    
    // Force preview to render immediately when note changes
    if (previewRef.current) {
      const html = renderMarkdown(note.content);
      const processedHtml = processBacklinks(html, notes, onNoteClick);
      previewRef.current.innerHTML = processedHtml;
      
      // Add click handlers to all backlinks
      const backlinks = previewRef.current.querySelectorAll('a[data-note-id]');
      backlinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const noteId = parseInt((e.currentTarget as HTMLAnchorElement).dataset.noteId || "0", 10);
          if (noteId) {
            onNoteClick(noteId);
          }
        });
      });
    }
  }, [note.id, note.title, note.content, notes, onNoteClick]);
  
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
  
  // Handle preview rendering
  useEffect(() => {
    if (activeTab === "preview" && previewRef.current) {
      const html = renderMarkdown(content);
      const processedHtml = processBacklinks(html, notes, onNoteClick);
      previewRef.current.innerHTML = processedHtml;
      
      // Add click handlers to all backlinks
      const backlinks = previewRef.current.querySelectorAll('a[data-note-id]');
      backlinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const noteId = parseInt((e.currentTarget as HTMLAnchorElement).dataset.noteId || "0", 10);
          if (noteId) {
            onNoteClick(noteId);
          }
        });
      });
    }
  }, [content, activeTab, notes, onNoteClick]);
  
  // Add global handler for backlink clicks
  useEffect(() => {
    window.noteClickHandler = (id: number) => {
      onNoteClick(id);
    };
    
    return () => {
      window.noteClickHandler = undefined;
    };
  }, [onNoteClick]);
  
  return (
    <div className="flex flex-col h-full">
      {/* Editor Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-3 flex justify-between items-center">
        <div className="flex items-center">
          <AnimatedButton
            variant="ghost"
            size="icon"
            className="md:block lg:hidden mr-2"
            onClick={onToggleNoteList}
            rippleEffect={true}
            hoverScale={true}
          >
            <ChevronLeft className="h-4 w-4" />
          </AnimatedButton>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-medium text-gray-900 dark:text-gray-100 border-none focus-visible:ring-0 px-0 text-base"
            placeholder="Note title..."
          />
        </div>
        <div className="flex items-center space-x-1">
          {/* Edit/Preview Toggle Buttons */}
          <div className="flex bg-muted rounded-md p-0.5 mr-3">
            <AnimatedButton 
              variant={activeTab === "edit" ? "secondary" : "ghost"} 
              size="sm"
              className="flex items-center gap-1 h-7 px-2.5 rounded-sm"
              onClick={() => setActiveTab("edit")}
              rippleEffect={true}
            >
              <Edit className="h-3.5 w-3.5" />
              <span className="text-xs">Edit</span>
            </AnimatedButton>
            <AnimatedButton 
              variant={activeTab === "preview" ? "secondary" : "ghost"}
              size="sm" 
              className="flex items-center gap-1 h-7 px-2 rounded-sm"
              onClick={() => setActiveTab("preview")}
              rippleEffect={true}
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="text-xs">Preview</span>
            </AnimatedButton>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <AnimatedButton 
                variant="ghost" 
                size="icon"
                rippleEffect={true}
                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </AnimatedButton>
            </AlertDialogTrigger>
            <AlertDialogContent className="animate-scale-in">
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

          <AnimatedButton 
            variant="ghost" 
            size="icon"
            rippleEffect={true}
          >
            <Share className="h-4 w-4" />
          </AnimatedButton>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <AnimatedButton 
                variant="ghost" 
                size="icon"
                rippleEffect={true}
              >
                <MoreVertical className="h-4 w-4" />
              </AnimatedButton>
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
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="relative w-full h-full">
          <div 
            className={`absolute inset-0 transition-opacity duration-200 ${
              activeTab === "edit" ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <div className="flex-1 overflow-hidden h-[calc(100vh-160px)]">
              <ScrollArea className="w-full p-5 h-full">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-full p-0 border-0 bg-transparent focus-visible:ring-0 resize-none font-mono text-gray-800 dark:text-gray-200 text-base leading-relaxed"
                  placeholder="Start writing with Markdown..."
                  disabled={activeTab !== "edit"}
                />
              </ScrollArea>
            </div>
          </div>
          
          <div 
            className={`absolute inset-0 transition-opacity duration-200 ${
              activeTab === "preview" ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <div className="flex-1 overflow-hidden h-[calc(100vh-160px)]">
              <ScrollArea className="w-full p-8 h-full">
                <div 
                  ref={previewRef} 
                  className={`prose dark:prose-invert max-w-none prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-blockquote:border-l-primary prose-a:text-primary dark:prose-a:text-primary prose-headings:text-gray-900 dark:prose-headings:text-gray-100 ${
                    activeTab === "preview" ? "animate-fade-in" : ""
                  }`}
                ></div>
              </ScrollArea>
            </div>
          </div>
        </div>
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