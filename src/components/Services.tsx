import React from 'react';
import { motion } from 'motion/react';
import { Code, ShoppingCart, Palette, Server, GraduationCap, Video } from 'lucide-react';
import TiltCard from './TiltCard';
import { useNavigate } from 'react-router-dom';

const services = [
  { id: 'static-websites', title: 'Static Websites', description: 'Fast, secure, and SEO-friendly static websites.', icon: Code },
  { id: 'ecommerce', title: 'E-commerce Development', description: 'Scalable online stores to boost your sales.', icon: ShoppingCart },
  { id: 'ui-ux', title: 'UI/UX Design', description: 'User-centric designs that drive engagement.', icon: Palette },
  { id: 'hosting', title: 'Domain & Hosting', description: 'Reliable hosting and domain management.', icon: Server },
  { id: 'college-projects', title: 'College Students Project', description: 'Professional PPTs and reports for your projects.', icon: GraduationCap },
  { id: 'video-editing', title: 'Video Editing', description: 'High-quality video editing for all platforms.', icon: Video },
];

export default function Services() {
  const navigate = useNavigate();

  return (
    <section id="services" className="py-24 bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-display font-black text-center mb-16 neon-text"
        >
          OUR SERVICES
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={service.id}>
              <TiltCard className="h-full">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass p-8 rounded-2xl h-full flex flex-col items-center text-center"
                >
                  <service.icon className="w-12 h-12 text-neon-blue mb-6" />
                  <h3 className="text-2xl font-display font-bold mb-4">{service.title}</h3>
                  <p className="text-slate-400 mb-8 flex-grow">{service.description}</p>
                  <button 
                    onClick={() => navigate(`/services/${service.id}`)}
                    className="btn-ripple px-6 py-3 bg-neon-blue text-black font-bold rounded-full hover:bg-white transition-colors"
                  >
                    View Details
                  </button>
                </motion.div>
              </TiltCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
