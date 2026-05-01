import { Target, BookOpen, Flame, Award, TrendingUp, Star } from 'lucide-react';
import { calculateSubjectProgress, calculateUnitProgress } from '../lib/utils';
import { motion } from 'framer-motion';
import StudyHeatmap from './StudyHeatmap';


const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "The only way to learn mathematics is to do mathematics.", author: "Paul Halmos" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
];

const quote = QUOTES[new Date().getDate() % QUOTES.length];

function StatCard({ icon, label, value, colorClass, glowClass, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`${colorClass} rounded-2xl p-5 card-lift cursor-default`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${glowClass}`}>
          {icon}
        </div>
        <TrendingUp className="w-4 h-4 text-white/20" />
      </div>
      <p className="text-3xl font-bold mb-1 tracking-tight text-text">{value}</p>
      <p className="text-xs font-black opacity-60 uppercase tracking-widest text-text-muted">{label}</p>
    </motion.div>
  );
}

export default function Dashboard({ activeSubject, completedTopics, studyLogs }) {
  const units = activeSubject?.units ?? [];
  const progress = calculateSubjectProgress(units, completedTopics);
  const totalHours = studyLogs.reduce((acc, log) => acc + Number(log.hours || 0), 0);
  const totalTopics = units.reduce((acc, u) => acc + u.topics.length, 0);
  const completedCount = completedTopics.filter(id => units.some(u => u.topics.some(t => t.id === id))).length;
  const completedUnits = units.filter(u => u.topics.length > 0 && u.topics.every(t => completedTopics.includes(t.id))).length;

  // circumference of the ring
  const r = 42;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress / 100);

  return (
    <div className="space-y-8 pb-10">
      {/* Header with Subject & Date moved to right */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text">
            Prep<span className="text-gradient">Board</span>
          </h1>
          <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em]">Performance Hub</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col items-end text-right"
        >
          <div className="flex items-center gap-2 bg-surface-2 border border-border px-4 py-2 rounded-2xl shadow-sm">
            <span className="text-lg">{activeSubject?.emoji}</span>
            <span className="text-sm font-bold text-text tracking-tight">{activeSubject?.name ?? 'Select Subject'}</span>
            <span className="text-text-muted/30 px-1">·</span>
            <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' })}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Hero progress card */}
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05, duration: 0.35 }}
        className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">

        {/* SVG ring */}
        <div className="relative shrink-0 w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Track */}
            <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-border/40" />
            {/* Main progress */}
            <circle cx="50" cy="50" r={r} fill="none"
              stroke="url(#ringGrad)" strokeWidth="8"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black tracking-tighter text-gradient">{progress}%</span>
            <span className="text-[11px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Complete</span>
          </div>
        </div>

        {/* Stats breakdown */}
        <div className="flex-1 w-full space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-muted font-bold uppercase tracking-widest text-[10px]">Topics completed</span>
              <span className="text-text font-bold">{completedCount} <span className="text-text-muted">/ {totalTopics}</span></span>
            </div>
            <div className="h-2.5 bg-border/40 rounded-full overflow-hidden">
              <div className="h-full progress-bar-fill rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-muted font-bold uppercase tracking-widest text-[10px]">Units completed</span>
              <span className="text-text font-bold">{completedUnits} <span className="text-text-muted">/ {units.length}</span></span>
            </div>
            <div className="h-2.5 bg-border/40 rounded-full overflow-hidden">
              <div className="h-full progress-bar-emerald rounded-full"
                style={{ width: units.length ? `${(completedUnits / units.length) * 100}%` : '0%' }} />
            </div>
          </div>

          {/* Mini unit bars */}
          {units.length > 0 && (
            <div className="pt-2">
              <p className="text-xs text-slate-600 mb-2 font-medium">Unit breakdown</p>
              <div className="flex items-end gap-1 h-8">
                {units.map(unit => {
                  const p = calculateUnitProgress(unit, completedTopics);
                  return (
                    <div key={unit.id} title={unit.title} className="flex-1 flex flex-col justify-end gap-1 group cursor-default">
                      <div className="w-full rounded-sm overflow-hidden bg-white/5 relative"
                        style={{ height: `${Math.max(4, (p / 100) * 28)}px` }}>
                        <div className="absolute inset-0 progress-bar-fill"
                          style={{ opacity: p === 100 ? 1 : 0.5 + p / 200 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Heatmap */}
      <StudyHeatmap logs={studyLogs} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard delay={0.1} icon={<Target className="w-5 h-5 text-violet-300" />}
          label="Progress" value={`${progress}%`}
          colorClass="stat-purple" glowClass="bg-violet-500/20" />
        <StatCard delay={0.15} icon={<BookOpen className="w-5 h-5 text-blue-300" />}
          label="Units done" value={`${completedUnits}/${units.length}`}
          colorClass="stat-blue" glowClass="bg-blue-500/20" />
        <StatCard delay={0.2} icon={<Flame className="w-5 h-5 text-orange-300" />}
          label="Hours studied" value={`${totalHours.toFixed(1)}h`}
          colorClass="stat-orange" glowClass="bg-orange-500/20" />
        <StatCard delay={0.25} icon={<Award className="w-5 h-5 text-emerald-300" />}
          label="PYQs done" value={studyLogs.reduce((a, l) => a + Number(l.pyqs || 0), 0)}
          colorClass="stat-emerald" glowClass="bg-emerald-500/20" />
      </div>

      {/* Quote */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="glass-panel rounded-2xl p-5 flex items-start gap-4">
        <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0 mt-0.5">
          <Star className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <p className="text-slate-300 italic leading-relaxed text-sm">"{quote.text}"</p>
          <p className="text-slate-600 text-xs mt-2 font-medium">— {quote.author}</p>
        </div>
      </motion.div>
    </div>
  );
}
