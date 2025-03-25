import { Note, Folder, LocalData, defaultData } from "./types";

const STORAGE_KEY = "forgeNotes";

// Save all data to localStorage
export function saveData(data: LocalData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Load all data from localStorage
export function loadData(): LocalData {
  const storedData = localStorage.getItem(STORAGE_KEY);
  
  if (!storedData) {
    // Initialize with default data
    saveData(defaultData);
    return defaultData;
  }
  
  try {
    const parsedData = JSON.parse(storedData) as LocalData;
    
    // Convert string dates to Date objects
    parsedData.notes = parsedData.notes.map(note => ({
      ...note,
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt)
    }));
    
    return parsedData;
  } catch (error) {
    console.error("Error parsing stored data:", error);
    return defaultData;
  }
}

// Folder operations
export function getFolders(): Folder[] {
  return loadData().folders;
}

export function saveFolder(folder: Omit<Folder, "id">): Folder {
  const data = loadData();
  const id = Math.max(0, ...data.folders.map(f => f.id)) + 1;
  
  const newFolder: Folder = {
    ...folder,
    id
  };
  
  data.folders.push(newFolder);
  saveData(data);
  
  return newFolder;
}

// Note operations
export function getNotes(): Note[] {
  return loadData().notes;
}

export function getNotesByFolder(folderId: number | null): Note[] {
  const notes = loadData().notes;
  
  if (folderId === null) {
    return notes;
  }
  
  return notes.filter(note => note.folderId === folderId);
}

export function getNote(id: number): Note | undefined {
  return loadData().notes.find(note => note.id === id);
}

export function saveNote(note: Omit<Note, "id" | "createdAt" | "updatedAt">): Note {
  const data = loadData();
  const id = Math.max(0, ...data.notes.map(n => n.id)) + 1;
  const now = new Date();
  
  const newNote: Note = {
    ...note,
    id,
    createdAt: now,
    updatedAt: now
  };
  
  data.notes.push(newNote);
  saveData(data);
  
  return newNote;
}

export function updateNote(id: number, updates: Partial<Omit<Note, "id" | "createdAt">>): Note | undefined {
  const data = loadData();
  const noteIndex = data.notes.findIndex(note => note.id === id);
  
  if (noteIndex === -1) {
    return undefined;
  }
  
  const updatedNote: Note = {
    ...data.notes[noteIndex],
    ...updates,
    updatedAt: new Date()
  };
  
  data.notes[noteIndex] = updatedNote;
  saveData(data);
  
  return updatedNote;
}

export function deleteNote(id: number): boolean {
  const data = loadData();
  const noteIndex = data.notes.findIndex(note => note.id === id);
  
  if (noteIndex === -1) {
    return false;
  }
  
  data.notes.splice(noteIndex, 1);
  saveData(data);
  
  return true;
}

// Search
export function searchNotes(query: string): Note[] {
  const notes = loadData().notes;
  const lowerQuery = query.toLowerCase();
  
  return notes.filter(note => 
    note.title.toLowerCase().includes(lowerQuery) || 
    note.content.toLowerCase().includes(lowerQuery)
  );
}
