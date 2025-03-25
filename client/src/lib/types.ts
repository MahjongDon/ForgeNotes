import { Note as ServerNote, Folder as ServerFolder } from "@shared/schema";

// Client types extending server types with additional client-specific properties

export interface Note extends ServerNote {
  // Server props are included by extension
}

export interface Folder extends ServerFolder {
  // Server props are included by extension
}

export interface LocalData {
  notes: Note[];
  folders: Folder[];
}

// Initial default data for empty local storage
export const defaultFolders: Folder[] = [
  { id: 1, name: "Personal", icon: "fa-user" },
  { id: 2, name: "Work", icon: "fa-briefcase" },
  { id: 3, name: "Projects", icon: "fa-folder-tree" }
];

export const defaultNotes: Note[] = [
  {
    id: 1,
    title: "Welcome to ForgeNotes",
    content: "# Welcome to ForgeNotes!\n\nThis is your first note. ForgeNotes supports **Markdown** formatting.\n\n## Features\n\n- Create and organize notes\n- Format with Markdown\n- Link between notes using [[Note Title]]\n- Dark mode support\n- Mobile responsive\n\n> ForgeNotes makes note-taking simple yet powerful.\n\nTry creating a `code block` or make a list:\n\n1. First item\n2. Second item\n3. Third item\n\nOr reference another note like this: [[Getting Started]]",
    folderId: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    title: "Getting Started",
    content: "# Getting Started with ForgeNotes\n\nThis guide will help you get familiar with the basic features.\n\n## Creating Notes\n\nClick the \"New Note\" button to create a new note. Give it a title and start writing.\n\n## Organizing with Folders\n\nUse the sidebar to navigate between folders. You can create new folders to organize your notes.\n\n## Markdown Support\n\nForgeNotes supports common markdown syntax:\n\n- **Bold text** with `**asterisks**`\n- *Italic text* with `*asterisks*`\n- Lists (like this one)\n- [Links](https://example.com) with `[text](url)`\n- Code blocks with backticks\n\n## Backlinking\n\nReference other notes by using double brackets: [[Welcome to ForgeNotes]]\n\nThis creates a link between notes, making it easy to build a knowledge network.",
    folderId: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const defaultData: LocalData = {
  folders: defaultFolders,
  notes: defaultNotes
};
