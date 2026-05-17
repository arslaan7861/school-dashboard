"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { AttendanceStatus } from "@/features/academic-day/types.academic-day";

interface BulkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (attendance: any[]) => void;
  academicDayId: number | null;
  classId: string;
  students: any[];
}

const bulkOptions = [
  {
    value: "present",
    label: "Mark All as Present",
    icon: CheckCircle,
    color: "text-green-600",
  },
  {
    value: "absent",
    label: "Mark All as Absent",
    icon: XCircle,
    color: "text-red-600",
  },
  {
    value: "leave",
    label: "Mark All as Leave",
    icon: Clock,
    color: "text-yellow-600",
  },
];

export function BulkAttendanceModal({
  isOpen,
  onClose,
  onSave,
  academicDayId,
  classId,
  students,
}: BulkAttendanceModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("present");
  const [remarks, setRemarks] = useState("");

  const handleApply = () => {
    const records = students.map((student) => ({
      classStudentId: student.classStudentId,
      status: selectedStatus as AttendanceStatus,
      remarks: remarks || null,
    }));
    onSave(records);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bulk Mark Attendance</DialogTitle>
          <DialogDescription>
            Apply the same status to all students in this class.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Status</Label>
            <RadioGroup
              value={selectedStatus}
              onValueChange={setSelectedStatus}
              className="flex flex-col space-y-2"
            >
              {bulkOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label
                    htmlFor={option.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <option.icon className={`h-4 w-4 ${option.color}`} />
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Remarks (Optional)</Label>
            <Textarea
              placeholder="Add common remarks for all students..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div className="rounded-md bg-gray-50 p-3">
            <p className="text-sm text-gray-600">
              This will affect all <strong>{students.length}</strong> students
              in this class.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply to All</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
