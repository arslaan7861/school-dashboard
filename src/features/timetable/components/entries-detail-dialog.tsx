"use client";

import { BookOpen, Edit, Trash2, Layers, Users, GraduationCap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { TimetableSlot, TimetableEntry } from "../types.timetable";
import { getDayLabel, formatTime, getTimeDifference, formatDurationMinutes, getSubjectColor, getInitials } from "../utils.timetable";

export const EntriesDetailDialog = ({
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
              {slot.entries?.length || 0}{" "}
              {slot.entries?.length === 1 ? "entry" : "entries"}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {!slot.entries || slot.entries.length === 0 ? (
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
                    entry.subject!.id,
                    entry.subject!.name,
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
                                  {entry.subject!.name}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    colors.bg,
                                    colors.border,
                                    colors.text,
                                  )}
                                >
                                  {entry.component!.type}
                                </Badge>
                                {/* @ts-ignore */}
                                {entry.subject.code && (
                                  <span className="text-xs text-muted-foreground">
                                    {/* @ts-ignore */}
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
                                {entry.component!.name}
                              </p>
                            </div>

                            {/* Batch */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="w-3.5 h-3.5" />
                                <span>Batch</span>
                              </div>
                              <p className="text-sm font-medium">
                                Batch {entry.batch!.name}
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
                                    {getInitials(entry.teacher!.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <p className="text-sm font-medium">
                                  {entry.teacher!.name}
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
