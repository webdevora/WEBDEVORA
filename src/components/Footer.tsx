import React from 'react';
import { Github, Twitter, Linkedin, Instagram, Code2, Heart } from 'lucide-react';

export default function Footer({ contactEmail }: { contactEmail: string }) {
  return (
    <footer className="bg-black pt-20 pb-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-neon-blue rounded-lg flex items-center justify-center">
                <Code2 className="text-slate-950" size={24} />
              </div>
              <span className="text-2xl font-bold tracking-tighter font-display">
                WEB<span className="text-neon-blue">DEVORA</span>
              </span>
            </div>
            <p className="text-slate-500 max-w-sm mb-8">
              Building the next generation of digital experiences. High-performance, futuristic, and user-centric web applications.
            </p>
            <div className="flex gap-4">
              {[Github, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="p-3 glass rounded-xl hover:neon-border hover:text-neon-blue transition-all">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-slate-400">Quick Links</h4>
            <ul className="space-y-4">
              {['Home', 'About', 'Projects', 'Payment', 'Contact'].map((link) => (
                <li key={link}>
                  <a href={`/#${link.toLowerCase()}`} className="text-slate-500 hover:text-neon-blue transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-slate-400">Contact Us</h4>
            <ul className="space-y-4 text-slate-500">
              <li>Chennai, India</li>
              <li>{contactEmail}</li>
              <li>+91 79047 32622</li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© 2026 WebDevora. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={14} className="text-rose-500 fill-rose-500" /> by <span className="text-neon-blue font-bold">Parasuraman</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
