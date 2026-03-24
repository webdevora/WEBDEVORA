import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, RefreshCw, CheckCircle, Search, Download, Trash2, ShieldAlert, ShieldCheck, User as UserIcon, Bell, Send, X, FileText, Filter, MessageSquare, Briefcase, Plus, Edit2, Link as LinkIcon, Image as ImageIcon, Cpu } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';

interface PaymentData {
  id: string;
  customerName: string;
  phone: string;
  amount: number;
  method: string;
  screenshot: string;
  status: string;
  createdAt: any;
}

interface ContactData {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: any;
}

interface WorkData {
  id: string;
  title: string;
  category: string;
  image: string;
  link: string;
  createdAt: any;
}

interface UserData {
  uid: string;
  name: string;
  email: string;
  role: string;
  createdAt: any;
}

interface ReminderData {
  id: string;
  customerEmail: string;
  title: string;
  message: string;
  date: any;
  createdAt: any;
}

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'payments' | 'contacts' | 'works' | 'customers'>('payments');
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'works' || tab === 'payments' || tab === 'contacts' || tab === 'customers') {
      setActiveTab(tab as any);
    }
  }, []);

  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [works, setWorks] = useState<WorkData[]>([]);
  const [customers, setCustomers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('All');

  // Work Form State
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<WorkData | null>(null);
  const [workForm, setWorkForm] = useState({ title: '', category: '', image: '', link: '' });
  
  // Reminder Form State
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<UserData | null>(null);
  const [reminderForm, setReminderForm] = useState({ title: '', message: '', date: '' });

  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError('');
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  useEffect(() => {
    if (!profile || profile.role !== 'admin') return;

    setIsLoading(true);
    let unsubscribe: () => void;

    if (activeTab === 'payments') {
      const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentData));
        setPayments(data);
        setIsLoading(false);
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'payments');
        setIsLoading(false);
      });
    } else if (activeTab === 'contacts') {
      const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactData));
        setContacts(data);
        setIsLoading(false);
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'contacts');
        setIsLoading(false);
      });
    } else if (activeTab === 'customers') {
      const q = query(collection(db, 'users'), where('role', '==', 'customer'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserData));
        setCustomers(data);
        setIsLoading(false);
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'users');
        setIsLoading(false);
      });
    } else {
      const q = query(collection(db, 'works'), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkData));
        setWorks(data);
        setIsLoading(false);
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'works');
        setIsLoading(false);
      });
    }

    return () => unsubscribe && unsubscribe();
  }, [activeTab, profile]);

  const handleWorkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    try {
      if (editingWork) {
        await updateDoc(doc(db, 'works', editingWork.id), {
          ...workForm,
          updatedAt: serverTimestamp()
        });
        setSuccessMessage('Work updated successfully!');
      } else {
        await addDoc(collection(db, 'works'), {
          ...workForm,
          createdAt: serverTimestamp()
        });
        setSuccessMessage('Work added successfully!');
      }
      setIsWorkModalOpen(false);
      setEditingWork(null);
      setWorkForm({ title: '', category: '', image: '', link: '' });
    } catch (err: any) {
      console.error(err);
      handleFirestoreError(err, editingWork ? OperationType.UPDATE : OperationType.CREATE, 'works');
    }
  };

  const handleReminderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setError('');
    setSuccessMessage('');
    try {
      await addDoc(collection(db, 'reminders'), {
        customerEmail: selectedCustomer.email,
        title: reminderForm.title,
        message: reminderForm.message,
        date: new Date(reminderForm.date),
        createdAt: serverTimestamp()
      });
      setSuccessMessage(`Reminder sent to ${selectedCustomer.email}!`);
      setIsReminderModalOpen(false);
      setSelectedCustomer(null);
      setReminderForm({ title: '', message: '', date: '' });
    } catch (err: any) {
      console.error(err);
      handleFirestoreError(err, OperationType.CREATE, 'reminders');
    }
  };

  const deleteWork = async (id: string) => {
    setError('');
    setSuccessMessage('');
    // Custom confirmation could be added here, but for now we'll just delete to avoid confirm() issues in iframe
    try {
      await deleteDoc(doc(db, 'works', id));
      setSuccessMessage('Work deleted successfully!');
    } catch (err: any) {
      console.error(err);
      handleFirestoreError(err, OperationType.DELETE, 'works');
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt) return;
    setIsAiGenerating(true);
    setError('');
    try {
      const response = await fetch('/api/admin/ai-generate-work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await response.json();
      if (data.success) {
        setWorkForm({
          title: data.data.title,
          category: data.data.category,
          image: data.data.image,
          link: data.data.link
        });
        setAiPrompt('');
        setSuccessMessage('AI generated project details successfully!');
      } else {
        setError(data.message || 'AI generation failed');
      }
    } catch (err) {
      console.error(err);
      setError('AI generation service unavailable');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = filterMethod === 'All' || p.method === filterMethod;
    return matchesSearch && matchesMethod;
  });

  const downloadPDF = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    
    doc.setFontSize(20);
    doc.text('WebDevora Admin Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${date}`, 14, 30);

    if (activeTab === 'payments') {
      const tableData = filteredPayments.map(p => [
        p.customerName,
        p.phone,
        `INR ${p.amount}`,
        p.method,
        p.status,
        p.createdAt?.toDate ? p.createdAt.toDate().toLocaleDateString() : 'N/A'
      ]);
      autoTable(doc, {
        startY: 40,
        head: [['Customer', 'Phone', 'Amount', 'Method', 'Status', 'Date']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [255, 215, 0] },
      });
    } else if (activeTab === 'contacts') {
      const tableData = contacts.map(c => [
        c.name,
        c.email,
        c.message,
        c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString() : 'N/A'
      ]);
      autoTable(doc, {
        startY: 40,
        head: [['Name', 'Email', 'Message', 'Date']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [168, 85, 247] },
      });
    }

    doc.save(`WebDevora_${activeTab}_Report_${date}.pdf`);
  };

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="py-24 flex flex-col items-center justify-center min-h-screen bg-slate-950">
        <ShieldAlert className="text-rose-500 mb-4" size={64} />
        <h2 className="text-2xl font-black text-white uppercase tracking-widest">ACCESS DENIED</h2>
        <p className="text-slate-500 mt-2">You do not have administrative privileges.</p>
      </div>
    );
  }

  return (
    <section id="admin" className="py-24 bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-black font-display mb-2 flex items-center gap-3 uppercase">
              <Database className="text-neon-blue" /> ADMIN CONTROL
            </h2>
            <p className="text-slate-500">Manage your business operations</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            {activeTab !== 'works' && (
              <button 
                onClick={downloadPDF}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-slate-950 rounded-full font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all"
              >
                <FileText size={18} /> Download PDF
              </button>
            )}
            {activeTab === 'works' && (
              <button 
                onClick={() => {
                  setEditingWork(null);
                  setWorkForm({ title: '', category: '', image: '', link: '' });
                  setIsWorkModalOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-2 bg-neon-blue text-slate-950 rounded-full font-bold hover:shadow-[0_0_20px_rgba(0,243,255,0.5)] transition-all"
              >
                <Plus size={18} /> Add Work
              </button>
            )}
            <button 
              onClick={() => {}} // Snapshot handles it
              className="p-2 glass hover:neon-border rounded-xl transition-all"
            >
              <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <AnimatePresence>
          {(error || successMessage) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-8 p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${error ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}
            >
              {error ? <ShieldAlert size={18} /> : <CheckCircle size={18} />}
              {error || successMessage}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'payments', label: 'Payments', icon: <Database size={18} /> },
            { id: 'contacts', label: 'Contacts', icon: <MessageSquare size={18} /> },
            { id: 'works', label: 'Works', icon: <Briefcase size={18} /> },
            { id: 'customers', label: 'Customers', icon: <UserIcon size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'glass text-slate-400 hover:text-white'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Filters (Only for Payments and Customers) */}
        {(activeTab === 'payments' || activeTab === 'customers') && (
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder={activeTab === 'payments' ? "Search by customer name..." : "Search by email or name..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:neon-border transition-all text-white"
              />
            </div>
            {activeTab === 'payments' && (
              <div className="relative w-full md:w-64">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <select 
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:neon-border transition-all appearance-none text-white"
                >
                  <option value="All" className="bg-slate-900 text-white">All Methods</option>
                  <option value="UPI" className="bg-slate-900 text-white">UPI</option>
                  <option value="GPay" className="bg-slate-900 text-white">GPay</option>
                  <option value="Razorpay" className="bg-slate-900 text-white">Razorpay</option>
                  <option value="Stripe" className="bg-slate-900 text-white">Stripe</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Content Area */}
        <div className="glass rounded-3xl overflow-hidden border border-white/10">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <RefreshCw className="text-neon-blue animate-spin mb-4" size={48} />
              <p className="text-slate-500 font-bold animate-pulse">FETCHING SECURE DATA...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {activeTab === 'customers' && (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Customer</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Email</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Joined</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {customers.filter(c => 
                      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      c.email.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length > 0 ? customers.filter(c => 
                      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      c.email.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((customer) => (
                      <tr key={customer.uid} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-bold">{customer.name}</td>
                        <td className="px-6 py-4 text-slate-400">{customer.email}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {customer.createdAt?.toDate ? customer.createdAt.toDate().toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setIsReminderModalOpen(true);
                            }}
                            className="p-2 bg-neon-blue/10 hover:bg-neon-blue text-neon-blue hover:text-slate-950 rounded-lg transition-all flex items-center gap-2 ml-auto text-xs font-bold"
                          >
                            <Bell size={14} /> SEND REMINDER
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                          No customers found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {activeTab === 'payments' && (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Customer</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Amount</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Method</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredPayments.length > 0 ? filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold">{payment.customerName}</div>
                          <div className="text-xs text-slate-500">{payment.phone}</div>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-neon-blue">
                          ₹{payment.amount}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold uppercase px-2 py-1 bg-white/5 rounded-md">
                            {payment.method}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                            <CheckCircle size={14} /> {payment.status.toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {payment.createdAt?.toDate ? payment.createdAt.toDate().toLocaleDateString() : 'Pending...'}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                          No payments found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {activeTab === 'contacts' && (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Sender</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Message</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {contacts.length > 0 ? contacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold">{contact.name}</div>
                          <div className="text-xs text-slate-500">{contact.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300 max-w-md">
                          {contact.message}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {contact.createdAt?.toDate ? contact.createdAt.toDate().toLocaleDateString() : 'Pending...'}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                          No messages found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {activeTab === 'works' && (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Work</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Category</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {works.length > 0 ? works.map((work) => (
                      <tr key={work.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={work.image} alt={work.title} className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                            <div className="font-bold">{work.title}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold uppercase px-2 py-1 bg-white/5 rounded-md text-neon-purple">
                            {work.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setEditingWork(work);
                                setWorkForm({ title: work.title, category: work.category, image: work.image, link: work.link });
                                setIsWorkModalOpen(true);
                              }}
                              className="p-2 hover:text-neon-blue transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              onClick={() => deleteWork(work.id)}
                              className="p-2 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                          No works found. Add your first project!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reminder Modal */}
      <AnimatePresence>
        {isReminderModalOpen && selectedCustomer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReminderModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass-heavy p-8 rounded-[2.5rem] border border-white/10"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neon-blue/20 rounded-xl">
                    <Bell className="text-neon-blue" size={20} />
                  </div>
                  <h3 className="text-xl font-black font-display tracking-tight uppercase">Send Reminder</h3>
                </div>
                <button onClick={() => setIsReminderModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">To Customer</p>
                <p className="font-bold">{selectedCustomer.name}</p>
                <p className="text-xs text-slate-400">{selectedCustomer.email}</p>
              </div>

              <form onSubmit={handleReminderSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Title</label>
                  <input 
                    type="text" 
                    required
                    value={reminderForm.title}
                    onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
                    placeholder="Payment Reminder"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:neon-border transition-all text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Message</label>
                  <textarea 
                    required
                    rows={4}
                    value={reminderForm.message}
                    onChange={(e) => setReminderForm({ ...reminderForm, message: e.target.value })}
                    placeholder="Your payment is pending. Please complete it to continue using our services."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:neon-border transition-all text-white resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Due Date</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={reminderForm.date}
                    onChange={(e) => setReminderForm({ ...reminderForm, date: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:neon-border transition-all text-white"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-neon-blue text-slate-950 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] transition-all"
                >
                  SEND REMINDER <Send size={20} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Work Modal */}
      <AnimatePresence>
        {isWorkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWorkModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass p-8 rounded-[2.5rem] border border-white/20"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black font-display uppercase">
                  {editingWork ? 'Edit Work' : 'Add New Work'}
                </h3>
                <div className="flex items-center gap-2">
                  {!editingWork && (
                    <button
                      type="button"
                      onClick={() => setWorkForm({
                        title: 'Quantum Dashboard',
                        category: 'Web Design',
                        image: 'https://picsum.photos/seed/quantum/800/600',
                        link: 'https://example.com'
                      })}
                      className="text-[10px] px-3 py-1 bg-neon-blue/10 border border-neon-blue/30 rounded-full text-neon-blue font-bold uppercase tracking-widest hover:bg-neon-blue/20 transition-all"
                    >
                      Fill Sample
                    </button>
                  )}
                  <button onClick={() => setIsWorkModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                    <X size={24} />
                  </button>
                </div>
              </div>

              {!editingWork && (
                <div className="mb-8 p-4 bg-neon-blue/10 border border-neon-blue/20 rounded-2xl">
                  <div className="flex items-center gap-2 mb-3 text-neon-blue">
                    <Cpu size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">AI GENERATOR</span>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Describe the project (e.g. 'A futuristic crypto dashboard')..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm outline-none focus:neon-border transition-all"
                    />
                    <button 
                      type="button"
                      onClick={handleAiGenerate}
                      disabled={isAiGenerating || !aiPrompt}
                      className="px-4 py-2 bg-neon-blue text-slate-950 text-xs font-bold rounded-xl hover:shadow-[0_0_15px_rgba(0,243,255,0.5)] disabled:opacity-50 transition-all"
                    >
                      {isAiGenerating ? <RefreshCw size={14} className="animate-spin" /> : 'GENERATE'}
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleWorkSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Title</label>
                  <input 
                    type="text" 
                    required
                    value={workForm.title}
                    onChange={(e) => setWorkForm({ ...workForm, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 outline-none focus:neon-border transition-all"
                    placeholder="Project Name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Category</label>
                  <input 
                    type="text" 
                    required
                    value={workForm.category}
                    onChange={(e) => setWorkForm({ ...workForm, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 outline-none focus:neon-border transition-all"
                    placeholder="e.g. Web Design, AI, Crypto"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Image URL</label>
                  <input 
                    type="text" 
                    required
                    value={workForm.image}
                    onChange={(e) => setWorkForm({ ...workForm, image: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 outline-none focus:neon-border transition-all"
                    placeholder="https://picsum.photos/..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Project Link</label>
                  <input 
                    type="text" 
                    required
                    value={workForm.link}
                    onChange={(e) => setWorkForm({ ...workForm, link: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 outline-none focus:neon-border transition-all"
                    placeholder="https://..."
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-neon-blue text-slate-950 font-black rounded-2xl hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] transition-all uppercase tracking-widest"
                >
                  {editingWork ? 'Update Work' : 'Add Work'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
