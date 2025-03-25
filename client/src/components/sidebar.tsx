import React, { useState } from "react";
import { Folder } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, Plus, Menu, X } from "lucide-react";
import { saveFolder } from "@/lib/localStorage";

interface SidebarProps {
  folders: Folder[];
  activeFolder: number | null;
  onFolderSelect: (id: number | null) => void;
  onSearch: (query: string) => void;
  isMobile: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onCreateNote: () => void;
  onFoldersChange: () => void;
}

export default function Sidebar({ 
  folders, 
  activeFolder, 
  onFolderSelect, 
  onSearch,
  isMobile,
  isOpen,
  onToggle,
  onCreateNote,
  onFoldersChange
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    if (isMobile) {
      onToggle();
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim() === "") return;
    
    saveFolder({
      name: newFolderName,
      icon: "fa-folder"
    });
    
    setNewFolderName("");
    setShowNewFolder(false);
    onFoldersChange();
  };

  return (
    <div 
      className={`w-56 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden 
                bg-gray-50 dark:bg-gray-900 h-full transition-all duration-200 
                ${isMobile ? "absolute inset-y-0 left-0 z-20" : "relative"} 
                ${isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"}`}
    >
      <div className="p-3">
        <Button onClick={onCreateNote} className="w-full justify-start">
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>
      
      <div className="px-3 pb-2">
        <form onSubmit={handleSearch} className="relative">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="pl-8"
          />
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          {searchQuery && (
            <button 
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>
      </div>
      
      <div className="px-3 py-2 flex justify-between items-center">
        <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Folders
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0" 
          onClick={() => setShowNewFolder(!showNewFolder)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {showNewFolder && (
        <div className="px-3 pb-2 flex gap-2">
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            size={1}
            className="h-8 text-sm"
          />
          <Button 
            size="sm" 
            className="h-8" 
            onClick={handleCreateFolder}
          >
            Add
          </Button>
        </div>
      )}
      
      <ScrollArea className="flex-1">
        <nav className="px-2">
          <ul className="space-y-1 pt-1">
            <li>
              <Button
                variant={activeFolder === null ? "secondary" : "ghost"}
                className="w-full justify-start font-normal"
                onClick={() => {
                  onFolderSelect(null);
                  if (isMobile) onToggle();
                }}
              >
                <i className="fas fa-notes mr-2"></i>
                All Notes
              </Button>
            </li>
            
            {folders.map((folder) => (
              <li key={folder.id}>
                <Button
                  variant={activeFolder === folder.id ? "secondary" : "ghost"}
                  className="w-full justify-start font-normal"
                  onClick={() => {
                    onFolderSelect(folder.id);
                    if (isMobile) onToggle();
                  }}
                >
                  <i className={`fas ${folder.icon} mr-2`}></i>
                  {folder.name}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </ScrollArea>
      
      {isMobile && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline" 
            className="w-full"
            onClick={onToggle}
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      )}
    </div>
  );
}
