"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MarksType } from "@/features/exam/types.exam";
import { Loader2 } from "lucide-react";

interface AddComponentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectName: string;
  componentName: string;
  componentType: string;
  initialMaxMarks?: number;
  initialPassingMarks?: number;
  initialMarksType?: MarksType;
  onConfirm: (maxMarks: number, passingMarks: number, marksType: MarksType) => Promise<void>;
  isPending: boolean;
  title?: string;
}

export function AddComponentDialog({
  open,
  onOpenChange,
  subjectName,
  componentName,
  componentType,
  initialMaxMarks,
  initialPassingMarks,
  initialMarksType,
  onConfirm,
  isPending,
  title = "Configure Component Rubric",
}: AddComponentDialogProps) {
  const [maxMarks, setMaxMarks] = useState("100");
  const [passingMarks, setPassingMarks] = useState("33");
  const [marksType, setMarksType] = useState<MarksType>(MarksType.NUMBER);

  useEffect(() => {
    if (open) {
      setMaxMarks(initialMaxMarks !== undefined ? String(initialMaxMarks) : "100");
      setPassingMarks(initialPassingMarks !== undefined ? String(initialPassingMarks) : "33");
      setMarksType(initialMarksType || MarksType.NUMBER);
    }
  }, [open, initialMaxMarks, initialPassingMarks, initialMarksType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const max = Number(maxMarks);
    const pass = Number(passingMarks);
    if (isNaN(max) || max <= 0) {
      return;
    }
    if (isNaN(pass) || pass <= 0 || pass > max) {
      return;
    }
    await onConfirm(max, pass, marksType);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Configure the grading rule for subject <strong className="font-semibold text-foreground">{subjectName}</strong> &apos;s component: <strong className="font-semibold text-foreground">{componentName} ({componentType})</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="max-marks">Max Marks</Label>
                <Input
                  id="max-marks"
                  type="number"
                  required
                  min={1}
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="passing-marks">Passing Marks</Label>
                <Input
                  id="passing-marks"
                  type="number"
                  required
                  min={1}
                  max={Number(maxMarks) || undefined}
                  value={passingMarks}
                  onChange={(e) => setPassingMarks(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="marks-type">Marks Type</Label>
              <Select
                value={marksType}
                onValueChange={(val) => setMarksType(val as MarksType)}
              >
                <SelectTrigger id="marks-type">
                  <SelectValue placeholder="Choose type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MarksType.NUMBER}>Numeric (e.g. 0-100)</SelectItem>
                  <SelectItem value={MarksType.GRADE}>Grades (e.g. A, B, C)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-1.5">
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Component
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
