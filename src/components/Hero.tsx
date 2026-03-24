import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, Sparkles, Zap, Shield, Code2 } from 'lucide-react';
import { motion } from 'motion/react';

import { useNavigate } from 'react-router-dom';

export default function Hero({ welcomeMessage, user }: { welcomeMessage: string, user: any }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-title', {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: 'power4.out',
        stagger: 0.2
      });
      
      gsap.to('.floating-blob', {
        x: 'random(-50, 50)',
        y: 'random(-50, 50)',
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: 'none'
      });
    }, heroRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section id="home" ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-neon-blue/20 rounded-full blur-[120px] floating-blob"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-neon-purple/20 rounded-full blur-[120px] floating-blob"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-neon-blue/30 mb-8"
        >
          <Sparkles className="text-neon-blue" size={16} />
          <span className="text-xs font-bold uppercase tracking-widest text-neon-blue">Future of Web Development</span>
        </motion.div>

        <h1 className="hero-title text-5xl md:text-8xl font-black font-display tracking-tighter leading-none mb-6 uppercase">
          {(welcomeMessage || 'CRAFTING DIGITAL EXPERIENCES').split(' ').map((word, i) => (
            <span key={i} className={i === 1 ? "text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink" : ""}>
              {word}{' '}
              {i === 1 && <br />}
            </span>
          ))}
        </h1>

        <p className="hero-title text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
          We build high-performance, futuristic web applications that push the boundaries of modern technology. Experience the next generation of UI/UX.
        </p>

        <div className="hero-title flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => {
              if (user) {
                if (user.role === 'admin') {
                  navigate('/admin');
                } else {
                  const el = document.getElementById('payment');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    navigate('/#payment');
                  }
                }
              } else {
                navigate('/login?role=admin');
              }
            }}
            className="group relative px-8 py-4 bg-neon-blue text-slate-950 font-bold rounded-full overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(0,243,255,0.8)] btn-ripple"
          >
            <span className="relative z-10 flex items-center gap-2 pointer-events-none">
              {user ? (user.role === 'admin' ? 'Go to Admin' : 'Go to Dashboard') : 'Get Started'} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById('projects');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-4 glass hover:neon-border rounded-full font-bold transition-all btn-ripple"
          >
            <span className="pointer-events-none">View Projects</span>
          </button>
        </div>

        {/* Stats */}
        <div className="hero-title grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
          {[
            { icon: <Zap size={24} />, label: 'Ultra Fast', value: '99.9%' },
            { icon: <Shield size={24} />, label: 'Secure', value: '256-bit' },
            { icon: <Code2 size={24} />, label: 'Code Quality', value: 'A+' },
            { icon: <Sparkles size={24} />, label: 'Modern UI', value: '2026' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="text-neon-blue mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold font-display">{stat.value}</div>
              <div className="text-xs uppercase tracking-widest text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Spline Placeholder */}
      <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none">
        {/* In a real app, you'd embed Spline here */}
        <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neon-blue/10 via-transparent to-transparent"></div>
      </div>
    </section>
  );
}
