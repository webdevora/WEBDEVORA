import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ServiceDetail from './pages/ServiceDetail';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AICommandCenter from './components/AICommandCenter';

function AppContent() {
  const { profile, loading: authLoading, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pageDetails, setPageDetails] = useState({
    welcomeMessage: 'CRAFTING DIGITAL EXPERIENCES',
    aboutText: 'Based in the digital frontier, WebDevora is a collective of designers and developers dedicated to pushing the boundaries of what\'s possible on the web. We don\'t just build websites; we create immersive digital ecosystems.',
    contactEmail: 'webdevora.001@gmail.com'
  });
  const location = useLocation();

  useEffect(() => {
    // Reduced loading screen for better performance
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Immediate load from cache for speed
    const cached = localStorage.getItem('pageDetails');
    if (cached) {
      setPageDetails(JSON.parse(cached));
    }

    const fetchPageDetails = async (retries = 3) => {
      try {
        const response = await fetch('/api/page-details');
        if (!response.ok) {
          throw new Error(`Page Details API Error (${response.status})`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new TypeError("Oops, we haven't got JSON!");
        }

        const data = await response.json();
        if (data && data.welcomeMessage) {
          setPageDetails(data);
          // Update cache
          localStorage.setItem('pageDetails', JSON.stringify(data));
        }
      } catch (err) {
        console.error('Failed to fetch page details:', err);
        // Auto retry on network/server errors, not on JSON parse errors
        if (retries > 0 && !(err instanceof TypeError)) {
          setTimeout(() => fetchPageDetails(retries - 1), 2000);
        }
      }
    };
    fetchPageDetails();
  }, []);

  // Scroll to top or hash on route change
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  // Ripple Effect Logic
  useEffect(() => {
    const handleRipple = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('btn-ripple')) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        
        const rect = target.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        target.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
      }
    };

    window.addEventListener('mousedown', handleRipple);
    return () => window.removeEventListener('mousedown', handleRipple);
  }, []);

  if (loading || authLoading) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 bg-neon-blue rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(0,243,255,0.5)] mb-8"
        >
          <div className="w-12 h-12 border-4 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div>
        </motion.div>
        <h1 className="text-4xl font-black tracking-tighter font-display animate-pulse">
          WEB<span className="text-neon-blue">DEVORA</span>
        </h1>
        <div className="mt-4 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2 }}
            className="h-full bg-neon-blue"
          />
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen gradient-mesh selection:bg-neon-blue/30 overflow-x-hidden relative">
        <div className="fixed inset-0 pointer-events-none opacity-40 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <Navbar onLogout={logout} user={profile} />
          
          <AnimatePresence mode="wait">
            <Routes location={location}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/services/:id" element={<ServiceDetail />} />
              
              <Route path="/" element={
                <>
                  <main>
                    <Home pageDetails={pageDetails} user={profile} />
                  </main>
                  <Footer contactEmail={pageDetails.contactEmail} />
                </>
              } />
              
              <Route path="/admin" element={
                profile?.role === 'admin' ? (
                  <AdminPage pageDetails={pageDetails} onLogout={logout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } />
            </Routes>
          </AnimatePresence>
          
          <AICommandCenter />
        </motion.div>
      </div>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
