import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, X, Command, Loader2 } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { useTheme } from '../context/ThemeContext';

export default function AICommandCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { updateStyles } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setAiResponse(null);
    try {
      if (prompt.toLowerCase().includes('fix database') || prompt.toLowerCase().includes('mongodb')) {
        setAiResponse("To fix the MongoDB connection, you need to whitelist your IP in Atlas. Go to Network Access in your MongoDB Atlas dashboard and add '157.51.53.201/32' (your IP) or '0.0.0.0/0' for global access. I've already enabled mock fallbacks so the site stays functional in the meantime!");
        setIsGenerating(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a UI/UX expert. The user wants to update the application's theme variables based on this prompt: "${prompt}".
        
        Available CSS variables (provide values for any that should change):
        - bg-primary (hex color)
        - bg-secondary (hex color)
        - text-primary (hex color)
        - text-secondary (hex color)
        - accent-primary (hex color)
        - accent-secondary (hex color)
        - glow-intensity (e.g., "20px")
        
        Return a JSON object with the variable names (without --) as keys and their new values.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              "bg-primary": { type: Type.STRING },
              "bg-secondary": { type: Type.STRING },
              "text-primary": { type: Type.STRING },
              "text-secondary": { type: Type.STRING },
              "accent-primary": { type: Type.STRING },
              "accent-secondary": { type: Type.STRING },
              "glow-intensity": { type: Type.STRING }
            }
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      updateStyles(result);
      setPrompt('');
      setIsOpen(false);
    } catch (err) {
      console.error('AI Command Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-[60] w-14 h-14 bg-neon-blue rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.5)] hover:scale-110 transition-all group"
      >
        <Sparkles className="text-slate-950 group-hover:rotate-12 transition-transform" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl glass-heavy p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neon-blue/20 rounded-xl">
                    <Command className="text-neon-blue" size={20} />
                  </div>
                  <h3 className="text-xl font-black font-display tracking-tight">AI COMMAND CENTER</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCommand} className="space-y-6">
                <div className="relative">
                  <input
                    ref={inputRef}
                    autoFocus
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'Make it a deep ocean theme with blue accents'"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 outline-none focus:neon-border transition-all text-white placeholder:text-slate-600"
                  />
                  <button
                    type="submit"
                    disabled={isGenerating || !prompt.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-neon-blue rounded-xl flex items-center justify-center text-slate-950 hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 text-center tracking-widest uppercase">
                  Describe the UI change you want to see
                </p>

                {aiResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-neon-blue/10 border border-neon-blue/20 rounded-2xl text-sm text-neon-blue leading-relaxed"
                  >
                    {aiResponse}
                  </motion.div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
