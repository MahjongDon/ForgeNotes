import React, { useState, useEffect } from "react";
import { Folder } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, Plus, Menu, X, FilePlus } from "lucide-react";
import { saveFolder } from "@/lib/localStorage";
import { useAnimation } from "@/hooks/use-animation";

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
  
  // Animation for new folder form
  const newFolderAnimation = useAnimation(showNewFolder, {
    duration: 200,
    easing: 'ease-out'
  });
  
  // Update animation when state changes
  useEffect(() => {
    newFolderAnimation.setIsActive(showNewFolder);
  }, [showNewFolder]);

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
        <AnimatedButton 
          onClick={onCreateNote} 
          className="w-full justify-start"
          hoverScale={true}
          pulseOnMount={true}
        >
          <FilePlus className="h-4 w-4 mr-2 animate-slide-in-right" />
          <span className="animate-slide-in-right" style={{ animationDelay: '50ms' }}>New Note</span>
        </AnimatedButton>
      </div>
      
      <div className="px-3 pb-2 animate-fade-in">
        <form onSubmit={handleSearch} className="relative">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="pl-8 transition-all duration-200 focus:ring-2 focus:ring-primary"
          />
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          {searchQuery && (
            <button 
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-4 w-4 hover:animate-wiggle" />
            </button>
          )}
        </form>
      </div>
      
      <div className="px-3 py-2 flex justify-between items-center">
        <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 animate-fade-in">
          Folders
        </h2>
        <AnimatedButton 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0" 
          onClick={() => setShowNewFolder(!showNewFolder)}
          rippleEffect={true}
        >
          <Plus className={`h-4 w-4 transition-transform duration-200 ${showNewFolder ? 'rotate-45' : 'rotate-0'}`} />
        </AnimatedButton>
      </div>
      
      {newFolderAnimation.isVisible && (
        <div 
          className={`px-3 pb-2 flex gap-2 ${newFolderAnimation.isActive ? 'opacity-100' : 'opacity-0'} animate-slide-down`}
          style={newFolderAnimation.style}
        >
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            size={1}
            className="h-8 text-sm"
            autoFocus
          />
          <AnimatedButton 
            size="sm" 
            className="h-8" 
            onClick={handleCreateFolder}
            rippleEffect={true}
          >
            Add
          </AnimatedButton>
        </div>
      )}
      
      <ScrollArea className="flex-1">
        <nav className="px-2">
          <ul className="space-y-1 pt-1">
            <li className="animate-fade-in" style={{ animationDelay: '50ms' }}>
              <AnimatedButton
                variant={activeFolder === null ? "secondary" : "ghost"}
                className="w-full justify-start font-normal"
                onClick={() => {
                  onFolderSelect(null);
                  if (isMobile) onToggle();
                }}
                rippleEffect={true}
                hoverScale={activeFolder !== null}
              >
                <i className="fas fa-notes mr-2"></i>
                All Notes
              </AnimatedButton>
            </li>
            
            {folders.map((folder, index) => (
              <li 
                key={folder.id}
                className="animate-fade-in" 
                style={{ animationDelay: `${(index + 1) * 50 + 50}ms` }}
              >
                <AnimatedButton
                  variant={activeFolder === folder.id ? "secondary" : "ghost"}
                  className="w-full justify-start font-normal"
                  onClick={() => {
                    onFolderSelect(folder.id);
                    if (isMobile) onToggle();
                  }}
                  rippleEffect={true}
                  hoverScale={activeFolder !== folder.id}
                >
                  <i className={`fas ${folder.icon} mr-2`}></i>
                  {folder.name}
                </AnimatedButton>
              </li>
            ))}
          </ul>
        </nav>
      </ScrollArea>
      
      {isMobile && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 animate-slide-up">
          <AnimatedButton
            variant="outline" 
            className="w-full"
            onClick={onToggle}
            rippleEffect={true}
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </AnimatedButton>
        </div>
      )}
    </div>
  );
}
