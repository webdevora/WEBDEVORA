import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, CreditCard, Copy, Check, Upload, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

export default function Payment() {
  const [amount, setAmount] = useState('100');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState('upi');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const upiId = 'parasuramanyuvaraj95@oksbi';
  const upiLink = `upi://pay?pa=${upiId}&pn=Parasuraman&am=${amount}&cu=INR`;

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !amount || !screenshot) {
      alert('Please fill all fields and upload screenshot');
      return;
    }

    setIsProcessing(true);
    
    // Simulate API call
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, amount, method, screenshot })
      });
      
      if (response.ok) {
        setIsSuccess(true);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f3ff', '#bc13fe', '#ff00ff']
        });

        // WhatsApp Auto Message
        const message = encodeURIComponent(`Hello WebDevora! I have made a payment of ₹${amount}. \nName: ${name}\nPhone: ${phone}\nMethod: ${method}`);
        setTimeout(() => {
          window.open(`https://wa.me/917904732622?text=${message}`, '_blank');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section id="payment" className="py-24 bg-slate-900">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black font-display mb-4">PREMIUM CHECKOUT</h2>
          <p className="text-slate-400">Secure and instant payment gateway</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Left: QR & Info */}
          <div className="glass p-8 rounded-3xl flex flex-col items-center">
            <div className="mb-8 p-4 bg-white rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              <QRCodeSVG value={upiLink} size={200} level="H" includeMargin={true} />
            </div>
            
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <Smartphone className="text-neon-blue" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">UPI ID</p>
                    <p className="font-mono text-sm">{upiId}</p>
                  </div>
                </div>
                <button onClick={handleCopy} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                </button>
              </div>

              <div className="p-4 bg-neon-blue/10 rounded-2xl border border-neon-blue/20">
                <p className="text-xs font-bold text-neon-blue uppercase mb-1">Instructions</p>
                <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                  <li>Scan QR or use UPI ID to pay</li>
                  <li>Enter exactly ₹{amount}</li>
                  <li>Take a screenshot of success page</li>
                  <li>Upload screenshot below to confirm</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="glass p-8 rounded-3xl">
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center py-12"
                >
                  <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                    <Check size={40} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">PAYMENT SUCCESSFUL!</h3>
                  <p className="text-slate-400 mb-8">Redirecting to WhatsApp for final confirmation...</p>
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="px-8 py-3 glass rounded-full font-bold hover:neon-border transition-all"
                  >
                    Make Another Payment
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 outline-none focus:neon-border transition-all"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 outline-none focus:neon-border transition-all"
                      placeholder="+91 00000 00000"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Amount (INR)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-neon-blue">₹</span>
                      <input 
                        type="number" 
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-8 pr-4 outline-none focus:neon-border transition-all font-bold text-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Upload Screenshot</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="screenshot-upload"
                      />
                      <label 
                        htmlFor="screenshot-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-2xl hover:border-neon-blue/50 hover:bg-neon-blue/5 transition-all cursor-pointer overflow-hidden"
                      >
                        {screenshot ? (
                          <img src={screenshot} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <Upload className="text-slate-500 mb-2 group-hover:text-neon-blue" />
                            <span className="text-xs text-slate-500">Click to upload proof</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  <button 
                    disabled={isProcessing}
                    className="w-full py-4 bg-neon-blue text-slate-950 font-black rounded-2xl hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div>
                    ) : (
                      <>CONFIRM PAYMENT <Send size={18} /></>
                    )}
                  </button>
                </form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
