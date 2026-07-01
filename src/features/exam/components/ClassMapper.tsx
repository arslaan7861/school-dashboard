"use client";

import { useState, useEffect } from "react";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface ClassMapperProps {
  examClasses: any[];
  allClasses: any[];
  onSaveClasses: (classIds: number[]) => Promise<void>;
  isPending: boolean;
}

export function ClassMapper({
  examClasses,
  allClasses,
  onSaveClasses,
  isPending,
}: ClassMapperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [assignedClassIds, setAssignedClassIds] = useState<number[]>([]);

  // Initialize selected class IDs when opening modal
  useEffect(() => {
    if (isOpen) {
      const initialIds = examClasses.map((ec) => Number(ec.classId));
      setAssignedClassIds(initialIds);
    }
  }, [isOpen, examClasses]);

  const handleSubmit = async () => {
    await onSaveClasses(assignedClassIds);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="font-semibold">Step 1: Map Classes</Label>
        <Button
          variant="link"
          size="sm"
          className="h-6 p-0 text-xs text-indigo-600 hover:text-indigo-700"
          onClick={() => setIsOpen(true)}
        >
          Assign / Edit
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5 p-3 border rounded-xl bg-slate-50 min-h-[60px] dark:bg-slate-900">
        {examClasses?.map((ec) => (
          <UiBadge
            key={ec.id}
            variant="secondary"
            className="pr-1 gap-1 py-1 px-2.5 rounded-lg"
          >
            {ec.class?.name} {ec.class?.section}
          </UiBadge>
        ))}
        {(!examClasses || examClasses.length === 0) && (
          <span className="text-xs text-muted-foreground p-1">
            No classes mapped yet
          </span>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Batches/Classes</DialogTitle>
            <DialogDescription>
              Map classes in the current active session to this exam campaign.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-[300px] overflow-y-auto pr-2">
            {allClasses?.map((c) => {
              const isChecked = assignedClassIds.includes(Number(c.id));
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2.5 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Label
                    htmlFor={`class-${c.id}`}
                    className="font-medium cursor-pointer flex-1"
                  >
                    {c.name} {c.section}
                  </Label>
                  <Switch
                    id={`class-${c.id}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setAssignedClassIds([...assignedClassIds, Number(c.id)]);
                      } else {
                        setAssignedClassIds(
                          assignedClassIds.filter((id) => id !== Number(c.id)),
                        );
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending} className="gap-1.5">
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Classes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
