import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Clock, AlertCircle, CheckCircle, X } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

interface Reminder {
  id: string;
  title: string;
  message: string;
  date: any;
  createdAt: any;
}

export default function Reminders() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;

    const q = query(
      collection(db, 'reminders'),
      where('customerEmail', '==', user.email),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reminder));
      setReminders(data);
      setIsLoading(false);
    }, (err) => {
      console.error('Error fetching reminders:', err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (isLoading) return null;
  if (reminders.length === 0) return null;

  return (
    <section className="py-12 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-neon-blue/20 rounded-xl">
            <Bell className="text-neon-blue" size={20} />
          </div>
          <h3 className="text-2xl font-black font-display tracking-tight uppercase">Your Reminders</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {reminders.map((reminder) => {
              const dueDate = reminder.date?.toDate ? reminder.date.toDate() : new Date(reminder.date);
              const isOverdue = dueDate < new Date();

              return (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`p-6 glass rounded-3xl border ${isOverdue ? 'border-rose-500/30 bg-rose-500/5' : 'border-white/10'} relative group overflow-hidden`}
                >
                  {isOverdue && (
                    <div className="absolute top-0 right-0 px-3 py-1 bg-rose-500 text-[10px] font-black uppercase tracking-widest rounded-bl-xl">
                      Overdue
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-2xl ${isOverdue ? 'bg-rose-500/20 text-rose-400' : 'bg-neon-blue/20 text-neon-blue'}`}>
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg leading-tight mb-1">{reminder.title}</h4>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">
                        Due: {dueDate.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    {reminder.message}
                  </p>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                      Ref: {reminder.id.slice(0, 8)}
                    </span>
                    {isOverdue ? (
                      <AlertCircle size={16} className="text-rose-500" />
                    ) : (
                      <CheckCircle size={16} className="text-emerald-500" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
