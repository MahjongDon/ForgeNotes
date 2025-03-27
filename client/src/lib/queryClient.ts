import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getFolders, getNotes, getNotesByFolder, getNote, saveNote, updateNote, deleteNote, searchNotes } from "./localStorage";
import { Note, Folder } from "./types";

// Static version of query client for deployment as a static site
// This version uses localStorage directly instead of API requests

// Simplified mock functions that match the API interface but use localStorage
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Parse URL to extract resource and ID if present
  const urlParts = url.split('/');
  const resource = urlParts[urlParts.length - 1].split('?')[0];
  const resourceId = !isNaN(parseInt(urlParts[urlParts.length - 1])) ? parseInt(urlParts[urlParts.length - 1]) : null;
  
  // Parse query parameters if any
  const queryParams = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '');
  const folderId = queryParams.get('folderId') ? parseInt(queryParams.get('folderId')!) : null;
  const searchQuery = queryParams.get('q');

  // Create a mock response based on the request
  let responseData: any = null;
  let status = 200;

  // Handle different HTTP methods
  switch (method) {
    case 'GET':
      if (url.includes('/api/folders')) {
        responseData = getFolders();
      } else if (url.includes('/api/notes')) {
        if (resourceId) {
          responseData = getNote(resourceId);
          if (!responseData) status = 404;
        } else if (searchQuery) {
          responseData = searchNotes(searchQuery);
        } else if (folderId !== null) {
          responseData = getNotesByFolder(folderId);
        } else {
          responseData = getNotes();
        }
      }
      break;
    case 'POST':
      if (url.includes('/api/notes')) {
        responseData = saveNote(data as Omit<Note, "id" | "createdAt" | "updatedAt">);
        status = 201;
      } else if (url.includes('/api/folders')) {
        responseData = { ...data as Omit<Folder, "id">, id: Date.now() };
        status = 201;
      }
      break;
    case 'PATCH':
      if (url.includes('/api/notes') && resourceId) {
        responseData = updateNote(resourceId, data as Partial<Note>);
        if (!responseData) status = 404;
      }
      break;
    case 'DELETE':
      if (url.includes('/api/notes') && resourceId) {
        const success = deleteNote(resourceId);
        responseData = {};
        status = success ? 204 : 404;
      }
      break;
    default:
      status = 400;
      responseData = { message: 'Invalid request' };
  }

  // Create a mock response
  const mockResponse = new Response(
    status !== 204 ? JSON.stringify(responseData) : null, 
    { status, headers: { 'Content-Type': 'application/json' } }
  );

  return mockResponse;
}

// Query function that works with localStorage instead of API calls
export const getQueryFn: (options: { on401: string }) => QueryFunction<any> =
  () =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    
    // Parse URL to determine what data to return
    if (url.includes('/api/folders')) {
      return getFolders();
    } else if (url.includes('/api/notes')) {
      const urlParts = url.split('/');
      const resourceId = !isNaN(parseInt(urlParts[urlParts.length - 1])) ? parseInt(urlParts[urlParts.length - 1]) : null;
      
      if (resourceId) {
        const note = getNote(resourceId);
        if (!note) throw new Error('Note not found');
        return note;
      }
      
      // Parse query parameters if any
      const queryParams = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '');
      const folderId = queryParams.get('folderId') ? parseInt(queryParams.get('folderId')!) : null;
      const searchQuery = queryParams.get('q');
      
      if (searchQuery) {
        return searchNotes(searchQuery);
      } else if (folderId !== null) {
        return getNotesByFolder(folderId);
      } else {
        return getNotes();
      }
    }
    
    // Default empty array response if route not recognized
    return [];
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
