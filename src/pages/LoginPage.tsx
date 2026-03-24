import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, User as UserIcon, ArrowRight, Power, Loader2, Sparkles, Chrome, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [role, setRole] = useState<'admin' | 'customer'>('customer');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLampOn, setIsLampOn] = useState(true);
  const [success, setSuccess] = useState(false);
  
  const { signInWithGoogle, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    if (roleParam === 'admin' || roleParam === 'customer') {
      setRole(roleParam as 'admin' | 'customer');
    }
  }, []);

  useEffect(() => {
    if (profile) {
      // If already logged in when arriving, redirect immediately
      if (!isLoading && !success) {
        navigate(profile.role === 'admin' ? '/admin' : '/');
        return;
      }
      
      setSuccess(true);
      const timer = setTimeout(() => {
        navigate(profile.role === 'admin' ? '/admin' : '/');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [profile, navigate, isLoading, success]);

  const handleToggleLamp = () => {
    setIsLampOn(!isLampOn);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'System Error: Connection to neural network failed');
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-1000 flex items-center justify-center p-6 overflow-hidden relative ${isLampOn ? 'bg-slate-950' : 'bg-black'}`}>
      {/* Futuristic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isLampOn ? 'opacity-30' : 'opacity-0'}`}>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.15),transparent_70%)]"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-blue/10 blur-[150px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-purple/10 blur-[150px] rounded-full"></div>
        </div>
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* Back Button */}
      <div className="absolute top-12 left-12 z-50">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-4 py-2 glass hover:neon-border rounded-xl text-sm font-bold transition-all group text-white"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          BACK TO HOME
        </Link>
      </div>

      {/* Lamp Switch (Tesla Style) */}
      <div className="absolute top-12 right-12 z-50">
        <div className="relative flex flex-col items-center">
          <div className="w-[2px] h-24 bg-gradient-to-b from-transparent via-slate-800 to-neon-blue/50 rounded-full"></div>
          <button 
            onClick={handleToggleLamp}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border ${isLampOn ? 'bg-neon-blue/10 border-neon-blue shadow-[0_0_40px_rgba(255,215,0,0.4)] scale-110' : 'bg-slate-900 border-white/10'}`}
          >
            <Power size={28} className={isLampOn ? 'text-neon-blue drop-shadow-[0_0_8px_rgba(255,215,0,1)]' : 'text-slate-600'} />
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full max-w-lg relative z-10 transition-all duration-700 ${!isLampOn ? 'opacity-20 blur-md grayscale pointer-events-none' : ''}`}
      >
        {/* Outer Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue to-neon-purple rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        
        <div className="relative glass-heavy p-10 md:p-12 rounded-[2.5rem] border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-[40px]">
          <div className="text-center mb-10">
            <div className="login-item inline-flex items-center justify-center w-20 h-20 bg-neon-blue/10 rounded-3xl mb-6 border border-neon-blue/30 shadow-[0_0_30px_rgba(0,243,255,0.2)]">
              {role === 'admin' ? <ShieldCheck className="text-neon-blue" size={40} /> : <Sparkles className="text-neon-blue" size={40} />}
            </div>
            <h1 className="login-item text-4xl font-black font-display tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              {success ? 'AUTHORIZATION GRANTED' : 'NEURAL ACCESS'}
            </h1>
            <p className="login-item text-slate-400 text-sm mt-3 font-medium tracking-widest uppercase opacity-80">
              {success ? 'Welcome to the digital frontier' : 'Identify yourself to proceed'}
            </p>
          </div>

          {!success && (
            <div className="login-item flex p-1.5 bg-white/5 rounded-2xl mb-10 border border-white/10">
              <button 
                onClick={() => setRole('customer')}
                className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-bold transition-all duration-500 btn-ripple ${role === 'customer' ? 'bg-white text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'text-slate-400 hover:text-white'}`}
              >
                <UserIcon size={18} /> CUSTOMER
              </button>
              <button 
                onClick={() => setRole('admin')}
                className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-bold transition-all duration-500 btn-ripple ${role === 'admin' ? 'bg-neon-blue text-slate-950 shadow-[0_0_20px_rgba(0,243,255,0.5)]' : 'text-slate-400 hover:text-white'}`}
              >
                <ShieldCheck size={18} /> ADMINISTRATOR
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center gap-6"
              >
                <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                  <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8 }}
                  >
                    <ShieldCheck className="text-emerald-400" size={48} />
                  </motion.div>
                </div>
                <p className="text-emerald-400 font-bold tracking-widest animate-pulse">DECRYPTING DASHBOARD...</p>
              </motion.div>
            ) : (
              <div className="space-y-8">
                <div className="login-item text-center">
                  <p className="text-slate-400 text-sm mb-8">
                    {role === 'admin' 
                      ? 'Administrator access requires a verified neural link with authorized credentials.' 
                      : 'Connect your neural profile via Google to access your dashboard.'}
                  </p>
                  
                  <button 
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className={`w-full py-5 rounded-2xl font-black text-sm tracking-[0.2em] flex items-center justify-center gap-4 transition-all duration-500 uppercase btn-ripple ${role === 'admin' ? 'bg-neon-blue text-slate-950 hover:shadow-[0_0_40px_rgba(0,243,255,0.6)]' : 'bg-white text-slate-950 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]'}`}
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <>
                        <Chrome size={24} />
                        SIGN IN WITH GOOGLE
                        <ArrowRight size={22} />
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="login-item p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4 text-rose-400 text-sm font-bold"
                  >
                    <AlertCircle size={20} className="shrink-0" />
                    {error}
                  </motion.div>
                )}
              </div>
            )}
          </AnimatePresence>

          {!success && (
            <div className="login-item mt-10 text-center">
              <p className="text-xs text-slate-500 font-medium tracking-widest uppercase">
                Secure Neural Link Established
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
