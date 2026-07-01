"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DroppableDayCard } from "./DroppableDayCard";
import { DraggableScheduledCard } from "./DraggableScheduledCard";
import { useDeleteExamSchedule } from "@/features/exam/hooks.exam";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  UserCheck,
  Edit2,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CalendarDay {
  id: number;
  date: string;
  isHoliday: boolean;
  holidayDescription?: string | null;
}

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
  // Extra fields for editing
  classId: number;
  subjectId: number;
  subjectComponentId: number;
  invigilatorId?: number;
  batchId?: number;
  dayId?: number;
}

interface CalendarGridProps {
  calendarDays: CalendarDay[] | undefined;
  calendarLoading: boolean;
  scheduledComponentsMap: Record<string, ScheduledSlot[]>;
  onEditSchedule: (schedule: ScheduledSlot) => void;
  examStartDate?: string;
  examEndDate?: string;
}

export function CalendarGrid({
  calendarDays,
  calendarLoading,
  scheduledComponentsMap,
  onEditSchedule,
  examStartDate,
  examEndDate,
}: CalendarGridProps) {
  const deleteMutation = useDeleteExamSchedule();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [targetDeleteSchedule, setTargetDeleteSchedule] = useState<ScheduledSlot | null>(null);

  const handleDeleteClick = (sch: ScheduledSlot) => {
    setTargetDeleteSchedule(sch);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!targetDeleteSchedule) return;
    deleteMutation.mutate(targetDeleteSchedule.id, {
      onSuccess: () => {
        toast.success("Schedule deleted/canceled successfully");
        setDeleteDialogOpen(false);
        setTargetDeleteSchedule(null);
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to delete schedule slot");
      },
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-5 min-w-0">
      {/* Calendar Header with Navigation */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm mb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
            Exam Schedule Calendar
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Duration: {examStartDate ? new Date(examStartDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'} - {examEndDate ? new Date(examEndDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}
          </p>
        </div>
      </div>

      {/* Calendar Grid Container (Scrollable) */}
      <div className="flex-1 overflow-y-auto pr-1.5 scrollbar-thin">
        {calendarLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
            {calendarDays?.map((day) => {
              const daySchedules = scheduledComponentsMap[day.date] || [];
              return (
                <DroppableDayCard key={day.date} day={day}>
                  {daySchedules.map((sch) => (
                    <DraggableScheduledCard
                      key={sch.id}
                      sch={sch}
                      onEditSchedule={onEditSchedule}
                      onDeleteSchedule={handleDeleteClick}
                    />
                  ))}
                </DroppableDayCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Unschedule Exam
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 mt-2">
              Are you sure you want to unschedule{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {targetDeleteSchedule?.subjectName}
              </span>{" "}
              for{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {targetDeleteSchedule?.className}
              </span>
              ? This component will return to the Unscheduled Queue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setTargetDeleteSchedule(null);
              }}
              disabled={deleteMutation.isPending}
              className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white font-medium flex items-center gap-1.5"
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Unschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
