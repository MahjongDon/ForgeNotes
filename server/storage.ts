import { 
  notes, folders, 
  type Note, type InsertNote, 
  type Folder, type InsertFolder 
} from "@shared/schema";

export interface IStorage {
  // Folder operations
  getFolders(): Promise<Folder[]>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  
  // Note operations
  getNotes(): Promise<Note[]>;
  getNotesByFolder(folderId: number): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
  
  // Search
  searchNotes(query: string): Promise<Note[]>;
}

export class MemStorage implements IStorage {
  private folders: Map<number, Folder>;
  private notes: Map<number, Note>;
  private folderCurrentId: number;
  private noteCurrentId: number;

  constructor() {
    this.folders = new Map();
    this.notes = new Map();
    this.folderCurrentId = 1;
    this.noteCurrentId = 1;
    
    // Initialize with default folders
    this.initDefaults();
  }
  
  private initDefaults() {
    // Create default folders
    const defaultFolders: InsertFolder[] = [
      { name: "Personal", icon: "fa-user" },
      { name: "Work", icon: "fa-briefcase" },
      { name: "Projects", icon: "fa-folder-tree" }
    ];
    
    defaultFolders.forEach(folder => {
      this.createFolder(folder);
    });
    
    // Create welcome note
    const welcomeNote: InsertNote = {
      title: "Welcome to ForgeNotes",
      content: "# Welcome to ForgeNotes!\n\nThis is your first note. ForgeNotes supports **Markdown** formatting.\n\n## Features\n\n- Create and organize notes\n- Format with Markdown\n- Link between notes using [[Note Title]]\n- Dark mode support\n- Mobile responsive\n\n> ForgeNotes makes note-taking simple yet powerful.\n\nTry creating a `code block` or make a list:\n\n1. First item\n2. Second item\n3. Third item\n\nOr reference another note like this: [[Getting Started]]",
      folderId: 1,
    };
    
    const gettingStartedNote: InsertNote = {
      title: "Getting Started",
      content: "# Getting Started with ForgeNotes\n\nThis guide will help you get familiar with the basic features.\n\n## Creating Notes\n\nClick the \"New Note\" button to create a new note. Give it a title and start writing.\n\n## Organizing with Folders\n\nUse the sidebar to navigate between folders. You can create new folders to organize your notes.\n\n## Markdown Support\n\nForgeNotes supports common markdown syntax:\n\n- **Bold text** with `**asterisks**`\n- *Italic text* with `*asterisks*`\n- Lists (like this one)\n- [Links](https://example.com) with `[text](url)`\n- Code blocks with backticks\n\n## Backlinking\n\nReference other notes by using double brackets: [[Welcome to ForgeNotes]]\n\nThis creates a link between notes, making it easy to build a knowledge network.",
      folderId: 1,
    };
    
    this.createNote(welcomeNote);
    this.createNote(gettingStartedNote);
  }

  async getFolders(): Promise<Folder[]> {
    return Array.from(this.folders.values());
  }

  async createFolder(folder: InsertFolder): Promise<Folder> {
    const id = this.folderCurrentId++;
    // Make sure icon exists, use default if not provided
    const folderWithIcon = {
      ...folder,
      icon: folder.icon || "fa-folder"
    };
    const newFolder: Folder = { ...folderWithIcon, id };
    this.folders.set(id, newFolder);
    return newFolder;
  }

  async getNotes(): Promise<Note[]> {
    return Array.from(this.notes.values());
  }

  async getNotesByFolder(folderId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(note => note.folderId === folderId);
  }

  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async createNote(note: InsertNote): Promise<Note> {
    const id = this.noteCurrentId++;
    const now = new Date();
    
    // Create a properly typed Note object by extracting only the required fields
    // and adding the necessary ones with proper types
    const newNote: Note = { 
      id, 
      title: note.title,
      content: note.content,
      folderId: note.folderId ?? null, // Use null coalescing to ensure null if undefined
      createdAt: now, 
      updatedAt: now 
    };
    
    this.notes.set(id, newNote);
    return newNote;
  }

  async updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined> {
    const existingNote = this.notes.get(id);
    if (!existingNote) return undefined;
    
    const now = new Date();
    const updatedNote: Note = { 
      ...existingNote, 
      ...note, 
      updatedAt: now 
    };
    
    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteNote(id: number): Promise<boolean> {
    return this.notes.delete(id);
  }

  async searchNotes(query: string): Promise<Note[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.notes.values()).filter(note => 
      note.title.toLowerCase().includes(lowerQuery) || 
      note.content.toLowerCase().includes(lowerQuery)
    );
  }
}

export const storage = new MemStorage();
