import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Sparkles, 
  Tv, 
  History, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Wrench, 
  ShieldCheck,
  CheckCircle2, 
  Calendar, 
  AlertCircle, 
  RotateCcw, 
  Download, 
  Layers, 
  SlidersHorizontal,
  ChevronRight,
  ListTodo,
  RefreshCw
} from 'lucide-react';
import { Asset, Category, MaintenanceLog, MaintenanceTask, MaintenanceTemplate, Priority } from './types';
import { DEFAULT_ASSETS, DEFAULT_LOGS, DEFAULT_TASKS } from './data/defaultData';
import { StatsBar } from './components/StatsBar';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { CompleteTaskModal } from './components/CompleteTaskModal';
import { MaintenanceTemplatesModal } from './components/MaintenanceTemplatesModal';
import { AssetManagerModal } from './components/AssetManagerModal';
import { ServiceHistoryModal } from './components/ServiceHistoryModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { getCategoryLabel } from './utils/categoryHelpers';
import { calculateNextDueDate, getDueStatus, getTodayString } from './utils/dateUtils';

const STORAGE_KEY_TASKS = 'maint_tasks_v1';
const STORAGE_KEY_ASSETS = 'maint_assets_v1';
const STORAGE_KEY_LOGS = 'maint_logs_v1';

