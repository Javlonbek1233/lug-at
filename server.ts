import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize express app
const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Google Gen AI
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("⚠️ Warning: GEMINI_API_KEY is not defined in the environment.");
}

// ---------------- API Routes ----------------

// 1. Save or proxy Free Dictionary API search
app.get("/api/dictionary/search/:word", async (req: Request, res: Response): Promise<void> => {
  const { word } = req.params;
  try {
    const apiRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!apiRes.ok) {
      if (apiRes.status === 404) {
        res.status(404).json({ error: "Word not found in structural dictionary API" });
        return;
      }
      throw new Error(`Dictionary API responded with status ${apiRes.status}`);
    }
    const data = await apiRes.json();
    res.json(data);
  } catch (error: any) {
    console.error("Dictionary API Error:", error.message);
    res.status(500).json({ error: "Lug'at ma'lumotlarini yuklashda xatolik yuz berdi" });
  }
});

// 2. Deep Language Learning Insights via Gemini AI
app.post("/api/learning/insights", async (req: Request, res: Response): Promise<void> => {
  const { word, definition, partOfSpeech } = req.body;

  if (!word) {
    res.status(400).json({ error: "Word is required" });
    return;
  }

  if (!ai) {
    res.status(503).json({ error: "Senty AI tizimi hozirda faol emas (API key yetishmayapti)" });
    return;
  }

  try {
    const prompt = `Analyses the English word "${word}". Definition: "${definition || 'Unknown'}". Part of speech: "${partOfSpeech || 'Unknown'}".
Provide language learning insights tailored for an Uzbek speaker. 
Return structured JSON containing:
1. uzbekTranslation: The most accurate Uzbek translation or translations of this word.
2. pronunciationTip: Tip for correct pronunciation of "${word}" in Uzbek.
3. grammarTips: Key grammar tips or usage rules for "${word}".
4. mnemonicTip: Mnemonic helper (eslab qolish usuli) or associative hint in Uzbek to easily remember the word "${word}".
5. examples: Array of 3 English example sentences using "${word}" along with their Uzbek translations. Each element has keys "english" and "uzbek".
6. quiz: Array of 2 multiple-choice question objects focusing on the meaning or context of "${word}". Each has fields "question" (in Uzbek or simple English), "options" (array of 4 strings), "correctIndex" (0-based correct option index), and "explanation" (explanation of why that is correct, in Uzbek).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            uzbekTranslation: {
              type: Type.STRING,
              description: "The Uzbek translation of the word, styled neatly."
            },
            pronunciationTip: {
              type: Type.STRING,
              description: "Pronunciation tips in Uzbek."
            },
            grammarTips: {
              type: Type.STRING,
              description: "Grammar tips or collocation rules."
            },
            mnemonicTip: {
              type: Type.STRING,
              description: "Mnemonics or association tricks to remember the word."
            },
            examples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  english: { type: Type.STRING },
                  uzbek: { type: Type.STRING }
                },
                required: ["english", "uzbek"]
              },
              description: "Exactly 3 examples with English and Uzbek translation."
            },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "correctIndex", "explanation"]
              },
              description: "Quiz questions to test retention."
            }
          },
          required: ["uzbekTranslation", "pronunciationTip", "grammarTips", "mnemonicTip", "examples", "quiz"]
        },
        systemInstruction: "You are an expert bilingual ESL teacher fluent in English and Uzbek. You help Uzbek language learners master English words through interactive, deep explanations, quizzes, and mnemonic techniques."
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini API");
    }

    const insights = JSON.parse(text.trim());
    res.json(insights);
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ error: "Sun'iy intellekt tahlilini yuklashda xatolik: " + err.message });
  }
});

// ---------------- Vite Middleware & Fallbacks ----------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve built files
    const currentDir = typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));
    const distPath = path.resolve(currentDir, "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Online Dictionary server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
