import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Github, Layers, Cpu, Globe, Rocket, ArrowRight, Settings } from 'lucide-react';
import TiltCard from './TiltCard';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const skills = [
  { name: 'React / Next.js', level: 95, color: 'bg-neon-blue' },
  { name: 'Node.js / Express', level: 90, color: 'bg-neon-purple' },
  { name: 'TypeScript', level: 85, color: 'bg-neon-pink' },
  { name: 'Tailwind CSS', level: 98, color: 'bg-amber-500' },
  { name: 'GSAP / Framer Motion', level: 80, color: 'bg-yellow-600' },
  { name: 'Cloud / DevOps', level: 75, color: 'bg-orange-500' },
];

interface WorkData {
  id: string;
  title: string;
  category: string;
  image: string;
  link: string;
}

export default function Portfolio({ aboutText }: { aboutText: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<WorkData[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'works'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkData));
      setProjects(data);
      setError(false);
    }, (err) => {
      console.error(err);
      setError(true);
      // handleFirestoreError(err, OperationType.LIST, 'works');
    });

    return () => unsubscribe();
  }, []);

  return (
    <section id="about" className="py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-6">
        {/* About Section */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black font-display mb-6">
              WE ARE <span className="neon-text">ARCHITECTS</span> OF THE FUTURE
            </h2>
            <p className="text-secondary text-lg mb-8 leading-relaxed">
              {aboutText}
            </p>
            <div className="grid grid-cols-2 gap-6">
              <TiltCard className="glass p-4 rounded-2xl">
                <Layers className="text-neon-blue mb-2" />
                <h4 className="font-bold">Scalable</h4>
                <p className="text-xs text-slate-500">Built for growth</p>
              </TiltCard>
              <TiltCard className="glass p-4 rounded-2xl">
                <Cpu className="text-neon-purple mb-2" />
                <h4 className="font-bold">Performant</h4>
                <p className="text-xs text-slate-500">Lightning fast</p>
              </TiltCard>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <TiltCard intensity={20}>
              <div className="aspect-square glass rounded-3xl overflow-hidden neon-border">
                <img 
                  src="https://picsum.photos/seed/tech/800/800" 
                  alt="Tech" 
                  className="w-full h-full object-cover opacity-50 hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent"></div>
              </div>
            </TiltCard>
            <div className="absolute -bottom-6 -right-6 glass p-6 rounded-2xl animate-float">
              <div className="text-3xl font-black text-neon-blue">10+</div>
              <div className="text-xs uppercase tracking-widest text-slate-500">Years Experience</div>
            </div>
          </motion.div>
        </div>

        {/* Skills Section */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black font-display mb-4">CORE CAPABILITIES</h2>
            <div className="w-20 h-1 bg-neon-blue mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-8">
            {skills.map((skill, i) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <span className="font-bold">{skill.name}</span>
                  <span className="text-neon-blue">{skill.level}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className={`h-full ${skill.color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects Section */}
        <div id="projects">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div>
              <h2 className="text-4xl font-black font-display mb-2">FEATURED WORKS</h2>
              <p className="text-slate-500">Selected projects that define our standards</p>
            </div>
            <div className="flex gap-4">
              {user?.role === 'admin' && (
                <button 
                  onClick={() => navigate('/admin?tab=works')}
                  className="px-6 py-2 bg-neon-blue/10 border border-neon-blue/30 text-neon-blue rounded-full text-sm font-bold transition-all hover:bg-neon-blue/20 flex items-center gap-2"
                >
                  <Settings size={16} /> Manage Projects
                </button>
              )}
              <button className="px-6 py-2 glass hover:neon-border rounded-full text-sm font-bold transition-all btn-ripple">
                View All Projects
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {error ? (
              <div className="col-span-3 py-12 text-center text-rose-400 font-bold">
                Failed to load featured works. Please check your connection.
              </div>
            ) : projects.length > 0 ? projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <TiltCard className="group glass rounded-3xl overflow-hidden hover:neon-border transition-all h-full">
                  <div className="aspect-video overflow-hidden relative">
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ExternalLink className="text-white" size={32} />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex gap-2 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-white/5 rounded-md text-slate-400">
                        {project.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-neon-blue transition-colors">{project.title}</h3>
                    <a href={project.link} className="inline-flex items-center gap-2 text-sm font-bold text-neon-blue hover:gap-3 transition-all">
                      Explore Project <ArrowRight size={16} />
                    </a>
                  </div>
                </TiltCard>
              </motion.div>
            )) : (
              <div className="col-span-3 py-12 text-center text-slate-500">
                No featured works available yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