export default function App() {
  // Persistence state
  const [tasks, setTasks] = useState<MaintenanceTask[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TASKS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved tasks', e);
      }
    }
    return DEFAULT_TASKS;
  });

  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ASSETS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved assets', e);
      }
    }
    return DEFAULT_ASSETS;
  });

  const [logs, setLogs] = useState<MaintenanceLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LOGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved logs', e);
      }
    }
    return DEFAULT_LOGS;
  });

  // Toasts state for instant auto-refresh feedback
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [, setTick] = useState(0);

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'success') => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);
    const newToast: ToastMessage = { id, type, message, timestamp: Date.now() };
    setToasts((prev) => [...prev.slice(-3), newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to localStorage and update sync timestamp
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(assets));
    setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
    setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, [logs]);

  // Automatic cross-tab and cross-window synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_TASKS && e.newValue) {
        try {
          setTasks(JSON.parse(e.newValue));
          showToast('Tasks synchronized from another tab', 'info');
        } catch (err) {
          console.error(err);
        }
      }
      if (e.key === STORAGE_KEY_ASSETS && e.newValue) {
        try {
          setAssets(JSON.parse(e.newValue));
        } catch (err) {
          console.error(err);
        }
      }
      if (e.key === STORAGE_KEY_LOGS && e.newValue) {
        try {
          setLogs(JSON.parse(e.newValue));
        } catch (err) {
          console.error(err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [showToast]);

  // Auto-refresh timer to update due dates and status in real-time every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 30000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setTick((t) => t + 1);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Manual refresh trigger
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    // Reload directly from localStorage or trigger re-render
    const savedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error(e);
      }
    }
    const savedAssets = localStorage.getItem(STORAGE_KEY_ASSETS);
    if (savedAssets) {
      try {
        setAssets(JSON.parse(savedAssets));
      } catch (e) {
        console.error(e);
      }
    }
    const savedLogs = localStorage.getItem(STORAGE_KEY_LOGS);
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch (e) {
        console.error(e);
      }
    }
    setTick((t) => t + 1);
    setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('All tasks & maintenance records refreshed', 'refresh');
    }, 400);
  };

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('all');
  const [activeQuickFilter, setActiveQuickFilter] = useState<string>('all'); // 'all', 'overdue', 'week'
  const [statusTab, setStatusTab] = useState<'active' | 'completed'>('active');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title' | 'createdAt'>('dueDate');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<MaintenanceTask | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<MaintenanceTask | null>(null);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isAssetsModalOpen, setIsAssetsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Handlers for Tasks with Auto-Refresh & Instant Feedback
  const handleSaveTask = (taskData: Omit<MaintenanceTask, 'id' | 'createdAt'>, taskId?: string) => {
    if (taskId) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...taskData } : t))
      );
      showToast(`Task "${taskData.title}" updated and auto-saved`);
    } else {
      const newTask: MaintenanceTask = {
        ...taskData,
        id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
      showToast(`New task "${taskData.title}" added to schedule`);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    if (window.confirm(`Delete task "${target?.title || 'this task'}"?`)) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      showToast('Task removed from schedule', 'alert');
    }
  };

  const handleToggleChecklistItem = (taskId: string, itemId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedChecklist = t.checklist.map((c) =>
          c.id === itemId ? { ...c, completed: !c.completed } : c
        );
        return { ...t, checklist: updatedChecklist };
      })
    );
    showToast('Checklist updated & auto-saved', 'info');
  };

  const handlePostponeTask = (taskId: string, days: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const parts = t.dueDate.split('-');
        let d = new Date();
        if (parts.length === 3) {
          d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        }
        d.setDate(d.getDate() + days);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return { ...t, dueDate: `${y}-${m}-${day}` };
      })
    );
    showToast(`Task postponed by ${days} day${days > 1 ? 's' : ''}`);
  };

  const handleQuickToggleStatus = (task: MaintenanceTask) => {
    if (task.status === 'completed') {
      // Revert to pending
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: 'pending' } : t))
      );
      showToast(`Task marked as active`);
    } else {
      // Open complete dialog for service logging
      setTaskToComplete(task);
      setIsCompleteModalOpen(true);
    }
  };

  const handleConfirmComplete = (
    task: MaintenanceTask,
    logData: Omit<MaintenanceLog, 'id'>,
    nextDueDate?: string
  ) => {
    // 1. Create log record
    const newLog: MaintenanceLog = {
      ...logData,
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    };
    setLogs((prev) => [newLog, ...prev]);

    // 2. Update task
    if (nextDueDate && task.recurrence && task.recurrence.type !== 'none') {
      // Advance to next cycle: reset checklist items and update dueDate
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== task.id) return t;
          const resetChecklist = t.checklist.map((c) => ({ ...c, completed: false }));
          return {
            ...t,
            dueDate: nextDueDate,
            status: 'pending',
            lastCompletedDate: getTodayString(),
            checklist: resetChecklist,
          };
        })
      );
      showToast(`Service logged & next cycle scheduled for ${nextDueDate}`);
    } else {
      // Mark as completed
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? { ...t, status: 'completed', lastCompletedDate: getTodayString() }
            : t
        )
      );
      showToast(`Task completed and saved to history logbook`);
    }
  };

  // Add from templates library
  const handleAddFromTemplate = (template: MaintenanceTemplate, assetId?: string) => {
    const asset = assets.find((a) => a.id === assetId);
    const checklistItems = template.checklist.map((text, idx) => ({
      id: `c_${idx}_${Date.now()}`,
      title: text,
      completed: false,
    }));

    const newTask: MaintenanceTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: template.title,
      description: template.description,
      category: template.category,
      assetId: asset ? asset.id : undefined,
      assetName: asset ? asset.name : undefined,
      priority: template.defaultPriority,
      status: 'pending',
      dueDate: calculateNextDueDate(new Date(), template.defaultRecurrence),
      estimatedTimeMinutes: template.suggestedEstimatedMinutes,
      estimatedCost: template.suggestedEstimatedCost,
      recurrence: template.defaultRecurrence,
      checklist: checklistItems,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    showToast(`Template "${template.title}" applied & auto-scheduled`);
  };

  // Asset handlers
  const handleAddAsset = (assetData: Omit<Asset, 'id' | 'createdAt'>) => {
    const newAsset: Asset = {
      ...assetData,
      id: 'asset_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setAssets((prev) => [...prev, newAsset]);
    showToast(`Equipment "${assetData.name}" added`);
  };

  const handleUpdateAsset = (id: string, assetData: Omit<Asset, 'id' | 'createdAt'>) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...assetData } : a))
    );
    // Update linked tasks
    setTasks((prev) =>
      prev.map((t) =>
        t.assetId === id ? { ...t, assetName: assetData.name } : t
      )
    );
    showToast(`Equipment "${assetData.name}" updated`);
  };

  const handleDeleteAsset = (id: string) => {
    if (window.confirm('Delete this asset? Existing tasks will remain but lose asset link.')) {
      setAssets((prev) => prev.filter((a) => a.id !== id));
      setTasks((prev) =>
        prev.map((t) =>
          t.assetId === id ? { ...t, assetId: undefined, assetName: undefined } : t
        )
      );
      showToast('Equipment removed', 'alert');
    }
  };

  // History log handlers
  const handleDeleteLog = (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
    showToast('Log entry removed', 'alert');
  };

  const handleClearLogs = () => {
    setLogs([]);
    showToast('Logbook history cleared', 'alert');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all maintenance tasks, equipment, and logs to sample data?')) {
      setTasks(DEFAULT_TASKS);
      setAssets(DEFAULT_ASSETS);
      setLogs(DEFAULT_LOGS);
      showToast('Restored default maintenance schedule', 'refresh');
    }
  };

  // Filtered and Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Tab filter
      if (statusTab === 'active' && task.status === 'completed') return false;
      if (statusTab === 'completed' && task.status !== 'completed') return false;

      // Quick filter
      if (activeQuickFilter === 'overdue') {
        if (getDueStatus(task.dueDate, task.status) !== 'overdue') return false;
      } else if (activeQuickFilter === 'week') {
        const s = getDueStatus(task.dueDate, task.status);
        if (s !== 'today' && s !== 'tomorrow' && s !== 'upcoming') return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(term);
        const matchesDesc = task.description?.toLowerCase().includes(term) ?? false;
        const matchesAsset = task.assetName?.toLowerCase().includes(term) ?? false;
        const matchesLocation = task.location?.toLowerCase().includes(term) ?? false;
        const matchesChecklist = task.checklist.some((c) => c.title.toLowerCase().includes(term));
        if (!matchesTitle && !matchesDesc && !matchesAsset && !matchesLocation && !matchesChecklist) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && task.category !== selectedCategory) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
        return false;
      }

      // Asset filter
      if (selectedAssetId !== 'all' && task.assetId !== selectedAssetId) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'dueDate') {
        return (a.dueDate || '').localeCompare(b.dueDate || '');
      }
      if (sortBy === 'priority') {
        const priorityOrder: Record<Priority, number> = {
          critical: 0,
          high: 1,
          medium: 2,
          low: 3,
        };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'createdAt') {
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      }
      return 0;
    });
  }, [
    tasks,
    statusTab,
    activeQuickFilter,
    searchTerm,
    selectedCategory,
    selectedPriority,
    selectedAssetId,
    sortBy,
  ]);

  const overdueCount = tasks.filter(
    (t) => t.status !== 'completed' && getDueStatus(t.dueDate, t.status) === 'overdue'
  ).length;

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 font-sans antialiased pb-20">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div 
              id="app-header-logo"
              className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center shadow-xs shrink-0 relative overflow-hidden"
              title="Maintenance Operations & Asset Tracking"
            >
              {/* Realistic Industrial Gear & Shield Mark */}
              <svg className="w-6 h-6 text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                {/* Outer cog / gear teeth */}
                <path d="M12 2v2m0 16v2M2 12h2m16 0h2m-3.05-6.95l-1.41 1.41M6.46 17.54l-1.41 1.41M18.95 18.95l-1.41-1.41M6.46 6.46L5.05 5.05" stroke="currentColor" opacity="0.4" />
                {/* Central Shield Plate */}
                <path d="M12 4.5l6 2.5v5c0 4.5-3 7.5-6 9-3-1.5-6-4.5-6-9V7l6-2.5z" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
                {/* Golden Safety Checkmark */}
                <path d="M9.5 12l2 2 3.5-3.5" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  Maintenance Task Tracker
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-300">
                  OPS
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal hidden sm:block">
                Equipment schedules, routine inspections & service logs
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Sync & Auto-Refresh Indicator + Manual Refresh */}
            <div className="hidden lg:flex items-center gap-2 pl-2 pr-3 py-1 bg-stone-100/90 rounded-xl border border-stone-200 text-[11px] text-stone-600">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium text-stone-700">Auto-Synced</span>
              <button
                id="header-manual-refresh-btn"
                onClick={handleManualRefresh}
                title="Refresh schedule & sync state"
                className={`p-1 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-all cursor-pointer ${
                  isRefreshing ? 'animate-spin text-amber-600' : ''
                }`}
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            {/* Library / Templates Button */}
            <button
              id="header-open-templates-btn"
              onClick={() => setIsTemplatesModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Browse standard maintenance checklist templates"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Templates Library</span>
            </button>

            {/* Equipment / Assets Button */}
            <button
              id="header-open-assets-btn"
              onClick={() => setIsAssetsModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Manage vehicles and equipment"
            >
              <Tv className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden md:inline">Equipment ({assets.length})</span>
            </button>

            {/* Service Logbook */}
            <button
              id="header-open-history-btn"
              onClick={() => setIsHistoryModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="View completed maintenance records & spend"
            >
              <History className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Logbook ({logs.length})</span>
            </button>

            {/* Primary New Task Action */}
            <button
              id="header-add-task-btn"
              onClick={() => {
                setTaskToEdit(null);
                setIsTaskModalOpen(true);
              }}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-white bg-amber-600 hover:bg-amber-700 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* Overdue alert banner if overdue tasks exist */}
        {overdueCount > 0 && activeQuickFilter !== 'overdue' && (
          <div
            id="overdue-reminder-banner"
            onClick={() => setActiveQuickFilter('overdue')}
            className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-300 flex items-center justify-between cursor-pointer hover:bg-rose-100/70 transition-colors"
          >
            <div className="flex items-center gap-2.5 text-xs font-semibold text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>
                {overdueCount === 1
                  ? 'You have 1 overdue maintenance task requiring attention.'
                  : `You have ${overdueCount} overdue maintenance tasks requiring attention.`}
              </span>
            </div>
            <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
              View Overdue Tasks <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        )}

        {/* Stats and filter summary strip */}
        <StatsBar
          tasks={tasks}
          logs={logs}
          activeFilter={activeQuickFilter}
          onSelectFilter={(f) => setActiveQuickFilter(f)}
          onOpenHistory={() => setIsHistoryModalOpen(true)}
        />

        {/* Search, Status Tabs & Filters Section */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-6 shadow-2xs space-y-3">
          {/* Row 1: Search & Status Tabs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                id="search-tasks-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search maintenance tasks, assets, checklist steps, locations..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Active vs Completed Tab Toggle */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 shrink-0 w-full sm:w-auto">
              <button
                id="tab-active-tasks-btn"
                onClick={() => setStatusTab('active')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusTab === 'active'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Active Schedule ({tasks.filter((t) => t.status !== 'completed').length})
              </button>
              <button
                id="tab-completed-tasks-btn"
                onClick={() => setStatusTab('completed')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusTab === 'completed'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Completed Archive ({tasks.filter((t) => t.status === 'completed').length})
              </button>
            </div>
          </div>

          {/* Row 2: Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'appliances', label: 'Appliances & HVAC' },
              { id: 'vehicle', label: 'Vehicle' },
              { id: 'safety', label: 'Safety & Alarms' },
              { id: 'home', label: 'Home Exterior' },
              { id: 'plumbing', label: 'Plumbing' },
              { id: 'electrical', label: 'Electrical' },
              { id: 'garden', label: 'Lawn & Garden' },
              { id: 'tech', label: 'Tech' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg border whitespace-nowrap transition-colors font-medium cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-stone-900 text-white border-stone-900 font-semibold'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Row 3: Secondary Filters (Priority, Asset, Sort) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* Asset Filter */}
              {assets.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-stone-500 font-medium">Asset:</span>
                  <select
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    className="px-2 py-1 border border-stone-300 rounded-lg bg-white text-stone-800"
                  >
                    <option value="all">All Equipment</option>
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Priority Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-stone-500 font-medium">Priority:</span>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-2 py-1 border border-stone-300 rounded-lg bg-white text-stone-800"
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Quick filter clear indicator if active */}
              {activeQuickFilter !== 'all' && (
                <button
                  onClick={() => setActiveQuickFilter('all')}
                  className="px-2 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Filter: {activeQuickFilter === 'overdue' ? 'Overdue Only' : 'Next 7 Days'}</span>
                  <span className="text-amber-600">✕</span>
                </button>
              )}
            </div>

            {/* Sort by */}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-stone-500 font-medium flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
                Sort:
              </span>
              <select
                id="sort-by-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2 py-1 border border-stone-300 rounded-lg bg-white text-stone-800"
              >
                <option value="dueDate">Due Date (Earliest)</option>
                <option value="priority">Priority (Highest first)</option>
                <option value="title">Title (Alphabetical)</option>
                <option value="createdAt">Recently Added</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task Cards Grid / List */}
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-3">
              <ListTodo className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-800">No maintenance tasks match your filters</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 leading-relaxed">
              {tasks.length === 0
                ? 'Your maintenance schedule is empty. Create a custom task or load from our standard procedure library.'
                : 'Try adjusting your search query, category, priority, or status filters.'}
            </p>
            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedPriority('all');
                  setSelectedAssetId('all');
                  setActiveQuickFilter('all');
                }}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 cursor-pointer"
              >
                Clear All Filters
              </button>
              <button
                onClick={() => setIsTemplatesModalOpen(true)}
                className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Browse Templates
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs text-stone-500 font-medium px-1">
              <span>
                Showing {filteredTasks.length} {statusTab === 'active' ? 'active' : 'completed'} task{filteredTasks.length === 1 ? '' : 's'}
              </span>
              <span className="hidden sm:inline">
                Click checkbox or "Complete Service" to record logs and schedule next cycle
              </span>
            </div>

            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleChecklistItem={handleToggleChecklistItem}
                onOpenCompleteModal={(t) => {
                  setTaskToComplete(t);
                  setIsCompleteModalOpen(true);
                }}
                onEdit={(t) => {
                  setTaskToEdit(t);
                  setIsTaskModalOpen(true);
                }}
                onDelete={handleDeleteTask}
                onPostpone={handlePostponeTask}
                onQuickToggleStatus={handleQuickToggleStatus}
              />
            ))}
          </div>
        )}

        {/* Footer controls: Reset data / Backup info */}
        <div className="mt-12 pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-stone-400" />
            <span>Maintenance Task Tracker • Client-side Local Storage</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleResetData}
              className="text-stone-500 hover:text-stone-800 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Sample Data
            </button>
          </div>
        </div>
      </main>

      {/* Modals */}
      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setTaskToEdit(null);
          }}
          onSave={handleSaveTask}
          taskToEdit={taskToEdit}
          assets={assets}
        />
      )}

      {isCompleteModalOpen && (
        <CompleteTaskModal
          isOpen={isCompleteModalOpen}
          onClose={() => {
            setIsCompleteModalOpen(false);
            setTaskToComplete(null);
          }}
          task={taskToComplete}
          onConfirmComplete={handleConfirmComplete}
        />
      )}

      {isTemplatesModalOpen && (
        <MaintenanceTemplatesModal
          isOpen={isTemplatesModalOpen}
          onClose={() => setIsTemplatesModalOpen(false)}
          onAddFromTemplate={handleAddFromTemplate}
          assets={assets}
        />
      )}

      {isAssetsModalOpen && (
        <AssetManagerModal
          isOpen={isAssetsModalOpen}
          onClose={() => setIsAssetsModalOpen(false)}
          assets={assets}
          tasks={tasks}
          logs={logs}
          onAddAsset={handleAddAsset}
          onUpdateAsset={handleUpdateAsset}
          onDeleteAsset={handleDeleteAsset}
        />
      )}

      {isHistoryModalOpen && (
        <ServiceHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          logs={logs}
          onDeleteLog={handleDeleteLog}
          onClearLogs={handleClearLogs}
        />
      )}

      {/* Auto-Refresh Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
