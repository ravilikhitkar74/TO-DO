import React from 'react';
import { 
  Home, 
  Car, 
  Tv, 
  Droplets, 
  Zap, 
  TreePine, 
  Laptop, 
  ShieldAlert, 
  Wrench,
  AlertOctagon,
  AlertTriangle,
  Info,
  Circle
} from 'lucide-react';
import { Category, Priority } from '../types';

export function getCategoryIcon(category: Category, className = 'w-4 h-4') {
  switch (category) {
    case 'home':
      return <Home className={className} />;
    case 'vehicle':
      return <Car className={className} />;
    case 'appliances':
      return <Tv className={className} />;
    case 'plumbing':
      return <Droplets className={className} />;
    case 'electrical':
      return <Zap className={className} />;
    case 'garden':
      return <TreePine className={className} />;
    case 'tech':
      return <Laptop className={className} />;
    case 'safety':
      return <ShieldAlert className={className} />;
    case 'general':
    default:
      return <Wrench className={className} />;
  }
}

export function getCategoryLabel(category: Category): string {
  switch (category) {
    case 'home':
      return 'Home & Exterior';
    case 'vehicle':
      return 'Vehicle & Auto';
    case 'appliances':
      return 'Appliances & HVAC';
    case 'plumbing':
      return 'Plumbing';
    case 'electrical':
      return 'Electrical';
    case 'garden':
      return 'Lawn & Garden';
    case 'tech':
      return 'Tech & Electronics';
    case 'safety':
      return 'Safety & Alarms';
    case 'general':
      return 'General Equipment';
    default:
      return category;
  }
}

export function getCategoryBadgeStyle(category: Category): string {
  switch (category) {
    case 'home':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'vehicle':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'appliances':
      return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    case 'plumbing':
      return 'bg-cyan-50 text-cyan-800 border-cyan-200';
    case 'electrical':
      return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    case 'garden':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'tech':
      return 'bg-violet-50 text-violet-800 border-violet-200';
    case 'safety':
      return 'bg-rose-50 text-rose-800 border-rose-200';
    case 'general':
    default:
      return 'bg-stone-100 text-stone-700 border-stone-200';
  }
}

export function getPriorityBadge(priority: Priority) {
  switch (priority) {
    case 'critical':
      return {
        label: 'Critical',
        style: 'bg-red-100 text-red-800 border-red-200',
        icon: <AlertOctagon className="w-3 h-3 mr-1" />,
      };
    case 'high':
      return {
        label: 'High',
        style: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: <AlertTriangle className="w-3 h-3 mr-1" />,
      };
    case 'medium':
      return {
        label: 'Medium',
        style: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: <Info className="w-3 h-3 mr-1" />,
      };
    case 'low':
      return {
        label: 'Low',
        style: 'bg-stone-100 text-stone-700 border-stone-200',
        icon: <Circle className="w-2.5 h-2.5 mr-1 fill-stone-400 text-stone-400" />,
      };
    default:
      return {
        label: priority,
        style: 'bg-stone-100 text-stone-700 border-stone-200',
        icon: null,
      };
  }
}
