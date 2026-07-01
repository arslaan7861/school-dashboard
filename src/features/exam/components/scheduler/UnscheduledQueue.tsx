"use client";

import { DraggableComponentCard } from "./DraggableComponentCard";
import { CalendarCheck, CheckCircle2 } from "lucide-react";

interface ComponentData {
  id: number;
  className: string;
  componentType: string;
  subjectName: string;
  componentName: string;
  maxMarks: number;
  passingMarks: number;
  classId: number;
  subjectId: number;
  examSubjectId: number;
  subjectComponentId: number;
}

interface UnscheduledQueueProps {
  unscheduledComponents: ComponentData[];
}

export function UnscheduledQueue({ unscheduledComponents }: UnscheduledQueueProps) {
  return (
    <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 p-5 flex flex-col gap-5 h-full">
      <div>
        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-base">
          <CalendarCheck className="w-5 h-5 text-indigo-500" />
          Unscheduled Queue
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Drag component items and drop onto calendar days to schedule.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 scrollbar-thin">
        {unscheduledComponents.map((comp) => (
          <DraggableComponentCard key={comp.id} component={comp} />
        ))}
        {unscheduledComponents.length === 0 && (
          <div className="h-48 flex flex-col items-center justify-center p-6 border border-dashed rounded-xl bg-white dark:bg-slate-900 text-center border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Queue Empty
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              All exam components have been scheduled.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
