import { motion, AnimatePresence } from "motion/react";
import { Star, Clock, Trash2, X, Search, BookmarkCheck } from "lucide-react";
import { FavoriteWord, HistoryItem } from "../types";

interface HistoryAndFavoritesProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteWord[];
  history: HistoryItem[];
  onRemoveFavorite: (word: string) => void;
  onSearchWord: (word: string) => void;
  onClearHistory: () => void;
  onClearFavorites: () => void;
}

export default function HistoryAndFavorites({
  isOpen,
  onClose,
  favorites,
  history,
  onRemoveFavorite,
  onSearchWord,
  onClearHistory,
  onClearFavorites,
}: HistoryAndFavoritesProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        {/* Modal Drawer */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BookmarkCheck className="text-indigo-500 w-5 h-5" />
              Sizning kabinetingiz
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub-panels scrollable container */}
          <div className="flex-1 overflow-y-auto p-5 space-y-8">
            {/* Favorites Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Sevimli so'zlar
                </h3>
                {favorites.length > 0 && (
                  <button
                    onClick={onClearFavorites}
                    className="text-xs text-rose-500 hover:underline flex items-center gap-1 font-medium bg-transparent cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hammasini o'chirish
                  </button>
                )}
              </div>

              {favorites.length === 0 ? (
                <div className="text-center py-6 px-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Sizda hali sevimlilar ro'yxatida so'zlar yo'q. Istalgan so'zni yulduzcha orqali bu yerga kiritishingiz mumkin.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {favorites.map((fav) => (
                    <motion.div
                      layout
                      key={fav.word}
                      className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:border-indigo-200 dark:hover:border-indigo-950 transition-colors relative group"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-base flex items-center gap-2">
                            {fav.word}
                            {fav.uzbekTranslation && (
                              <span className="text-xs font-normal text-indigo-500 dark:text-indigo-400">
                                ({fav.uzbekTranslation})
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-slate-450 dark:text-slate-400 line-clamp-2 mt-1">
                            {fav.definition}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              onSearchWord(fav.word);
                              onClose();
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-500 rounded transition-colors"
                            title="Qidirish"
                          >
                            <Search className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRemoveFavorite(fav.word)}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                            title="Sevimlilardan o'chirish"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* History Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Qidiruv tarixi
                </h3>
                {history.length > 0 && (
                  <button
                    onClick={onClearHistory}
                    className="text-xs text-rose-500 hover:underline flex items-center gap-1 font-medium bg-transparent cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hammasini o'chirish
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-6 px-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Sizning yaqinda qidirgan so'zlaringiz tarixi shu yerda ko'rinadi.
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {history.map((hist, index) => (
                    <motion.button
                      layout
                      onClick={() => {
                        onSearchWord(hist.word);
                        onClose();
                      }}
                      key={`${hist.word}-${index}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-950 transition-colors flex items-center gap-1"
                    >
                      <span>{hist.word}</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-center">
            <p className="text-[10px] text-slate-400">
              LingoSphere premium til ko'nikmalaringizni oshirish bilan faxrlanadi.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
