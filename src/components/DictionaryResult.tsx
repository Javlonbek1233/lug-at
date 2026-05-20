import { useState, useEffect } from "react";
import { Volume2, VolumeX, Star, HelpCircle, ChevronRight, Hash } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DictionaryEntry, Meaning } from "../types";

interface DictionaryResultProps {
  entry: DictionaryEntry;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSearchWord: (word: string) => void;
}

export default function DictionaryResult({
  entry,
  isFavorite,
  onToggleFavorite,
  onSearchWord,
}: DictionaryResultProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Find a valid audio link
    const foundPhonetic = entry.phonetics?.find((p) => p.audio && p.audio.length > 0);
    setAudioUrl(foundPhonetic?.audio || null);
  }, [entry]);

  const handlePlayAudio = () => {
    if (!audioUrl) return;
    setIsPlaying(true);
    const audio = new Audio(audioUrl);
    audio.play()
      .then(() => {
        audio.onended = () => setIsPlaying(false);
      })
      .catch((err) => {
        console.error("Audio playback error:", err);
        setIsPlaying(false);
      });
  };

  const getCleanPhonetic = () => {
    if (entry.phonetic) return entry.phonetic;
    const withText = entry.phonetics?.find((p) => p.text && p.text.length > 0);
    return withText?.text || "";
  };

  const cleanPhonetic = getCleanPhonetic();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-150 dark:border-slate-800 p-6 sm:p-8 shadow-md"
    >
      {/* Title & Phonetic audio controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white capitalize">
              {entry.word}
            </h2>
            
            {/* Favorite toggle button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onToggleFavorite}
              className={`p-2 rounded-xl border transition-colors ${
                isFavorite
                  ? "bg-amber-50 dark:bg-amber-950/20 border-amber-350 dark:border-amber-900/40 text-amber-500"
                  : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-amber-500 hover:bg-amber-50/50"
              }`}
              title={isFavorite ? "Sevimlilardan o'chirish" : "Sevimlilarga qo'shish"}
            >
              <Star className={`w-5 h-5 ${isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
            </motion.button>
          </div>

          {cleanPhonetic && (
            <p className="font-mono text-indigo-500 dark:text-indigo-400 font-medium tracking-wide text-base">
              {cleanPhonetic}
            </p>
          )}
        </div>

        {/* Audio Button */}
        <div className="flex items-center gap-2">
          {audioUrl ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePlayAudio}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold transition-all shadow-sm ${
                isPlaying
                  ? "bg-indigo-600 text-white animate-pulse"
                  : "bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400"
              }`}
            >
              <Volume2 className="w-5 h-5" />
              <span>Talaffuz (Audio)</span>
            </motion.button>
          ) : (
            <button
              disabled
              className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold bg-slate-100 dark:bg-slate-850 text-slate-400 cursor-not-allowed text-sm"
            >
              <VolumeX className="w-5 h-5" />
              <span>Audio mavjud emas</span>
            </button>
          )}
        </div>
      </div>

      {/* Meanings Loop */}
      <div className="space-y-8">
        {entry.meanings?.map((meaning: Meaning, mIndex: number) => (
          <div key={`${meaning.partOfSpeech}-${mIndex}`} className="space-y-4">
            {/* Part Of Speech Indicator */}
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-cyan-100 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400">
                {meaning.partOfSpeech}
              </span>
              <div className="h-[2px] flex-1 bg-gradient-to-r from-cyan-100 to-transparent dark:from-cyan-950/30" />
            </div>

            {/* Definitions */}
            <ul className="space-y-4">
              {meaning.definitions?.map((def, dIndex) => (
                <li
                  key={dIndex}
                  className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-750 transition-colors"
                >
                  <p className="text-slate-800 dark:text-slate-200 font-medium text-base leading-relaxed">
                    {def.definition}
                  </p>

                  {/* Definition Examples */}
                  {def.example && (
                    <div className="mt-2.5 pl-4 border-l-2 border-indigo-400 dark:border-indigo-600">
                      <p className="text-slate-500 dark:text-slate-450 italic text-sm">
                        "{def.example}"
                      </p>
                    </div>
                  )}

                  {/* Sub-definitions synonyms/antonyms */}
                  {(def.synonyms?.length > 0 || def.antonyms?.length > 0) && (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {def.synonyms?.slice(0, 3).map((syn) => (
                        <button
                          key={syn}
                          onClick={() => onSearchWord(syn)}
                          className="px-2 py-1 rounded bg-teal-50 dark:bg-teal-950/20 text-teal-650 dark:text-teal-400 hover:underline hover:bg-teal-100"
                        >
                          syn: {syn}
                        </button>
                      ))}
                      {def.antonyms?.slice(0, 3).map((ant) => (
                        <button
                          key={ant}
                          onClick={() => onSearchWord(ant)}
                          className="px-2 py-1 rounded bg-rose-50 dark:bg-rose-950/20 text-rose-650 dark:text-rose-400 hover:underline hover:bg-rose-100"
                        >
                          ant: {ant}
                        </button>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {/* Meaning Level Synonyms and Antonyms */}
            {(meaning.synonyms?.length > 0 || meaning.antonyms?.length > 0) && (
              <div className="p-4 rounded-2xl bg-indigo-50/25 dark:bg-indigo-950/10 border border-indigo-50 dark:border-indigo-950 space-y-2.5">
                {meaning.synonyms?.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="font-bold text-teal-650 dark:text-teal-400 min-w-[75px] pt-1">
                      Sinonimlar:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {meaning.synonyms.slice(0, 6).map((syn) => (
                        <button
                          key={syn}
                          onClick={() => onSearchWord(syn)}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-950/40 text-xs font-semibold cursor-pointer"
                        >
                          {syn}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {meaning.antonyms?.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="font-bold text-rose-600 dark:text-rose-400 min-w-[75px] pt-1">
                      Antonimlar:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {meaning.antonyms.slice(0, 6).map((ant) => (
                        <button
                          key={ant}
                          onClick={() => onSearchWord(ant)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-xs font-semibold cursor-pointer"
                        >
                          {ant}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Source URL links */}
      {entry.sourceUrls && entry.sourceUrls.length > 0 && (
        <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-1.5 text-xs text-slate-400">
          <span>Manba:</span>
          {entry.sourceUrls.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              referrerPolicy="no-referrer"
              className="hover:text-indigo-500 transition-colors truncate max-w-[280px] hover:underline"
            >
              {url}
            </a>
          ))}
        </div>
      )}
    </motion.div>
  );
}
