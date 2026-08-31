import { RecurrenceConfig } from '../types';

export function formatDate(dateString: string): string {
  if (!dateString) return 'No date';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function getDaysDifference(dueDateString: string): number {
  if (!dueDateString) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parts = dueDateString.split('-');
  let target: Date;
  if (parts.length === 3) {
    target = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  } else {
    target = new Date(dueDateString);
  }
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function getDueStatus(dueDateString: string, status: 'pending' | 'in_progress' | 'completed'): 'completed' | 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'later' {
  if (status === 'completed') return 'completed';
  const diff = getDaysDifference(dueDateString);
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff <= 7) return 'upcoming';
  return 'later';
}

export function getDueLabel(dueDateString: string, status: 'pending' | 'in_progress' | 'completed'): { label: string; color: string } {
  if (status === 'completed') {
    return { label: 'Completed', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  }
  const diff = getDaysDifference(dueDateString);
  if (diff < 0) {
    const abs = Math.abs(diff);
    return {
      label: abs === 1 ? '1 day overdue' : `${abs} days overdue`,
      color: 'text-rose-700 bg-rose-50 border-rose-200',
    };
  }
  if (diff === 0) {
    return { label: 'Due today', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  }
  if (diff === 1) {
    return { label: 'Due tomorrow', color: 'text-amber-600 bg-amber-50/60 border-amber-200' };
  }
  if (diff <= 7) {
    return { label: `Due in ${diff} days`, color: 'text-sky-700 bg-sky-50 border-sky-200' };
  }
  return { label: `Due ${formatDate(dueDateString)}`, color: 'text-stone-600 bg-stone-100 border-stone-200' };
}

export function calculateNextDueDate(baseDate: string | Date, recurrence: RecurrenceConfig): string {
  let date: Date;
  if (typeof baseDate === 'string') {
    const parts = baseDate.split('-');
    if (parts.length === 3) {
      date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      date = new Date(baseDate);
    }
  } else {
    date = new Date(baseDate);
  }

  switch (recurrence.type) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'biannually':
      date.setMonth(date.getMonth() + 6);
      break;
    case 'annually':
      date.setFullYear(date.getFullYear() + 1);
      break;
    case 'custom': {
      const val = recurrence.intervalValue || 1;
      const unit = recurrence.intervalUnit || 'months';
      if (unit === 'days') date.setDate(date.getDate() + val);
      else if (unit === 'weeks') date.setDate(date.getDate() + val * 7);
      else if (unit === 'months') date.setMonth(date.getMonth() + val);
      else if (unit === 'years') date.setFullYear(date.getFullYear() + val);
      break;
    }
    default:
      break;
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTodayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatRecurrenceLabel(rec: RecurrenceConfig): string {
  switch (rec.type) {
    case 'none':
      return 'One-time';
    case 'daily':
      return 'Every day';
    case 'weekly':
      return 'Every week';
    case 'monthly':
      return 'Every month';
    case 'quarterly':
      return 'Every 3 months';
    case 'biannually':
      return 'Every 6 months';
    case 'annually':
      return 'Every year';
    case 'custom': {
      const v = rec.intervalValue || 1;
      const u = rec.intervalUnit || 'months';
      return `Every ${v} ${u}`;
    }
    default:
      return 'One-time';
  }
}
