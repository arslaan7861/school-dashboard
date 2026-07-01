"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  attendanceLockFormSchema,
  AttendanceLockFormValues,
} from "@/features/calendar/validator.calendar";
import { useCalendarMutations } from "@/features/calendar/hooks.calendar";
import { useAuthStore } from "@/store/authStore";
import { useClasses } from "@/features/class/hooks.class";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface AttendanceLockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  classId?: number;
  onSuccess?: () => void;
}

type SelectionMode = "all" | "specific";

export function AttendanceLockModal({
  open,
  onOpenChange,
  selectedDate,
  classId,
  onSuccess,
}: AttendanceLockModalProps) {
  const { activeSessionId } = useAuthStore();
  const { lockAttendance, isUpdating } = useCalendarMutations();

  // State for selection mode
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(
    classId ? "specific" : "all",
  );

  // Fetch actual classes using the hook
  const { data: classesData, isLoading: isLoadingClasses } = useClasses(
    activeSessionId ? Number(activeSessionId) : undefined,
  );

  const form = useForm<AttendanceLockFormValues>({
    resolver: zodResolver(attendanceLockFormSchema),
    defaultValues: {
      startDate: selectedDate || new Date(),
      endDate: selectedDate || new Date(),
      classIds: classId ? [classId] : [],
    },
  });

  // Update form when selectedDate or classId changes
  useEffect(() => {
    if (selectedDate) {
      form.setValue("startDate", selectedDate);
      form.setValue("endDate", selectedDate);
    }
    if (classId) {
      form.setValue("classIds", [classId]);
      setSelectionMode("specific");
    }
  }, [selectedDate, classId, form]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.reset({
        startDate: selectedDate || new Date(),
        endDate: selectedDate || new Date(),
        classIds: classId ? [classId] : [],
      });
      setSelectionMode(classId ? "specific" : "all");
    }
  }, [open, selectedDate, classId, form]);

  const classes = classesData?.data || [];

  // Format classes for display
  const formattedClasses = classes.map((cls: any) => ({
    id: parseInt(cls.id),
    displayName: `${cls.name} - ${cls.section}`,
  }));

  const onSubmit = async (values: AttendanceLockFormValues) => {
    if (!activeSessionId) {
      toast.error("No active session selected");
      return;
    }

    // If selection mode is "all", send undefined classIds (affects all classes)
    // If selection mode is "specific", send the selected classIds
    const classIdsToSend =
      selectionMode === "all" ? undefined : values.classIds;

    lockAttendance({
      sessionId: Number(activeSessionId),
      startDate: format(values.startDate, "yyyy-MM-dd"),
      endDate: format(values.endDate, "yyyy-MM-dd"),
      classIds: classIdsToSend,
    });

    // Close modal and refresh
    setTimeout(() => {
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    }, 500);
  };

  const handleSelectAllClasses = () => {
    const allClassIds = formattedClasses.map((c) => c.id);
    form.setValue("classIds", allClassIds);
  };

  const handleClearClasses = () => {
    form.setValue("classIds", []);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Lock Attendance</DialogTitle>
          <DialogDescription>
            Prevent teachers from modifying attendance for selected dates and
            classes.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Once attendance is locked, teachers will not be able to mark or
            modify attendance for these dates.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Date Range */}
            <div className="grid grid-cols-2  gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Selection Mode */}
            <div className="space-y-2">
              <FormLabel>Apply to</FormLabel>
              <RadioGroup
                value={selectionMode}
                onValueChange={(value) =>
                  setSelectionMode(value as SelectionMode)
                }
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all-classes" />
                  <Label htmlFor="all-classes">All Classes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="specific" id="specific-classes" />
                  <Label htmlFor="specific-classes">Specific Classes</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Class Selection - Only show when "specific" mode is selected */}
            {selectionMode === "specific" && (
              <FormField
                control={form.control}
                name="classIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Classes</FormLabel>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAllClasses}
                          className="text-xs"
                        >
                          Select All
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleClearClasses}
                          className="text-xs"
                        >
                          Clear
                        </Button>
                      </div>

                      {isLoadingClasses ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                      ) : formattedClasses.length > 0 ? (
                        <ScrollArea className="h-[200px] border rounded-md p-2">
                          <div className="space-y-2">
                            {formattedClasses.map((cls) => (
                              <div
                                key={cls.id}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`lock-class-${cls.id}`}
                                  checked={field.value?.includes(cls.id)}
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentValue, cls.id]);
                                    } else {
                                      field.onChange(
                                        currentValue.filter(
                                          (id) => id !== cls.id,
                                        ),
                                      );
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`lock-class-${cls.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {cls.displayName}
                                </label>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No classes found for this session
                        </p>
                      )}

                      {field.value && field.value.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {field.value.length} class(es) selected
                        </p>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating || isLoadingClasses}
                variant="destructive"
              >
                {isUpdating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Lock Attendance
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
