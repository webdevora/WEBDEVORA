import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Mail, Lock, Eye, EyeOff, User, Power } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const [isLampOn, setIsLampOn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = data.user.email.includes('admin') ? '/admin' : '/';
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      gsap.from('.login-item', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'back.out(1.7)'
      });
    }
  }, [isLoading]);

  const handleToggleLamp = () => {
    setIsLampOn(!isLampOn);
    // Vibration effect
    if (navigator.vibrate) navigator.vibrate(50);
    // Sound effect (mock)
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    audio.volume = 0.2;
    audio.play().catch(() => {});
  };

  return (
    <section id="login" className={`relative min-h-screen flex items-center justify-center transition-colors duration-700 ${isLampOn ? 'bg-slate-900' : 'bg-black'}`}>
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isLampOn ? 'opacity-20' : 'opacity-0'}`}>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-neon-blue/20 via-transparent to-neon-purple/20 animate-pulse"></div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-neon-blue rounded-full opacity-30"
            animate={{
              x: [Math.random() * 1000, Math.random() * 1000],
              y: [Math.random() * 1000, Math.random() * 1000],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Lamp Toggle Concept */}
      <div className="absolute top-10 right-10 z-50">
        <div className="relative flex flex-col items-center">
          <div className="w-1 h-20 bg-slate-700 rounded-full"></div>
          <button 
            onClick={handleToggleLamp}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${isLampOn ? 'bg-neon-blue shadow-[0_0_30px_rgba(0,243,255,1)] scale-110' : 'bg-slate-800'}`}
          >
            <Power size={24} className={isLampOn ? 'text-slate-950' : 'text-slate-500'} />
          </button>
          {/* Light Beam Cone */}
          <AnimatePresence>
            {isLampOn && (
              <motion.div 
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                className="absolute top-32 w-[400px] h-[600px] bg-gradient-to-b from-neon-blue/30 to-transparent origin-top blur-3xl pointer-events-none"
                style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isLoading ? (
          <motion.div 
            key="loader"
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 border-4 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin"></div>
            <span className="text-neon-blue font-bold tracking-widest animate-pulse">INITIALIZING...</span>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-md p-8 glass rounded-3xl border-white/10"
          >
            <div className="text-center mb-10">
              <h2 className="login-item text-3xl font-black font-display mb-2">WELCOME BACK</h2>
              <p className="login-item text-slate-400">Access the digital frontier</p>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="login-item relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neon-blue transition-colors" size={20} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:neon-border transition-all placeholder:text-slate-600"
                />
              </div>

              <div className="login-item relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neon-blue transition-colors" size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 outline-none focus:neon-border transition-all placeholder:text-slate-600"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-rose-500 text-sm font-bold text-center"
                >
                  {error}
                </motion.div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting}
                className="login-item w-full py-4 bg-gradient-to-r from-neon-blue to-neon-purple text-slate-950 font-black rounded-2xl hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'AUTHORIZING...' : 'AUTHORIZE ACCESS'}
              </button>

              <div className="login-item flex items-center justify-between text-sm text-slate-500">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-neon-blue" />
                  Remember Me
                </label>
                <a href="#" className="hover:text-neon-blue transition-colors">Forgot Password?</a>
              </div>
            </form>

            <div className="login-item mt-10 pt-8 border-t border-white/10 text-center">
              <p className="text-slate-500 mb-4">Or connect with</p>
              <div className="flex justify-center gap-4">
                {['Google', 'GitHub', 'Apple'].map((provider) => (
                  <button key={provider} className="p-3 glass rounded-xl hover:neon-border transition-all">
                    <span className="text-xs font-bold">{provider}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
