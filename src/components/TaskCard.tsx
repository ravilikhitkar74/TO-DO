import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Repeat, 
  CheckSquare, 
  Square, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  MapPin, 
  UserCheck, 
  CornerDownRight,
  Sparkles,
  CalendarPlus,
  History
} from 'lucide-react';
import { MaintenanceTask } from '../types';
import { 
  formatDate, 
  formatRecurrenceLabel, 
  getDueLabel, 
  getDueStatus 
} from '../utils/dateUtils';
import { 
  getCategoryBadgeStyle, 
  getCategoryIcon, 
  getCategoryLabel, 
  getPriorityBadge 
} from '../utils/categoryHelpers';

interface TaskCardProps {
  task: MaintenanceTask;
  onToggleChecklistItem: (taskId: string, itemId: string) => void;
  onOpenCompleteModal: (task: MaintenanceTask) => void;
  onEdit: (task: MaintenanceTask) => void;
  onDelete: (taskId: string) => void;
  onPostpone: (taskId: string, days: number) => void;
  onQuickToggleStatus: (task: MaintenanceTask) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleChecklistItem,
  onOpenCompleteModal,
  onEdit,
  onDelete,
  onPostpone,
  onQuickToggleStatus,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showPostponeMenu, setShowPostponeMenu] = useState<boolean>(false);

  const dueInfo = getDueLabel(task.dueDate, task.status);
  const dueStatus = getDueStatus(task.dueDate, task.status);
  const priorityInfo = getPriorityBadge(task.priority);
  const completedChecklistCount = task.checklist.filter((i) => i.completed).length;
  const totalChecklistCount = task.checklist.length;
  const checklistPercent = totalChecklistCount > 0 
    ? Math.round((completedChecklistCount / totalChecklistCount) * 100) 
    : 0;

  const isCompleted = task.status === 'completed';

  return (
    <div
      id={`task-card-${task.id}`}
      className={`group relative rounded-xl border transition-all duration-200 bg-white ${
        isCompleted
          ? 'border-stone-200 bg-stone-50/70 opacity-75'
          : dueStatus === 'overdue'
          ? 'border-rose-300 shadow-xs hover:border-rose-400 hover:shadow-sm'
          : dueStatus === 'today'
          ? 'border-amber-300 shadow-xs hover:border-amber-400 hover:shadow-sm'
          : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          {/* Main Left Section: Checkbox & Info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <button
              id={`task-complete-trigger-${task.id}`}
              onClick={() => onOpenCompleteModal(task)}
              title="Record Maintenance & Complete"
              className={`mt-0.5 w-6 h-6 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                isCompleted
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'border-stone-300 text-transparent hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600'
              }`}
            >
              <Check className="w-4 h-4" />
            </button>

            <div className="flex-1 min-w-0">
              {/* Header tags: Priority, Category, Due date */}
              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                {/* Priority */}
                <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${priorityInfo.style}`}>
                  {priorityInfo.icon}
                  {priorityInfo.label}
                </span>

                {/* Category */}
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${getCategoryBadgeStyle(task.category)}`}>
                  {getCategoryIcon(task.category, 'w-3 h-3')}
                  {getCategoryLabel(task.category)}
                </span>

                {/* Due status badge */}
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${dueInfo.color}`}>
                  <Calendar className="w-3 h-3" />
                  {dueInfo.label}
                </span>

                {/* Recurrence badge */}
                {task.recurrence.type !== 'none' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border border-stone-200 bg-stone-100 text-stone-700">
                    <Repeat className="w-3 h-3 text-stone-500" />
                    {formatRecurrenceLabel(task.recurrence)}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className={`text-base font-semibold text-stone-900 leading-snug break-words ${isCompleted ? 'line-through text-stone-500' : ''}`}>
                {task.title}
              </h3>

              {/* Asset Name & Location */}
              {(task.assetName || task.location) && (
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 mt-1 font-medium">
                  {task.assetName && (
                    <span className="flex items-center gap-1 text-stone-700 font-semibold bg-stone-100 px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      {task.assetName}
                    </span>
                  )}
                  {task.location && (
                    <span className="flex items-center gap-1 text-stone-500">
                      <MapPin className="w-3 h-3" />
                      {task.location}
                    </span>
                  )}
                </div>
              )}

              {/* Description */}
              {task.description && (
                <p className="text-sm text-stone-600 mt-2 leading-relaxed line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {/* Top-Right Quick Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              id={`task-log-service-btn-${task.id}`}
              onClick={() => onOpenCompleteModal(task)}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Complete Service
            </button>

            {/* Postpone button */}
            <div className="relative">
              <button
                id={`task-snooze-btn-${task.id}`}
                onClick={() => setShowPostponeMenu(!showPostponeMenu)}
                title="Postpone / Reschedule"
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <CalendarPlus className="w-4 h-4" />
              </button>

              {showPostponeMenu && (
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-stone-200 py-1 z-20 text-xs font-medium text-stone-700">
                  <div className="px-2.5 py-1 text-[10px] uppercase font-semibold tracking-wider text-stone-400">
                    Reschedule
                  </div>
                  <button
                    onClick={() => {
                      onPostpone(task.id, 1);
                      setShowPostponeMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-stone-50 text-stone-700"
                  >
                    +1 Day (Tomorrow)
                  </button>
                  <button
                    onClick={() => {
                      onPostpone(task.id, 3);
                      setShowPostponeMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-stone-50 text-stone-700"
                  >
                    +3 Days
                  </button>
                  <button
                    onClick={() => {
                      onPostpone(task.id, 7);
                      setShowPostponeMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-stone-50 text-stone-700"
                  >
                    +1 Week
                  </button>
                  <button
                    onClick={() => {
                      onPostpone(task.id, 30);
                      setShowPostponeMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-stone-50 text-stone-700"
                  >
                    +1 Month
                  </button>
                </div>
              )}
            </div>

            {/* Edit */}
            <button
              id={`task-edit-btn-${task.id}`}
              onClick={() => onEdit(task)}
              title="Edit Task"
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button
              id={`task-delete-btn-${task.id}`}
              onClick={() => onDelete(task.id)}
              title="Delete Task"
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Checklist summary and metadata footer */}
        <div className="mt-3.5 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Checklist progress */}
            {totalChecklistCount > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1.5 font-medium text-stone-700 hover:text-stone-900 cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  Checklist: {completedChecklistCount}/{totalChecklistCount} done ({checklistPercent}%)
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                )}
              </button>
            )}

            {/* Estimated time */}
            {task.estimatedTimeMinutes && task.estimatedTimeMinutes > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                ~{task.estimatedTimeMinutes >= 60 ? `${(task.estimatedTimeMinutes / 60).toFixed(1)} hrs` : `${task.estimatedTimeMinutes} mins`}
              </span>
            )}

            {/* Estimated cost */}
            {task.estimatedCost !== undefined && task.estimatedCost > 0 && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-stone-400" />
                Est. ${task.estimatedCost.toFixed(2)}
              </span>
            )}

            {/* Service Provider */}
            {task.serviceProvider && (
              <span className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-stone-400" />
                {task.serviceProvider}
              </span>
            )}
          </div>

          {/* Mobile complete service button */}
          <button
            onClick={() => onOpenCompleteModal(task)}
            className="sm:hidden text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            Complete Service
          </button>
        </div>

        {/* Expandable Checklist Section */}
        {totalChecklistCount > 0 && isExpanded && (
          <div className="mt-3 pt-3 border-t border-stone-100 space-y-2 bg-stone-50/80 -mx-4 -mb-4 p-4 rounded-b-xl">
            <div className="flex items-center justify-between text-xs font-medium text-stone-600 mb-1">
              <span>Maintenance Checklist Steps</span>
              <span className="text-[11px] text-stone-400">Click step to mark done</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden mb-2">
              <div
                className="bg-amber-600 h-full transition-all duration-300"
                style={{ width: `${checklistPercent}%` }}
              ></div>
            </div>

            <div className="space-y-1.5">
              {task.checklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onToggleChecklistItem(task.id, item.id)}
                  className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                    item.completed
                      ? 'bg-emerald-50/60 text-stone-500'
                      : 'bg-white hover:bg-stone-100 text-stone-800 border border-stone-200/70'
                  }`}
                >
                  <span className="mt-0.5 shrink-0 text-emerald-600">
                    {item.completed ? (
                      <CheckSquare className="w-4 h-4 fill-emerald-100" />
                    ) : (
                      <Square className="w-4 h-4 text-stone-400" />
                    )}
                  </span>
                  <span className={item.completed ? 'line-through text-stone-400' : 'font-medium'}>
                    {item.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
