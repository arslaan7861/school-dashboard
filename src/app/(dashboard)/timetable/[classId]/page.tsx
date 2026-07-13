"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { differenceInMinutes, parse, format } from "date-fns";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronRight,
  BookMarked,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter,
} from "@dnd-kit/core";

import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
  useClassTimetable,
  useTimetableCrud,
} from "@/features/timetable/hooks.timetable";
import { useClass } from "@/features/class/hooks.class";
import { useSubjectsByClass } from "@/features/subjects/hooks.subject";
import { useTeachers } from "@/features/teachers/hooks.teacher";
import { WeekDay, WEEK_DAYS, TimetableSlot, TimetableEntry } from "@/features/timetable/types.timetable";

// Imported Refactored Components
import { getDayLabel, LECTURE_NUMBERS, formatTimeForSubmission, formatDurationMinutes } from "@/features/timetable/utils.timetable";
import { DayColumn } from "@/features/timetable/components/day-column";
import { EntriesDetailDialog } from "@/features/timetable/components/entries-detail-dialog";
import { CopyDayDialog } from "@/features/timetable/components/copy-day-dialog";
import { EntryItem } from "@/features/timetable/components/entry-item";

export default function TimetablePage() {
  const params = useParams();
  const router = useRouter();
  const classId = Number(params.classId);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // UI State
  const [selectedDay, setSelectedDay] = useState<WeekDay | "all">("all");
  const [activeDragEntry, setActiveDragEntry] = useState<TimetableEntry | null>(null);

  // Dialog States
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  const [isAddSlotDialogOpen, setIsAddSlotDialogOpen] = useState(false);
  const [isEditSlotDialogOpen, setIsEditSlotDialogOpen] = useState(false);
  const [isAddEntryDialogOpen, setIsAddEntryDialogOpen] = useState(false);
  const [isEditEntryDialogOpen, setIsEditEntryDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"slot" | "entry" | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteEntryItem, setDeleteEntryItem] = useState<TimetableEntry | null>(null);
  
  // Copy Day State
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [copySourceDay, setCopySourceDay] = useState<WeekDay | null>(null);


  // Form States
  const [slotForm, setSlotForm] = useState({
    day: "" as WeekDay,
    lectureNo: 1,
    startTime: "",
    endTime: "",
  });

  const [entryForm, setEntryForm] = useState({
    subjectId: "",
    subjectComponentId: "",
    academicBatchId: "",
    teacherId: "",
  });

  // Data Fetching
  const { data: classData, isLoading: isLoadingClass } = useClass(classId);
  const { data: timetable, isLoading: isLoadingTimetable } = useClassTimetable(classId);
  const { data: subjects = [], isLoading: isLoadingSubjects } = useSubjectsByClass(classId, { includeDetails: true });
  const { data: teachersData, isLoading: isLoadingTeachers } = useTeachers();
  
  const {
    createSlotAsync,
    updateSlotAsync,
    deleteSlotAsync,
    createEntryAsync,
    updateEntryAsync,
    deleteEntryAsync,
    isCreatingSlot,
    isUpdatingSlot,
    isDeletingSlot,
    isCreatingEntry,
    isUpdatingEntry,
    isDeletingEntry,
    copyDayAsync,
    isCopyingDay,
    moveEntryAsync,
  } = useTimetableCrud(classId);

  const teachers = teachersData?.data?.teachers || [];
  const classInfo = classData?.data;

  const isLoading = isLoadingClass || isLoadingTimetable || isLoadingSubjects || isLoadingTeachers;

  // Computed Properties for Forms
  const availableComponents = useMemo(() => {
    if (!entryForm.subjectId) return [];
    const subject = subjects.find((s) => s.id === Number(entryForm.subjectId));
    return subject?.components || [];
  }, [subjects, entryForm.subjectId]);

  const availableBatches = useMemo(() => {
    if (!entryForm.subjectComponentId) return [];
    const component = availableComponents.find((c) => c.id === Number(entryForm.subjectComponentId));
    return component?.batches || [];
  }, [availableComponents, entryForm.subjectComponentId]);

  useEffect(() => {
    if (entryForm.academicBatchId) {
      const selectedBatch = availableBatches.find((b) => b.id === Number(entryForm.academicBatchId));
      if (selectedBatch?.teacherId) {
        setEntryForm((prev) => ({ ...prev, teacherId: selectedBatch.teacherId.toString() }));
      }
    }
  }, [entryForm.academicBatchId, availableBatches]);

  // Organize timetable data
  const timetableGrid = useMemo(() => {
    const grid = WEEK_DAYS.reduce((acc, curr) => {
      acc[curr.value] = [] as TimetableSlot[];
      return acc;
    }, {} as Record<WeekDay, TimetableSlot[]>);

    if (timetable?.slots) {
      timetable.slots.forEach((slot: any) => {
        const day = slot.day as WeekDay;
        if (grid[day]) {
          grid[day].push({ ...slot, classId } as TimetableSlot);
        }
      });
    }

    return grid;
  }, [timetable]);

  const parseTimeSafe = (time?: string): Date | null => {
    if (!time) return null;
    try {
      const parts = time.split(":");
      if (parts.length === 3) return parse(time, "HH:mm:ss", new Date());
      return parse(time, "HH:mm", new Date());
    } catch {
      return null;
    }
  };

  const recessForDay = useMemo(() => {
    const recess = WEEK_DAYS.reduce((acc, curr) => {
      acc[curr.value] = null;
      return acc;
    }, {} as Record<WeekDay, any>);

    WEEK_DAYS.forEach(({ value: day }) => {
      const slotsForDay = timetableGrid[day];
      const lecture4 = slotsForDay.find(s => s.lectureNo === 4);
      const lecture5 = slotsForDay.find(s => s.lectureNo === 5);

      if (!lecture4?.endTime || !lecture5?.startTime) return;

      const endL4 = parseTimeSafe(lecture4.endTime);
      const startL5 = parseTimeSafe(lecture5.startTime);

      if (!endL4 || !startL5) return;

      const diffMinutes = differenceInMinutes(startL5, endL4);
      if (diffMinutes <= 0) return;

      recess[day] = {
        start: lecture4.endTime,
        end: lecture5.startTime,
        startFormatted: format(endL4, "h:mm a"),
        endFormatted: format(startL5, "h:mm a"),
        duration: diffMinutes,
        display: formatDurationMinutes(diffMinutes),
      };
    });
    return recess;
  }, [timetableGrid]);

  const filteredDays = useMemo(() => {
    if (selectedDay === "all") return WEEK_DAYS;
    return WEEK_DAYS.filter((d) => d.value === selectedDay);
  }, [selectedDay]);

  const resetEntryForm = () => {
    setEntryForm({ subjectId: "", subjectComponentId: "", academicBatchId: "", teacherId: "" });
  };

  // Drag and Drop Handlers
  const handleDragStart = (event: any) => {
    const { active } = event;
    if (active.data.current?.type === "entry") {
      setActiveDragEntry(active.data.current.entry);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragEntry(null);
    const { active, over } = event;
    if (!over) return;

    const entry = active.data.current?.entry as TimetableEntry;
    const targetSlot = over.data.current?.slot as TimetableSlot | undefined;
    const targetDay = over.data.current?.day as WeekDay;
    const targetLectureNo = over.data.current?.lectureNo as number;

    if (!entry) return;
    if (targetSlot && entry.timetableSlotId === targetSlot.id) return; // Dropped in same slot

    try {
      await moveEntryAsync({
        entryId: entry.id,
        data: {
          targetDay,
          targetLectureNo,
        },
      });
    } catch (error: any) {
      toast.error(error?.message || "Failed to move entry");
    }
  };

  // Copy Day Handler
  const handleCopyDay = async (targetDay: WeekDay) => {
    if (!copySourceDay) return;
    
    try {
      await copyDayAsync({
        sourceDay: copySourceDay,
        targetDay,
      });
      setIsCopyDialogOpen(false);
    } catch (error: any) {
      // Error handled by hook
    } finally {
      setCopySourceDay(null);
    }
  };

  // Normal CRUD Handlers
  const handleAddSlot = async () => {
    if (!slotForm.day || !slotForm.lectureNo) {
      toast.error("Please select day and lecture number");
      return;
    }
    try {
      await createSlotAsync({
        classId,
        day: slotForm.day,
        lectureNo: slotForm.lectureNo,
        ...(slotForm.startTime && { startTime: formatTimeForSubmission(slotForm.startTime) }),
        ...(slotForm.endTime && { endTime: formatTimeForSubmission(slotForm.endTime) }),
      });
      setIsAddSlotDialogOpen(false);
      setSlotForm({ day: "" as WeekDay, lectureNo: 1, startTime: "", endTime: "" });
    } catch (error) {}
  };

  const handleEditSlot = async () => {
    if (!selectedSlot) return;
    try {
      await updateSlotAsync({
        slotId: selectedSlot.id,
        data: {
          day: slotForm.day,
          lectureNo: slotForm.lectureNo,
          ...(slotForm.startTime && { startTime: formatTimeForSubmission(slotForm.startTime) }),
          ...(slotForm.endTime && { endTime: formatTimeForSubmission(slotForm.endTime) }),
        },
      });
      setIsEditSlotDialogOpen(false);
      setSelectedSlot(null);
    } catch (error) {}
  };

  const handleDelete = async () => {
    if (!deleteId || !deleteType) return;
    try {
      if (deleteType === "slot") {
        await deleteSlotAsync(deleteId);
      } else {
        await deleteEntryAsync(deleteId);
      }
      setDeleteDialogOpen(false);
      setDeleteId(null);
      setDeleteType(null);
      setDeleteEntryItem(null);
    } catch (error) {}
  };

  const handleAddEntry = async () => {
    if (!selectedSlot || selectedSlot.id === 0) {
      toast.error("Please create the slot first");
      return;
    }
    try {
      await createEntryAsync({
        timetableSlotId: selectedSlot.id,
        classId,
        subjectId: Number(entryForm.subjectId),
        subjectComponentId: Number(entryForm.subjectComponentId),
        academicBatchId: Number(entryForm.academicBatchId),
        teacherId: Number(entryForm.teacherId),
      });
      setIsAddEntryDialogOpen(false);
      setSelectedSlot(null);
      resetEntryForm();
    } catch (error) {}
  };

  const handleEditEntry = async () => {
    if (!selectedEntry) return;
    try {
      await updateEntryAsync({
        entryId: selectedEntry.id,
        data: {
          subjectId: Number(entryForm.subjectId),
          subjectComponentId: Number(entryForm.subjectComponentId),
          academicBatchId: Number(entryForm.academicBatchId),
          teacherId: Number(entryForm.teacherId),
        },
      });
      setIsEditEntryDialogOpen(false);
      setSelectedEntry(null);
      resetEntryForm();
    } catch (error) {}
  };

  // Dialog Openers
  const openAddSlotDialog = (day: WeekDay, lectureNo: number) => {
    setSlotForm({ day, lectureNo, startTime: "", endTime: "" });
    setIsAddSlotDialogOpen(true);
  };

  const openEditSlotDialog = (slot: TimetableSlot) => {
    setSelectedSlot(slot);
    setSlotForm({ day: slot.day, lectureNo: slot.lectureNo, startTime: slot.startTime || "", endTime: slot.endTime || "" });
    setIsEditSlotDialogOpen(true);
  };

  const openAddEntryDialog = (slot: TimetableSlot) => {
    if (slot.id === 0) { toast.error("Please create the slot first"); return; }
    setSelectedSlot(slot);
    resetEntryForm();
    setIsAddEntryDialogOpen(true);
  };

  const openEditEntryDialog = (entry: TimetableEntry) => {
    setSelectedEntry(entry);
    setEntryForm({
      subjectId: entry.subject!.id.toString(),
      subjectComponentId: entry.component!.id.toString(),
      academicBatchId: entry.batch!.id.toString(),
      teacherId: entry.teacher!.id.toString(),
    });
    setIsEditEntryDialogOpen(true);
  };

  const openViewDetailsDialog = (slot: TimetableSlot) => {
    setSelectedSlot(slot);
    setIsDetailsDialogOpen(true);
  };

  const openDeleteDialog = (id: number, type: "slot" | "entry", entry?: TimetableEntry) => {
    setDeleteId(id);
    setDeleteType(type);
    setDeleteEntryItem(entry || null);
    setDeleteDialogOpen(true);
  };

  const openCopyDialog = (day: WeekDay) => {
    setCopySourceDay(day);
    setIsCopyDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 h-full pt-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[800px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const today = format(new Date(), 'eeee').toLowerCase() as WeekDay;

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <TooltipProvider>
        <div className="space-y-6 h-full flex flex-col pt-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={router.back}
                className="rounded-full hover:bg-primary/10 hover:text-primary"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight">Timetable</h1>
                  <Badge variant="outline" className="ml-2">
                    <BookMarked className="w-3 h-3 mr-1" />
                    {classInfo?.name}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  <span>Class {classInfo?.name}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>Section {classInfo?.section}</span>
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <Select value={selectedDay} onValueChange={(value: string) => setSelectedDay(value as WeekDay | "all")}>
                <SelectTrigger className="w-full min-w-[140px]">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Days</SelectItem>
                  {WEEK_DAYS.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Timetable Grid */}
          <div className="flex-1 min-h-0 overflow-auto px-4">
            <div
              className={cn(
                "flex gap-4 w-fit pb-8",
              )}
            >
              {filteredDays.map(({ value: day }) => (
                <DayColumn
                  key={day}
                  day={day}
                  isToday={today === day}
                  slots={timetableGrid[day]}
                  onCopyDay={() => openCopyDialog(day)}
                  onEditSlot={openEditSlotDialog}
                  onAddEntry={openAddEntryDialog}
                  onDeleteSlot={(slotId) => openDeleteDialog(slotId, "slot")}
                  onEditEntry={openEditEntryDialog}
                  onDeleteEntry={(entry) => openDeleteDialog(entry.id, "entry", entry)}
                  onViewDetails={openViewDetailsDialog}
                  onAddSlot={openAddSlotDialog}
                />
              ))}
            </div>
          </div>
          
          <DragOverlay>
            {activeDragEntry ? (
              <div className="w-[280px] shadow-xl rotate-3 opacity-90">
                <EntryItem 
                  entry={activeDragEntry} 
                  onEdit={() => {}} 
                  onDelete={() => {}} 
                  compact 
                />
              </div>
            ) : null}
          </DragOverlay>

          {/* Dialogs */}
          <EntriesDetailDialog
            open={isDetailsDialogOpen}
            onOpenChange={setIsDetailsDialogOpen}
            slot={selectedSlot}
            onEditEntry={openEditEntryDialog}
            onDeleteEntry={(entry) => openDeleteDialog(entry.id, "entry", entry)}
            onAddEntry={openAddEntryDialog}
          />
          
          <CopyDayDialog
            open={isCopyDialogOpen}
            onOpenChange={setIsCopyDialogOpen}
            sourceDay={copySourceDay}
            isCopying={isCopyingDay}
            onCopy={handleCopyDay}
          />

          {/* Add Slot Dialog */}
          <Dialog open={isAddSlotDialogOpen} onOpenChange={setIsAddSlotDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Slot</DialogTitle>
                <DialogDescription>
                  Add timing for {slotForm.day && getDayLabel(slotForm.day)} Lecture {slotForm.lectureNo}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <Input
                    type="time"
                    value={slotForm.startTime}
                    onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Time</label>
                  <Input
                    type="time"
                    value={slotForm.endTime}
                    onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddSlotDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddSlot} disabled={isCreatingSlot}>
                  {isCreatingSlot ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Slot
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Slot Dialog */}
          <Dialog open={isEditSlotDialogOpen} onOpenChange={setIsEditSlotDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Slot</DialogTitle>
                <DialogDescription>Update slot timing and details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Day</label>
                  <Select value={slotForm.day} onValueChange={(value: WeekDay) => setSlotForm({ ...slotForm, day: value })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {WEEK_DAYS.map((day) => (
                        <SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lecture Number</label>
                  <Select value={slotForm.lectureNo.toString()} onValueChange={(value) => setSlotForm({ ...slotForm, lectureNo: parseInt(value) })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LECTURE_NUMBERS.map((num) => (
                        <SelectItem key={num} value={num.toString()}>Lecture {num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <Input type="time" value={slotForm.startTime} onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Time</label>
                  <Input type="time" value={slotForm.endTime} onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditSlotDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleEditSlot} disabled={isUpdatingSlot}>
                  {isUpdatingSlot ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Update Slot
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add/Edit Entry Dialog */}
          {/* Note: I'm combining them visually since they share the same form logic in this scope. Wait, actually I'll just render them identically for simplicity as they both use entryForm */}
          <Dialog open={isAddEntryDialogOpen || isEditEntryDialogOpen} onOpenChange={(open) => {
            if(!open) { setIsAddEntryDialogOpen(false); setIsEditEntryDialogOpen(false); resetEntryForm(); }
          }}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{isEditEntryDialogOpen ? "Edit Entry" : "Add Entry"}</DialogTitle>
                <DialogDescription>{isEditEntryDialogOpen ? "Update entry details" : "Add a new entry to this slot"}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Select value={entryForm.subjectId} onValueChange={(value) => setEntryForm({ ...entryForm, subjectId: value, subjectComponentId: "", academicBatchId: "", teacherId: "" })}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>{subject.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {entryForm.subjectId && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Component</label>
                    <Select value={entryForm.subjectComponentId} onValueChange={(value) => setEntryForm({ ...entryForm, subjectComponentId: value, academicBatchId: "", teacherId: "" })}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select component" /></SelectTrigger>
                      <SelectContent>
                        {availableComponents.map((component) => (
                          <SelectItem key={component.id} value={component.id.toString()}>{component.name} ({component.type})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {entryForm.subjectComponentId && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Batch</label>
                    <Select value={entryForm.academicBatchId} onValueChange={(value) => setEntryForm({ ...entryForm, academicBatchId: value })}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select batch" /></SelectTrigger>
                      <SelectContent>
                        {availableBatches.map((batch) => (
                          <SelectItem key={batch.id} value={batch.id.toString()}>{batch.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Teacher</label>
                  <Select value={entryForm.teacherId} onValueChange={(value) => setEntryForm({ ...entryForm, teacherId: value })} disabled={!entryForm.academicBatchId}>
                    <SelectTrigger className={!entryForm.academicBatchId ? "bg-muted w-full" : "w-full"}>
                      <SelectValue placeholder={!entryForm.academicBatchId ? "Select a batch first" : "Select teacher"} />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher: any) => (
                        <SelectItem key={teacher.id} value={teacher.id.toString()}>{teacher.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsAddEntryDialogOpen(false); setIsEditEntryDialogOpen(false); resetEntryForm(); }}>Cancel</Button>
                <Button onClick={isEditEntryDialogOpen ? handleEditEntry : handleAddEntry} disabled={(isEditEntryDialogOpen ? isUpdatingEntry : isCreatingEntry) || !entryForm.subjectId || !entryForm.subjectComponentId || !entryForm.academicBatchId || !entryForm.teacherId}>
                  {(isEditEntryDialogOpen ? isUpdatingEntry : isCreatingEntry) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isEditEntryDialogOpen ? "Update Entry" : "Create Entry"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  {deleteType === "slot" ? "This will permanently delete this slot and all its entries." : "This will permanently delete this entry."}
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isDeletingSlot || isDeletingEntry}>
                  {isDeletingSlot || isDeletingEntry ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TooltipProvider>
    </DndContext>
  );
}
