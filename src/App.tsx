import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  BookOpen, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Star, 
  Trash2, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  X, 
  Award, 
  Compass, 
  HelpCircle,
  Moon,
  Sun,
  GraduationCap
} from "lucide-react";

import { DictionaryEntry, GeminiInsights, FavoriteWord, HistoryItem } from "./types";

// Seeded pre-loaded Words of the Day
const WORD_OF_THE_DAY = {
  word: "Serendipity",
  phonetic: "/ˌserənˈdipədē/",
  partOfSpeech: "noun",
  definition: "The occurrence of events by chance in a happy or beneficial way.",
  uzbekTranslation: "Tasodifiy baxt; kutilmagan yaxshi uchrashuv yoki qiziqarli kashfiyot.",
  mnemonic: "Siz bog'da sargardon yurib, kutilmaganda pul topib olganingizda - bu serendipity!"
};

const SAMPLE_POPULAR = ["Eloquent", "Resilience", "Melancholy", "Benevolent", "Aesthetic", "Nostalgia"];

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [searchWord, setSearchWord] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data State
  const [dictionaryData, setDictionaryData] = useState<DictionaryEntry | null>(null);
  const [geminiInsights, setGeminiInsights] = useState<GeminiInsights | null>(null);
  
  // LocalStorage Persisted States
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem("linguo_history");
    return saved ? JSON.parse(saved) : [
      { word: "Soliloquy", timestamp: Date.now() - 120000 },
      { word: "Mellifluous", timestamp: Date.now() - 3600000 },
      { word: "Ambivalence", timestamp: Date.now() - 86400000 }
    ];
  });
  
  const [favorites, setFavorites] = useState<FavoriteWord[]>(() => {
    const saved = localStorage.getItem("linguo_favorites");
    return saved ? JSON.parse(saved) : [
      { word: "Serendipity", definition: "The occurrence of events by chance in a happy way.", uzbekTranslation: "Tasodifiy baxt", timestamp: Date.now() }
    ];
  });

  // Quiz active states for dynamic learning
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<"lugat" | "test" | "yoqlar">("lugat");
  const [soundPlaying, setSoundPlaying] = useState<boolean>(false);

  // Sync localStorage with theme & preferences
  useEffect(() => {
    localStorage.setItem("linguo_history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("linguo_favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Initial load
  useEffect(() => {
    // Look up default premium word to ensure screen has an active, highly polished setup on boot
    handleSearch("Serendipity", false);
  }, []);

  const handleSearch = async (wordToQuery: string, addHistory: boolean = true) => {
    const query = wordToQuery.trim();
    if (!query) return;

    setLoading(true);
    setError(null);
    setSearchWord(query);
    setGeminiInsights(null);
    setSelectedQuizAnswers({});
    setQuizSubmitted({});

    if (addHistory) {
      setHistory(prev => {
        // Prevent duplication
        const filtered = prev.filter(item => item.word.toLowerCase() !== query.toLowerCase());
        return [{ word: query, timestamp: Date.now() }, ...filtered].slice(0, 15);
      });
    }

    try {
      // 1. Fetch standard definitions from Dictionary API
      const dictResponse = await fetch(`/api/dictionary/search/${encodeURIComponent(query)}`);
      let dictionaryEntry: DictionaryEntry | null = null;
      let primaryDefinition = "";
      let primaryPartOfSpeech = "";

      if (dictResponse.ok) {
        const payload = await dictResponse.json();
        if (Array.isArray(payload) && payload.length > 0) {
          dictionaryEntry = payload[0];
          setDictionaryData(dictionaryEntry);
          
          // Pull first definition for Gemini assistance proxy
          primaryDefinition = dictionaryEntry.meanings?.[0]?.definitions?.[0]?.definition || "";
          primaryPartOfSpeech = dictionaryEntry.meanings?.[0]?.partOfSpeech || "";
        }
      } else {
        // Fallback for custom or rare slang/words not in standard API
        setDictionaryData({
          word: query,
          phonetics: [],
          meanings: [
            {
              partOfSpeech: "Noun / Verb / Modifier",
              definitions: [
                {
                  definition: "Sought-after terms. Proceeding directly with premium Gemini AI concept generation.",
                  synonyms: [],
                  antonyms: []
                }
              ],
              synonyms: [],
              antonyms: []
            }
          ]
        });
      }

      // 2. Fetch AI Insights (Uzbek Translations, Mnemonics, Examples, Quiz and Correct pronunciation tips)
      setAiLoading(true);
      const geminiResponse = await fetch("/api/learning/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: query,
          definition: primaryDefinition,
          partOfSpeech: primaryPartOfSpeech
        })
      });

      if (geminiResponse.ok) {
        const insights: GeminiInsights = await geminiResponse.json();
        setGeminiInsights(insights);
      } else {
        console.warn("Could not retrieve AI insights, rendering standard translations.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Qidiruv jarayonida xatolik yuz berdi. Tarmoq ulanishini tekshiring.");
    } finally {
      setLoading(false);
      setAiLoading(false);
    }
  };

  const handleToggleFavorite = () => {
    if (!dictionaryData) return;
    const isFav = favorites.some(f => f.word.toLowerCase() === dictionaryData.word.toLowerCase());
    
    if (isFav) {
      setFavorites(prev => prev.filter(f => f.word.toLowerCase() !== dictionaryData.word.toLowerCase()));
    } else {
      const firstDef = dictionaryData.meanings?.[0]?.definitions?.[0]?.definition || "Meaning";
      const uzDef = geminiInsights?.uzbekTranslation || "";
      setFavorites(prev => [
        {
          word: dictionaryData.word,
          definition: firstDef,
          uzbekTranslation: uzDef,
          timestamp: Date.now()
        },
        ...prev
      ]);
    }
  };

  const playVoiceSynthesizer = () => {
    // Try to find native phonetic audio first
    const phoneticAudio = dictionaryData?.phonetics?.find(p => p.audio && p.audio.length > 0)?.audio;
    if (phoneticAudio) {
      setSoundPlaying(true);
      const snd = new Audio(phoneticAudio);
      snd.play()
        .then(() => {
          snd.onended = () => setSoundPlaying(false);
        })
        .catch(() => {
          setSoundPlaying(false);
          // Fallback to Web Speech Synthesis API
          triggerSpeechSynthesis();
        });
    } else {
      triggerSpeechSynthesis();
    }
  };

  const triggerSpeechSynthesis = () => {
    if ("speechSynthesis" in window) {
      setSoundPlaying(true);
      const utterance = new SpeechSynthesisUtterance(dictionaryData?.word || searchWord);
      utterance.lang = "en-US";
      utterance.onend = () => setSoundPlaying(false);
      utterance.onerror = () => setSoundPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Kechirasiz, ushbu brauzerda audio talaffuz texnologiyasi qo'llab-quvvatlanmaydi.");
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const removeHistoryItem = (word: string) => {
    setHistory(prev => prev.filter(h => h.word.toLowerCase() !== word.toLowerCase()));
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  const isWordFavorite = dictionaryData 
    ? favorites.some(f => f.word.toLowerCase() === dictionaryData.word.toLowerCase())
    : false;

  return (
    <div className={`min-h-screen font-sans ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"} transition-colors duration-300 relative`}>
      
      {/* Immersive background decoration */}
      <div className="absolute top-0 left-0 right-0 h-[500px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-250px] left-[15%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[120px] dark:bg-indigo-500/5 animate-glow" />
        <div className="absolute top-[-200px] right-[10%] w-[500px] h-[500px] rounded-full bg-pink-500/10 blur-[130px] dark:bg-pink-500/5" />
      </div>

      {/* Header element conforming to HTML specs */}
      <header className={`sticky top-0 z-40 border-b ${darkMode ? "border-slate-900 bg-slate-950/80" : "border-slate-200 bg-white/80"} backdrop-blur-xl transition-all`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo with Gradient text matching Immersive CSS */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleSearch("Serendipity")}>
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20 text-base">
              L
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              Linguo<span className="gradient-text">Dictionary</span>
            </span>
          </div>

          {/* Nav with interactive filters */}
          <nav className="hidden md:flex space-x-8 text-sm font-semibold text-slate-400 dark:text-slate-400">
            <button 
              onClick={() => setActiveTab("lugat")} 
              className={`pb-1 transition-colors hover:text-indigo-400 ${activeTab === "lugat" ? "text-indigo-500 dark:text-white border-b-2 border-indigo-500" : ""}`}
            >
              Asosiy Lug'at
            </button>
            <button 
              onClick={() => setActiveTab("test")} 
              className={`pb-1 transition-colors hover:text-indigo-400 relative ${activeTab === "test" ? "text-indigo-500 dark:text-white border-b-2 border-indigo-500" : ""}`}
            >
              Mashq va Testlar
              {geminiInsights?.quiz && (
                <span className="absolute -top-1.5 -right-3.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab("yoqlar")} 
              className={`pb-1 transition-colors hover:text-indigo-400 ${activeTab === "yoqlar" ? "text-indigo-500 dark:text-white border-b-2 border-indigo-500" : ""}`}
            >
              Sevimlilar ({favorites.length})
            </button>
          </nav>

          {/* Quick Config Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl transition-all ${darkMode ? "bg-slate-900 border border-slate-800 text-amber-400 hover:bg-slate-850" : "bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-150"}`}
              title={darkMode ? "Kunning yorug' rejimiga o'tish" : "Tunning qorong'u rejimiga o'tish"}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-500 border border-slate-600 shadow-inner flex items-center justify-center text-xs font-bold text-white uppercase">
              U
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 relative z-10 space-y-6">
        
        {/* Modern Interactive Search Block */}
        <div className="flex flex-col items-center justify-center py-2 w-full">
          <div className="relative w-full max-w-3xl group">
            
            {/* Ambient background glow effect */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-45 transition duration-1000" />
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch(searchWord);
              }}
              className={`relative flex items-center ${darkMode ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-250"} border rounded-2xl p-1.5 search-glow`}
            >
              <div className="pl-4 pr-2 text-slate-400">
                <Search className="w-5 h-5 pointer-events-none text-indigo-400" />
              </div>
              <input 
                type="text" 
                placeholder="Inglizcha so'z, ibora yoki tushunchani kiriting..." 
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                className="w-full bg-transparent border-none outline-none py-3 px-1 text-base sm:text-lg tracking-tight placeholder-slate-500 text-slate-900 dark:text-slate-100"
              />
              
              <button 
                type="submit" 
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 cursor-pointer text-white px-5 sm:px-8 py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-indigo-500/20 flex items-center gap-1.5 shrink-0 text-sm"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Qidiruv</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick tags suggestion row */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 max-w-2xl">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 dark:text-slate-500">
              Ommabop qidiruvlar:
            </span>
            {SAMPLE_POPULAR.map((word) => (
              <button
                key={word}
                onClick={() => {
                  setSearchWord(word);
                  handleSearch(word);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  darkMode 
                    ? "bg-slate-900/60 hover:bg-indigo-950/30 text-slate-300 border border-slate-800/80 hover:border-indigo-500/30" 
                    : "bg-white hover:bg-indigo-50 text-slate-600 border border-slate-200 hover:border-indigo-200"
                }`}
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        {/* Loading overlay for content transitions */}
        {loading && !dictionaryData && (
          <div className="text-center py-20">
            <div className="relative inline-flex mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-400 animate-pulse">LingoSphere ma'lumotlar omboridan va Sun'iy Intellektdan yuklanmoqda...</p>
          </div>
        )}

        {/* Core Layout Grid */}
        <main className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left Panel: History, Quick Word of the Day, Information */}
          <aside className="col-span-1 md:col-span-3 flex flex-col space-y-6">
            
            {/* History Card with glass effects */}
            <div className={`p-5 rounded-3xl ${darkMode ? "glass text-slate-100" : "glass-light text-slate-800"} flex flex-col min-h-[300px]`}>
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  Qidiruv Tarixi
                </h3>
                {history.length > 0 && (
                  <button 
                    onClick={clearHistory}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    Tozalash
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <Compass className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                  <p className="text-xs text-slate-400 dark:text-slate-500">Yaqinda qidirilgan so'zlar bu yerda saqlanadi.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto max-h-[280px] mt-3 space-y-2 pr-1">
                  {history.map((hist, index) => (
                    <div 
                      key={`${hist.word}-${index}`}
                      className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                        darkMode 
                          ? "bg-slate-900/60 hover:bg-slate-850/80 border border-slate-850/80 hover:border-slate-800" 
                          : "bg-white hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-100"
                      } cursor-pointer`}
                      onClick={() => handleSearch(hist.word, false)}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-semibold text-sm truncate capitalize">{hist.word}</p>
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest">
                          {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeHistoryItem(hist.word);
                        }}
                        className="p-1 hover:text-rose-500 transition-colors rounded"
                        title="O'chirish"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Word of the Day premium widget */}
            <div className={`p-5 rounded-3xl bg-gradient-to-tr ${darkMode ? "from-indigo-950/40 to-slate-900 border border-indigo-500/20" : "from-indigo-50 to-white border border-indigo-100"} hover:shadow-xl hover:shadow-indigo-500/5 transition-all`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase font-black tracking-widest text-indigo-500 dark:text-indigo-300">
                  Kun so'zi
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h4 className="text-xl font-black capitalize">{WORD_OF_THE_DAY.word}</h4>
              <p className="text-[11px] font-mono font-bold text-slate-400 tracking-wide mt-0.5">{WORD_OF_THE_DAY.phonetic}</p>
              
              <div className="p-3 my-3 rounded-xl bg-slate-100/50 dark:bg-slate-950/60 border border-slate-150 dark:border-slate-900">
                <span className="text-[9px] font-bold text-indigo-400 capitalize inline-block mb-1">
                  ({WORD_OF_THE_DAY.partOfSpeech}) ing.
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{WORD_OF_THE_DAY.definition}"
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-indigo-500 dark:text-indigo-400 block">
                  O'zbekcha sharhi
                </span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {WORD_OF_THE_DAY.uzbekTranslation}
                </p>
                <p className="text-[10px] italic text-slate-400 dark:text-slate-500 mt-1">
                  💡 {WORD_OF_THE_DAY.mnemonic}
                </p>
              </div>
              
              <button
                onClick={() => handleSearch(WORD_OF_THE_DAY.word)}
                className="w-full mt-4 py-2 font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Compass className="w-3.5 h-3.5" /> Barcha tahlillarni ochish
              </button>
            </div>
          </aside>

          {/* Center Panel - Main Core Content Container */}
          <section className="col-span-1 md:col-span-6 flex flex-col space-y-6">

            {/* Error handling */}
            {error && (
              <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm flex items-start gap-3">
                <HelpCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Xatolik yuz berdi</p>
                  <p className="text-xs opacity-90 mt-1">{error}</p>
                  <button 
                    onClick={() => handleSearch(searchWord || "Resilience")}
                    className="mt-2.5 px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-lg transition-all"
                  >
                    Qaytadan urinish
                  </button>
                </div>
              </div>
            )}

            {/* Tab navigation for mobile displays */}
            <div className="flex md:hidden bg-slate-900 border border-slate-800 rounded-xl p-1 justify-around text-xs">
              <button 
                onClick={() => setActiveTab("lugat")} 
                className={`py-2 px-3 rounded-lg flex-1 text-center font-bold transition-all ${activeTab === "lugat" ? "bg-indigo-600 text-white" : "text-slate-400"}`}
              >
                Lug'at
              </button>
              <button 
                onClick={() => setActiveTab("test")} 
                className={`py-2 px-3 rounded-lg flex-1 text-center font-bold transition-all ${activeTab === "test" ? "bg-indigo-600 text-white" : "text-slate-400"}`}
              >
                Mashqlar
              </button>
              <button 
                onClick={() => setActiveTab("yoqlar")} 
                className={`py-2 px-3 rounded-lg flex-1 text-center font-bold transition-all ${activeTab === "yoqlar" ? "bg-indigo-600 text-white" : "text-slate-400"}`}
              >
                Yulduzchalar ({favorites.length})
              </button>
            </div>

            {/* Lug'at & Insight Panels (activeTab === "lugat") */}
            {activeTab === "lugat" && (
              <AnimatePresence mode="wait">
                {dictionaryData && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    
                    {/* Primary word display block */}
                    <div className={`p-6 sm:p-8 rounded-3xl ${darkMode ? "glass bg-slate-900/45 text-slate-100" : "glass-light bg-white text-slate-800"} flex flex-col space-y-4`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-4.5xl font-black capitalize tracking-tight">{dictionaryData.word}</h2>
                            <button
                              onClick={handleToggleFavorite}
                              className={`p-2 rounded-xl border transition-all ${
                                isWordFavorite 
                                  ? "bg-amber-500/15 border-amber-500/30 text-amber-500 scale-105" 
                                  : "bg-slate-100/50 dark:bg-slate-905 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-amber-500"
                              }`}
                              title={isWordFavorite ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"}
                            >
                              <Star className={`w-4 h-4 ${isWordFavorite ? "fill-amber-400 text-amber-500" : ""}`} />
                            </button>
                          </div>
                          
                          {/* IPA phonetic */}
                          {dictionaryData.phonetic && (
                            <p className="font-mono text-sm tracking-wide text-indigo-400 dark:text-indigo-300 font-bold mt-1">
                              {dictionaryData.phonetic}
                            </p>
                          )}
                        </div>

                        {/* Pronunciation block */}
                        <div className="space-y-1">
                          <button
                            onClick={playVoiceSynthesizer}
                            className={`p-3.5 rounded-full transition-all flex items-center justify-center ${
                              soundPlaying 
                                ? "bg-indigo-650 text-white animate-pulse" 
                                : "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 border border-indigo-500/20 hover:scale-105"
                            }`}
                            title="Talaffuzni eshitish"
                          >
                            {soundPlaying ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <Volume2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Gemini Enhanced Uzbek Translations & Mnemonics */}
                      <div className="pt-4 border-t border-slate-150 dark:border-slate-800/80 space-y-4">
                        
                        {/* Premium Uzbek translation label */}
                        <div>
                          <div className="inline-flex items-center gap-1.5 bg-gradient-to-tr from-cyan-500/10 to-indigo-500/10 border border-cyan-500/25 px-2.5 py-1 rounded-lg">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            <span className="text-[10px] uppercase font-black tracking-wider text-cyan-400">
                              Sun'iy Intellekt Tarjimasi
                            </span>
                          </div>

                          {aiLoading ? (
                            <div className="flex items-center space-x-2 mt-2 py-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                              <span className="text-xs text-indigo-400 font-bold animate-pulse">Uzbekcha chuqur tarjima shakllantirilmoqda...</span>
                            </div>
                          ) : (
                            geminiInsights?.uzbekTranslation && (
                              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight mt-1 bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
                                {geminiInsights.uzbekTranslation}
                              </h3>
                            )
                          )}
                        </div>

                        {/* Speech guides & mnemonics */}
                        {!aiLoading && geminiInsights && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                            {geminiInsights.pronunciationTip && (
                              <div className="p-3 bg-slate-900/20 border border-slate-800/60 rounded-2xl">
                                <span className="text-[9px] uppercase font-extrabold tracking-widest text-slate-400 block mb-0.5">
                                  Talaffuz Yo'riqnomasi
                                </span>
                                <p className="text-xs text-slate-350 leading-relaxed font-semibold">
                                  {geminiInsights.pronunciationTip}
                                </p>
                              </div>
                            )}

                            {geminiInsights.mnemonicTip && (
                              <div className="p-3 bg-slate-900/20 border border-slate-800/60 rounded-2xl">
                                <span className="text-[9px] uppercase font-extrabold tracking-widest text-pink-400 block mb-0.5">
                                  Eslab qolish usuli (Mnemofaza)
                                </span>
                                <p className="text-xs text-slate-350 leading-relaxed">
                                  💡 {geminiInsights.mnemonicTip}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Classic definitions & meanings block */}
                    <div className="space-y-4">
                      {dictionaryData.meanings?.map((meaning, index) => (
                        <div 
                          key={`${meaning.partOfSpeech}-${index}`}
                          className={`p-6 rounded-3xl ${darkMode ? "glass text-slate-100" : "glass-light bg-white text-slate-800"} space-y-4`}
                        >
                          {/* Part of Speech Label */}
                          <div className="flex items-center space-x-3">
                            <span className="px-3.5 py-1 bg-pink-500/10 text-pink-400 text-xs font-black uppercase rounded-lg border border-pink-500/20">
                              {meaning.partOfSpeech}
                            </span>
                            <div className="h-px flex-1 bg-slate-150 dark:bg-slate-800" />
                          </div>

                          {/* Definitions Loop */}
                          <div className="space-y-4">
                            {meaning.definitions?.map((def, defIndex) => (
                              <div key={defIndex} className="space-y-2">
                                <div className="flex items-start gap-3">
                                  <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 text-xs mt-0.5 shrink-0">
                                    {defIndex + 1}
                                  </div>
                                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">
                                    {def.definition}
                                  </p>
                                </div>
                                
                                {def.example && (
                                  <div className="ml-9 p-3 bg-slate-50/70 dark:bg-slate-950/40 rounded-xl border-l-[3px] border-indigo-500 italic text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                                    "{def.example}"
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* AI Generated Multilingual Example Sentences */}
                    {!aiLoading && geminiInsights?.examples && (
                      <div className={`p-6 rounded-3xl ${darkMode ? "glass text-slate-100" : "glass-light bg-white text-slate-800"} space-y-4`}>
                        <div className="flex items-center space-x-2 pb-2">
                          <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-black uppercase rounded-lg border border-indigo-500/20 flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5" />
                            Mukammal Misollar & Tarjimalar
                          </span>
                        </div>

                        <div className="grid gap-3.5">
                          {geminiInsights.examples.map((ex, idx) => (
                            <div 
                              key={idx}
                              className="p-4 rounded-2xl bg-indigo-950/10 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-800/80 hover:border-indigo-500/10 transition-colors"
                            >
                              <p className="font-semibold text-sm text-slate-850 dark:text-indigo-300 leading-relaxed">
                                {ex.english}
                              </p>
                              <div className="h-px bg-slate-100 dark:bg-slate-800/80 my-2" />
                              <p className="text-xs text-slate-650 dark:text-slate-400 italic">
                                🇺🇿 {ex.uzbek}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grammar and syntax tips */}
                    {!aiLoading && geminiInsights?.grammarTips && (
                      <div className={`p-6 rounded-3xl ${darkMode ? "glass text-slate-100" : "glass-light bg-white text-slate-800"} space-y-2`}>
                        <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400">
                          Qoidalar va Grammatika
                        </h4>
                        <p className="text-xs text-slate-750 dark:text-slate-300 leading-relaxed">
                          {geminiInsights.grammarTips}
                        </p>
                      </div>
                    )}

                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Test tab matching activeTab === "test" or show always below if desired */}
            {activeTab === "test" && (
              <div className={`p-6 sm:p-8 rounded-3xl ${darkMode ? "glass text-slate-100" : "glass-light text-slate-800"} space-y-6`}>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-tr from-pink-500 to-indigo-600 rounded-lg text-white">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg">AI Viktorina (Vocabulary Quiz)</h3>
                    <p className="text-xs text-slate-400">Qidirilgan so'zni yaxshiroq tushunib, xotirada qotirish uchun viktorina.</p>
                  </div>
                </div>

                {/* Loading state for quiz */}
                {aiLoading && (
                  <div className="text-center py-10 space-y-2">
                    <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin inline-block" />
                    <p className="text-xs text-slate-400">Sun'iy Intellekt yangi savollar tuzmoqda...</p>
                  </div>
                )}

                {/* Main Quiz Render */}
                {!aiLoading && geminiInsights?.quiz && (
                  <div className="space-y-6">
                    {geminiInsights.quiz.map((q, quizIdx) => {
                      const answerSelected = selectedQuizAnswers[quizIdx] !== undefined;
                      const submitted = quizSubmitted[quizIdx];
                      const selectedIndex = selectedQuizAnswers[quizIdx];

                      return (
                        <div 
                          key={quizIdx}
                          className="p-4 sm:p-5 rounded-2xl bg-indigo-950/10 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800/80 space-y-4"
                        >
                          <div className="flex items-start gap-2">
                            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-wider rounded border border-indigo-500/20">
                              Savol #{quizIdx + 1}
                            </span>
                            <span className="text-xs text-slate-400 font-bold">Sinov Testi</span>
                          </div>
                          
                          <p className="font-bold text-sm tracking-tight leading-relaxed">
                            {q.question}
                          </p>

                          {/* Options list */}
                          <div className="grid gap-2.5">
                            {q.options.map((option, idx) => {
                              const isSelected = selectedIndex === idx;
                              const isCorrect = idx === q.correctIndex;

                              let cardStyle = "border-slate-200 dark:border-slate-800/80 hover:bg-slate-100/50 dark:hover:bg-slate-900/60";
                              if (isSelected) {
                                cardStyle = "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400";
                              }
                              if (submitted) {
                                if (isCorrect) {
                                  cardStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold";
                                } else if (isSelected) {
                                  cardStyle = "border-rose-500 bg-rose-500/15 text-rose-500 dark:text-rose-400";
                                } else {
                                  cardStyle = "opacity-40 border-slate-150 dark:border-slate-850";
                                }
                              }

                              return (
                                <button
                                  key={idx}
                                  disabled={submitted}
                                  onClick={() => setSelectedQuizAnswers(prev => ({ ...prev, [quizIdx]: idx }))}
                                  className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${cardStyle} cursor-pointer`}
                                >
                                  <span>{option}</span>
                                  {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-1" />}
                                  {submitted && isSelected && !isCorrect && <X className="w-4 h-4 text-rose-500 shrink-0 ml-1" />}
                                </button>
                              );
                            })}
                          </div>

                          {/* Submitted / action buttons */}
                          {!submitted ? (
                            <button
                              disabled={!answerSelected}
                              onClick={() => setQuizSubmitted(prev => ({ ...prev, [quizIdx]: true }))}
                              className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 select-none cursor-pointer"
                            >
                              Javobni Tekshirish
                            </button>
                          ) : (
                            <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-xs leading-relaxed text-slate-300 space-y-1">
                              <span className="font-extrabold text-indigo-400 block uppercase tracking-wider text-[10px]">
                                To'liq Izoh
                              </span>
                              <p>{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {!geminiInsights?.quiz && !aiLoading && (
                  <div className="text-center py-12 p-6 flex flex-col items-center justify-center space-y-3 border-2 border-dashed border-slate-800 rounded-3xl">
                    <BookOpen className="w-10 h-10 text-indigo-400/40" />
                    <div>
                      <p className="font-bold text-sm">Viktorina uchun so'z topilmadi</p>
                      <p className="text-xs text-slate-500 max-w-sm mt-1">Har qanday so'zni qidirganingizda tizim sizga uning asosida yangi til viktorinasini tuzib beradi.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Favorites list for smaller screens representation / separate interactive list */}
            {activeTab === "yoqlar" && (
              <div className={`p-6 sm:p-8 rounded-3xl ${darkMode ? "glass text-slate-100" : "glass-light bg-white text-slate-800"} space-y-6`}>
                <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-black flex items-center gap-1.5 text-indigo-400">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    Maxsus Sevimlilar
                  </h3>
                  {favorites.length > 0 && (
                    <button 
                      onClick={clearFavorites}
                      className="text-xs font-bold text-rose-500 hover:underline"
                    >
                      Hammasini o'chirish
                    </button>
                  )}
                </div>

                {favorites.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Star className="w-10 h-10 mx-auto text-slate-755 mb-2 opacity-50" />
                    <p className="font-bold text-sm">Sevimlilar ro'yxati hozircha bo'sh.</p>
                    <p className="text-xs max-w-xs mx-auto mt-1">Qorong'u tunda so'zlarni eslab qolish uchun istalgan so'zga yulduzcha bering.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {favorites.map((fav, index) => (
                      <div 
                        key={`${fav.word}-${index}`}
                        className="p-4 rounded-2xl border border-slate-150 dark:border-slate-800/80 hover:border-indigo-500/20 transition-all flex justify-between items-center bg-slate-900/10"
                      >
                        <div>
                          <span className="font-bold text-slate-850 dark:text-slate-100 block capitalize text-base cursor-pointer hover:text-indigo-400" onClick={() => handleSearch(fav.word)}>
                            {fav.word}
                          </span>
                          <span className="text-xs text-indigo-500 dark:text-indigo-400 font-bold">{fav.uzbekTranslation || "Tarjimasi mavjud"}</span>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-1 font-medium">{fav.definition}</p>
                        </div>
                        <button
                          onClick={() => setFavorites(prev => prev.filter(f => f.word !== fav.word))}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                          title="O'chirish"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* API and server performance information */}
            <div className="flex justify-between items-center px-4 py-2 bg-slate-900/10 border border-slate-150 dark:border-slate-850 rounded-2xl text-[10px] text-slate-400 tracking-wider">
              <span className="flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
                SYSTEM API STATUS: ADVANCED ONLINE
              </span>
              <span>LingoSphere PRO v2.4</span>
            </div>
          </section>

          {/* Right Panel: Side features - Sinograms, Antonyms, Favorites and Quick Actions */}
          <aside className="col-span-1 md:col-span-3 flex flex-col space-y-6">
            
            {/* Synonyms & Antonyms block */}
            <div className={`p-5 rounded-3xl ${darkMode ? "glass text-slate-100" : "glass-light text-slate-850"} flex flex-col`}>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-405 border-b pb-3 border-slate-100 dark:border-slate-800 mb-4">
                Leksik bog'liqliklar
              </h3>

              {!dictionaryData && (
                <p className="text-xs text-slate-400">Tahlil qilinayotgan biror so'zni qidiring.</p>
              )}

              {dictionaryData && (
                <div className="space-y-6">
                  {/* Synonyms */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] bg-slate-900/60 dark:bg-slate-950/60 px-2 py-0.5 rounded border border-indigo-500/20 text-indigo-400 uppercase tracking-widest font-extrabold block w-fit">
                      Sinonimlar (Synonyms)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {dictionaryData.meanings?.some(m => m.synonyms?.length > 0) ? (
                        dictionaryData.meanings.flatMap(m => m.synonyms || []).slice(0, 8).map((syn) => (
                          <button
                            key={syn}
                            onClick={() => handleSearch(syn)}
                            className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-teal-650 dark:text-teal-400 hover:bg-teal-500/10 cursor-pointer transition-all hover:scale-105"
                          >
                            {syn}
                          </button>
                        ))
                      ) : (
                        <span className="text-xs italic text-slate-500">Sinonimlar aniqlanmadi</span>
                      )}
                    </div>
                  </div>

                  {/* Antonyms */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] bg-slate-900/60 dark:bg-slate-950/60 px-2 py-0.5 rounded border border-pink-500/20 text-pink-450 uppercase tracking-widest font-extrabold block w-fit">
                      Antonimlar (Antonyms)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {dictionaryData.meanings?.some(m => m.antonyms?.length > 0) ? (
                        dictionaryData.meanings.flatMap(m => m.antonyms || []).slice(0, 6).map((ant) => (
                          <button
                            key={ant}
                            onClick={() => handleSearch(ant)}
                            className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-rose-650 dark:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-all hover:scale-105"
                          >
                            {ant}
                          </button>
                        ))
                      ) : (
                        <span className="text-xs italic text-slate-500">Antonimlar aniqlanmadi</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop favorites quick display */}
            <div className={`p-5 rounded-3xl ${darkMode ? "glass text-slate-100" : "glass-light text-slate-800"}`}>
              <div className="flex items-center gap-2.5 mb-3 border-b pb-3 border-slate-800/60">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                </div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
                  Saqlangan yulduzchalar ({favorites.length})
                </span>
              </div>

              {favorites.length === 0 ? (
                <p className="text-xs text-slate-400">Hech qanday so'z sevimlilarga kiritilmagan.</p>
              ) : (
                <div className="space-y-2 mt-2 max-h-[300px] overflow-y-auto">
                  {favorites.slice(0, 6).map((fav) => (
                    <div 
                      key={fav.word} 
                      onClick={() => handleSearch(fav.word)}
                      className={`p-2.5 text-xs rounded-xl border transition-all ${
                        darkMode 
                          ? "bg-slate-900/40 border-slate-850 hover:bg-slate-850 cursor-pointer" 
                          : "bg-white border-slate-100 hover:bg-slate-50 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold capitalize text-slate-800 dark:text-slate-200">{fav.word}</span>
                        {fav.uzbekTranslation && (
                          <span className="text-[10px] font-bold text-indigo-400 truncate max-w-[100px]" title={fav.uzbekTranslation}>
                            {fav.uzbekTranslation}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-1 italic">"{fav.definition}"</p>
                    </div>
                  ))}
                  {favorites.length > 6 && (
                    <button 
                      onClick={() => setActiveTab("yoqlar")}
                      className="text-[11px] font-bold text-indigo-400 hover:underline pt-2 inline-block"
                    >
                      Barchasini ko'rish (+{favorites.length - 6} ta)
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Quick installation / Deployment instruction guide */}
            <div className={`p-4 rounded-3xl ${darkMode ? "bg-slate-900/40 border border-slate-850 text-slate-400" : "bg-white border border-slate-200 text-slate-600"} text-xs leading-relaxed space-y-2`}>
              <p className="font-bold text-slate-850 dark:text-slate-300">🚀 Deploy Qilish Qo'llanmasi</p>
              <ul className="list-decimal list-inside space-y-1 text-[11px]">
                <li>LingoSphere to'liq full-stack Cloud Run platformasida ishga tushadi.</li>
                <li>Hamma so'rovlar <code className="bg-slate-805/40 p-1 dark:bg-slate-900 rounded font-code">/api/*</code> server proksisi orqali xavfsiz boshqariladi.</li>
                <li>Ushbu loyihani local orqali ishga tushirish uchun: <code className="bg-slate-805/40 p-1 dark:bg-slate-900 rounded font-code">npm run dev</code></li>
                <li>Ishlab chiqarish (Production) uchun: <code className="bg-slate-805/40 p-1 dark:bg-slate-900 rounded font-code">npm run build</code></li>
              </ul>
            </div>
          </aside>
        </main>
      </div>

      {/* Footer element */}
      <footer className={`h-14 mt-16 border-t ${darkMode ? "border-slate-900 bg-slate-950/40" : "border-slate-100 bg-white"} flex flex-col sm:flex-row items-center justify-between px-6 text-[10px] text-slate-500 uppercase tracking-[2px] z-10 relative`}>
        <div className="flex items-center space-x-2">
          <span>&copy; 2026 LingoSphere Dictionary & Language Learning Toolkit • v2.4</span>
        </div>
        <div className="flex space-x-6 mt-2 sm:mt-0">
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
            Gemini Assistant: Active
          </span>
          <span>UZB / ENG</span>
        </div>
      </footer>
    </div>
  );
}
