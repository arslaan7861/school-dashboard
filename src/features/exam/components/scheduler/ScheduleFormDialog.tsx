"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubjectsByClass } from "@/features/subjects/hooks.subject";
import { useTeachers } from "@/features/teachers/hooks.teacher";
import { useCreateExamSchedule, useUpdateExamSchedule } from "@/features/exam/hooks.exam";
import { Loader2 } from "lucide-react";

interface ScheduleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  // For Create mode
  dndScheduleData?: {
    component: any;
    day: any;
  } | null;
  // For Edit mode
  editScheduleData?: {
    id: number;
    componentId: number;
    subjectName: string;
    componentName: string;
    className: string;
    startTime: string;
    endTime: string;
    room: string;
    invigilatorId?: number;
    batchId?: number;
    dayId?: number;
    classId: number;
    subjectId: number;
    subjectComponentId: number;
  } | null;
}

export function ScheduleFormDialog({
  open,
  onOpenChange,
  mode,
  dndScheduleData,
  editScheduleData,
}: ScheduleFormDialogProps) {
  // Mutations
  const createMutation = useCreateExamSchedule();
  const updateMutation = useUpdateExamSchedule();

  // Queries
  const { data: teachers } = useTeachers();

  // Determine active class id to fetch batches
  const classId = useMemo(() => {
    if (mode === "create") {
      return dndScheduleData?.component?.classId ?? 0;
    }
    return editScheduleData?.classId ?? 0;
  }, [mode, dndScheduleData, editScheduleData]);

  const { data: subjectsByClass } = useSubjectsByClass(classId);

  // Derive target component info
  const componentInfo = useMemo(() => {
    if (mode === "create") {
      return dndScheduleData?.component;
    }
    return editScheduleData;
  }, [mode, dndScheduleData, editScheduleData]);

  // Retrieve Batches for scheduling
  const availableBatches = useMemo(() => {
    if (!componentInfo || !subjectsByClass) return [];
    const subj = subjectsByClass.find(
      (s) => s.id === componentInfo.subjectId,
    );
    if (!subj) return [];
    const comp = subj.components?.find(
      (c: any) => c.id === componentInfo.subjectComponentId,
    );
    return comp?.batches || [];
  }, [componentInfo, subjectsByClass]);

  // Local Form States
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [room, setRoom] = useState("Exam Hall 1");
  const [batchId, setBatchId] = useState("");
  const [invigilatorId, setInvigilatorId] = useState("");

  // Initialize fields on open or change
  useEffect(() => {
    if (open) {
      if (mode === "edit" && editScheduleData) {
        // Strip seconds if present in times (e.g. "09:00:00" -> "09:00")
        const cleanStart = editScheduleData.startTime.slice(0, 5);
        const cleanEnd = editScheduleData.endTime.slice(0, 5);
        setStartTime(cleanStart);
        setEndTime(cleanEnd);
        setRoom(editScheduleData.room || "");
        setBatchId(editScheduleData.batchId?.toString() ?? "");
        setInvigilatorId(editScheduleData.invigilatorId?.toString() ?? "");
      } else {
        // Create mode defaults
        setStartTime("09:00");
        setEndTime("12:00");
        setRoom("Exam Hall 1");
        setBatchId("");
        setInvigilatorId("");
      }
    }
  }, [open, mode, editScheduleData]);

  // Set default batch when available
  useEffect(() => {
    if (open && mode === "create" && availableBatches.length > 0 && !batchId) {
      setBatchId(availableBatches[0].id.toString());
    }
  }, [open, mode, availableBatches, batchId]);

  const handleSubmit = () => {
    if (!batchId) {
      toast.error("Please select an academic batch");
      return;
    }

    // Basic time validation
    if (startTime >= endTime) {
      toast.error("End time must be after start time");
      return;
    }

    if (mode === "create") {
      if (!dndScheduleData) return;
      createMutation.mutate(
        {
          examComponentId: dndScheduleData.component.id,
          academicBatchId: Number(batchId),
          academicDayId: dndScheduleData.day.id,
          startTime,
          endTime,
          room,
          invigilatorId: invigilatorId ? Number(invigilatorId) : undefined,
        },
        {
          onSuccess: () => {
            toast.success("Schedule assigned successfully");
            onOpenChange(false);
          },
          onError: (err: any) => {
            toast.error(err.message || "Conflict or failure in scheduling");
          },
        },
      );
    } else {
      if (!editScheduleData) return;
      updateMutation.mutate(
        {
          scheduleId: editScheduleData.id,
          data: {
            academicBatchId: Number(batchId),
            startTime,
            endTime,
            room,
            invigilatorId: invigilatorId ? Number(invigilatorId) : null,
          },
        },
        {
          onSuccess: () => {
            toast.success("Schedule updated successfully");
            onOpenChange(false);
          },
          onError: (err: any) => {
            toast.error(err.message || "Conflict or failure in updating schedule");
          },
        },
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-50">
            {mode === "create" ? "Configure Exam Schedule" : "Edit Exam Schedule"}
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Setup timeline and slot configurations for{" "}
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {componentInfo?.subjectName} ({componentInfo?.componentName})
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Start Time</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">End Time</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Academic Batch</Label>
            <Select value={batchId} onValueChange={setBatchId}>
              <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                <SelectValue placeholder="Choose target batch" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                {availableBatches.map((b: any) => (
                  <SelectItem key={b.id} value={b.id.toString()}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Room / Hall Location</Label>
            <Input
              placeholder="e.g., Exam Room 402"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Invigilator / Supervisor</Label>
            <Select value={invigilatorId} onValueChange={setInvigilatorId}>
              <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                <SelectValue placeholder="Assign invigilator teacher (Optional)" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                {teachers?.data?.teachers?.map((t) => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1.5">
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "create" ? "Schedule Component" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
