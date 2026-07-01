"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useAuthStore } from "@/store/authStore";
import { calendarApi } from "@/features/calendar/api.calendar";
import { useQuery } from "@tanstack/react-query";
import { UnscheduledQueue } from "./UnscheduledQueue";
import { CalendarGrid } from "./CalendarGrid";
import { ScheduleFormDialog } from "./ScheduleFormDialog";
import { DraggableComponentCard } from "./DraggableComponentCard";
import { DraggableScheduledCard } from "./DraggableScheduledCard";
import { useUpdateExamSchedule } from "@/features/exam/hooks.exam";
import { toast } from "sonner";

interface SchedulerTabProps {
  exam: any;
  examId: number;
}

export function SchedulerTab({ exam, examId }: SchedulerTabProps) {
  const activeSessionId = useAuthStore((s) => s.activeSessionId);

  const spannedMonths = useMemo(() => {
    if (!exam?.startDate || !exam?.endDate) return [];
    try {
      const start = new Date(exam.startDate);
      const end = new Date(exam.endDate);
      const months: { year: string; month: string }[] = [];

      let current = new Date(start.getFullYear(), start.getMonth(), 1);
      const last = new Date(end.getFullYear(), end.getMonth(), 1);

      while (current <= last) {
        months.push({
          year: current.getFullYear().toString(),
          month: (current.getMonth() + 1).toString(),
        });
        current.setMonth(current.getMonth() + 1);
      }
      return months;
    } catch (e) {
      console.error("Failed to parse exam dates", e);
      return [];
    }
  }, [exam?.startDate, exam?.endDate]);

  // Fetch Calendar Academic Days
  const { data: allFetchedDays, isLoading: calendarLoading } = useQuery({
    queryKey: ["calendar", "exam-range", examId, exam?.startDate, exam?.endDate, activeSessionId],
    queryFn: async () => {
      if (!activeSessionId || spannedMonths.length === 0) return [];
      const promises = spannedMonths.map(async (m) => {
        try {
          const response = await calendarApi.getMonthDashboard({
            year: m.year,
            month: m.month,
            sessionId: Number(activeSessionId),
          });
          if (Array.isArray(response)) return response;
          if (
            response &&
            typeof response === "object" &&
            "data" in response &&
            Array.isArray(response.data)
          ) {
            return response.data;
          }
          return [];
        } catch (error) {
          console.error("Failed to fetch calendar month:", error);
          return [];
        }
      });
      const results = await Promise.all(promises);
      return results.flat();
    },
    enabled: !!activeSessionId && spannedMonths.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const calendarDays = useMemo(() => {
    if (!allFetchedDays || !exam?.startDate || !exam?.endDate) return [];
    return allFetchedDays.filter((day: any) => {
      return day.date >= exam.startDate && day.date <= exam.endDate;
    });
  }, [allFetchedDays, exam?.startDate, exam?.endDate]);

  // Calculate Unscheduled components
  const unscheduledComponents = useMemo(() => {
    if (!exam?.examClasses) return [];
    const list: any[] = [];
    exam.examClasses.forEach((ec: any) => {
      if (ec.subjects) {
        ec.subjects.forEach((es: any) => {
          if (es.components) {
            es.components.forEach((comp: any) => {
              const scheduled = comp.schedules && comp.schedules.length > 0;
              if (!scheduled) {
                list.push({
                  id: comp.id,
                  examSubjectId: comp.examSubjectId,
                  subjectComponentId: comp.subjectComponentId,
                  maxMarks: comp.maxMarks,
                  passingMarks: comp.passingMarks,
                  className: ec.class?.name + " " + ec.class?.section,
                  classId: ec.classId,
                  subjectId: es.subjectId,
                  subjectName: es.subject?.name,
                  componentName: comp.subjectComponent?.name,
                  componentType: comp.subjectComponent?.type,
                });
              }
            });
          }
        });
      }
    });
    return list;
  }, [exam?.examClasses]);

  // Map of date string -> scheduled components
  const scheduledComponentsMap = useMemo(() => {
    const map: Record<string, any[]> = {};
    if (!exam?.examClasses) return map;
    exam.examClasses.forEach((ec: any) => {
      if (ec.subjects) {
        ec.subjects.forEach((es: any) => {
          if (es.components) {
            es.components.forEach((comp: any) => {
              if (comp.schedules) {
                comp.schedules.forEach((sch: any) => {
                  if (sch.day?.date) {
                    if (!map[sch.day.date]) map[sch.day.date] = [];
                    map[sch.day.date].push({
                      id: sch.id,
                      componentId: comp.id,
                      subjectName: es.subject?.name,
                      componentName: comp.subjectComponent?.name,
                      className: ec.class?.name + " " + ec.class?.section,
                      startTime: sch.startTime,
                      endTime: sch.endTime,
                      room: sch.room,
                      invigilatorName: sch.invigilator?.user?.name,
                      batchName: sch.batch?.name,
                      // For editing:
                      classId: ec.classId,
                      subjectId: es.subjectId,
                      subjectComponentId: comp.subjectComponentId,
                      invigilatorId: sch.invigilatorId,
                      batchId: sch.academicBatchId,
                      dayId: sch.academicDayId,
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
    return map;
  }, [exam?.examClasses]);

  // Dialog and Drag States
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [activeDragComponent, setActiveDragComponent] = useState<any>(null);
  const [activeDragSchedule, setActiveDragSchedule] = useState<any>(null);
  const [dndScheduleData, setDndScheduleData] = useState<{ component: any; day: any } | null>(null);
  const [editScheduleData, setEditScheduleData] = useState<any>(null);

  // Setup sensors with activation constraints
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200,
      tolerance: 5,
    },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  const updateScheduleMutation = useUpdateExamSchedule();

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const component = active.data.current?.component;
    const schedule = active.data.current?.schedule;
    if (component) {
      setActiveDragComponent(component);
    } else if (schedule) {
      setActiveDragSchedule(schedule);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragComponent(null);
    setActiveDragSchedule(null);
    if (!over) return;

    const dragId = active.id.toString();
    const dropId = over.id.toString();
    const day = over.data.current?.day;

    if (!day) return;

    if (dragId.startsWith("draggable-") && !dragId.startsWith("draggable-scheduled-") && dropId.startsWith("droppable-")) {
      const component = active.data.current?.component;

      if (component) {
        if (day.isHoliday) {
          toast.error("Cannot schedule exams on a holiday!");
          return;
        }
        setDndScheduleData({ component, day });
        setFormMode("create");
        setScheduleModalOpen(true);
      }
    } else if (dragId.startsWith("draggable-scheduled-") && dropId.startsWith("droppable-")) {
      const schedule = active.data.current?.schedule;

      if (schedule) {
        if (day.isHoliday) {
          toast.error("Cannot schedule/move exams to a holiday!");
          return;
        }

        if (schedule.dayId === day.id) return;

        updateScheduleMutation.mutate(
          {
            scheduleId: schedule.id,
            data: {
              academicDayId: day.id,
            },
          },
          {
            onSuccess: () => {
              toast.success("Rescheduled exam successfully");
            },
            onError: (err: any) => {
              toast.error(err.message || "Failed to reschedule exam");
            },
          }
        );
      }
    }
  };

  const handleEditSchedule = (schedule: any) => {
    setEditScheduleData(schedule);
    setFormMode("edit");
    setScheduleModalOpen(true);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveDragComponent(null);
        setActiveDragSchedule(null);
      }}
    >
      <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm h-[calc(100vh-14rem)] overflow-hidden">
        {/* Unscheduled Queue */}
        <UnscheduledQueue unscheduledComponents={unscheduledComponents} />

        {/* Academic Calendar Grid */}
        <CalendarGrid
          calendarDays={calendarDays}
          calendarLoading={calendarLoading}
          scheduledComponentsMap={scheduledComponentsMap}
          onEditSchedule={handleEditSchedule}
          examStartDate={exam?.startDate}
          examEndDate={exam?.endDate}
        />
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeDragComponent ? (
          <div className="opacity-80 scale-105 pointer-events-none rotate-1 shadow-2xl transition-all">
            <DraggableComponentCard component={activeDragComponent} />
          </div>
        ) : activeDragSchedule ? (
          <div className="opacity-80 scale-105 pointer-events-none rotate-1 shadow-2xl transition-all w-60">
            <DraggableScheduledCard
              sch={activeDragSchedule}
              onEditSchedule={() => {}}
              onDeleteSchedule={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>

      {/* Scheduling Form Dialog */}
      <ScheduleFormDialog
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        mode={formMode}
        dndScheduleData={dndScheduleData}
        editScheduleData={editScheduleData}
      />
    </DndContext>
  );
}
