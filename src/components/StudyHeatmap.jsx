import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { format, eachDayOfInterval, startOfYear, endOfYear, eachMonthOfInterval, startOfMonth, endOfMonth, eachWeekOfInterval } from 'date-fns';
import { cn } from '../lib/utils';
import { Flame, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function StudyHeatmap({ logs }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const logMap = useMemo(() => logs.reduce((acc, log) => {
    acc[log.date] = log.hours;
    return acc;
  }, {}), [logs]);

  const months = useMemo(() => {
    const start = startOfYear(new Date(selectedYear, 0, 1));
    const end = endOfYear(new Date(selectedYear, 0, 1));
    const monthsInterval = eachMonthOfInterval({ start, end });

    return monthsInterval.map(monthDate => {
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      // Get weeks that have at least one day in this month
      // We use eachDay and then group to handle the partial weeks better
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
      
      const weeksInMonth = [];
      let currentWeek = [];
      
      // Pad beginning of month to align with day of week (0=Sun, 1=Mon...)
      // But we want Mon=0 for our grid (Mon-Sun)
      const firstDay = monthStart.getDay();
      const padding = firstDay === 0 ? 6 : firstDay - 1;

      days.forEach((day, i) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const hours = logMap[dateStr] || 0;
        let level = 0;
        if (hours > 0 && hours < 1) level = 1;
        else if (hours >= 1 && hours < 2) level = 2;
        else if (hours >= 2 && hours < 4) level = 3;
        else if (hours >= 4) level = 4;

        currentWeek.push({ date: day, dateStr, hours, level });
        
        if (day.getDay() === 0 || i === days.length - 1) { // 0 is Sunday
          weeksInMonth.push(currentWeek);
          currentWeek = [];
        }
      });

      return {
        name: format(monthDate, 'MMM'),
        weeks: weeksInMonth
      };
    });
  }, [selectedYear, logMap]);

  const currentStreak = useMemo(() => {
    let streak = 0;
    const sortedDates = [...new Set(logs.map(l => l.date))].sort().reverse();
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const yesterdayStr = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
    
    let checkDate = todayStr;
    if (!sortedDates.includes(todayStr) && sortedDates.includes(yesterdayStr)) {
      checkDate = yesterdayStr;
    }

    if (sortedDates.includes(checkDate)) {
      for (let i = 0; i < 365; i++) {
        const d = format(new Date(new Date(checkDate).getTime() - i * 86400000), 'yyyy-MM-dd');
        if (sortedDates.includes(d)) {
          streak++;
        } else {
          break;
        }
      }
    }
    return streak;
  }, [logs]);

  const { theme } = useTheme();

  const getColor = (level) => {
    if (theme === 'light') {
      switch (level) {
        case 0: return 'bg-[#E5E7EB]';
        case 1: return 'bg-[#BBF7D0]';
        case 2: return 'bg-[#4ADE80]';
        case 3: return 'bg-[#22C55E]';
        case 4: return 'bg-[#16A34A]';
        default: return 'bg-[#E5E7EB]';
      }
    }
    // Dark mode
    switch (level) {
      case 0: return 'bg-white/[0.08]';
      case 1: return 'bg-emerald-500/20';
      case 2: return 'bg-emerald-500/40';
      case 3: return 'bg-emerald-500/70';
      case 4: return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
      default: return 'bg-white/[0.08]';
    }
  };

  return (
    <div className="glass-panel p-6 rounded-[2.5rem] border-border">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
            <Calendar className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-text flex items-center gap-2">
              Study Activity
              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest font-bold">{selectedYear}</span>
            </h3>
            <p className="text-xs text-text-muted mt-1 font-medium">Full year-wise consistency tracking</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl border border-border">
            <button onClick={() => setSelectedYear(y => y - 1)} className="p-1.5 hover:bg-surface rounded-lg text-text-muted transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-xs font-bold text-text px-2 w-12 text-center">{selectedYear}</span>
            <button 
              onClick={() => setSelectedYear(y => y + 1)} 
              disabled={selectedYear >= new Date().getFullYear()}
              className="p-1.5 hover:bg-surface rounded-lg text-text-muted disabled:opacity-20 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {currentStreak > 0 && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-3 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 px-4 py-2 rounded-2xl shadow-lg shadow-orange-500/5"
            >
              <Flame className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-lg font-black text-text leading-none">{currentStreak}</p>
                <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">Day Streak</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto pb-6 custom-scrollbar">
        <div className="flex gap-4 min-w-max px-2">
          {/* Months Containers */}
          {months.map((month, mi) => (
            <div key={mi} className="flex flex-col gap-2">
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter text-center">
                {month.name}
              </span>
              <div className="flex gap-[4px]">
                {month.weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[4px] justify-end">
                    {/* Add padding for the first week of the month if it doesn't start on Monday */}
                    {wi === 0 && Array.from({ length: 7 - week.length }).map((_, pi) => (
                      <div key={`pad-${pi}`} className="w-3 h-3 bg-transparent" />
                    ))}
                    
                    {week.map((day, di) => (
                      <div key={di} className="group relative">
                        <motion.div
                          whileHover={{ scale: 1.3, zIndex: 10 }}
                          className={cn(
                            'w-3 h-3 rounded-[3px] transition-all duration-300',
                            getColor(day.level)
                          )}
                        />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-all z-50 transform group-hover:-translate-y-1">
                          <div className="bg-surface-2 border border-border rounded-xl p-3 shadow-xl whitespace-nowrap">
                            <p className="text-[10px] font-black text-text tracking-tight">{format(day.date, 'PPPP')}</p>
                            <p className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 inline-block rounded-full bg-emerald-400" />
                              {day.hours} hours studied
                            </p>
                          </div>
                          <div className="w-2.5 h-2.5 bg-surface-2 border-r border-b border-border rotate-45 absolute -bottom-[5px] left-1/2 -translate-x-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-t border-border pt-6">
        <div className="flex items-center gap-3">
           <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
           <p className="text-xs text-slate-500 font-medium italic">"Consistency is the key to mastery."</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-600">
          <span className="uppercase tracking-widest text-[8px]">Less Activity</span>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map(l => (
              <div key={l} className={cn("w-3.5 h-3.5 rounded-[3px]", getColor(l))} />
            ))}
          </div>
          <span className="uppercase tracking-widest text-[8px]">More Activity</span>
        </div>
      </div>
    </div>
  );
}
