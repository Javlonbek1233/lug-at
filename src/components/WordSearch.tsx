import React, { useState } from "react";
import { Search, Sparkles, BookOpen, Clock, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { HistoryItem } from "../types";

interface WordSearchProps {
  onSearch: (word: string) => void;
  history: HistoryItem[];
  onClearHistory: () => void;
  onRemoveHistoryItem: (word: string) => void;
}

const POPULAR_WORDS = ["Resilience", "Eloquent", "Melancholy", "Paradox", "Benevolent"];

export default function WordSearch({ onSearch, history, onClearHistory, onRemoveHistoryItem }: WordSearchProps) {
  const [query, setQuery] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      onSearch(trimmed);
      setShowHistory(false);
    }
  };

  const handlePopularClick = (word: string) => {
    setQuery(word);
    onSearch(word);
  };

  const handleHistoryClick = (word: string) => {
    setQuery(word);
    onSearch(word);
    setShowHistory(false);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 200)} // Allow click handler to fire
            placeholder="Qidirmoqchi bo'lgan inglizcha so'zni yozing..."
            className="w-full px-5 py-4 pl-12 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-indigo-500 dark:focus:border-indigo-500 text-lg shadow-sm focus:shadow-md transition-all outline-none text-slate-800 dark:text-slate-100"
          />
          <Search className="w-6 h-6 text-slate-400 absolute left-4 pointer-events-none" />
          
          <button
            type="submit"
            className="absolute right-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-medium shadow-md shadow-indigo-500/10 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Izlash</span>
          </button>
        </div>

        {/* History Dropdown */}
        {showHistory && history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-35 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-150 dark:border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Qidiruv tarixi
              </span>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent blur
                  onClearHistory();
                }}
                className="text-xs text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <Trash2 className="w-3 h-3" /> Tozalash
              </button>
            </div>
            <ul className="max-h-60 overflow-y-auto divided-y divide-slate-100 dark:divide-slate-800">
              {history.map((item, idx) => (
                <li
                  key={`${item.word}-${idx}`}
                  className="flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent blur
                      handleHistoryClick(item.word);
                    }}
                    className="flex-1 text-left px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {item.word}
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent blur
                      onRemoveHistoryItem(item.word);
                    }}
                    className="p-1 px-3 text-slate-400 hover:text-rose-500 transition-colors text-xs"
                    title="O'chirish"
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </form>

      {/* Popular words quick-start suggestion */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
          Tavsiya etiladi:
        </span>
        {POPULAR_WORDS.map((w) => (
          <motion.button
            key={w}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePopularClick(w)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            {w}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
