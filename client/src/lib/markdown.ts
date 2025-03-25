import { marked } from "marked";
import { Note } from "./types";

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Process markdown to HTML
export function renderMarkdown(content: string): string {
  return marked.parse(content);
}

// Process backlinking
export function processBacklinks(html: string, notes: Note[], onNoteClick: (id: number) => void): string {
  // Replace [[Note Title]] with links
  return html.replace(/\[\[(.*?)\]\]/g, (match, noteTitle) => {
    const targetNote = notes.find(n => n.title.toLowerCase() === noteTitle.toLowerCase());
    if (targetNote) {
      return `<a href="#" class="text-primary-600 dark:text-primary-400 hover:underline" 
                data-note-id="${targetNote.id}" 
                onclick="event.preventDefault(); window.noteClickHandler(${targetNote.id})">
                ${noteTitle}
              </a>`;
    }
    return `<span class="text-gray-400 dark:text-gray-500">${noteTitle}</span>`;
  });
}

// Get an excerpt from markdown text
export function getExcerpt(content: string, maxLength = 100): string {
  // Strip markdown formatting
  let excerpt = content
    .replace(/#{1,6}\s+/g, '') // Remove headings
    .replace(/\*\*|\*|__|\|_/g, '') // Remove bold/italic markers
    .replace(/\[\[|\]\]/g, '') // Remove backlinking brackets
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Replace markdown links with just text
    .replace(/`{1,3}.*?`{1,3}/g, '') // Remove inline code
    .replace(/>\s(.*)/g, '$1') // Remove blockquote marker
    .replace(/\n/g, ' ').trim(); // Replace newlines with spaces

  if (excerpt.length > maxLength) {
    return excerpt.substring(0, maxLength) + '...';
  }
  
  return excerpt;
}

// Get word count from content
export function getWordCount(content: string): number {
  return content.split(/\s+/).filter(word => word.trim() !== '').length;
}

// Format date for display
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

// Format time for display
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}
