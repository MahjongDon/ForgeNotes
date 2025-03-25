import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFolderSchema, insertNoteSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Folders endpoints
  app.get("/api/folders", async (req, res) => {
    try {
      const folders = await storage.getFolders();
      res.json(folders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch folders" });
    }
  });

  app.post("/api/folders", async (req, res) => {
    try {
      const folder = insertFolderSchema.parse(req.body);
      const newFolder = await storage.createFolder(folder);
      res.status(201).json(newFolder);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Failed to create folder" });
      }
    }
  });

  // Notes endpoints
  app.get("/api/notes", async (req, res) => {
    try {
      const folderId = req.query.folderId ? parseInt(req.query.folderId as string) : undefined;
      const searchQuery = req.query.q as string | undefined;
      
      if (searchQuery) {
        const notes = await storage.searchNotes(searchQuery);
        res.json(notes);
      } else if (folderId) {
        const notes = await storage.getNotesByFolder(folderId);
        res.json(notes);
      } else {
        const notes = await storage.getNotes();
        res.json(notes);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.get("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const note = await storage.getNote(id);
      
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch note" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const note = insertNoteSchema.parse(req.body);
      const newNote = await storage.createNote(note);
      res.status(201).json(newNote);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Failed to create note" });
      }
    }
  });

  app.patch("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const noteUpdate = insertNoteSchema.partial().parse(req.body);
      
      const updatedNote = await storage.updateNote(id, noteUpdate);
      
      if (!updatedNote) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.json(updatedNote);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Failed to update note" });
      }
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteNote(id);
      
      if (!success) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
