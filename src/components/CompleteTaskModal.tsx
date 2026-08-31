import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  Clock, 
  Wrench, 
  Repeat, 
  FileText,
  CheckSquare,
  Square
} from 'lucide-react';
import { MaintenanceTask, MaintenanceLog } from '../types';
import { calculateNextDueDate, formatDate, formatRecurrenceLabel, getTodayString } from '../utils/dateUtils';
import { getCategoryLabel } from '../utils/categoryHelpers';

interface CompleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: MaintenanceTask | null;
  onConfirmComplete: (
    task: MaintenanceTask,
    logData: Omit<MaintenanceLog, 'id'>,
    nextDueDate?: string
  ) => void;
}

export const CompleteTaskModal: React.FC<CompleteTaskModalProps> = ({
  isOpen,
  onClose,
  task,
  onConfirmComplete,
}) => {
  const [costSpent, setCostSpent] = useState<string>('');
  const [timeSpent, setTimeSpent] = useState<string>('');
  const [performedBy, setPerformedBy] = useState<string>('Self');
  const [notes, setNotes] = useState<string>('');
  const [partsUsed, setPartsUsed] = useState<string>('');
  const [rescheduleNext, setRescheduleNext] = useState<boolean>(true);
  const [nextDueDate, setNextDueDate] = useState<string>('');
  const [checklistState, setChecklistState] = useState<{ id: string; completed: boolean }[]>([]);

  useEffect(() => {
    if (task) {
      setCostSpent(task.estimatedCost !== undefined ? String(task.estimatedCost) : '0');
      setTimeSpent(task.estimatedTimeMinutes !== undefined ? String(task.estimatedTimeMinutes) : '30');
      setPerformedBy(task.serviceProvider || 'Self');
      setNotes('');
      setPartsUsed('');
      setChecklistState(
        task.checklist ? task.checklist.map((c) => ({ id: c.id, completed: true })) : []
      );

      if (task.recurrence && task.recurrence.type !== 'none') {
        setRescheduleNext(true);
        const next = calculateNextDueDate(new Date(), task.recurrence);
        setNextDueDate(next);
      } else {
        setRescheduleNext(false);
        setNextDueDate('');
      }
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleToggleChecklistItem = (id: string) => {
    setChecklistState((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleCheckAll = () => {
    setChecklistState((prev) => prev.map((item) => ({ ...item, completed: true })));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const logData: Omit<MaintenanceLog, 'id'> = {
      taskId: task.id,
      taskTitle: task.title,
      category: task.category,
      assetName: task.assetName,
      completedAt: new Date().toISOString(),
      costSpent: costSpent ? parseFloat(costSpent) : 0,
      timeSpentMinutes: timeSpent ? parseInt(timeSpent, 10) : 0,
      performedBy: performedBy.trim() || 'Self',
      notes: notes.trim() || undefined,
      partsUsed: partsUsed.trim() || undefined,
    };

    onConfirmComplete(
      task,
      logData,
      rescheduleNext && nextDueDate ? nextDueDate : undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="complete-task-modal-container"
        className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-stone-200 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-emerald-50/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Record Maintenance Service</h2>
              <p className="text-xs text-stone-500 font-medium">
                Log completed service details, parts, costs, and schedule next recurrence
              </p>
            </div>
          </div>
          <button
            id="close-complete-task-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Task Summary Banner */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                {getCategoryLabel(task.category)}
              </span>
              {task.recurrence.type !== 'none' && (
                <span className="text-xs font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                  <Repeat className="w-3 h-3" />
                  {formatRecurrenceLabel(task.recurrence)}
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-stone-900">{task.title}</h3>
            {task.assetName && (
              <p className="text-xs text-stone-600 font-medium">
                Asset: <span className="text-stone-800 font-semibold">{task.assetName}</span>
              </p>
            )}
          </div>

          {/* Checklist validation */}
          {task.checklist && task.checklist.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Verify Checklist Steps
                </label>
                <button
                  type="button"
                  onClick={handleCheckAll}
                  className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
                >
                  Mark All Completed
                </button>
              </div>
              <div className="space-y-1 bg-stone-50 p-2.5 rounded-xl border border-stone-200 max-h-36 overflow-y-auto">
                {task.checklist.map((item) => {
                  const isChecked = checklistState.find((c) => c.id === item.id)?.completed ?? false;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggleChecklistItem(item.id)}
                      className={`w-full flex items-center gap-2 p-1.5 rounded-md text-left text-xs transition-colors cursor-pointer ${
                        isChecked ? 'text-stone-600 bg-emerald-50/50' : 'text-stone-800 bg-white'
                      }`}
                    >
                      <span className="text-emerald-600 shrink-0">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-400" />
                        )}
                      </span>
                      <span className={isChecked ? 'line-through text-stone-400' : 'font-medium'}>
                        {item.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cost and Time spent */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Actual Cost Spent ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-400 text-xs">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={costSpent}
                  onChange={(e) => setCostSpent(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Time Spent (Minutes)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 text-stone-400 w-3.5 h-3.5" />
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={timeSpent}
                  onChange={(e) => setTimeSpent(e.target.value)}
                  placeholder="30"
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Performed By & Parts Used */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Performed By
              </label>
              <input
                type="text"
                value={performedBy}
                onChange={(e) => setPerformedBy(e.target.value)}
                placeholder="Self / HVAC Tech John"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Parts / Supplies Used
              </label>
              <input
                type="text"
                value={partsUsed}
                onChange={(e) => setPartsUsed(e.target.value)}
                placeholder="e.g. Filter #2025, 5qt 0W-20"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Service Log Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Service Notes & Observations
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Coils cleaned, no leaks detected, next check recommended before winter..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Recurrence & Next Due Date handling */}
          {task.recurrence && task.recurrence.type !== 'none' && (
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800">
                <input
                  type="checkbox"
                  checked={rescheduleNext}
                  onChange={(e) => setRescheduleNext(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span>Automatically schedule next routine maintenance cycle</span>
              </label>

              {rescheduleNext && (
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs text-stone-600 font-medium">Next Due Date:</span>
                  <input
                    type="date"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="px-2.5 py-1 text-xs border border-stone-300 rounded-lg bg-white"
                  />
                  <span className="text-[11px] text-stone-500">
                    ({formatRecurrenceLabel(task.recurrence)})
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="confirm-complete-service-btn"
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              {rescheduleNext ? 'Save Log & Schedule Next Cycle' : 'Save Log & Mark Completed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
