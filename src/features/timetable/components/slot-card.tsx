"use client";

import { useState } from "react";
import { Plus, Clock, Eye, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import { TimetableSlot, TimetableEntry, WeekDay } from "../types.timetable";
import { formatTime, getTimeDifference, formatDurationMinutes } from "../utils.timetable";
import { EntryItem } from "./entry-item";

export const SlotCard = ({
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
  
  const { setNodeRef, isOver } = useDroppable({
    id: slot ? `slot-${slot.id}` : `empty-slot-${day}-${lectureNo}`,
    data: {
      type: "slot",
      slot,
      day,
      lectureNo,
    },
  });

  const hasEntries = slot?.entries && slot.entries.length > 0;
  const entriesCount = slot?.entries?.length || 0;
  const displayEntries = expanded ? slot?.entries : slot?.entries?.slice(0, 2);

  if (!slot) {
    return (
      <div
        ref={setNodeRef}
        onClick={() => onAddSlot(day, lectureNo)}
        className={cn(
          "h-[200px] border-2 border-dashed rounded-xl transition-all group",
          isOver
            ? "border-primary bg-primary/10"
            : "border-muted-300 dark:border-muted-700 bg-muted/5 hover:bg-muted/10 bg-secondary"
        )}
      >
        <div className="h-full flex flex-col items-center justify-center p-4">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center mb-2",
            isOver ? "bg-primary/20" : "bg-muted/20"
          )}>
            <Plus className={cn("w-5 h-5", isOver ? "text-primary" : "text-muted-400")} />
          </div>
          <p className={cn("text-xs mb-3", isOver ? "text-primary/80" : "text-muted-400")}>
            {isOver ? "Drop to create slot & move" : "No slot scheduled"}
          </p>
          <p className={cn("text-sm", isOver ? "text-primary" : "text-secondary-foreground")}>
            {isOver ? "Drop here" : "Tap to add"}
          </p>
        </div>
      </div>
    );
  }

  const startTime = formatTime(slot.startTime);
  const endTime = formatTime(slot.endTime);
  const duration = getTimeDifference(slot.startTime, slot.endTime);
  const durationText = duration ? formatDurationMinutes(duration) : "";

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "h-[200px] border rounded-xl shadow-sm transition-all overflow-hidden flex flex-col",
        isOver 
          ? "border-primary bg-primary/5 ring-2 ring-primary/20 scale-[1.02]" 
          : "bg-card hover:shadow-md"
      )}
    >
      {/* Slot Header */}
      <div className={cn(
        "p-2 border-b shrink-0 transition-colors",
        isOver ? "bg-primary/10 border-primary/20" : "bg-muted/5"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Badge
              variant="outline"
              className={cn(
                "h-5 px-1.5 text-[10px]",
                isOver ? "bg-primary/20 border-primary/30 text-primary" : "bg-primary/5 text-primary border-primary/20"
              )}
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
      <div className={cn(
        "flex-1 overflow-y-auto p-2",
        isOver && !hasEntries && "bg-primary/5"
      )}>
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
            onClick={() => !isOver && onAddEntry(slot)}
            className="h-full flex flex-col items-center justify-center cursor-pointer"
          >
            <p className={cn("text-[10px] mb-2", isOver ? "text-primary/60" : "text-muted-400")}>
              {isOver ? "Drop entry here" : "No entries"}
            </p>
            <p className={cn("text-sm", isOver ? "text-primary" : "text-muted-400")}>
              {isOver ? "Move here" : "Tap to add"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
