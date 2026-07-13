"use client";

import { Calendar as CalendarIcon, Copy, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TimetableSlot, WeekDay } from "../types.timetable";
import { getDayLabel, LECTURE_NUMBERS } from "../utils.timetable";
import { SlotCard } from "./slot-card";
import { RecessCard } from "./recess-card";

export const DayColumn = ({
  day,
  isToday,
  slots,
  onCopyDay,
  onEditSlot,
  onAddEntry,
  onDeleteSlot,
  onEditEntry,
  onDeleteEntry,
  onViewDetails,
  onAddSlot,
}: {
  day: WeekDay;
  isToday: boolean;
  slots: TimetableSlot[];
  onCopyDay: () => void;
  onEditSlot: (slot: TimetableSlot) => void;
  onAddEntry: (slot: TimetableSlot) => void;
  onDeleteSlot: (slotId: number) => void;
  onEditEntry: (entry: any) => void;
  onDeleteEntry: (entry: any) => void;
  onViewDetails: (slot: TimetableSlot) => void;
  onAddSlot: (day: WeekDay, lectureNo: number) => void;
}) => {
  return (
    <div className="flex flex-col min-w-[300px] max-w-[320px] shrink-0 border-r border-border/50">
      {/* Day Header */}
      <div className={cn(
        "sticky top-0 z-20 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        isToday && "bg-primary/5 dark:bg-primary/10 border-primary/20",
      )}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CalendarIcon className={cn("w-4 h-4", isToday ? "text-primary" : "text-muted-foreground")} />
            <h3 className={cn("font-semibold", isToday && "text-primary")}>
              {getDayLabel(day)}
            </h3>
            {isToday && (
              <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/20">
                Today
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onCopyDay}
            title="Copy Schedule"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Play className="w-3 h-3" />
            {slots.length} slots
          </span>
          <span>•</span>
          <span>
            {slots.reduce((acc, slot) => acc + (slot.entries?.length || 0), 0)} entries
          </span>
        </div>
      </div>

      {/* Slots List */}
      <div className="p-4 space-y-4 bg-muted/10 flex-1">
        {LECTURE_NUMBERS.map((lectureNo) => {
          const slot = slots.find((s) => s.lectureNo === lectureNo);

          return (
            <div key={`${day}-${lectureNo}`}>
              {/* Insert Recess between Lecture 4 and 5 */}
              {lectureNo === 5 && (
                <div className="mb-4">
                  <RecessCard 
                    day={day} 
                    recess={{
                      start: "11:30",
                      end: "12:00",
                      duration: 30,
                      display: "Recess"
                    }} 
                  />
                </div>
              )}

              <SlotCard
                slot={slot}
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
            </div>
          );
        })}
      </div>
    </div>
  );
};
