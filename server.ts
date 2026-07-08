import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini Client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API endpoint for secure server-side Gemini generation
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { prompt, systemInstruction, responseMimeType, responseSchema } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const config: any = {};
      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }
      if (responseMimeType) {
        config.responseMimeType = responseMimeType;
      }
      if (responseSchema) {
        config.responseSchema = responseSchema;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config,
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error on server side:", error);
      res.status(500).json({ error: error.message || "Failed to generate content from Gemini" });
    }
  });

  // Vite development or production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ArenaIntel server running on port ${PORT}`);
  });
}

startServer();
