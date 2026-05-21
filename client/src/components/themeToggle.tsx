"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Determine initial theme
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme === "dark" || (!savedTheme && prefersDark) ? "dark" : "light";
    
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        backgroundColor: theme === "light" ? "#eaeff5" : "#1e293b",
      }}
      className="w-8 h-8 rounded-lg text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
      aria-label="Toggle dark mode"
    >
      {theme === "light" ? (
        <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
      ) : (
        <span className="relative flex items-center justify-center">
          <Moon className="w-4 h-4 text-indigo-400" />
          <motion.span
            className="absolute -top-1.5 -right-1.5"
            animate={{ scale: [0.6, 1.2, 0.6], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Star className="w-2 h-2 text-yellow-300 fill-yellow-300" />
          </motion.span>
          <motion.span
            className="absolute -bottom-1 -left-1"
            animate={{ scale: [1, 0.5, 1], opacity: [1, 0.3, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
          >
            <Star className="w-1.5 h-1.5 text-indigo-300 fill-indigo-300" />
          </motion.span>
        </span>
      )}
    </motion.button>
  );
}
