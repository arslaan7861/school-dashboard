"use client";

import { useState } from "react";
import { Copy, Loader2 } from "lucide-react";
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
import { WeekDay, WEEK_DAYS } from "../types.timetable";
import { getDayLabel } from "../utils.timetable";

export const CopyDayDialog = ({
  open,
  onOpenChange,
  sourceDay,
  onCopy,
  isCopying,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceDay: WeekDay | null;
  onCopy: (targetDay: WeekDay) => void;
  isCopying: boolean;
}) => {
  const [targetDay, setTargetDay] = useState<WeekDay | "">("");

  if (!sourceDay) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Copy Schedule
          </DialogTitle>
          <DialogDescription>
            Copy all slots and entries from {getDayLabel(sourceDay)} to another day.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Day</label>
            <Select value={targetDay} onValueChange={(val: WeekDay) => setTargetDay(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select target day" />
              </SelectTrigger>
              <SelectContent>
                {WEEK_DAYS.filter(d => d.value !== sourceDay).map(d => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            Note: This will add the slots to the target day. Existing slots on the target day will not be overwritten unless they conflict.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCopying}>
            Cancel
          </Button>
          <Button 
            onClick={() => targetDay && onCopy(targetDay as WeekDay)} 
            disabled={!targetDay || isCopying}
          >
            {isCopying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Copy Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
