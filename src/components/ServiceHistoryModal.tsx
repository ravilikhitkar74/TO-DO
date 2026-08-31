import React, { useState } from 'react';
import { 
  X, 
  History, 
  Search, 
  DollarSign, 
  Clock, 
  Calendar, 
  Trash2, 
  Download, 
  CheckCircle2, 
  FileText,
  UserCheck,
  Tag
} from 'lucide-react';
import { MaintenanceLog, Category } from '../types';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import { getCategoryBadgeStyle, getCategoryIcon, getCategoryLabel } from '../utils/categoryHelpers';

interface ServiceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: MaintenanceLog[];
  onDeleteLog: (id: string) => void;
  onClearLogs: () => void;
}

export const ServiceHistoryModal: React.FC<ServiceHistoryModalProps> = ({
  isOpen,
  onClose,
  logs,
  onDeleteLog,
  onClearLogs,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.assetName && log.assetName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.notes && log.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.partsUsed && log.partsUsed.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.performedBy && log.performedBy.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || log.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalSpent = logs.reduce((sum, l) => sum + (l.costSpent || 0), 0);
  const totalMinutes = logs.reduce((sum, l) => sum + (l.timeSpentMinutes || 0), 0);

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Date', 'Task Title', 'Category', 'Asset', 'Cost ($)', 'Time (min)', 'Performed By', 'Parts Used', 'Notes'];
    const rows = logs.map((l) => [
      `"${l.completedAt}"`,
      `"${l.taskTitle.replace(/"/g, '""')}"`,
      `"${l.category}"`,
      `"${(l.assetName || '').replace(/"/g, '""')}"`,
      l.costSpent || 0,
      l.timeSpentMinutes || 0,
      `"${(l.performedBy || '').replace(/"/g, '""')}"`,
      `"${(l.partsUsed || '').replace(/"/g, '""')}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `maintenance_service_logbook_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="history-modal-container"
        className="bg-white w-full max-w-4xl rounded-2xl shadow-xl border border-stone-200 overflow-hidden my-8 flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Maintenance Service Logbook</h2>
              <p className="text-xs text-stone-500 font-medium">
                Comprehensive historical log of all completed maintenance, parts, and recorded expenses
              </p>
            </div>
          </div>
          <button
            id="close-history-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats strip */}
        <div className="bg-stone-50/70 border-b border-stone-200 px-6 py-3 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Total Services</div>
            <div className="text-base font-bold text-stone-900">{logs.length} logged</div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Total Expenses</div>
            <div className="text-base font-bold text-emerald-700">${totalSpent.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Time Invested</div>
            <div className="text-base font-bold text-stone-900">
              {totalMinutes >= 60 ? `${(totalMinutes / 60).toFixed(1)} hours` : `${totalMinutes} mins`}
            </div>
          </div>
        </div>

        {/* Filters and Export Bar */}
        <div className="p-4 border-b border-stone-200 bg-white flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search service logs by task, asset, parts, technician..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-stone-300 rounded-xl bg-white"
            >
              <option value="all">All Categories</option>
              {['appliances', 'vehicle', 'safety', 'home', 'plumbing', 'electrical', 'garden', 'tech'].map((c) => (
                <option key={c} value={c}>
                  {getCategoryLabel(c as Category)}
                </option>
              ))}
            </select>

            <button
              onClick={handleExportCSV}
              disabled={logs.length === 0}
              className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl border border-stone-300 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Logs list */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs">
              {logs.length === 0
                ? 'No maintenance history recorded yet. Complete a maintenance task to generate your first log entry.'
                : 'No logs match your current search and category filters.'}
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${getCategoryBadgeStyle(log.category)}`}>
                        {getCategoryIcon(log.category, 'w-3 h-3')}
                        {getCategoryLabel(log.category)}
                      </span>

                      {log.assetName && (
                        <span className="text-xs font-semibold text-stone-800 bg-stone-100 px-2 py-0.5 rounded">
                          {log.assetName}
                        </span>
                      )}

                      <span className="text-xs text-stone-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {formatDateTime(log.completedAt)}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-stone-900">{log.taskTitle}</h4>

                    {/* Metadata details */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 mt-2 font-medium">
                      {log.costSpent !== undefined && log.costSpent > 0 && (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold flex items-center gap-0.5">
                          <DollarSign className="w-3 h-3" />
                          ${log.costSpent.toFixed(2)}
                        </span>
                      )}

                      {log.timeSpentMinutes !== undefined && log.timeSpentMinutes > 0 && (
                        <span className="flex items-center gap-1 text-stone-500">
                          <Clock className="w-3 h-3 text-stone-400" />
                          {log.timeSpentMinutes} mins
                        </span>
                      )}

                      {log.performedBy && (
                        <span className="flex items-center gap-1 text-stone-500">
                          <UserCheck className="w-3 h-3 text-stone-400" />
                          By: {log.performedBy}
                        </span>
                      )}
                    </div>

                    {/* Parts Used */}
                    {log.partsUsed && (
                      <div className="text-xs text-stone-700 mt-2 bg-stone-50 p-2 rounded-lg border border-stone-200">
                        <span className="font-semibold text-stone-800">Parts Used: </span>
                        {log.partsUsed}
                      </div>
                    )}

                    {/* Notes */}
                    {log.notes && (
                      <p className="text-xs text-stone-600 mt-2 italic bg-amber-50/40 p-2 rounded-lg border border-amber-200/50">
                        "{log.notes}"
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteLog(log.id)}
                    title="Delete Record"
                    className="self-end sm:self-start p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          {logs.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all maintenance service logs?')) {
                  onClearLogs();
                }
              }}
              className="text-xs font-medium text-rose-600 hover:underline cursor-pointer"
            >
              Clear Logbook
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-4 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-100 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
