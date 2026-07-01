"use client";

import { useDraggable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";

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

export function DraggableComponentCard({ component }: { component: ComponentData }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `draggable-${component.id}`,
    data: { component },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border rounded-lg cursor-grab active:cursor-grabbing shadow-sm flex flex-col gap-1 select-none border-l-4 border-l-indigo-500 transition-all ${
        isDragging ? "opacity-35 scale-95 shadow-none border-dashed border-indigo-300" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {component.className}
        </span>
        <Badge variant="outline" className="text-[9px] px-1 h-4 font-normal bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900">
          {component.componentType}
        </Badge>
      </div>
      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
        {component.subjectName}
      </span>
      <span className="text-xs text-muted-foreground">
        Component: {component.componentName}
      </span>
      <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[10px] text-muted-foreground">
          Max: {component.maxMarks}
        </span>
        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-500">
          Pass: {component.passingMarks}
        </span>
      </div>
    </div>
  );
}
