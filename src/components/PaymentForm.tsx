import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, User, Phone, IndianRupee, Image as ImageIcon, Send, CheckCircle, AlertCircle, Loader2, ChevronDown, QrCode, Copy, Check } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function PaymentForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    amount: '',
    method: 'UPI',
    screenshot: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const [copied, setCopied] = useState<'upi' | 'gpay' | null>(null);

  const upiId = 'parasuramanyuvaraj95@oksbi';
  const gpayNumber = '790473622';
  const upiUri = `upi://pay?pa=${upiId}&pn=PARASURAMAN%20Y&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUri)}`;

  const copyToClipboard = (text: string, type: 'upi' | 'gpay') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) { // 500KB limit for base64 storage
        setStatus('error');
        setMessage('Image too large. Please upload a smaller screenshot (max 500KB).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, screenshot: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setStatus('error');
      setMessage('You must be logged in to submit a payment.');
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');

    try {
      const paymentData = {
        ...formData,
        amount: Number(formData.amount),
        status: 'Pending',
        authorUid: user.uid,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'payments'), paymentData);

      setStatus('success');
      setMessage('Payment details submitted successfully! Our team will verify it shortly.');
      setFormData({ customerName: '', phone: '', amount: '', method: 'UPI', screenshot: '' });
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setMessage('Failed to submit payment details. Please check your connection and permissions.');
      // handleFirestoreError(err, OperationType.CREATE, 'payments');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass p-8 rounded-3xl border border-white/10 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-neon-blue/20 rounded-2xl flex items-center justify-center border border-neon-blue/30">
          <CreditCard className="text-neon-blue" size={24} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-2xl font-black font-display tracking-tight">SUBMIT PAYMENT</h3>
            <button
              type="button"
              onClick={() => setFormData({
                customerName: 'John Doe',
                phone: '+91 98765 43210',
                amount: '5000',
                method: 'UPI',
                screenshot: 'https://picsum.photos/seed/receipt/400/600'
              })}
              className="text-[10px] px-3 py-1 bg-neon-blue/10 border border-neon-blue/30 rounded-full text-neon-blue font-bold uppercase tracking-widest hover:bg-neon-blue/20 transition-all"
            >
              Fill Sample
            </button>
          </div>
          <p className="text-slate-500 text-sm">Upload your transaction details for verification</p>
        </div>
      </div>

      {/* Payment Details & QR Code */}
      <div className="grid md:grid-cols-2 gap-6 mb-10 p-6 bg-white/5 rounded-3xl border border-white/10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <QrCode className="text-neon-blue" size={20} />
            <h4 className="font-bold text-sm uppercase tracking-widest">Payment Details</h4>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 bg-slate-950/50 rounded-xl border border-white/5 flex justify-between items-center group">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">UPI ID</p>
                <p className="text-sm font-mono text-white">{upiId}</p>
              </div>
              <button 
                onClick={() => copyToClipboard(upiId, 'upi')}
                className="p-2 hover:bg-white/10 rounded-lg transition-all text-slate-400 hover:text-neon-blue"
              >
                {copied === 'upi' ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            <div className="p-3 bg-slate-950/50 rounded-xl border border-white/5 flex justify-between items-center group">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">G-Pay Number</p>
                <p className="text-sm font-mono text-white">{gpayNumber}</p>
              </div>
              <button 
                onClick={() => copyToClipboard(gpayNumber, 'gpay')}
                className="p-2 hover:bg-white/10 rounded-lg transition-all text-slate-400 hover:text-neon-blue"
              >
                {copied === 'gpay' ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
          
          <div className="p-4 bg-neon-blue/5 border border-neon-blue/20 rounded-xl">
            <p className="text-xs text-neon-blue font-medium leading-relaxed">
              Scan the QR code or copy the details to pay. After payment, please upload the screenshot below.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="p-3 bg-white rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <img 
              src={qrCodeUrl} 
              alt="Payment QR Code" 
              className="w-40 h-40"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Scan to Pay</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Customer Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="John Doe"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:neon-border transition-all text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="tel" 
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 00000 00000"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:neon-border transition-all text-white"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Amount Paid</label>
            <div className="relative">
              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="number" 
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="5000"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:neon-border transition-all text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Payment Method</label>
            <div className="relative">
              <select 
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:neon-border transition-all appearance-none text-white font-medium cursor-pointer"
              >
                <option value="UPI" className="bg-slate-900 text-white">UPI</option>
                <option value="GPay" className="bg-slate-900 text-white">GPay</option>
                <option value="Razorpay" className="bg-slate-900 text-white">Razorpay</option>
                <option value="Stripe" className="bg-slate-900 text-white">Stripe</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Transaction Screenshot</label>
          <div className="relative group">
            <input 
              type="file" 
              accept="image/*"
              required
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="w-full bg-white/5 border-2 border-dashed border-white/10 rounded-2xl py-8 flex flex-col items-center justify-center gap-2 group-hover:border-neon-blue/50 transition-all">
              {formData.screenshot ? (
                <img src={formData.screenshot} alt="Preview" className="h-32 rounded-lg mb-2" />
              ) : (
                <ImageIcon className="text-slate-500 group-hover:text-neon-blue transition-all" size={32} />
              )}
              <p className="text-sm text-slate-500">
                {formData.screenshot ? 'Click to change image' : 'Click or drag to upload screenshot'}
              </p>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {status !== 'idle' && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}
            >
              {status === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-neon-blue text-slate-950 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>SUBMIT TRANSACTION <Send size={20} /></>
          )}
        </button>
      </form>
    </div>
  );
}
