import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data for service details
  const service = {
    title: id?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    description: 'Detailed description of the service goes here. We provide top-notch solutions tailored to your needs.',
    price: '$99',
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-slate-400 hover:text-neon-blue mb-12 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Services
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-12 rounded-3xl"
        >
          <h1 className="text-5xl font-display font-black mb-6 neon-text">{service.title}</h1>
          <p className="text-xl text-slate-300 mb-12">{service.description}</p>
          
          <div className="flex items-center justify-between p-8 bg-slate-900 rounded-2xl border border-white/5">
            <span className="text-3xl font-bold">{service.price}</span>
            <button 
              onClick={() => navigate('/#payment')}
              className="btn-ripple flex items-center px-8 py-4 bg-neon-blue text-black font-bold rounded-full hover:bg-white transition-colors"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Buy Now
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
