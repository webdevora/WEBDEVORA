import React, { useState, useEffect } from 'react';
import { Sun, Moon, Menu, X, Code2, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  onLogout?: () => void;
  user?: any;
}

export default function Navbar({ onLogout, user }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', href: '/#home', isExternal: false, show: true },
    { name: 'About', href: '/#about', isExternal: false, show: true },
    { name: 'Projects', href: '/#projects', isExternal: false, show: true },
    { name: 'Payment', href: '/#payment', isExternal: false, show: user?.role === 'customer' },
    { name: 'Contact', href: '/#contact', isExternal: false, show: true },
    { name: 'Admin', href: '/admin', isExternal: true, show: user?.role === 'admin' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, isExternal: boolean) => {
    if (!isExternal && location.pathname === '/') {
      e.preventDefault();
      const id = href.split('#')[1];
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'glass py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link 
          to="/"
          className="flex items-center gap-2"
        >
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-10 h-10 bg-neon-blue rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.5)]"
          >
            <Code2 className="text-slate-950" size={24} />
          </motion.div>
          <span className="text-2xl font-bold tracking-tighter font-display">
            WEB<span className="text-neon-blue">DEVORA</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.filter(l => l.show).map((link) => (
            link.isExternal ? (
              <Link 
                key={link.name} 
                to={link.href}
                className="text-sm font-medium hover:text-neon-blue transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neon-blue transition-all group-hover:w-full"></span>
              </Link>
            ) : (
              <a 
                key={link.name} 
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href, false)}
                className="text-sm font-medium hover:text-neon-blue transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neon-blue transition-all group-hover:w-full"></span>
              </a>
            )
          ))}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full glass hover:neon-border transition-all btn-ripple"
          >
            {theme === 'dark' ? <Sun size={20} className="pointer-events-none" /> : <Moon size={20} className="pointer-events-none" />}
          </button>
          {user ? (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white font-bold rounded-full transition-all border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)] hover:shadow-[0_0_25px_rgba(244,63,94,0.4)] btn-ripple"
            >
              <span className="flex items-center gap-2 pointer-events-none">
                <LogOut size={18} /> Logout
              </span>
            </button>
          ) : (
            <Link 
              to="/login"
              className="px-6 py-2 bg-neon-blue text-slate-950 font-bold rounded-full hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all btn-ripple"
            >
              <span className="pointer-events-none">Login</span>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 rounded-full glass btn-ripple">
            {theme === 'dark' ? <Sun size={20} className="pointer-events-none" /> : <Moon size={20} className="pointer-events-none" />}
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/10 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.filter(l => l.show).map((link) => (
                link.isExternal ? (
                  <Link 
                    key={link.name} 
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-medium hover:text-neon-blue"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a 
                    key={link.name} 
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href, false)}
                    className="text-lg font-medium hover:text-neon-blue"
                  >
                    {link.name}
                  </a>
                )
              ))}
              {user ? (
                <button 
                  onClick={handleLogout}
                  className="w-full py-4 bg-rose-500 text-white text-center font-bold rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.3)] btn-ripple"
                >
                  <span className="flex items-center gap-2 pointer-events-none">
                    <LogOut size={20} /> Logout
                  </span>
                </button>
              ) : (
                <Link 
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 bg-neon-blue text-slate-950 text-center font-bold rounded-xl btn-ripple"
                >
                  <span className="pointer-events-none">Login</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
