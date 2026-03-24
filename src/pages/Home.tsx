import React from 'react';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Portfolio from '../components/Portfolio';
import PaymentForm from '../components/PaymentForm';
import ContactForm from '../components/ContactForm';
import Reminders from '../components/Reminders';
import { motion } from 'motion/react';

export default function Home({ pageDetails, user }: { pageDetails: any, user: any }) {
  return (
    <>
      <Hero welcomeMessage={pageDetails.welcomeMessage} user={user} />
      <Services />
      
      <Portfolio aboutText={pageDetails.aboutText} />

      {user?.role === 'customer' && <Reminders />}

      {/* Interactive Forms Section */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-blue/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-purple/10 blur-[120px] rounded-full"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className={`grid ${user?.role === 'customer' ? 'lg:grid-cols-2' : 'grid-cols-1 max-w-2xl mx-auto'} gap-12`}>
            {user?.role === 'customer' && (
              <motion.div
                id="payment"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <PaymentForm />
              </motion.div>
            )}

            <motion.div
              id="contact"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
