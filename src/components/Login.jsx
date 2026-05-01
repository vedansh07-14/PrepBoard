import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Sparkles, LogIn, AlertCircle, 
  Mail, Lock, ArrowRight, UserPlus, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export default function Login() {
  const { 
    login, loginWithEmail, registerWithEmail, authError 
  } = useAuth();

  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  // Email form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegistering) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      // Error handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-4 py-12 text-text font-sans">
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orb-1 absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="orb-2 absolute bottom-[-15%] right-[-10%] w-[65%] h-[65%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-panel-strong p-8 md:p-12 rounded-[3rem] flex flex-col items-center border-border">
          {/* Logo Area */}
          <div className="flex flex-col items-center mb-10 text-center">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-20 h-20 rounded-[2rem] overflow-hidden shadow-lg shadow-primary/20 mb-6 border-2 border-border"
            >
              <img src="/logo.png" alt="PrepBoard Logo" className="w-full h-full object-cover" />
            </motion.div>
            <h1 className="text-3xl font-black tracking-tighter text-text">
              Prep<span className="text-gradient">Board</span>
            </h1>
            <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.4em] mt-1">Your Growth Portal</p>
          </div>

          <div className="w-full space-y-8">
            {/* Main Form Section */}
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold text-text">
                  {isRegistering ? 'Create Your Account' : 'Welcome Back'}
                </h2>
                <p className="text-xs text-text-muted font-medium">
                  {isRegistering ? 'Sign up to start tracking your journey' : 'Sign in to access your dashboard'}
                </p>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="group space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted transition-colors group-focus-within:text-primary" />
                    <input 
                      type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full bg-surface-2 border border-border rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all text-text placeholder:text-text-muted/50"
                    />
                  </div>
                </div>
                <div className="group space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted transition-colors group-focus-within:text-primary" />
                    <input 
                      type="password" required value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-surface-2 border border-border rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all text-text placeholder:text-text-muted/50"
                    />
                  </div>
                </div>

                <button 
                  type="submit" disabled={loading}
                  className="w-full btn-primary text-white py-4.5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 group/btn shadow-lg shadow-primary/20"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      {isRegistering ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                      <span className="uppercase tracking-widest text-xs">{isRegistering ? 'Sign Up' : 'Sign In'}</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <button 
                onClick={() => setIsRegistering(!isRegistering)}
                className="w-full text-xs text-text-muted hover:text-primary transition-colors font-bold uppercase tracking-wider py-1"
              >
                {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>

            {/* Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest"><span className="bg-surface px-3 text-text-muted">Or continue with</span></div>
            </div>

            {/* Google Section */}
            <button 
              onClick={login}
              className="w-full flex items-center justify-center gap-4 bg-surface border border-border text-text py-4.5 rounded-2xl font-black transition-all hover:bg-surface-2 hover:scale-[1.02] active:scale-[0.98] shadow-sm text-xs uppercase tracking-widest"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Sign In with Google
            </button>
          </div>

          {/* Errors */}
          <AnimatePresence>
            {authError && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="w-full mt-8 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-red-500 text-xs flex items-start gap-3 font-bold"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{authError}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Branding Footer */}
        <div className="mt-10 text-center">
          <p className="text-text-muted/40 text-[10px] uppercase font-black tracking-[0.4em] mb-4">Secured by PrepBoard Labs</p>
          <div className="flex items-center justify-center gap-4">
            <Sparkles className="w-3.5 h-3.5 text-text-muted/20" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
