import React from 'react';
import { 
  Inbox, 
  Calendar, 
  CalendarDays, 
  AlertCircle, 
  Archive, 
  CheckCircle2, 
  Flag,
  Plus
} from 'lucide-react';
import { TaskView, TaskPriority } from '../../types';

interface TaskSubNavProps {
  activeView: TaskView;
  setActiveView: (view: TaskView) => void;
  selectedLabel: string | null;
  setSelectedLabel: (label: string | null) => void;
  selectedPriority: TaskPriority | null;
  setSelectedPriority: (priority: TaskPriority | null) => void;
  counts: {
    inbox: number;
    today: number;
    upcoming: number;
    overdue: number;
    someday: number;
    all: number;
    completed: number;
  };
}

export const TaskSubNav: React.FC<TaskSubNavProps> = ({
  activeView,
  setActiveView,
  selectedLabel,
  setSelectedLabel,
  selectedPriority,
  setSelectedPriority,
  counts,
}) => {
  const views = [
    { id: 'inbox' as TaskView, label: 'Inbox', count: counts.inbox, icon: Inbox },
    { id: 'today' as TaskView, label: 'Today', count: counts.today, icon: Calendar },
    { id: 'upcoming' as TaskView, label: 'Upcoming', count: counts.upcoming, icon: CalendarDays },
    { id: 'overdue' as TaskView, label: 'Overdue', count: counts.overdue, icon: AlertCircle, isAlert: true },
    { id: 'someday' as TaskView, label: 'Someday', count: counts.someday, icon: Archive },
    { id: 'completed' as TaskView, label: 'Completed', count: counts.completed, icon: CheckCircle2 },
  ];

  const labels = [
    { name: 'Study', dotColor: 'bg-[#3B82F6]' },
    { name: 'Workout', dotColor: 'bg-[#F59E0B]' },
    { name: 'Personal', dotColor: 'bg-[#F43F5E]' },
    { name: 'Health', dotColor: 'bg-[#10B981]' },
    { name: 'Projects', dotColor: 'bg-[#8B5CF6]' },
  ];

  const priorities: { id: TaskPriority; label: string; flagColor: string }[] = [
    { id: 'high', label: 'High', flagColor: 'text-[#EF4444]' },
    { id: 'medium', label: 'Medium', flagColor: 'text-[#F59E0B]' },
    { id: 'low', label: 'Low', flagColor: 'text-[#64748B]' },
  ];

  return (
    <aside 
      id="tasks-subnavigation" 
      className="w-full lg:w-[210px] xl:w-[224px] shrink-0 flex flex-col gap-6"
    >
      {/* Category Views List */}
      <div className="flex flex-col gap-1">
        {views.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id && !selectedLabel && !selectedPriority;
          return (
            <button
              key={item.id}
              id={`task-view-${item.id}`}
              onClick={() => {
                setActiveView(item.id);
                setSelectedLabel(null);
                setSelectedPriority(null);
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#EEF2FF] dark:bg-[#1E1B4B] text-[#6366F1] dark:text-[#A5B4FC]'
                  : 'text-[#475569] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#6366F1]' : item.isAlert ? 'text-[#EF4444]' : 'text-[#64748B]'}`} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  item.isAlert && item.count > 0
                    ? 'bg-[#FEE2E2] dark:bg-[#450A0A] text-[#EF4444]'
                    : isActive
                    ? 'bg-[#E0E7FF] dark:bg-[#312E81] text-[#6366F1] dark:text-[#A5B4FC]'
                    : 'text-[#64748B] dark:text-[#64748B]'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Labels Section */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] dark:text-[#64748B] px-3">
          Labels
        </h4>
        <div className="flex flex-col gap-1">
          {labels.map((lbl) => {
            const isSelected = selectedLabel === lbl.name;
            return (
              <button
                key={lbl.name}
                id={`task-label-${lbl.name.toLowerCase()}`}
                onClick={() => {
                  setSelectedLabel(isSelected ? null : lbl.name);
                }}
                className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-[#EEF2FF] dark:bg-[#1E1B4B] text-[#6366F1] dark:text-[#A5B4FC]'
                    : 'text-[#475569] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${lbl.dotColor}`} />
                  <span>{lbl.name}</span>
                </div>
              </button>
            );
          })}

          <button 
            id="add-label-btn"
            onClick={() => {
              const newName = window.prompt('Enter new label name:');
              if (newName) setSelectedLabel(newName);
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#6366F1] dark:text-[#A5B4FC] font-medium hover:underline text-left mt-1"
          >
            <span>Add label</span>
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Priority Section */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] dark:text-[#64748B] px-3">
          Priority
        </h4>
        <div className="flex flex-col gap-1">
          {priorities.map((p) => {
            const isSelected = selectedPriority === p.id;
            return (
              <button
                key={p.id}
                id={`task-priority-${p.id}`}
                onClick={() => {
                  setSelectedPriority(isSelected ? null : p.id);
                }}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-[#EEF2FF] dark:bg-[#1E1B4B] text-[#6366F1] dark:text-[#A5B4FC]'
                    : 'text-[#475569] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]'
                }`}
              >
                <Flag className={`w-3.5 h-3.5 ${p.flagColor} fill-current`} />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
