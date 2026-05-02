import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Loader2, RefreshCw, AlertCircle, CheckCircle2, Circle } from 'lucide-react';
import { generatePlan } from '../lib/api';
import { cn } from '../lib/utils';

export default function StudyPlanner({ activeSubject, completedTopics, toggleTopic, storedPlan, onSavePlan }) {
  const [examDate, setExamDate] = useState(storedPlan?.examDate || '');
  const [plan, setPlan] = useState(storedPlan?.plan || null);
  const [generatedAt, setGeneratedAt] = useState(storedPlan?.generatedAt || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load plan when subject changes
  useEffect(() => {
    setPlan(storedPlan?.plan || null);
    setExamDate(storedPlan?.examDate || '');
    setGeneratedAt(storedPlan?.generatedAt || null);
    setError(null);
  }, [activeSubject?.id, storedPlan]);

  // Create a mapping of topic titles to IDs for syncing
  const topicIdMap = {};
  if (activeSubject?.units) {
    activeSubject.units.forEach(unit => {
      unit.topics.forEach(topic => {
        topicIdMap[topic.title] = topic.id;
      });
    });
  }

  const flattenTopics = (subject) => {
    return subject?.units?.flatMap(unit =>
      unit?.topics?.map(topic => ({
        name: topic.title,
        completed: completedTopics.includes(topic.id)
      })) || []
    ) || [];
  };

  const getRemainingTopics = (topics) => {
    return topics.filter(t => t.completed === false);
  };

  const allTopics = flattenTopics(activeSubject);
  const remainingTopics = getRemainingTopics(allTopics);
  const hasRemainingTopics = remainingTopics.length > 0;

  const handleGenerate = async () => {
    if (!examDate) {
      setError('Please select an exam date.');
      return;
    }
    
    if (!hasRemainingTopics) {
      setError('All topics completed 🎉');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Sending to n8n:", {
        examDate,
        topics: remainingTopics
      });

      const response = await generatePlan(examDate, remainingTopics);
      console.log("Received from n8n:", response);
      
      // n8n webhooks sometimes return different formats
      // Format A: { plan: [ { date, tasks: [] } ] }
      // Format B: [ { date, time, topic, type } ] (Flat array)
      
      let rawData = Array.isArray(response) ? response : [response];
      if (rawData.length === 1 && rawData[0].plan) {
         rawData = rawData[0].plan;
      } else if (response && response.plan) {
         rawData = response.plan;
      }

      if (!Array.isArray(rawData) || rawData.length === 0) {
        console.error("Backend error:", response);
        throw new Error("Invalid plan format received from webhook");
      }

      let safePlan = [];

      // Detect if it's a flat array of tasks
      if (rawData[0].topic && !rawData[0].tasks) {
        const grouped = {};
        rawData.forEach(item => {
           const d = item.date || new Date().toISOString().split('T')[0];
           if (!grouped[d]) grouped[d] = { date: d, tasks: [] };
           
           // If the AI combined topics like "Topic A, Topic B", split them so they sync properly
           const topicsList = item.topic ? item.topic.split(',').map(t => t.trim()) : ["Unnamed Task"];
           
           topicsList.forEach(t => {
             grouped[d].tasks.push({
               time: item.time,
               topic: t,
               type: item.type
             });
           });
        });
        safePlan = Object.values(grouped);
        
        // Sort by date
        safePlan.sort((a, b) => new Date(a.date) - new Date(b.date));
      } else {
        // It's already grouped by date
        safePlan = rawData.map(day => ({
          ...day,
          date: day.date || new Date().toISOString().split('T')[0],
          tasks: Array.isArray(day.tasks) ? day.tasks : (typeof day.tasks === 'string' ? [day.tasks] : [])
        }));
      }
      
      setPlan(safePlan);
      const timestamp = new Date().toISOString();
      setGeneratedAt(timestamp);
      if (onSavePlan) {
        await onSavePlan({ examDate, plan: safePlan, generatedAt: timestamp });
      }
    } catch (err) {
      console.error("Plan Generation Error:", err);
      setError(err.message || 'An error occurred while generating the plan.');
    } finally {
      setLoading(false);
    }
  };

  const getTodayString = () => new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight mb-1 text-text">AI Study Planner</h2>
          <p className="text-text-muted text-sm font-medium">Generate a personalized daily roadmap based on your exam date.</p>
        </div>
      </div>

      {/* Controls Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="glass-panel-strong p-6 rounded-[2rem] border-border shadow-xl flex flex-col sm:flex-row items-center gap-4">
        
        <div className="flex-1 w-full relative group">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
          <input 
            type="date" 
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:border-primary/50 text-text shadow-inner transition-colors"
          />
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading || !examDate || !hasRemainingTopics}
          className={cn(
            "w-full sm:w-auto btn-primary text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 shrink-0",
            (loading || !examDate || !hasRemainingTopics) ? "opacity-70 cursor-not-allowed" : "shadow-primary/20 hover:scale-[1.02]"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              {plan ? <RefreshCw className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
              {plan ? 'Regenerate' : 'Generate Plan'}
            </>
          )}
        </button>
      </motion.div>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-red-500 text-xs flex items-center gap-3 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan Display Section */}
      <AnimatePresence mode="wait">
        {plan && !loading && (
          <motion.div key="plan-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-6">
            
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <div className="flex flex-col items-center">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2">Your Personalized Roadmap</p>
                {generatedAt && (
                  <p className="text-[9px] text-text-muted/60 mt-0.5 font-medium tracking-wide">Last generated: {new Date(generatedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                )}
              </div>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plan.map((dayPlan, idx) => {
                const isToday = dayPlan.date === getTodayString();
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    key={dayPlan.date} 
                    className={cn(
                      "rounded-[2rem] border transition-all h-full flex flex-col relative overflow-hidden",
                      isToday 
                        ? "bg-surface border-primary/40 shadow-2xl shadow-primary/10 ring-1 ring-primary/20" 
                        : "bg-surface/50 border-border/80 hover:border-primary/30 shadow-lg hover:shadow-xl backdrop-blur-sm"
                    )}
                  >
                    {/* Card Header */}
                    <div className={cn(
                      "px-6 py-5 border-b flex items-center justify-between",
                      isToday ? "bg-primary/5 border-primary/20" : "bg-surface-2/40 border-border/50"
                    )}>
                      <div>
                        <h4 className={cn("text-lg font-black tracking-tight", isToday ? "text-primary drop-shadow-sm" : "text-text")}>
                          {new Date(dayPlan.date).toLocaleDateString('en-US', { weekday: 'long' })}
                        </h4>
                        <p className={cn("text-[11px] font-bold mt-0.5 uppercase tracking-widest", isToday ? "text-primary/70" : "text-text-muted/70")}>
                          {new Date(dayPlan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      {isToday && (
                        <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-inner border border-primary/20">
                          Today
                        </div>
                      )}
                    </div>
                    
                    {/* Tasks List */}
                    <div className="p-6 space-y-4 flex-1 bg-gradient-to-b from-transparent to-surface-2/10">
                      {dayPlan.tasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-center opacity-50">
                          <CheckCircle2 className="w-8 h-8 text-text-muted mb-2 opacity-50" />
                          <p className="text-xs text-text-muted font-bold tracking-wide">Free Day!</p>
                        </div>
                      ) : (
                        dayPlan.tasks.map((taskItem, tIdx) => {
                          const isObject = typeof taskItem === 'object' && taskItem !== null;
                          const taskName = isObject ? (taskItem.topic || taskItem.name || JSON.stringify(taskItem)) : String(taskItem);
                          const taskTime = isObject ? taskItem.time : null;
                          const taskType = isObject ? taskItem.type : null;
                          
                          const topicId = topicIdMap[taskName];
                          
                          // Use the individual task's completed state so multiple sessions for the same topic don't sync visually
                          const isCompleted = isObject ? !!taskItem.completed : false;

                          // Dynamic colors based on type
                          const t = (taskType || '').toLowerCase();
                          let typeColors = "bg-primary/10 text-primary border-primary/20 border-l-primary";
                          if (t.includes('concept')) typeColors = "bg-blue-500/10 text-blue-400 border-blue-500/20 border-l-blue-500";
                          else if (t.includes('practice') || t.includes('pyq')) typeColors = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 border-l-emerald-500";
                          else if (t.includes('revision') || t.includes('mock')) typeColors = "bg-purple-500/10 text-purple-400 border-purple-500/20 border-l-purple-500";

                          return (
                            <motion.div 
                              whileHover={{ scale: 1.02 }}
                              key={tIdx} 
                              onClick={async () => {
                                if (!isObject) return;
                                
                                // 1. Toggle this specific task in the planner
                                const newPlan = [...plan];
                                const dayIndex = newPlan.findIndex(d => d.date === dayPlan.date);
                                const updatedDay = { ...dayPlan, tasks: [...dayPlan.tasks] };
                                updatedDay.tasks[tIdx] = { ...taskItem, completed: !taskItem.completed };
                                newPlan[dayIndex] = updatedDay;
                                
                                setPlan(newPlan);
                                
                                // 2. Save the updated plan to Firebase
                                if (onSavePlan) {
                                  await onSavePlan({ examDate, plan: newPlan, generatedAt });
                                }

                                // 3. Auto-complete the global syllabus topic if it isn't already
                                if (!isCompleted && topicId && !completedTopics.includes(topicId)) {
                                  toggleTopic(topicId);
                                }
                              }}
                              className={cn(
                                "flex flex-col p-4 rounded-2xl border transition-all relative overflow-hidden group cursor-pointer",
                                isCompleted 
                                  ? "bg-surface-2/30 border-border/40 grayscale-[0.5] opacity-60" 
                                  : cn("bg-surface border-l-4 shadow-sm", typeColors.split(' border-l-')[0], typeColors.match(/border-l-[a-z0-5-]+/)?.[0])
                              )}
                            >
                              {/* Background subtle glow for incomplete active tasks */}
                              {!isCompleted && (
                                <div className={cn("absolute inset-0 opacity-[0.03] transition-opacity group-hover:opacity-[0.06]", typeColors.split(' ')[0])} />
                              )}

                              <div className="flex items-start gap-3 relative z-10">
                                <button className={cn(
                                  "shrink-0 mt-0.5 w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all",
                                  isCompleted 
                                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-500" 
                                    : "border-text-muted/30 group-hover:border-primary/50 text-transparent"
                                )}>
                                  <CheckCircle2 className={cn("w-3.5 h-3.5", isCompleted ? "opacity-100" : "opacity-0")} />
                                </button>
                                
                                <div className="flex flex-col min-w-0 flex-1">
                                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                    {taskTime && (
                                      <span className={cn(
                                        "text-[10px] font-black tracking-wider flex items-center gap-1",
                                        isCompleted ? "text-text-muted" : "text-text"
                                      )}>
                                        {taskTime}
                                      </span>
                                    )}
                                    {taskType && (
                                      <span className={cn(
                                        "text-[8px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border",
                                        isCompleted ? "bg-surface-2 text-text-muted border-border" : typeColors.split(' border-l-')[0]
                                      )}>
                                        {taskType}
                                      </span>
                                    )}
                                  </div>
                                  
                                  <span className={cn(
                                    "text-sm font-bold leading-relaxed break-words",
                                    isCompleted ? "text-text-muted line-through decoration-text-muted/40" : "text-text group-hover:text-primary transition-colors"
                                  )}>
                                    {taskName}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
