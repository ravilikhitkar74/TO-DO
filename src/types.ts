export type Priority = 'critical' | 'high' | 'medium' | 'low';

export type Category = 
  | 'home' 
  | 'vehicle' 
  | 'appliances' 
  | 'plumbing' 
  | 'electrical' 
  | 'garden' 
  | 'tech' 
  | 'safety' 
  | 'general';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannually' | 'annually' | 'custom';

export type CustomRecurrenceUnit = 'days' | 'weeks' | 'months' | 'years';

export interface RecurrenceConfig {
  type: RecurrenceType;
  intervalValue?: number;
  intervalUnit?: CustomRecurrenceUnit;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface Asset {
  id: string;
  name: string;
  category: Category;
  modelOrLocation?: string;
  serialNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface MaintenanceTask {
  id: string;
  title: string;
  description?: string;
  category: Category;
  assetId?: string;
  assetName?: string;
  priority: Priority;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string; // YYYY-MM-DD
  estimatedTimeMinutes?: number;
  estimatedCost?: number;
  recurrence: RecurrenceConfig;
  checklist: ChecklistItem[];
  location?: string;
  serviceProvider?: string;
  notes?: string;
  lastCompletedDate?: string;
  createdAt: string;
}

export interface MaintenanceLog {
  id: string;
  taskId?: string;
  taskTitle: string;
  category: Category;
  assetName?: string;
  completedAt: string; // ISO date-time
  costSpent?: number;
  timeSpentMinutes?: number;
  performedBy?: string;
  notes?: string;
  partsUsed?: string;
}

export interface MaintenanceTemplate {
  id: string;
  title: string;
  description: string;
  category: Category;
  defaultPriority: Priority;
  defaultRecurrence: RecurrenceConfig;
  suggestedEstimatedMinutes?: number;
  suggestedEstimatedCost?: number;
  checklist: string[];
  tips?: string;
}
