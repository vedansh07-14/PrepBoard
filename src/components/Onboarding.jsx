import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, School, GraduationCap, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Onboarding({ onComplete }) {
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !college || !year) return;
    setLoading(true);
    await onComplete({ name, college, year });
    setLoading(false);
  };

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgrad', 'Other'];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-4 font-sans text-text">
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orb-1 absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="orb-2 absolute bottom-[-15%] right-[-10%] w-[65%] h-[65%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="glass-panel-strong p-8 md:p-12 rounded-[3rem] shadow-2xl border-border">
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-[2rem] overflow-hidden shadow-xl mb-6 border-2 border-border">
              <img src="/logo.png" alt="PrepBoard Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Setup Your Profile</span>
            </div>
            <h2 className="text-3xl font-black text-text tracking-tight mb-2">Welcome to PrepBoard</h2>
            <p className="text-text-muted text-sm font-medium">Tell us a bit about yourself to personalize your experience.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Your Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" required value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-surface-2 border border-border rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all text-text placeholder:text-text-muted/40"
                />
              </div>
            </div>

            {/* College Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">College / University</label>
              <div className="relative group">
                <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" required value={college} onChange={e => setCollege(e.target.value)}
                  placeholder="e.g. IIT Delhi"
                  className="w-full bg-surface-2 border border-border rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all text-text placeholder:text-text-muted/40"
                />
              </div>
            </div>

            {/* Year of Study */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Year of Study</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {years.map(y => (
                  <button
                    key={y} type="button" onClick={() => setYear(y)}
                    className={cn(
                      'py-3 px-4 rounded-xl text-xs font-black transition-all border shrink-0 uppercase tracking-widest',
                      year === y 
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                        : 'bg-surface border-border text-text-muted hover:bg-surface-2 hover:text-text'
                    )}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" disabled={loading}
                className="w-full btn-primary text-white py-4.5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 group shadow-xl shadow-primary/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span className="uppercase tracking-widest text-xs">Get Started</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
