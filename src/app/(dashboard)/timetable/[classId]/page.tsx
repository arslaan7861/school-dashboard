"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  format,
  parse,
  differenceInMinutes,
  formatDuration,
  intervalToDuration,
} from "date-fns";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Clock,
  BookOpen,
  Users,
  Layers,
  MoreVertical,
  Loader2,
  Calendar as CalendarIcon,
  Coffee,
  ChevronRight,
  Sparkles,
  Grid3x3,
  Timer,
  GraduationCap,
  BookMarked,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
  useClassTimetable,
  useTimetableCrud,
} from "@/features/timetable/hooks.timetable";
import { useClass } from "@/features/class/hooks.class";
import { useSubjectsByClass } from "@/features/subjects/hooks.subject";
import { useTeachers } from "@/features/teachers/hooks.teacher";
import { WeekDay, WEEK_DAYS } from "@/features/timetable/types.timetable";

// Types
interface TimetableEntry {
  id: number;
  subject: { id: number; name: string; code?: string };
  component: { id: number; name: string; type: string };
  batch: { id: number; name: string };
  teacher: { id: number; name: string; initials?: string };
}

interface TimetableSlot {
  id: number;
  day: WeekDay;
  lectureNo: number;
  startTime?: string;
  endTime?: string;
  entries: TimetableEntry[];
}

// Helper functions using date-fns
const getDayLabel = (day: WeekDay): string => {
  const found = WEEK_DAYS.find((d) => d.value === day);
  return found?.label || day;
};

const formatTime = (time?: string): string => {
  if (!time) return "--:--";
  try {
    // Parse time string (HH:MM or HH:MM:SS) and format it
    const date = parse(
      time,
      time.includes(":") ? "HH:mm:ss" : "HH:mm",
      new Date(),
    );
    return format(date, "h:mm a");
  } catch {
    return time.split(":").slice(0, 2).join(":");
  }
};

const formatTimeForSubmission = (time: string): string => {
  if (!time) return "";
  return time.split(":").slice(0, 2).join(":");
};

const formatDurationMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins} min${mins !== 1 ? "s" : ""}`;
  } else if (mins === 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  } else {
    return `${hours} hour${hours !== 1 ? "s" : ""} ${mins} min${mins !== 1 ? "s" : ""}`;
  }
};

const getTimeDifference = (start?: string, end?: string): number | null => {
  if (!start || !end) return null;

  try {
    const startTime = parse(start, "HH:mm", new Date());
    const endTime = parse(end, "HH:mm", new Date());
    return differenceInMinutes(endTime, startTime);
  } catch {
    return null;
  }
};

const LECTURE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8];

// Get initials from name
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Color palette generator for subjects
const getSubjectColor = (subjectId: number, subjectName: string) => {
  const colors = [
    {
      bg: "bg-blue-100 dark:bg-blue-950/40",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-700 dark:text-blue-300",
      badge: "bg-blue-500",
      light: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      bg: "bg-emerald-100 dark:bg-emerald-950/40",
      border: "border-emerald-200 dark:border-emerald-800",
      text: "text-emerald-700 dark:text-emerald-300",
      badge: "bg-emerald-500",
      light: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      bg: "bg-amber-100 dark:bg-amber-950/40",
      border: "border-amber-200 dark:border-amber-800",
      text: "text-amber-700 dark:text-amber-300",
      badge: "bg-amber-500",
      light: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      bg: "bg-rose-100 dark:bg-rose-950/40",
      border: "border-rose-200 dark:border-rose-800",
      text: "text-rose-700 dark:text-rose-300",
      badge: "bg-rose-500",
      light: "bg-rose-50 dark:bg-rose-900/20",
    },
    {
      bg: "bg-purple-100 dark:bg-purple-950/40",
      border: "border-purple-200 dark:border-purple-800",
      text: "text-purple-700 dark:text-purple-300",
      badge: "bg-purple-500",
      light: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      bg: "bg-cyan-100 dark:bg-cyan-950/40",
      border: "border-cyan-200 dark:border-cyan-800",
      text: "text-cyan-700 dark:text-cyan-300",
      badge: "bg-cyan-500",
      light: "bg-cyan-50 dark:bg-cyan-900/20",
    },
    {
      bg: "bg-orange-100 dark:bg-orange-950/40",
      border: "border-orange-200 dark:border-orange-800",
      text: "text-orange-700 dark:text-orange-300",
      badge: "bg-orange-500",
      light: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      bg: "bg-indigo-100 dark:bg-indigo-950/40",
      border: "border-indigo-200 dark:border-indigo-800",
      text: "text-indigo-700 dark:text-indigo-300",
      badge: "bg-indigo-500",
      light: "bg-indigo-50 dark:bg-indigo-900/20",
    },
  ];
  const index = (subjectId + subjectName.length) % colors.length;
  return colors[index];
};

// Detailed Entries Dialog Component
const EntriesDetailDialog = ({
  open,
  onOpenChange,
  slot,
  onEditEntry,
  onDeleteEntry,
  onAddEntry,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot: TimetableSlot | null;
  onEditEntry: (entry: TimetableEntry) => void;
  onDeleteEntry: (entry: TimetableEntry) => void;
  onAddEntry: (slot: TimetableSlot) => void;
}) => {
  if (!slot) return null;

  const duration = getTimeDifference(slot.startTime, slot.endTime);
  const durationText = duration ? formatDurationMinutes(duration) : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="w-5 h-5 text-primary" />
            Slot Details - {getDayLabel(slot.day)} Lecture {slot.lectureNo}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <span>
              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
            </span>
            {duration && duration > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                <span className="font-mono text-xs">{durationText}</span>
              </>
            )}
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span>
              {slot.entries.length}{" "}
              {slot.entries.length === 1 ? "entry" : "entries"}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {slot.entries.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <BookOpen className="w-12 h-12 text-muted-400 mx-auto mb-3" />
              <p className="text-muted-400 mb-4">No entries in this slot</p>
              <Button
                onClick={() => {
                  onOpenChange(false);
                  onAddEntry(slot);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Entry
              </Button>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px] pr-4">
              <div className="space-y-4">
                {slot.entries.map((entry) => {
                  const colors = getSubjectColor(
                    entry.subject.id,
                    entry.subject.name,
                  );
                  return (
                    <div
                      key={entry.id}
                      className={cn(
                        "p-4 rounded-lg border",
                        colors.light,
                        colors.border,
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Header with Subject and Type */}
                          <div className="flex items-center gap-2 mb-3">
                            <div
                              className={cn(
                                "w-2 h-8 rounded-full",
                                colors.badge,
                              )}
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h3
                                  className={cn("font-semibold", colors.text)}
                                >
                                  {entry.subject.name}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    colors.bg,
                                    colors.border,
                                    colors.text,
                                  )}
                                >
                                  {entry.component.type}
                                </Badge>
                                {entry.subject.code && (
                                  <span className="text-xs text-muted-foreground">
                                    {entry.subject.code}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-3 gap-4 ml-4">
                            {/* Component */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Layers className="w-3.5 h-3.5" />
                                <span>Component</span>
                              </div>
                              <p className="text-sm font-medium">
                                {entry.component.name}
                              </p>
                            </div>

                            {/* Batch */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="w-3.5 h-3.5" />
                                <span>Batch</span>
                              </div>
                              <p className="text-sm font-medium">
                                Batch {entry.batch.name}
                              </p>
                            </div>

                            {/* Teacher */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <GraduationCap className="w-3.5 h-3.5" />
                                <span>Teacher</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {getInitials(entry.teacher.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <p className="text-sm font-medium">
                                  {entry.teacher.name}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 ml-4">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  onOpenChange(false);
                                  onEditEntry(entry);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit entry</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => {
                                  onOpenChange(false);
                                  onDeleteEntry(entry);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete entry</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Entry Card Component
const EntryItem = ({
  entry,
  onEdit,
  onDelete,
  onView,
  compact = false,
}: {
  entry: TimetableEntry;
  onEdit: () => void;
  onDelete: () => void;
  onView?: () => void;
  compact?: boolean;
}) => {
  const colors = getSubjectColor(entry.subject.id, entry.subject.name);

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:shadow-sm transition-all",
          colors.bg,
          colors.border,
        )}
        onClick={onView}
      >
        <div className={cn("w-1 h-8 rounded-full", colors.badge)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className={cn("text-xs font-medium truncate", colors.text)}>
              {entry.subject.name}
            </span>
            <Badge variant="outline" className="h-4 text-[9px] px-1">
              {entry.component.type}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="w-3 h-3" />
            <span className="truncate">{entry.batch.name}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <GraduationCap className="w-3 h-3" />
            <span className="truncate">{entry.teacher.name.split(" ")[0]}</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreVertical className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="w-3 h-3 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="w-3 h-3 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className={cn("p-3 rounded-lg border", colors.bg, colors.border)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1">
          <div className={cn("w-1.5 h-12 rounded-full", colors.badge)} />
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className={cn("font-medium", colors.text)}>
                {entry.subject.name}
              </span>
              <Badge variant="outline" className="text-xs">
                {entry.component.type}
              </Badge>
              {entry.subject.code && (
                <span className="text-xs text-muted-foreground">
                  {entry.subject.code}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Layers className="w-3 h-3" />
                <span>{entry.component.name}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>{entry.batch.name}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground col-span-2">
                <GraduationCap className="w-3 h-3" />
                <span>{entry.teacher.name}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onEdit}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit entry</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete entry</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

// Slot Card Component
const SlotCard = ({
  slot,
  day,
  lectureNo,
  onEditSlot,
  onAddEntry,
  onDeleteSlot,
  onEditEntry,
  onDeleteEntry,
  onViewDetails,
  onAddSlot,
}: {
  slot: TimetableSlot | null | undefined;
  day: WeekDay;
  lectureNo: number;
  onEditSlot: (slot: TimetableSlot) => void;
  onAddEntry: (slot: TimetableSlot) => void;
  onDeleteSlot: (slotId: number) => void;
  onEditEntry: (entry: TimetableEntry) => void;
  onDeleteEntry: (entry: TimetableEntry) => void;
  onViewDetails: (slot: TimetableSlot) => void;
  onAddSlot: (day: WeekDay, lectureNo: number) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasEntries = slot?.entries && slot.entries.length > 0;
  const entriesCount = slot?.entries?.length || 0;
  const displayEntries = expanded ? slot?.entries : slot?.entries?.slice(0, 2);

  if (!slot) {
    return (
      <div
        onClick={() => onAddSlot(day, lectureNo)}
        className="h-[200px] bg-secondary border-2 border-dashed border-muted-300 dark:border-muted-700 rounded-xl bg-muted/5 hover:bg-muted/10 transition-all group"
      >
        <div className="h-full flex flex-col items-center justify-center p-4">
          <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center mb-2">
            <Plus className="w-5 h-5 text-muted-400" />
          </div>
          <p className="text-xs text-muted-400 mb-3">No slot scheduled</p>
          <p className="text-sm text-secondary-foreground">Tap to add</p>
        </div>
      </div>
    );
  }

  const startTime = formatTime(slot.startTime);
  const endTime = formatTime(slot.endTime);
  const duration = getTimeDifference(slot.startTime, slot.endTime);
  const durationText = duration ? formatDurationMinutes(duration) : "";

  return (
    <div className="h-[200px] border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      {/* Slot Header */}
      <div className="p-2 border-b bg-muted/5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Badge
              variant="outline"
              className="bg-primary/5 text-primary border-primary/20 h-5 px-1.5 text-[10px]"
            >
              L{lectureNo}
            </Badge>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="w-2.5 h-2.5" />
              <span className="font-mono">
                {startTime} - {endTime}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {hasEntries && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onViewDetails(slot)}
              >
                <Eye className="w-3 h-3" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditSlot(slot)}>
                  <Edit className="w-3.5 h-3.5 mr-2" />
                  Edit Timing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddEntry(slot)}>
                  <Plus className="w-3.5 h-3.5 mr-2" />
                  Add Entry
                </DropdownMenuItem>
                {hasEntries && (
                  <DropdownMenuItem onClick={() => onViewDetails(slot)}>
                    <Eye className="w-3.5 h-3.5 mr-2" />
                    View Details
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDeleteSlot(slot.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Delete Slot
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {durationText && (
          <p className="text-[8px] text-muted-400 mt-0.5">{durationText}</p>
        )}
      </div>

      {/* Slot Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-2">
        {hasEntries ? (
          <>
            <div className="space-y-1.5">
              {displayEntries?.map((entry) => (
                <EntryItem
                  key={entry.id}
                  entry={entry}
                  onEdit={() => onEditEntry(entry)}
                  onDelete={() => onDeleteEntry(entry)}
                  onView={() => onViewDetails(slot)}
                  compact
                />
              ))}
            </div>

            {entriesCount > 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="w-full mt-1.5 h-6 text-[10px]"
              >
                {expanded ? <>Show less</> : <>+{entriesCount - 2} more</>}
              </Button>
            )}
          </>
        ) : (
          <div
            onClick={() => onAddEntry(slot)}
            className="h-full flex flex-col items-center justify-center"
          >
            <p className="text-[10px] text-muted-400 mb-2">No entries</p>
            <p className="text-sm text-muted-400">Tap to add</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Recess Card Component
const RecessCard = ({ recess, day }: { recess?: any; day: WeekDay }) => {
  // Format the duration in a more readable way
  const formatBreakDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min${minutes !== 1 ? "s" : ""}`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} hour${hours !== 1 ? "s" : ""}`;
    }
    return `${hours} hour${hours !== 1 ? "s" : ""} ${mins} min${mins !== 1 ? "s" : ""}`;
  };

  // Format time for display in recess card
  const formatRecessTime = (time?: string): string => {
    if (!time) return "";
    try {
      const date = parse(time, "HH:mm", new Date());
      return format(date, "h:mm a");
    } catch {
      return time;
    }
  };

  return (
    <div
      className={cn(
        "h-[200px] rounded-xl border-2 p-3 transition-all",
        recess
          ? "border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10 hover:shadow-md"
          : "border-dashed border-muted-300 dark:border-muted-700 bg-muted/5 hover:bg-muted/10",
      )}
    >
      <div className="h-full flex flex-col items-center justify-center text-center">
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all",
            recess ? "bg-amber-100 dark:bg-amber-900/50" : "bg-muted/20",
          )}
        >
          <Coffee
            className={cn(
              "w-6 h-6",
              recess ? "text-amber-600 dark:text-amber-400" : "text-muted-400",
            )}
          />
        </div>

        {recess ? (
          <>
            <Badge
              variant="secondary"
              className="mb-2 bg-amber-200 text-amber-800 border-amber-300 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700 font-mono"
            >
              {recess.display}
            </Badge>
            <h4 className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
              Break Time
            </h4>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
              {formatRecessTime(recess.start)} - {formatRecessTime(recess.end)}
            </p>
            <p className="text-[10px] text-amber-500/70 dark:text-amber-500/50 mt-2">
              {formatBreakDuration(recess.duration)}
            </p>
          </>
        ) : (
          <>
            <h4 className="font-medium text-muted-400 text-sm mb-1">
              No Recess
            </h4>
            <p className="text-xs text-muted-400">Scheduled</p>
            <p className="text-[10px] text-muted-300 mt-2">Between L4 & L5</p>
          </>
        )}
      </div>
    </div>
  );
};

// Day Column Component
const DayColumn = ({
  day,
  label,
  slots,
  recess,
  onEditSlot,
  onAddEntry,
  onDeleteSlot,
  onEditEntry,
  onDeleteEntry,
  onViewDetails,
  onAddSlot,
}: {
  day: WeekDay;
  label: string;
  slots: Record<number, TimetableSlot | null | undefined>;
  recess: any;
  onEditSlot: (slot: TimetableSlot) => void;
  onAddEntry: (slot: TimetableSlot) => void;
  onDeleteSlot: (slotId: number) => void;
  onEditEntry: (entry: TimetableEntry) => void;
  onDeleteEntry: (entry: TimetableEntry) => void;
  onViewDetails: (slot: TimetableSlot) => void;
  onAddSlot: (day: WeekDay, lectureNo: number) => void;
}) => {
  const getDayColor = (day: WeekDay) => {
    const colors = {
      monday: "bg-blue-500",
      tuesday: "bg-emerald-500",
      wednesday: "bg-amber-500",
      thursday: "bg-rose-500",
      friday: "bg-purple-500",
      saturday: "bg-cyan-500",
    };
    return colors[day];
  };

  return (
    <div className="space-y-3">
      {/* Day Header */}
      <div className="sticky top-0 bg-background pt-2 pb-2 z-10">
        <div className="flex items-center gap-2">
          <div className={cn("w-2.5 h-2.5 rounded-full", getDayColor(day))} />
          <h3 className="font-semibold text-sm">{label}</h3>
        </div>
        <Separator className="mt-1" />
      </div>

      {/* Lecture Slots - Fixed height container */}
      <div className="space-y-3">
        {/* Lectures 1-4 */}
        {LECTURE_NUMBERS.slice(0, 4).map((lectureNo) => (
          <SlotCard
            key={lectureNo}
            slot={slots[lectureNo]}
            day={day}
            lectureNo={lectureNo}
            onEditSlot={onEditSlot}
            onAddEntry={onAddEntry}
            onDeleteSlot={onDeleteSlot}
            onEditEntry={onEditEntry}
            onDeleteEntry={onDeleteEntry}
            onViewDetails={onViewDetails}
            onAddSlot={onAddSlot}
          />
        ))}

        {/* Recess - Between 4th and 5th lecture */}
        <RecessCard recess={recess} day={day} />

        {/* Lectures 5-8 */}
        {LECTURE_NUMBERS.slice(4).map((lectureNo) => (
          <SlotCard
            key={lectureNo}
            slot={slots[lectureNo]}
            day={day}
            lectureNo={lectureNo}
            onEditSlot={onEditSlot}
            onAddEntry={onAddEntry}
            onDeleteSlot={onDeleteSlot}
            onEditEntry={onEditEntry}
            onDeleteEntry={onDeleteEntry}
            onViewDetails={onViewDetails}
            onAddSlot={onAddSlot}
          />
        ))}
      </div>
    </div>
  );
};

export default function TimetablePage() {
  const params = useParams();
  const router = useRouter();
  const classId = Number(params.classId);

  // UI State
  const [selectedDay, setSelectedDay] = useState<WeekDay | "all">("all");

  // Dialog States
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(
    null,
  );
  const [isAddSlotDialogOpen, setIsAddSlotDialogOpen] = useState(false);
  const [isEditSlotDialogOpen, setIsEditSlotDialogOpen] = useState(false);
  const [isAddEntryDialogOpen, setIsAddEntryDialogOpen] = useState(false);
  const [isEditEntryDialogOpen, setIsEditEntryDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"slot" | "entry" | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<TimetableEntry | null>(null);

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
  const { data: classData, isLoading: isLoadingClass } = useClass(
    String(classId),
  );
  const { data: timetable, isLoading: isLoadingTimetable } =
    useClassTimetable(classId);
  const { data: subjects = [], isLoading: isLoadingSubjects } =
    useSubjectsByClass(classId, {
      includeDetails: true,
    });
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
  } = useTimetableCrud(classId);

  const teachers = teachersData?.data?.teachers || [];
  const classInfo = classData?.data;

  const isLoading =
    isLoadingClass ||
    isLoadingTimetable ||
    isLoadingSubjects ||
    isLoadingTeachers;

  // Computed Properties
  const availableComponents = useMemo(() => {
    if (!entryForm.subjectId) return [];
    const subject = subjects.find((s) => s.id === Number(entryForm.subjectId));
    return subject?.components || [];
  }, [subjects, entryForm.subjectId]);

  const availableBatches = useMemo(() => {
    if (!entryForm.subjectComponentId) return [];
    const component = availableComponents.find(
      (c) => c.id === Number(entryForm.subjectComponentId),
    );
    return component?.batches || [];
  }, [availableComponents, entryForm.subjectComponentId]);

  // Auto-select teacher when batch is selected
  useEffect(() => {
    if (entryForm.academicBatchId) {
      const selectedBatch = availableBatches.find(
        (b) => b.id === Number(entryForm.academicBatchId),
      );
      if (selectedBatch?.teacherId) {
        setEntryForm((prev) => ({
          ...prev,
          teacherId: selectedBatch.teacherId.toString(),
        }));
      }
    }
  }, [entryForm.academicBatchId, availableBatches]);

  // Organize timetable data
  const timetableGrid: Record<
    WeekDay,
    Record<number, TimetableSlot | null>
  > = useMemo(() => {
    const grid: Record<WeekDay, Record<number, TimetableSlot | null>> = {
      monday: {},
      tuesday: {},
      wednesday: {},
      thursday: {},
      friday: {},
      saturday: {},
    };

    LECTURE_NUMBERS.forEach((lectureNo) => {
      grid.monday[lectureNo] = null;
      grid.tuesday[lectureNo] = null;
      grid.wednesday[lectureNo] = null;
      grid.thursday[lectureNo] = null;
      grid.friday[lectureNo] = null;
      grid.saturday[lectureNo] = null;
    });

    if (timetable) {
      timetable.slots?.forEach((slot: TimetableSlot) => {
        if (grid[slot.day]) {
          grid[slot.day][slot.lectureNo] = slot;
        }
      });
    }

    return grid;
  }, [timetable]);

  const parseTimeSafe = (time?: string): Date | null => {
    if (!time) return null;

    try {
      const parts = time.split(":");

      if (parts.length === 3) {
        return parse(time, "HH:mm:ss", new Date());
      }

      return parse(time, "HH:mm", new Date());
    } catch {
      return null;
    }
  };

  const recessForDay = useMemo(() => {
    const recess: Record<WeekDay, any> = {
      monday: null,
      tuesday: null,
      wednesday: null,
      thursday: null,
      friday: null,
      saturday: null,
    };

    WEEK_DAYS.forEach(({ value: day }) => {
      const lecture4 = timetableGrid[day]?.[4];
      const lecture5 = timetableGrid[day]?.[5];

      if (!lecture4?.endTime || !lecture5?.startTime) {
        return;
      }

      const endL4 = parseTimeSafe(lecture4.endTime);
      const startL5 = parseTimeSafe(lecture5.startTime);

      if (!endL4 || !startL5) {
        console.warn("Invalid time detected", {
          day,
          lecture4: lecture4.endTime,
          lecture5: lecture5.startTime,
        });
        return;
      }

      const diffMinutes = differenceInMinutes(startL5, endL4);

      if (diffMinutes <= 0) {
        return;
      }

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

  // Filter days based on selection
  const filteredDays = useMemo(() => {
    if (selectedDay === "all") return WEEK_DAYS;
    return WEEK_DAYS.filter((d) => d.value === selectedDay);
  }, [selectedDay]);

  // Reset entry form
  const resetEntryForm = () => {
    setEntryForm({
      subjectId: "",
      subjectComponentId: "",
      academicBatchId: "",
      teacherId: "",
    });
  };

  // Handlers
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
        ...(slotForm.startTime && {
          startTime: formatTimeForSubmission(slotForm.startTime),
        }),
        ...(slotForm.endTime && {
          endTime: formatTimeForSubmission(slotForm.endTime),
        }),
      });

      setIsAddSlotDialogOpen(false);
      setSlotForm({
        day: "" as WeekDay,
        lectureNo: 1,
        startTime: "",
        endTime: "",
      });
      toast.success("Slot created successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to create slot");
    }
  };

  const handleEditSlot = async () => {
    if (!selectedSlot) return;

    try {
      await updateSlotAsync({
        slotId: selectedSlot.id,
        data: {
          day: slotForm.day,
          lectureNo: slotForm.lectureNo,
          ...(slotForm.startTime && {
            startTime: formatTimeForSubmission(slotForm.startTime),
          }),
          ...(slotForm.endTime && {
            endTime: formatTimeForSubmission(slotForm.endTime),
          }),
        },
      });

      setIsEditSlotDialogOpen(false);
      setSelectedSlot(null);
      toast.success("Slot updated successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update slot");
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !deleteType) return;

    try {
      if (deleteType === "slot") {
        await deleteSlotAsync(deleteId);
        toast.success("Slot deleted successfully");
      } else {
        await deleteEntryAsync(deleteId);
        toast.success("Entry deleted successfully");
      }
      setDeleteDialogOpen(false);
      setDeleteId(null);
      setDeleteType(null);
      setDeleteEntry(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete");
    }
  };

  const handleAddEntry = async () => {
    if (!selectedSlot) return;

    // Prevent adding entry to a slot that doesn't exist (id === 0)
    if (selectedSlot.id === 0) {
      toast.error("Please create the slot first before adding entries");
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
      toast.success("Entry created successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to create entry");
    }
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
      toast.success("Entry updated successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update entry");
    }
  };

  // Dialog Openers
  const openAddSlotDialog = (day: WeekDay, lectureNo: number) => {
    setSlotForm({ day, lectureNo, startTime: "", endTime: "" });
    setIsAddSlotDialogOpen(true);
  };

  const openEditSlotDialog = (slot: TimetableSlot) => {
    setSelectedSlot(slot);
    setSlotForm({
      day: slot.day,
      lectureNo: slot.lectureNo,
      startTime: slot.startTime || "",
      endTime: slot.endTime || "",
    });
    setIsEditSlotDialogOpen(true);
  };

  const openAddEntryDialog = (slot: TimetableSlot) => {
    // Prevent opening add entry dialog for non-existent slots
    if (slot.id === 0) {
      toast.error("Please create the slot first");
      return;
    }
    setSelectedSlot(slot);
    resetEntryForm();
    setIsAddEntryDialogOpen(true);
  };

  const openEditEntryDialog = (entry: TimetableEntry) => {
    setSelectedEntry(entry);
    setEntryForm({
      subjectId: entry.subject.id.toString(),
      subjectComponentId: entry.component.id.toString(),
      academicBatchId: entry.batch.id.toString(),
      teacherId: entry.teacher.id.toString(),
    });
    setIsEditEntryDialogOpen(true);
  };

  const openViewDetailsDialog = (slot: TimetableSlot) => {
    setSelectedSlot(slot);
    setIsDetailsDialogOpen(true);
  };

  const openDeleteDialog = (
    id: number,
    type: "slot" | "entry",
    entry?: TimetableEntry,
  ) => {
    setDeleteId(id);
    setDeleteType(type);
    setDeleteEntry(entry || null);
    setDeleteDialogOpen(true);
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

  return (
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
            <Select
              value={selectedDay}
              onValueChange={(value: string) =>
                setSelectedDay(value as WeekDay | "all")
              }
            >
              <SelectTrigger className="w-full">
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

            <Button variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="flex-1 min-h-0 overflow-auto px-4">
          <div
            className={cn(
              "grid gap-4",
              filteredDays.length === 1
                ? "grid-cols-1"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
            )}
          >
            {filteredDays.map(({ value: day, label }) => (
              <DayColumn
                key={day}
                day={day}
                label={label}
                slots={timetableGrid[day]}
                recess={recessForDay[day]}
                onEditSlot={openEditSlotDialog}
                onAddEntry={openAddEntryDialog}
                onDeleteSlot={(slotId) => openDeleteDialog(slotId, "slot")}
                onEditEntry={openEditEntryDialog}
                onDeleteEntry={(entry) =>
                  openDeleteDialog(entry.id, "entry", entry)
                }
                onViewDetails={openViewDetailsDialog}
                onAddSlot={openAddSlotDialog}
              />
            ))}
          </div>
        </div>

        {/* Entries Detail Dialog */}
        <EntriesDetailDialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          slot={selectedSlot}
          onEditEntry={openEditEntryDialog}
          onDeleteEntry={(entry) => openDeleteDialog(entry.id, "entry", entry)}
          onAddEntry={openAddEntryDialog}
        />

        {/* Add Slot Dialog */}
        <Dialog
          open={isAddSlotDialogOpen}
          onOpenChange={setIsAddSlotDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Slot</DialogTitle>
              <DialogDescription>
                Add timing for {slotForm.day && getDayLabel(slotForm.day)}{" "}
                Lecture {slotForm.lectureNo}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Time</label>
                <Input
                  type="time"
                  value={slotForm.startTime}
                  onChange={(e) =>
                    setSlotForm({ ...slotForm, startTime: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Enter time in 24-hour format (e.g., 09:00)
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Time</label>
                <Input
                  type="time"
                  value={slotForm.endTime}
                  onChange={(e) =>
                    setSlotForm({ ...slotForm, endTime: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Enter time in 24-hour format (e.g., 10:00)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddSlotDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddSlot} disabled={isCreatingSlot}>
                {isCreatingSlot ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Slot"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Slot Dialog */}
        <Dialog
          open={isEditSlotDialogOpen}
          onOpenChange={setIsEditSlotDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Slot</DialogTitle>
              <DialogDescription>
                Update slot timing and details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Day</label>
                <Select
                  value={slotForm.day}
                  onValueChange={(value: WeekDay) =>
                    setSlotForm({ ...slotForm, day: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WEEK_DAYS.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Lecture Number</label>
                <Select
                  value={slotForm.lectureNo.toString()}
                  onValueChange={(value) =>
                    setSlotForm({ ...slotForm, lectureNo: parseInt(value) })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LECTURE_NUMBERS.map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        Lecture {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Time</label>
                <Input
                  type="time"
                  value={slotForm.startTime}
                  onChange={(e) =>
                    setSlotForm({ ...slotForm, startTime: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Time</label>
                <Input
                  type="time"
                  value={slotForm.endTime}
                  onChange={(e) =>
                    setSlotForm({ ...slotForm, endTime: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditSlotDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEditSlot} disabled={isUpdatingSlot}>
                {isUpdatingSlot ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update Slot"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Entry Dialog */}
        <Dialog
          open={isAddEntryDialogOpen}
          onOpenChange={setIsAddEntryDialogOpen}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Entry</DialogTitle>
              <DialogDescription>
                Add a new entry to this slot
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Select
                  value={entryForm.subjectId}
                  onValueChange={(value) => {
                    setEntryForm({
                      ...entryForm,
                      subjectId: value,
                      subjectComponentId: "",
                      academicBatchId: "",
                      teacherId: "",
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem
                        key={subject.id}
                        value={subject.id.toString()}
                      >
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {entryForm.subjectId && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Component</label>
                  <Select
                    value={entryForm.subjectComponentId}
                    onValueChange={(value) => {
                      setEntryForm({
                        ...entryForm,
                        subjectComponentId: value,
                        academicBatchId: "",
                        teacherId: "",
                      });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select component" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableComponents.map((component) => (
                        <SelectItem
                          key={component.id}
                          value={component.id.toString()}
                        >
                          {component.name} ({component.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {entryForm.subjectComponentId && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Batch</label>
                  <Select
                    value={entryForm.academicBatchId}
                    onValueChange={(value) =>
                      setEntryForm({ ...entryForm, academicBatchId: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBatches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id.toString()}>
                          {batch.name}{" "}
                          {batch.capacity && `(Cap: ${batch.capacity})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Teacher</label>
                <Select
                  value={entryForm.teacherId}
                  onValueChange={(value) =>
                    setEntryForm({ ...entryForm, teacherId: value })
                  }
                  disabled={!entryForm.academicBatchId}
                >
                  <SelectTrigger
                    className={
                      !entryForm.academicBatchId ? "bg-muted w-full" : "w-full"
                    }
                  >
                    <SelectValue
                      placeholder={
                        !entryForm.academicBatchId
                          ? "Select a batch first"
                          : "Select teacher"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher: any) => (
                      <SelectItem
                        key={teacher.id}
                        value={teacher.id.toString()}
                      >
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {entryForm.academicBatchId && entryForm.teacherId && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Teacher auto-selected from batch
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddEntryDialogOpen(false);
                  resetEntryForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddEntry}
                disabled={
                  isCreatingEntry ||
                  !entryForm.subjectId ||
                  !entryForm.subjectComponentId ||
                  !entryForm.academicBatchId ||
                  !entryForm.teacherId
                }
              >
                {isCreatingEntry ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Entry"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Entry Dialog */}
        <Dialog
          open={isEditEntryDialogOpen}
          onOpenChange={setIsEditEntryDialogOpen}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Entry</DialogTitle>
              <DialogDescription>Update entry details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Select
                  value={entryForm.subjectId}
                  onValueChange={(value) => {
                    setEntryForm({
                      ...entryForm,
                      subjectId: value,
                      subjectComponentId: "",
                      academicBatchId: "",
                      teacherId: "",
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem
                        key={subject.id}
                        value={subject.id.toString()}
                      >
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {entryForm.subjectId && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Component</label>
                  <Select
                    value={entryForm.subjectComponentId}
                    onValueChange={(value) => {
                      setEntryForm({
                        ...entryForm,
                        subjectComponentId: value,
                        academicBatchId: "",
                        teacherId: "",
                      });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableComponents.map((component) => (
                        <SelectItem
                          key={component.id}
                          value={component.id.toString()}
                        >
                          {component.name} ({component.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {entryForm.subjectComponentId && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Batch</label>
                  <Select
                    value={entryForm.academicBatchId}
                    onValueChange={(value) =>
                      setEntryForm({ ...entryForm, academicBatchId: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBatches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id.toString()}>
                          {batch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Teacher</label>
                <Select
                  value={entryForm.teacherId}
                  onValueChange={(value) =>
                    setEntryForm({ ...entryForm, teacherId: value })
                  }
                  disabled={!entryForm.academicBatchId}
                >
                  <SelectTrigger
                    className={
                      !entryForm.academicBatchId ? "bg-muted w-full" : "w-full"
                    }
                  >
                    <SelectValue
                      placeholder={
                        !entryForm.academicBatchId
                          ? "Select a batch first"
                          : "Select teacher"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher: any) => (
                      <SelectItem
                        key={teacher.id}
                        value={teacher.id.toString()}
                      >
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditEntryDialogOpen(false);
                  resetEntryForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditEntry}
                disabled={
                  isUpdatingEntry ||
                  !entryForm.subjectId ||
                  !entryForm.subjectComponentId ||
                  !entryForm.academicBatchId ||
                  !entryForm.teacherId
                }
              >
                {isUpdatingEntry ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update Entry"
                )}
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
                {deleteType === "slot"
                  ? "This will permanently delete this slot and all its entries."
                  : deleteEntry
                    ? `This will permanently delete ${deleteEntry.subject.name} from this slot.`
                    : "This will permanently delete this entry."}
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeletingSlot || isDeletingEntry}
              >
                {isDeletingSlot || isDeletingEntry ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
