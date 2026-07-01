"use client";

import { useDraggable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, UserCheck, Edit2, Trash2 } from "lucide-react";

interface ScheduledSlot {
  id: number;
  componentId: number;
  subjectName: string;
  componentName: string;
  className: string;
  startTime: string;
  endTime: string;
  room: string;
  invigilatorName?: string;
  batchName?: string;
  classId: number;
  subjectId: number;
  subjectComponentId: number;
  invigilatorId?: number;
  batchId?: number;
  dayId?: number;
}

interface DraggableScheduledCardProps {
  sch: ScheduledSlot;
  onEditSchedule: (sch: ScheduledSlot) => void;
  onDeleteSchedule: (sch: ScheduledSlot) => void;
}

export function DraggableScheduledCard({
  sch,
  onEditSchedule,
  onDeleteSchedule,
}: DraggableScheduledCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `draggable-scheduled-${sch.id}`,
    data: { schedule: sch },
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
      className={`p-2.5 border rounded-lg bg-indigo-50/40 dark:bg-indigo-950/10 border-indigo-100/70 dark:border-indigo-950/50 flex flex-col gap-1 text-[10px] relative group cursor-grab active:cursor-grabbing transition-all hover:shadow-sm select-none ${
        isDragging ? "opacity-35 scale-95 shadow-none border-dashed border-indigo-300" : ""
      }`}
    >
      {/* Action buttons (visible on hover) */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 bg-indigo-50/90 dark:bg-slate-900/90 p-0.5 rounded border border-indigo-100 dark:border-slate-800">
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
          onClick={(e) => {
            e.stopPropagation();
            onEditSchedule(sch);
          }}
        >
          <Edit2 className="w-2.5 h-2.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteSchedule(sch);
          }}
        >
          <Trash2 className="w-2.5 h-2.5" />
        </Button>
      </div>

      <div className="flex justify-between font-bold text-indigo-950 dark:text-indigo-300 pr-9">
        <span className="truncate max-w-[90px]" title={sch.subjectName}>
          {sch.subjectName}
        </span>
        <span className="flex items-center gap-0.5 text-[9px] text-indigo-600 dark:text-indigo-400 font-medium">
          <Clock className="w-2 h-2" />
          {sch.startTime.slice(0, 5)}
        </span>
      </div>

      <span className="text-slate-500 dark:text-slate-400 font-medium text-[9px]">
        Class: {sch.className} ({sch.batchName})
      </span>

      <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 mt-1 pt-1 border-t border-indigo-100/30">
        <span className="flex items-center gap-0.5 text-[9px]">
          <MapPin className="w-2.5 h-2.5 text-slate-400" />
          {sch.room || "N/A"}
        </span>
        {sch.invigilatorName && (
          <span
            className="flex items-center gap-0.5 truncate max-w-[65px] text-[9px] font-medium"
            title={sch.invigilatorName}
          >
            <UserCheck className="w-2.5 h-2.5 text-slate-400" />
            {sch.invigilatorName.split(" ")[0]}
          </span>
        )}
      </div>
    </div>
  );
}
