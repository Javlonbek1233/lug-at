import { motion } from "motion/react";
import { Sun, Moon, BookOpen, Star } from "lucide-react";

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  favoritesCount: number;
  onOpenFavorites: () => void;
}

export default function Header({ darkMode, setDarkMode, favoritesCount, onOpenFavorites }: HeaderProps) {
  return (
    <header className="border-b transition-colors duration-300 border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-2-5 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-xl text-white shadow-md shadow-indigo-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              LingoSphere
            </h1>
            <p className="text-[10px] font-medium text-indigo-500 dark:text-indigo-400 tracking-widest uppercase">
              Lug'at & Til O'rganish
            </p>
          </div>
        </motion.div>

        <div className="flex items-center gap-2">
          {/* Favorites Badge Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onOpenFavorites}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 relative"
          >
            <Star className={`w-4 h-4 ${favoritesCount > 0 ? "fill-amber-400 text-amber-400" : ""}`} />
            <span className="hidden sm:inline">Sevimlilar</span>
            {favoritesCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={favoritesCount}
                className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900"
              >
                {favoritesCount}
              </motion.span>
            )}
          </motion.button>

          {/* Theme switcher */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl bg-slate-150 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
            aria-label="Mavzuni almashtirish"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-400 animate-pulse" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600" />
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
}
