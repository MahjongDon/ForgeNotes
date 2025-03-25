import React, { useRef, useEffect } from "react";
import { Note } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { renderMarkdown, processBacklinks } from "@/lib/markdown";

// Extend Window interface to include our custom property
declare global {
  interface Window {
    noteClickHandler?: (id: number) => void;
  }
}

interface PreviewProps {
  note: Note;
  notes: Note[];
  onNoteClick: (id: number) => void;
}

export default function Preview({ note, notes, onNoteClick }: PreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Add global handler for backlink clicks
    window.noteClickHandler = (id: number) => {
      onNoteClick(id);
    };
    
    // Process links in the content
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
    
    return () => {
      // Clean up
      window.noteClickHandler = undefined;
    };
  }, [note.content, notes, onNoteClick]);
  
  return (
    <ScrollArea className="w-full p-8 markdown-content text-gray-800 dark:text-gray-200">
      <div 
        ref={previewRef} 
        className="prose dark:prose-invert max-w-none prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-blockquote:border-l-primary prose-a:text-primary dark:prose-a:text-primary prose-headings:text-gray-900 dark:prose-headings:text-gray-100"
      ></div>
    </ScrollArea>
  );
}
