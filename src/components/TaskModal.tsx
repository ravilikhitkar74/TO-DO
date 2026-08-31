import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  DollarSign, 
  Repeat, 
  Layers, 
  CheckSquare, 
  Sparkles,
  MapPin,
  Wrench
} from 'lucide-react';
import { 
  Asset, 
  Category, 
  ChecklistItem, 
  CustomRecurrenceUnit, 
  MaintenanceTask, 
  Priority, 
  RecurrenceConfig, 
  RecurrenceType 
} from '../types';
import { getTodayString } from '../utils/dateUtils';
import { getCategoryIcon, getCategoryLabel } from '../utils/categoryHelpers';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<MaintenanceTask, 'id' | 'createdAt'>, taskId?: string) => void;
  taskToEdit?: MaintenanceTask | null;
  assets: Asset[];
}

const CATEGORIES: Category[] = [
  'appliances',
  'vehicle',
  'safety',
  'home',
  'plumbing',
  'electrical',
  'garden',
  'tech',
  'general',
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  assets,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('home');
  const [assetId, setAssetId] = useState<string>('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<string>(getTodayString());
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('monthly');
  const [customIntervalValue, setCustomIntervalValue] = useState<number>(3);
  const [customIntervalUnit, setCustomIntervalUnit] = useState<CustomRecurrenceUnit>('months');
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>('30');
  const [estimatedCost, setEstimatedCost] = useState<string>('0');
  const [location, setLocation] = useState('');
  const [serviceProvider, setServiceProvider] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setCategory(taskToEdit.category);
      setAssetId(taskToEdit.assetId || '');
      setPriority(taskToEdit.priority);
      setDueDate(taskToEdit.dueDate || getTodayString());
      setRecurrenceType(taskToEdit.recurrence.type);
      setCustomIntervalValue(taskToEdit.recurrence.intervalValue || 1);
      setCustomIntervalUnit(taskToEdit.recurrence.intervalUnit || 'months');
      setEstimatedMinutes(taskToEdit.estimatedTimeMinutes ? String(taskToEdit.estimatedTimeMinutes) : '');
      setEstimatedCost(taskToEdit.estimatedCost !== undefined ? String(taskToEdit.estimatedCost) : '');
      setLocation(taskToEdit.location || '');
      setServiceProvider(taskToEdit.serviceProvider || '');
      setChecklist(taskToEdit.checklist ? [...taskToEdit.checklist] : []);
    } else {
      // Default reset
      setTitle('');
      setDescription('');
      setCategory('home');
      setAssetId('');
      setPriority('medium');
      setDueDate(getTodayString());
      setRecurrenceType('monthly');
      setCustomIntervalValue(3);
      setCustomIntervalUnit('months');
      setEstimatedMinutes('30');
      setEstimatedCost('0');
      setLocation('');
      setServiceProvider('Self');
      setChecklist([]);
      setNewChecklistText('');
    }
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    const newItem: ChecklistItem = {
      id: 'c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: newChecklistText.trim(),
      completed: false,
    };
    setChecklist([...checklist, newItem]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(checklist.filter((item) => item.id !== id));
  };

  const handleApplyPresetDue = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setDueDate(`${y}-${m}-${day}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedAsset = assets.find((a) => a.id === assetId);

    const recurrenceConfig: RecurrenceConfig = {
      type: recurrenceType,
      intervalValue: recurrenceType === 'custom' ? customIntervalValue : undefined,
      intervalUnit: recurrenceType === 'custom' ? customIntervalUnit : undefined,
    };

    onSave(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        assetId: assetId || undefined,
        assetName: selectedAsset ? selectedAsset.name : undefined,
        priority,
        status: taskToEdit ? taskToEdit.status : 'pending',
        dueDate,
        estimatedTimeMinutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : undefined,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        recurrence: recurrenceConfig,
        checklist,
        location: location.trim() || undefined,
        serviceProvider: serviceProvider.trim() || undefined,
      },
      taskToEdit ? taskToEdit.id : undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="task-modal-container" 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-stone-200 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                {taskToEdit ? 'Edit Maintenance Task' : 'New Maintenance Todo'}
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Configure schedule, asset tags, checklists, and service intervals
              </p>
            </div>
          </div>
          <button
            id="close-task-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Replace HVAC Filter, Car Oil Change, Gutter Cleanout"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Category & Asset row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Category
              </label>
              <select
                id="task-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {getCategoryLabel(cat)}
                  </option>
                ))}
              </select>
            </div>

            {/* Asset */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Associated Equipment / Asset
              </label>
              <select
                id="task-asset-select"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">(No specific asset - general home)</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} {asset.modelOrLocation ? `(${asset.modelOrLocation})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Priority
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['low', 'medium', 'high', 'critical'] as Priority[]).map((p) => {
                  const active = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 px-1 text-xs font-semibold rounded-lg border capitalize transition-all cursor-pointer ${
                        active
                          ? p === 'critical'
                            ? 'bg-rose-100 border-rose-400 text-rose-800 ring-1 ring-rose-300'
                            : p === 'high'
                            ? 'bg-orange-100 border-orange-400 text-orange-800 ring-1 ring-orange-300'
                            : p === 'medium'
                            ? 'bg-amber-100 border-amber-400 text-amber-800 ring-1 ring-amber-300'
                            : 'bg-stone-200 border-stone-400 text-stone-900 ring-1 ring-stone-300'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due Date with Quick Presets */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Due Date
              </label>
              <div className="space-y-1.5">
                <input
                  id="task-due-date-input"
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
                <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium">
                  <span>Presets:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetDue(0)}
                    className="hover:text-amber-700 underline cursor-pointer"
                  >
                    Today
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetDue(1)}
                    className="hover:text-amber-700 underline cursor-pointer"
                  >
                    Tomorrow
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetDue(7)}
                    className="hover:text-amber-700 underline cursor-pointer"
                  >
                    +7 Days
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetDue(30)}
                    className="hover:text-amber-700 underline cursor-pointer"
                  >
                    +1 Month
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recurrence Configuration */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
            <div className="flex items-center gap-2 mb-2">
              <Repeat className="w-4 h-4 text-amber-700" />
              <label className="text-xs font-bold uppercase tracking-wider text-stone-800">
                Recurrence Schedule
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'none', label: 'One-time' },
                { id: 'monthly', label: 'Monthly' },
                { id: 'quarterly', label: 'Quarterly (3m)' },
                { id: 'biannually', label: 'Bi-annual (6m)' },
                { id: 'annually', label: 'Annual (1 yr)' },
                { id: 'weekly', label: 'Weekly' },
                { id: 'custom', label: 'Custom...' },
              ].map((rec) => (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => setRecurrenceType(rec.id as RecurrenceType)}
                  className={`py-1.5 px-2.5 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                    recurrenceType === rec.id
                      ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {rec.label}
                </button>
              ))}
            </div>

            {/* Custom Interval settings */}
            {recurrenceType === 'custom' && (
              <div className="mt-3 pt-3 border-t border-stone-200/80 flex items-center gap-2">
                <span className="text-xs text-stone-600 font-medium">Every</span>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={customIntervalValue}
                  onChange={(e) => setCustomIntervalValue(Math.max(1, parseInt(e.target.value || '1', 10)))}
                  className="w-16 px-2 py-1 text-xs border border-stone-300 rounded bg-white"
                />
                <select
                  value={customIntervalUnit}
                  onChange={(e) => setCustomIntervalUnit(e.target.value as CustomRecurrenceUnit)}
                  className="px-2 py-1 text-xs border border-stone-300 rounded bg-white"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Task Notes / Instructions
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context, required tools, part specifications, or manual instructions..."
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Maintenance Checklist */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-amber-700" />
                Subtasks / Maintenance Checklist ({checklist.length})
              </label>
            </div>

            {/* Checklist Items list */}
            {checklist.length > 0 && (
              <div className="space-y-1.5 mb-2.5">
                {checklist.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-stone-50 border border-stone-200 text-xs"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-stone-400 font-mono">{index + 1}.</span>
                      <span className="font-medium text-stone-800">{item.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(item.id)}
                      className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Checklist Item input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
                placeholder="Add checklist step (e.g. Inspect o-ring, Torque bolts to 80 ft-lbs)..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-lg border border-stone-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Step
              </button>
            </div>
          </div>

          {/* Time, Cost, Location, Provider row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-stone-200">
            <div>
              <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">
                Est. Time (Mins)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                placeholder="30"
                className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">
                Est. Cost ($)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="0"
                className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Garage / Basement"
                className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">
                Performed By
              </label>
              <input
                type="text"
                value={serviceProvider}
                onChange={(e) => setServiceProvider(e.target.value)}
                placeholder="Self / Contractor"
                className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-task-submit-btn"
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              {taskToEdit ? 'Save Changes' : 'Create Maintenance Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
