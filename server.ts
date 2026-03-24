import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Request Logger
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      console.log(`[API Request] ${req.method} ${req.url}`);
    }
    next();
  });

  // --- API Routes ---
  const apiRouter = express.Router();

  // 1. AI Generate Work API
  apiRouter.post('/admin/ai-generate-work', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: 'Prompt is required' });

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a portfolio project detail based on this description: "${prompt}". 
        Return a JSON object with: title, category, and imageKeyword (for a placeholder image).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              category: { type: Type.STRING },
              imageKeyword: { type: Type.STRING }
            },
            required: ["title", "category", "imageKeyword"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      res.json({
        success: true,
        data: {
          title: result.title,
          category: result.category,
          image: `https://picsum.photos/seed/${result.imageKeyword || 'project'}/800/600`,
          link: '#'
        }
      });
    } catch (err) {
      console.error('AI Generation Error:', err);
      res.status(500).json({ success: false, message: 'AI generation failed' });
    }
  });

  // 2. Page Details API
  apiRouter.get('/page-details', (req, res) => {
    res.json({
      welcomeMessage: 'CRAFTING DIGITAL EXPERIENCES',
      aboutText: 'Based in the digital frontier, WebDevora is a collective of designers and developers dedicated to pushing the boundaries of what\'s possible on the web. We don\'t just build websites; we create immersive digital ecosystems.',
      contactEmail: 'webdevora.001@gmail.com'
    });
  });

  // Mount API Router
  app.use('/api', apiRouter);

  // --- API Error Handler ---
  // Ensure all /api routes return JSON even on 404
  app.all('/api/*', (req, res) => {
    res.status(404).json({ success: false, message: 'API endpoint not found' });
  });

  // --- Vite / Static Files ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
