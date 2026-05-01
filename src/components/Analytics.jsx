import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { format, subDays, isSameDay } from 'date-fns';
import { TrendingUp, Clock, Zap, Calendar } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel-strong rounded-xl px-4 py-3 text-sm shadow-xl">
        <p className="text-text-muted mb-1 font-bold text-[10px] uppercase tracking-widest">{label}</p>
        <p className="font-bold text-text text-base">{payload[0].value.toFixed(1)}h studied</p>
      </div>
    );
  }
  return null;
};

export default function Analytics({ studyLogs }) {
  const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), 6 - i));

  const chartData = last7Days.map(date => {
    const dayLogs = studyLogs.filter(log => isSameDay(new Date(log.date), date));
    const totalHours = dayLogs.reduce((sum, log) => sum + Number(log.hours || 0), 0);
    return { day: format(date, 'EEE'), fullDate: format(date, 'MMM dd'), hours: totalHours };
  });

  const maxHours = Math.max(...chartData.map(d => d.hours), 1);
  const totalWeek = chartData.reduce((sum, item) => sum + item.hours, 0);
  const avg = totalWeek / 7;
  const bestDay = chartData.reduce((max, obj) => obj.hours > max.hours ? obj : max, chartData[0]);
  const studyDays = chartData.filter(d => d.hours > 0).length;

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1 text-text">Analytics & Trends</h2>
        <p className="text-text-muted text-sm font-medium">Visualize your growth and study consistency.</p>
      </div>

      {/* Mini stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: <Clock className="w-4 h-4" />, label: 'Total This Week', value: `${totalWeek.toFixed(1)}h`, color: 'text-violet-400 bg-violet-500/15' },
          { icon: <TrendingUp className="w-4 h-4" />, label: 'Daily Average', value: `${avg.toFixed(1)}h`, color: 'text-blue-400 bg-blue-500/15' },
          { icon: <Zap className="w-4 h-4" />, label: 'Best Day', value: bestDay.hours > 0 ? `${bestDay.day} (${bestDay.hours}h)` : '—', color: 'text-amber-400 bg-amber-500/15' },
          { icon: <Calendar className="w-4 h-4" />, label: 'Active Days', value: `${studyDays}/7`, color: 'text-emerald-400 bg-emerald-500/15' },
        ].map(({ icon, label, value, color }) => (
          <div key={label} className="glass-panel rounded-2xl p-4 card-lift">
            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mb-3 ${color}`}>{icon}</div>
            <p className="text-[10px] text-text-muted mb-1 font-black uppercase tracking-widest">{label}</p>
            <p className="font-black text-text text-base leading-tight">{value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-black text-text text-lg tracking-tight">Daily Performance</h3>
            <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-black mt-1">Activity Chart</p>
          </div>
          <span className="text-[10px] text-text-muted bg-surface-2 px-2.5 py-1 rounded-full font-black uppercase tracking-widest border border-border">Last 7 days</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" vertical={false} className="text-border/30" />
              <XAxis dataKey="day" axisLine={false} tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={8} />
              <YAxis axisLine={false} tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
                domain={[0, Math.ceil(maxHours + 0.5)]} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139,92,246,0.06)', radius: 8 }} />
              <Bar dataKey="hours" radius={[6, 6, 2, 2]} barSize={32} animationDuration={1200}>
                {chartData.map((entry, index) => (
                  <Cell key={index}
                      fill={entry.hours === maxHours && entry.hours > 0
                        ? 'url(#barGradBest)'
                        : entry.hours > 0 ? 'url(#barGrad)' : 'currentColor'}
                      className={entry.hours === 0 ? 'text-border/20' : ''}
                  />
                ))}
              </Bar>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="barGradBest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity={0.8} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
