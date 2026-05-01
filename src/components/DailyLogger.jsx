import { useState } from 'react';
import { Plus, Trash2, CalendarDays, Clock, BookOpen, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const uuidv4 = () => crypto.randomUUID();

export default function DailyLogger({ studyLogs, setStudyLogs }) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [hours, setHours] = useState('');
  const [topics, setTopics] = useState('');
  const [pyqs, setPyqs] = useState('');

  const handleAddLog = (e) => {
    e.preventDefault();
    if (!date || !hours) return;
    const newLog = {
      id: uuidv4(), date, hours: parseFloat(hours),
      topics, pyqs: parseInt(pyqs || 0, 10),
    };
    const updated = [...studyLogs, newLog].sort((a, b) => new Date(b.date) - new Date(a.date));
    setStudyLogs(updated);
    setHours(''); setTopics(''); setPyqs('');
  };

  const handleDelete = (id) => setStudyLogs(studyLogs.filter(l => l.id !== id));

  const inputCls = 'w-full input-styled rounded-xl px-4 py-2.5 text-sm focus:outline-none';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1 text-text">Daily Study Log</h2>
        <p className="text-text-muted text-sm font-medium">Record your daily sessions to track consistency.</p>
      </div>

      {/* Form card */}
      <div className="glass-panel-strong rounded-2xl p-6">
        <h3 className="text-[10px] font-black text-text-muted mb-4 uppercase tracking-[0.2em]">Log Today's Session</h3>
        <form onSubmit={handleAddLog} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5"><CalendarDays className="w-3 h-3" />Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5"><Clock className="w-3 h-3" />Hours</label>
            <input type="number" step="0.5" min="0" value={hours} onChange={e => setHours(e.target.value)}
              placeholder="2.5" className={inputCls} required />
          </div>
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
            <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5"><BookOpen className="w-3 h-3" />Topics covered</label>
            <input type="text" value={topics} onChange={e => setTopics(e.target.value)}
              placeholder="Bayes Theorem, Normal Distribution…" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted flex items-center gap-1.5 uppercase tracking-wider"><CheckSquare className="w-3 h-3" />PYQs</label>
            <div className="flex gap-2">
              <input type="number" min="0" value={pyqs} onChange={e => setPyqs(e.target.value)}
                placeholder="0" className={inputCls} />
              <button type="submit" id="add-log-btn"
                className="btn-primary text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm font-bold focus:outline-none whitespace-nowrap shrink-0 shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {studyLogs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-600">
            <CalendarDays className="w-10 h-10 opacity-30" />
            <p className="text-sm">No sessions logged yet.</p>
            <p className="text-xs">Fill in the form above to start tracking.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3.5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Date</th>
                  <th className="px-5 py-3.5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Hours</th>
                  <th className="px-5 py-3.5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] hidden md:table-cell">Topics</th>
                  <th className="px-5 py-3.5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">PYQs</th>
                  <th className="px-5 py-3.5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-right"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {studyLogs.map((log, i) => (
                    <motion.tr key={log.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border/50 hover:bg-surface-2 transition-colors group">
                      <td className="px-5 py-3.5 font-bold text-text whitespace-nowrap">
                        {format(new Date(log.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/20">
                          <Clock className="w-3 h-3" />{log.hours}h
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 max-w-xs hidden md:table-cell">
                        <span className="truncate block">{log.topics || <span className="text-slate-700 italic">—</span>}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {Number(log.pyqs) > 0
                          ? <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{log.pyqs}</span>
                          : <span className="text-slate-700">—</span>
                        }
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button onClick={() => handleDelete(log.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 focus:outline-none">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
