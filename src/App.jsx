import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Clock, BarChart2, Sparkles,
  Menu, X, Plus, Trash2, Brain, LogOut, GraduationCap, Settings, Sun, Moon
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import { DEFAULT_SUBJECT } from './data/defaultSubject';
import { cn } from './lib/utils';
import Dashboard from './components/Dashboard';
import UnitTracker from './components/UnitTracker';
import DailyLogger from './components/DailyLogger';
import Analytics from './components/Analytics';
import SyllabusImporter from './components/SyllabusImporter';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import ProfileEditModal from './components/ProfileEditModal';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'units', label: 'Units & Topics', icon: BookOpen },
  { id: 'logs', label: 'Daily Log', icon: Clock },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'import', label: 'AI Import', icon: Sparkles, badge: 'AI' },
];

function SidebarContent({ 
  user, 
  profile, 
  photoURL, 
  activeTab, 
  setActiveTab, 
  subjects, 
  activeSubjectId, 
  setActiveSubjectId, 
  subjectProgress, 
  showDeleteConfirm, 
  setShowDeleteConfirm, 
  deleteSubject, 
  setIsProfileModalOpen, 
  theme, 
  toggleTheme, 
  logout 
}) {
  const displayPhoto = photoURL || user?.photoURL;

  return (
    <div className="flex flex-col h-full bg-surface-2">
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/10 shrink-0">
            <img src="/logo.png" alt="PrepBoard Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-bold text-base text-gradient tracking-tight">PrepBoard</p>
            <p className="text-[10px] text-text-muted -mt-0.5 font-bold uppercase tracking-widest">Mastery Hub</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 focus:outline-none relative text-left',
                isActive ? 'nav-active-pill text-text' : 'text-text-muted hover:text-text hover:bg-surface/50')}>
              {isActive && (
                <motion.div layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl nav-active-pill"
                  initial={false} transition={{ type: 'spring', stiffness: 350, damping: 35 }} />
              )}
              <Icon className={cn('w-4 h-4 relative z-10 shrink-0', isActive ? 'text-primary' : '')} />
              <span className="font-bold relative z-10 text-sm">{item.label}</span>
              {item.badge && (
                <span className="ml-auto relative z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-5 mt-1">
          <div className="flex items-center gap-2 px-3 mb-3">
            <div className="h-px flex-1 bg-border" />
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] whitespace-nowrap">Subjects</p>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-1">
            {subjects.map(subject => {
              const isActive = subject.id === activeSubjectId;
              const completed = (subjectProgress[subject.id] ?? []).filter(id =>
                subject.units.some(u => u.topics.some(t => t.id === id))
              ).length;
              const total = subject.units.reduce((a, u) => a + u.topics.length, 0);
              const pct = total ? Math.round((completed / total) * 100) : 0;

              return (
                <div key={subject.id}
                  className={cn('flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all group/subj',
                    isActive ? 'bg-surface border border-border shadow-sm' : 'hover:bg-surface/50')}>
                  <button onClick={() => { setActiveSubjectId(subject.id); setActiveTab('dashboard'); }}
                    className="flex items-center gap-2.5 flex-1 min-w-0 focus:outline-none text-left">
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-base shrink-0 transition-all',
                      isActive ? 'bg-primary/10 shadow-sm shadow-primary/10' : 'bg-surface-2')}>
                      {subject.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-xs font-bold truncate', isActive ? 'text-text' : 'text-text-muted group-hover/subj:text-text')}>
                        {subject.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="h-1 flex-1 bg-border rounded-full overflow-hidden">
                          <div className="h-full progress-bar-fill rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[9px] text-text-muted shrink-0 font-bold">{pct}%</span>
                      </div>
                    </div>
                  </button>
                  {subject.id !== DEFAULT_SUBJECT.id && (
                    showDeleteConfirm === subject.id ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => deleteSubject(subject.id)} className="text-[10px] text-red-400 hover:text-red-300 px-1.5 py-0.5 rounded focus:outline-none bg-red-400/10">del</button>
                        <button onClick={() => setShowDeleteConfirm(null)} className="text-[10px] text-text-muted px-1 py-0.5 rounded focus:outline-none">✕</button>
                      </div>
                    ) : (
                      <button onClick={() => setShowDeleteConfirm(subject.id)}
                        className="opacity-0 group-hover/subj:opacity-100 transition-opacity text-text-muted hover:text-red-400 p-1 focus:outline-none shrink-0">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>

          <button onClick={() => setActiveTab('import')}
            className="w-full mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-text-muted hover:text-primary hover:bg-primary/5 transition-all border border-dashed border-border hover:border-primary/25 focus:outline-none text-xs group font-bold uppercase tracking-wider">
            <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200" />
            <span>Add via AI Import</span>
          </button>
        </div>
      </nav>

      <div className="px-3 py-4 border-t border-border space-y-2">
        <div className="group relative flex items-center gap-3 px-3 py-2.5 bg-surface rounded-2xl border border-border hover:border-primary/20 transition-all cursor-pointer shadow-sm"
          onClick={() => setIsProfileModalOpen(true)}>
          <div className="w-10 h-10 rounded-xl border border-primary/30 overflow-hidden bg-primary/10 flex items-center justify-center shrink-0 group-hover:border-primary/50 transition-all shadow-inner">
            {displayPhoto ? (
              <img src={displayPhoto} alt={profile?.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-black text-primary">{(profile?.name || user?.email || 'U').charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-text truncate group-hover:text-primary transition-colors">{profile?.name || user?.displayName || 'PrepBoard User'}</p>
            <div className="flex flex-col">
              <span className="text-[9px] text-text-muted font-black uppercase tracking-[0.1em] flex items-center gap-1">
                <GraduationCap className="w-2.5 h-2.5" /> {profile?.year || 'Batch unknown'}
              </span>
            </div>
          </div>
          <Settings className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-all opacity-0 group-hover:opacity-100 group-hover:rotate-45" />
        </div>

        {/* Theme Toggle & Sign Out */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-surface border border-border text-text-muted hover:text-primary hover:bg-primary/5 transition-all group shadow-sm"
            title="Toggle Theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 group-hover:-rotate-12 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Dark</span>
              </>
            )}
          </button>
          <button
            onClick={logout}
            className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all shadow-sm"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { user, userData, logout, updateData, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubjectId, setActiveSubjectId] = useState(DEFAULT_SUBJECT.id);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => { setIsMobileMenuOpen(false); }, [activeTab, activeSubjectId]);

  const { subjects = [DEFAULT_SUBJECT], subjectProgress = {}, studyLogs = [], profile = null, photoURL = null } = userData || {};

  useEffect(() => {
    if (subjects.length > 0 && !subjects.find(s => s.id === activeSubjectId)) {
      setActiveSubjectId(subjects[0].id);
    }
  }, [subjects, activeSubjectId]);

  if (loading) return null;
  if (!user) return <Login />;

  if (!profile) {
    return <Onboarding onComplete={(data) => updateData({ profile: data })} />;
  }

  const activeSubject = subjects.find(s => s.id === activeSubjectId) ?? subjects[0];
  const completedTopics = subjectProgress[activeSubject?.id] ?? [];

  const toggleTopic = async (topicId) => {
    const curr = subjectProgress[activeSubject.id] ?? [];
    const isAdding = !curr.includes(topicId);
    const next = isAdding
      ? [...curr, topicId]
      : curr.filter(id => id !== topicId);

    const updates = {
      subjectProgress: {
        ...subjectProgress,
        [activeSubject.id]: next
      }
    };

    if (isAdding) {
      const topic = activeSubject.units.flatMap(u => u.topics).find(t => t.id === topicId);
      if (topic) {
        const today = new Date().toISOString().split('T')[0];
        const existingLogIdx = studyLogs.findIndex(l => l.date === today);
        let nextLogs = [...studyLogs];

        if (existingLogIdx > -1) {
          const log = nextLogs[existingLogIdx];
          const topicsArr = log.topics ? log.topics.split(', ').filter(t => t) : [];
          if (!topicsArr.includes(topic.title)) {
            topicsArr.push(topic.title);
            nextLogs[existingLogIdx] = { ...log, topics: topicsArr.join(', ') };
          }
        } else {
          nextLogs.unshift({
            id: crypto.randomUUID(),
            date: today,
            hours: 0.5,
            topics: topic.title,
            pyqs: 0
          });
        }
        updates.studyLogs = nextLogs;
      }
    }
    await updateData(updates);
  };

  const updateActiveUnits = async (newUnits) => {
    const nextSubjects = subjects.map(s => s.id === activeSubject.id ? { ...s, units: newUnits } : s);
    await updateData({ subjects: nextSubjects });
  };

  const addSubject = async (subject) => {
    await updateData({
      subjects: [...subjects, subject],
      subjectProgress: { ...subjectProgress, [subject.id]: [] }
    });
    setActiveSubjectId(subject.id);
    setActiveTab('units');
  };

  const deleteSubject = async (subjectId) => {
    if (subjectId === DEFAULT_SUBJECT.id) return;
    const nextSubjects = subjects.filter(s => s.id !== subjectId);
    const { [subjectId]: _, ...nextProgress } = subjectProgress;
    await updateData({ subjects: nextSubjects, subjectProgress: nextProgress });
    if (activeSubjectId === subjectId) setActiveSubjectId(DEFAULT_SUBJECT.id);
    setShowDeleteConfirm(null);
  };

  const setStudyLogs = async (newLogs) => {
    await updateData({ studyLogs: newLogs });
  };

  const renderContent = () => {
    if (!activeSubject) return null;
    switch (activeTab) {
      case 'dashboard': return <Dashboard activeSubject={activeSubject} completedTopics={completedTopics} studyLogs={studyLogs} />;
      case 'units': return <UnitTracker units={activeSubject.units} completedTopics={completedTopics} toggleTopic={toggleTopic} onUpdateUnits={updateActiveUnits} />;
      case 'logs': return <DailyLogger studyLogs={studyLogs} setStudyLogs={setStudyLogs} />;
      case 'analytics': return <Analytics studyLogs={studyLogs} />;
      case 'import': return <SyllabusImporter onSubjectCreated={addSubject} />;
      default: return <Dashboard activeSubject={activeSubject} completedTopics={completedTopics} studyLogs={studyLogs} />;
    }
  };

  const commonProps = {
    user, profile, photoURL, activeTab, setActiveTab, subjects, activeSubjectId, setActiveSubjectId, 
    subjectProgress, showDeleteConfirm, setShowDeleteConfirm, deleteSubject, setIsProfileModalOpen, theme, toggleTheme, logout
  };

  return (
    <div className="min-h-screen bg-background flex font-sans text-text relative">
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-md">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-gradient text-base">PrepBoard</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(v => !v)} className="p-2 text-text-muted hover:text-text focus:outline-none transition-colors">
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-border shrink-0 z-10">
        <SidebarContent {...commonProps} />
      </aside>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-[24px] z-30 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)} />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 w-72 h-full border-r border-border z-40 flex flex-col lg:hidden">
              <SidebarContent {...commonProps} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-w-0 pt-14 lg:pt-0 h-screen overflow-hidden relative z-10">
        <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8 lg:px-10 pb-10 scrollbar-hide">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div key={`${activeTab}-${activeSubjectId}`}
                initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}>
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isProfileModalOpen && (
          <ProfileEditModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
