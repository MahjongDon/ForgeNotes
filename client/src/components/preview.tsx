import React, { useRef, useEffect } from "react";
import { Note } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { renderMarkdown, processBacklinks } from "@/lib/markdown";

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
      delete window.noteClickHandler;
    };
  }, [note.content, notes, onNoteClick]);
  
  return (
    <ScrollArea className="w-1/2 p-6 markdown-content text-gray-800 dark:text-gray-200">
      <div ref={previewRef} className="prose dark:prose-invert max-w-none prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-blockquote:border-l-primary-500"></div>
    </ScrollArea>
  );
}
