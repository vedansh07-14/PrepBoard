import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle2, Circle, Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { cn, calculateUnitProgress, generateId } from '../lib/utils';

function InlineEdit({ value, onSave, className }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const save = () => {
    const t = draft.trim();
    if (t && t !== value) onSave(t);
    setEditing(false);
  };
  if (editing) return (
    <span className="flex items-center gap-1 flex-1 min-w-0">
      <input autoFocus value={draft} onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
        className={cn('input-styled rounded-lg px-2 py-0.5 text-sm flex-1 min-w-0 bg-surface-2 border-b-2 border-primary/50 focus:outline-none focus:border-primary', className)} />
      <button onClick={save} className="text-emerald-500 hover:text-emerald-400 p-0.5 transition-colors"><Check className="w-3.5 h-3.5" /></button>
      <button onClick={() => setEditing(false)} className="text-text-muted hover:text-text p-0.5 transition-colors"><X className="w-3.5 h-3.5" /></button>
    </span>
  );
  return (
    <span className={cn('flex-1 min-w-0 group/edit flex items-center gap-1.5', className)}>
      <span className="truncate">{value}</span>
      <button onClick={() => { setDraft(value); setEditing(true); }}
        className="opacity-0 group-hover/edit:opacity-100 transition-opacity text-text-muted hover:text-primary p-0.5 shrink-0">
        <Pencil className="w-3 h-3" />
      </button>
    </span>
  );
}

export default function DynamicTracker({ units, completedTopics, toggleTopic, onUpdateUnits, editable = true }) {
  const [expandedUnit, setExpandedUnit] = useState(units[0]?.id ?? null);

  const updateUnit = (unitId, changes) =>
    onUpdateUnits(units.map(u => u.id === unitId ? { ...u, ...changes } : u));
  const addUnit = () => {
    const nu = { id: generateId(), title: 'New Unit', topics: [] };
    onUpdateUnits([...units, nu]);
    setExpandedUnit(nu.id);
  };
  const deleteUnit = (unitId) => {
    onUpdateUnits(units.filter(u => u.id !== unitId));
    if (expandedUnit === unitId) setExpandedUnit(null);
  };
  const addTopic = (unitId) => {
    const unit = units.find(u => u.id === unitId);
    updateUnit(unitId, { topics: [...unit.topics, { id: generateId(), title: 'New Topic' }] });
  };
  const renameTopic = (unitId, topicId, v) => {
    const unit = units.find(u => u.id === unitId);
    updateUnit(unitId, { topics: unit.topics.map(t => t.id === topicId ? { ...t, title: v } : t) });
  };
  const deleteTopic = (unitId, topicId) => {
    const unit = units.find(u => u.id === unitId);
    updateUnit(unitId, { topics: unit.topics.filter(t => t.id !== topicId) });
  };

  return (
    <div className="space-y-3">
      {units.map((unit, unitIdx) => {
        const isExpanded = expandedUnit === unit.id;
        const progress = calculateUnitProgress(unit, completedTopics);
        const isComplete = progress === 100 && unit.topics.length > 0;

        return (
          <motion.div key={unit.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: unitIdx * 0.04, duration: 0.25 }}
            className={cn('rounded-2xl overflow-hidden transition-all duration-300',
              isExpanded
                ? 'glass-panel-strong border-primary/20'
                : 'glass-panel hover:border-primary/10 border-transparent')}>

            {/* Unit header */}
            <div className="flex items-center gap-3 px-4 py-4">
              {/* Expand button */}
              <button onClick={() => setExpandedUnit(isExpanded ? null : unit.id)}
                className="flex-1 flex items-center gap-3 text-left focus:outline-none min-w-0 group/header">
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all',
                  isComplete ? 'bg-emerald-500/20' : isExpanded ? 'bg-primary/20' : 'bg-surface-2 group-hover/header:bg-primary/10')}>
                  <ChevronDown className={cn('w-4 h-4 transition-all duration-300',
                    isExpanded ? 'rotate-180 text-primary' : 'text-text-muted group-hover/header:text-primary')} />
                </div>

                {editable
                  ? <InlineEdit value={unit.title} onSave={v => updateUnit(unit.id, { title: v })}
                      className={cn('font-bold text-sm', isComplete ? 'text-emerald-500' : 'text-text')} />
                  : <span className={cn('font-bold text-sm truncate flex-1', isComplete ? 'text-emerald-500' : 'text-text')}>{unit.title}</span>}
              </button>

              {/* Progress + delete */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 bg-surface-2 rounded-full overflow-hidden hidden sm:block">
                    <div className={cn('h-full rounded-full transition-all duration-700',
                      isComplete ? 'progress-bar-emerald' : 'progress-bar-fill')}
                      style={{ width: `${progress}%` }} />
                  </div>
                  <span className={cn('text-xs font-black tabular-nums w-8 text-right',
                    isComplete ? 'text-emerald-500' : 'text-text-muted')}>{progress}%</span>
                </div>
                {editable && (
                  <button onClick={() => deleteUnit(unit.id)}
                    className="p-1.5 text-text-muted/30 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all focus:outline-none">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Topics */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden">
                  <div className="px-4 pb-4 space-y-1 border-t border-border pt-3">
                    {unit.topics.length === 0 && (
                      <p className="text-sm text-text-muted/60 py-3 text-center font-medium italic">No topics yet. Add one below.</p>
                    )}
                    {unit.topics.map((topic, topicIdx) => {
                      const done = completedTopics.includes(topic.id);
                      return (
                        <motion.div key={topic.id}
                          initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: topicIdx * 0.03 }}
                          className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group/topic topic-row',
                            done ? 'bg-emerald-500/8 hover:bg-emerald-500/12' : 'hover:bg-surface-2')}>

                          <button onClick={() => toggleTopic(topic.id)} className="shrink-0 focus:outline-none group/check">
                            {done ? (
                              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-500/30">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-border group-hover/check:border-primary transition-colors flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-transparent group-hover/check:bg-primary/40 transition-colors" />
                              </div>
                            )}
                          </button>

                          {editable
                            ? <InlineEdit value={topic.title} onSave={v => renameTopic(unit.id, topic.id, v)}
                                className={cn('text-sm font-medium', done ? 'text-emerald-600/60 line-through decoration-emerald-500/30' : 'text-text')} />
                            : <span className={cn('text-sm flex-1 font-medium', done ? 'text-emerald-600/60 line-through decoration-emerald-500/30' : 'text-text')}>
                                {topic.title}</span>}

                          {editable && (
                            <button onClick={() => deleteTopic(unit.id, topic.id)}
                              className="opacity-0 group-hover/topic:opacity-100 p-1 text-text-muted/30 hover:text-red-500 transition-all focus:outline-none shrink-0">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </motion.div>
                      );
                    })}
                    {editable && (
                      <button onClick={() => addTopic(unit.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-primary hover:bg-primary/5 rounded-xl transition-all focus:outline-none border border-dashed border-border hover:border-primary/25 mt-2 group font-bold uppercase tracking-widest text-[10px]">
                        <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200" /> Add topic
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {editable && (
        <button onClick={addUnit}
          className="w-full flex items-center justify-center gap-2 py-3.5 text-xs font-black uppercase tracking-[0.2em] text-text-muted hover:text-primary border border-dashed border-border hover:border-primary/25 rounded-2xl transition-all focus:outline-none hover:bg-primary/5 group shadow-sm bg-surface">
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" /> Add Unit
        </button>
      )}
    </div>
  );
}
