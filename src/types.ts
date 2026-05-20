// Shared TypeScript definitions for Dictionary and Language Learning.

export interface Definition {
  definition: string;
  synonyms: string[];
  antonyms: string[];
  example?: string;
}

export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms: string[];
  antonyms: string[];
}

export interface Phonetic {
  text?: string;
  audio?: string;
  sourceUrl?: string;
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  sourceUrls?: string[];
}

export interface ExampleSentence {
  english: string;
  uzbek: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface GeminiInsights {
  uzbekTranslation: string;
  pronunciationTip: string;
  grammarTips: string;
  mnemonicTip: string;
  examples: ExampleSentence[];
  quiz: QuizQuestion[];
}

export interface FavoriteWord {
  word: string;
  definition: string;
  uzbekTranslation?: string;
  timestamp: number;
}

export interface HistoryItem {
  word: string;
  timestamp: number;
}
