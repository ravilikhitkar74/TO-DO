import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Plus, 
  Check, 
  Clock, 
  DollarSign, 
  Repeat, 
  CheckSquare, 
  Search, 
  Info,
  Layers
} from 'lucide-react';
import { Asset, Category, MaintenanceTask, MaintenanceTemplate } from '../types';
import { MAINTENANCE_TEMPLATES } from '../data/defaultData';
import { getCategoryBadgeStyle, getCategoryIcon, getCategoryLabel } from '../utils/categoryHelpers';
import { formatRecurrenceLabel, getTodayString } from '../utils/dateUtils';

interface MaintenanceTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFromTemplate: (template: MaintenanceTemplate, assetId?: string) => void;
  assets: Asset[];
}

export const MaintenanceTemplatesModal: React.FC<MaintenanceTemplatesModalProps> = ({
  isOpen,
  onClose,
  onAddFromTemplate,
  assets,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [addedTemplateIds, setAddedTemplateIds] = useState<string[]>([]);
  const [targetAssetMap, setTargetAssetMap] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const filteredTemplates = MAINTENANCE_TEMPLATES.filter((tpl) => {
    const matchesSearch =
      tpl.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.checklist.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || tpl.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleAdd = (template: MaintenanceTemplate) => {
    const assetId = targetAssetMap[template.id] || undefined;
    onAddFromTemplate(template, assetId);
    setAddedTemplateIds([...addedTemplateIds, template.id]);
    setTimeout(() => {
      setAddedTemplateIds((prev) => prev.filter((id) => id !== template.id));
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="templates-modal-container"
        className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-stone-200 overflow-hidden my-8 flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Maintenance Schedule Library
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Standard checklists and recommended intervals for home, auto, safety, and equipment
              </p>
            </div>
          </div>
          <button
            id="close-templates-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-stone-200 bg-white flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search maintenance procedures, checklists, or equipment..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'appliances', 'vehicle', 'home', 'safety', 'plumbing', 'garden', 'tech'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {cat === 'all' ? 'All Templates' : getCategoryLabel(cat as Category)}
              </button>
            ))}
          </div>
        </div>

        {/* Templates List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12 text-stone-500 text-xs">
              No matching maintenance templates found for "{searchTerm}".
            </div>
          ) : (
            filteredTemplates.map((template) => {
              const isAdded = addedTemplateIds.includes(template.id);
              const matchingAssets = assets.filter(
                (a) => a.category === template.category || template.category === 'appliances'
              );

              return (
                <div
                  key={template.id}
                  className="p-4 rounded-xl border border-stone-200 hover:border-amber-300 hover:shadow-xs transition-all bg-white"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${getCategoryBadgeStyle(template.category)}`}>
                          {getCategoryIcon(template.category, 'w-3 h-3')}
                          {getCategoryLabel(template.category)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border border-stone-200 bg-stone-50 text-stone-700">
                          <Repeat className="w-3 h-3 text-stone-400" />
                          {formatRecurrenceLabel(template.defaultRecurrence)}
                        </span>
                        {template.suggestedEstimatedMinutes && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-stone-500">
                            <Clock className="w-3 h-3 text-stone-400" />
                            ~{template.suggestedEstimatedMinutes}m
                          </span>
                        )}
                        {template.suggestedEstimatedCost !== undefined && template.suggestedEstimatedCost > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-stone-500">
                            <DollarSign className="w-3 h-3 text-stone-400" />
                            Est. ${template.suggestedEstimatedCost}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-stone-900">{template.title}</h3>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        {template.description}
                      </p>

                      {/* Checklist preview */}
                      <div className="mt-3 bg-stone-50/80 p-2.5 rounded-lg border border-stone-200/80">
                        <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block mb-1.5">
                          Standard Procedure ({template.checklist.length} Steps):
                        </span>
                        <ul className="text-xs text-stone-700 space-y-1">
                          {template.checklist.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-amber-600 font-bold shrink-0 text-[10px] mt-0.5">✓</span>
                              <span className="text-stone-600">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {template.tips && (
                        <p className="text-[11px] text-amber-800 bg-amber-50/70 border border-amber-200/80 p-2 rounded-md mt-2 flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5" />
                          <span><strong className="font-semibold">Pro-tip:</strong> {template.tips}</span>
                        </p>
                      )}
                    </div>

                    {/* Action button */}
                    <div className="flex sm:flex-col items-end gap-2 shrink-0 pt-2 sm:pt-0">
                      {assets.length > 0 && (
                        <select
                          value={targetAssetMap[template.id] || ''}
                          onChange={(e) =>
                            setTargetAssetMap({ ...targetAssetMap, [template.id]: e.target.value })
                          }
                          className="text-[11px] px-2 py-1 border border-stone-300 rounded-lg bg-white w-full max-w-[150px]"
                        >
                          <option value="">Assign Asset...</option>
                          {assets.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      )}

                      <button
                        id={`add-template-btn-${template.id}`}
                        onClick={() => handleAdd(template)}
                        disabled={isAdded}
                        className={`w-full px-3.5 py-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-amber-600 hover:bg-amber-700 text-white border-transparent shadow-xs'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-4 h-4" />
                            Added to Todos
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Add to Schedule
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <span>Templates pre-fill checklists, intervals, and estimated materials.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-100 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
