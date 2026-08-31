import React from 'react';
import { 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  DollarSign, 
  Clock, 
  ListTodo,
  TrendingUp
} from 'lucide-react';
import { MaintenanceLog, MaintenanceTask } from '../types';
import { getDueStatus } from '../utils/dateUtils';

interface StatsBarProps {
  tasks: MaintenanceTask[];
  logs: MaintenanceLog[];
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
  onOpenHistory: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  tasks,
  logs,
  activeFilter,
  onSelectFilter,
  onOpenHistory,
}) => {
  const activeTasks = tasks.filter((t) => t.status !== 'completed');
  
  const overdueCount = activeTasks.filter(
    (t) => getDueStatus(t.dueDate, t.status) === 'overdue'
  ).length;

  const dueTodayCount = activeTasks.filter(
    (t) => getDueStatus(t.dueDate, t.status) === 'today'
  ).length;

  const dueThisWeekCount = activeTasks.filter((t) => {
    const status = getDueStatus(t.dueDate, t.status);
    return status === 'today' || status === 'tomorrow' || status === 'upcoming';
  }).length;

  const totalCostRecorded = logs.reduce((sum, log) => sum + (log.costSpent || 0), 0);

  return (
    <div id="stats-overview-panel" className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {/* Overdue Card */}
      <button
        id="stat-filter-overdue-btn"
        onClick={() => onSelectFilter(activeFilter === 'overdue' ? 'all' : 'overdue')}
        className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
          activeFilter === 'overdue'
            ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-200'
            : overdueCount > 0
            ? 'bg-rose-50/70 border-rose-200 hover:border-rose-300 hover:bg-rose-50'
            : 'bg-white border-stone-200 hover:border-stone-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
            <AlertCircle className={`w-3.5 h-3.5 ${overdueCount > 0 ? 'text-rose-600' : 'text-stone-400'}`} />
            Overdue
          </span>
          <span className={`text-xl font-bold ${overdueCount > 0 ? 'text-rose-700' : 'text-stone-500'}`}>
            {overdueCount}
          </span>
        </div>
        <p className="text-xs text-stone-500 mt-1 font-medium">
          {overdueCount === 0 ? 'Everything on schedule' : 'Requires immediate attention'}
        </p>
      </button>

      {/* Due This Week */}
      <button
        id="stat-filter-upcoming-btn"
        onClick={() => onSelectFilter(activeFilter === 'week' ? 'all' : 'week')}
        className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
          activeFilter === 'week'
            ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-200'
            : 'bg-white border-stone-200 hover:border-stone-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            Next 7 Days
          </span>
          <span className="text-xl font-bold text-sky-900">
            {dueThisWeekCount}
          </span>
        </div>
        <p className="text-xs text-stone-500 mt-1 font-medium">
          {dueTodayCount > 0 ? `${dueTodayCount} due today` : 'Upcoming routine tasks'}
        </p>
      </button>

      {/* Active Tasks */}
      <button
        id="stat-filter-all-btn"
        onClick={() => onSelectFilter('all')}
        className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
          activeFilter === 'all'
            ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-200'
            : 'bg-white border-stone-200 hover:border-stone-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
            <ListTodo className="w-3.5 h-3.5 text-amber-600" />
            Active Tasks
          </span>
          <span className="text-xl font-bold text-stone-900">
            {activeTasks.length}
          </span>
        </div>
        <p className="text-xs text-stone-500 mt-1 font-medium">
          {tasks.filter((t) => t.recurrence.type !== 'none').length} recurring schedules
        </p>
      </button>

      {/* Service History & Spend */}
      <button
        id="stat-view-history-btn"
        onClick={onOpenHistory}
        className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-all duration-200 cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Service History
          </span>
          <span className="text-xl font-bold text-emerald-900">
            {logs.length}
          </span>
        </div>
        <p className="text-xs text-stone-500 mt-1 font-medium flex items-center gap-1">
          <span>${totalCostRecorded.toFixed(2)} logged spend</span>
          <span className="text-emerald-600 group-hover:translate-x-0.5 transition-transform">→</span>
        </p>
      </button>
    </div>
  );
};
