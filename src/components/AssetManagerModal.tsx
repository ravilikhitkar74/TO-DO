import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Tv, 
  Wrench, 
  Layers, 
  Check, 
  Tag, 
  MapPin,
  FileText
} from 'lucide-react';
import { Asset, Category, MaintenanceLog, MaintenanceTask } from '../types';
import { getCategoryBadgeStyle, getCategoryIcon, getCategoryLabel } from '../utils/categoryHelpers';

interface AssetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  tasks: MaintenanceTask[];
  logs: MaintenanceLog[];
  onAddAsset: (asset: Omit<Asset, 'id' | 'createdAt'>) => void;
  onUpdateAsset: (id: string, asset: Omit<Asset, 'id' | 'createdAt'>) => void;
  onDeleteAsset: (id: string) => void;
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

export const AssetManagerModal: React.FC<AssetManagerModalProps> = ({
  isOpen,
  onClose,
  assets,
  tasks,
  logs,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('appliances');
  const [modelOrLocation, setModelOrLocation] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setCategory('appliances');
    setModelOrLocation('');
    setSerialNumber('');
    setNotes('');
    setIsAdding(false);
    setEditingAssetId(null);
  };

  const startEdit = (asset: Asset) => {
    setEditingAssetId(asset.id);
    setName(asset.name);
    setCategory(asset.category);
    setModelOrLocation(asset.modelOrLocation || '');
    setSerialNumber(asset.serialNumber || '');
    setNotes(asset.notes || '');
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingAssetId) {
      onUpdateAsset(editingAssetId, {
        name: name.trim(),
        category,
        modelOrLocation: modelOrLocation.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      onAddAsset({
        name: name.trim(),
        category,
        modelOrLocation: modelOrLocation.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }

    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="assets-modal-container"
        className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-stone-200 overflow-hidden my-8 flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Equipment & Asset Registry</h2>
              <p className="text-xs text-stone-500 font-medium">
                Track vehicles, HVAC units, appliances, tools, and systems
              </p>
            </div>
          </div>
          <button
            id="close-asset-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Add / Edit Form */}
          {isAdding ? (
            <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-amber-300 bg-amber-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  {editingAssetId ? 'Edit Equipment Profile' : 'Register New Equipment / Asset'}
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-stone-500 hover:text-stone-800 underline"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                    Equipment / Asset Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. 2023 Honda CR-V, Carrier HVAC"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {getCategoryLabel(c)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                    Model / Location
                  </label>
                  <input
                    type="text"
                    value={modelOrLocation}
                    onChange={(e) => setModelOrLocation(e.target.value)}
                    placeholder="e.g. Basement / Model 9600"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                    Serial # / VIN / Filter Size
                  </label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g. SN-892174 or 20x25x4 filter"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                  Maintenance Specs & Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Takes 0W-20 oil, replacement filter every 3 months"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 text-xs font-semibold text-stone-600 bg-white border border-stone-300 rounded-lg hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
                >
                  {editingAssetId ? 'Update Asset' : 'Save Asset'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Registered Equipment ({assets.length})
              </span>
              <button
                id="add-new-asset-trigger-btn"
                onClick={() => setIsAdding(true)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Equipment / Asset
              </button>
            </div>
          )}

          {/* Asset List */}
          <div className="space-y-3">
            {assets.length === 0 ? (
              <div className="text-center py-10 text-stone-400 text-xs">
                No equipment registered yet. Click "Add Equipment" to organize your maintenance by asset.
              </div>
            ) : (
              assets.map((asset) => {
                const assetTasks = tasks.filter((t) => t.assetId === asset.id);
                const assetLogs = logs.filter((l) => l.assetName === asset.name);

                return (
                  <div
                    key={asset.id}
                    className="p-4 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${getCategoryBadgeStyle(asset.category)}`}>
                          {getCategoryIcon(asset.category, 'w-3 h-3')}
                          {getCategoryLabel(asset.category)}
                        </span>
                        {asset.modelOrLocation && (
                          <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            {asset.modelOrLocation}
                          </span>
                        )}
                        {asset.serialNumber && (
                          <span className="text-[11px] text-stone-600 bg-stone-100 font-mono px-1.5 py-0.5 rounded border border-stone-200">
                            {asset.serialNumber}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-stone-900">{asset.name}</h4>

                      {asset.notes && (
                        <p className="text-xs text-stone-600 mt-1">{asset.notes}</p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-stone-500 mt-2 font-medium">
                        <span>{assetTasks.length} active todos</span>
                        <span>•</span>
                        <span>{assetLogs.length} completed logs</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startEdit(asset)}
                        title="Edit Asset"
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteAsset(asset.id)}
                        title="Delete Asset"
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-100 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
