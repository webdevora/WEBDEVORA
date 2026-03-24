import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Mail, MessageSquare, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [responseMsg, setResponseMsg] = useState('');

  const quickMessages = [
    "I'm interested in a new website project.",
    "I have a question about your services.",
    "I'd like to discuss a potential partnership.",
    "I need help with an existing application."
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');

    try {
      await addDoc(collection(db, 'contacts'), {
        ...formData,
        createdAt: serverTimestamp()
      });

      setStatus('success');
      setResponseMsg('Your message has been sent! We will get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setResponseMsg('Failed to send message. Please check your connection and try again.');
      // handleFirestoreError(err, OperationType.CREATE, 'contacts');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass p-8 rounded-3xl border border-white/10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-neon-purple/20 rounded-2xl flex items-center justify-center border border-neon-purple/30">
          <MessageSquare className="text-neon-purple" size={24} />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-2xl font-black font-display tracking-tight uppercase">GET IN TOUCH</h3>
            <button
              type="button"
              onClick={() => setFormData({
                name: 'John Doe',
                email: 'john@example.com',
                message: "I'm interested in a new website project. Please contact me with more details."
              })}
              className="text-[10px] px-3 py-1 bg-neon-purple/10 border border-neon-purple/30 rounded-full text-neon-purple font-bold uppercase tracking-widest hover:bg-neon-purple/20 transition-all"
            >
              Fill Sample
            </button>
          </div>
          <p className="text-slate-500 text-sm">Send us a message and we'll respond within 24 hours</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Your Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:neon-border transition-all text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:neon-border transition-all text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center ml-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Message</label>
            <span className="text-[10px] text-neon-purple font-bold uppercase tracking-tighter">Quick Fill</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {quickMessages.map((msg, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setFormData({ ...formData, message: msg })}
                className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 rounded-full hover:bg-neon-purple/20 hover:border-neon-purple/50 transition-all text-slate-400 hover:text-white"
              >
                {msg.length > 25 ? msg.substring(0, 25) + '...' : msg}
              </button>
            ))}
          </div>
          <textarea 
            required
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Tell us about your project..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:neon-border transition-all resize-none text-white"
          />
        </div>

        <AnimatePresence>
          {status !== 'idle' && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}
            >
              {status === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {responseMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-neon-purple text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(188,19,254,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>SEND MESSAGE <Send size={20} /></>
          )}
        </button>
      </form>
    </div>
  );
}
