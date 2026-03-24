import React from 'react';
import AdminDashboard from '../components/AdminDashboard';
import Footer from '../components/Footer';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminPage({ pageDetails, onLogout }: { pageDetails: any, onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="pt-24 max-w-7xl mx-auto px-6 mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-4 py-2 glass hover:neon-border rounded-xl text-sm font-bold transition-all group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          BACK TO HOME
        </Link>
      </div>
      <div className="pb-20">
        <AdminDashboard />
      </div>
      <Footer contactEmail={pageDetails.contactEmail} />
    </div>
  );
}
