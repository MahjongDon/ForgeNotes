import React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Don't run this on server-side rendering
    if (typeof window === 'undefined') return false;
    
    // Check local storage first
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      return true;
    } else if (savedTheme === "light") {
      return false;
    }
    
    // Otherwise check user preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    // Update the document class for Tailwind CSS
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
    
    // Save the theme preference to localStorage
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't explicitly set a preference
      if (!localStorage.getItem("theme")) {
        setDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setDarkMode(!darkMode)}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
};

export default ThemeToggle;
