"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarIcon,
  Save,
  X,
  Paperclip,
  FileText,
  BookOpen,
  User,
  Upload,
  Clock,
  AlertCircle,
  FileImage,
  FileArchive,
  FileSpreadsheet,
  File,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
  CreateHomeworkType,
  createHomeworkSchema,
} from "@/features/homework/types.homework";
import { Subject } from "@/features/subjects/types.subject";
import { useHomeworkMutations } from "@/features/homework/hooks.homework";

interface CreateHomeworkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  classId: number;
  className?: string;
  sessionId: string | null;
}

export function CreateHomeworkDialog({
  open,
  onOpenChange,
  subjects,
  classId,
  className,
  sessionId,
}: CreateHomeworkDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [date, setDate] = useState<Date>();
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateHomeworkType>({
    resolver: zodResolver(createHomeworkSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      subjectId: 0,
    },
  });

  const { createHomeworkMutation } = useHomeworkMutations(
    classId,
    sessionId || undefined,
  );

  const handleSubmit = async (data: CreateHomeworkType) => {
    if (selectedFiles.length > 5) {
      toast.error("Maximum 5 files allowed");
      return;
    }

    // Check file sizes
    const oversizedFiles = selectedFiles.filter(
      (file) => file.size > 10 * 1024 * 1024,
    );
    if (oversizedFiles.length > 0) {
      toast.error("Some files exceed 10MB limit");
      return;
    }

    setIsSubmitting(true);
    try {
      await createHomeworkMutation.mutateAsync({
        data,
        attachments: selectedFiles,
      });

      // Success actions
      toast.success("Homework assigned successfully", {
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        description: `Homework "${data.title}" has been assigned to ${className}`,
      });

      onOpenChange(false);
      form.reset();
      setSelectedFiles([]);
      setDate(undefined);
    } catch (error) {
      // Error is already handled in mutation
      console.error("Homework creation failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      // Check total files limit
      if (selectedFiles.length + files.length > 5) {
        toast.error("Maximum 5 files allowed");
        return;
      }

      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);

      // Check total files limit
      if (selectedFiles.length + files.length > 5) {
        toast.error("Maximum 5 files allowed");
        return;
      }

      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) {
      return <FileText className="h-4 w-4 text-red-500" />;
    }
    if (fileType.includes("image")) {
      return <FileImage className="h-4 w-4 text-blue-500" />;
    }
    if (fileType.includes("word") || fileType.includes("document")) {
      return <FileText className="h-4 w-4 text-blue-700" />;
    }
    if (fileType.includes("excel") || fileType.includes("sheet")) {
      return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
    }
    if (fileType.includes("zip") || fileType.includes("archive")) {
      return <FileArchive className="h-4 w-4 text-yellow-600" />;
    }
    return <File className="h-4 w-4 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const selectedSubjectId = form.watch("subjectId");
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 flex flex-col h-[90vh]">
        {/* Fixed Header */}
        <div className="flex-none bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Assign Homework
            </DialogTitle>
            <DialogDescription>Create new homework</DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Form {...form}>
            <form
              id="homework-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Title & Description */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Chapter 5 Mathematics Exercises"
                          className="focus-visible:ring-primary"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide detailed instructions, page numbers, or specific requirements..."
                          className="min-h-[100px] focus-visible:ring-primary resize-y"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Subject and Due Date - Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Subject Selection */}
                <FormField
                  control={form.control}
                  name="subjectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                        Subject
                      </FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        value={field.value ? field.value.toString() : ""}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem
                              key={subject.id}
                              value={subject.id.toString()}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>{subject.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Due Date */}
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                        Due Date
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                              disabled={isSubmitting}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(date) => {
                              setDate(date);
                              field.onChange(
                                date ? format(date, "yyyy-MM-dd") : "",
                              );
                            }}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Subject Teacher Info - Enhanced */}
              {selectedSubjectId > 0 && (
                <div
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border",
                    selectedSubject?.teacher
                      ? "bg-primary/5 border-primary/20"
                      : "bg-amber-50 border-amber-200",
                  )}
                >
                  {selectedSubject?.teacher ? (
                    <>
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">
                          Subject Teacher
                        </p>
                        <p className="text-sm font-medium">
                          {selectedSubject.teacher.name}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-background">
                        Assigned
                      </Badge>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      <p className="text-sm text-amber-600">
                        This subject has no teacher assigned
                      </p>
                    </>
                  )}
                </div>
              )}

              <Separator />

              {/* File Attachments - Enhanced with Drag & Drop */}
              <div className="space-y-4">
                <FormLabel className="text-sm font-medium flex items-center gap-1">
                  <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
                  Attachments{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    (Optional, max 5 files)
                  </span>
                </FormLabel>

                {/* Drop Zone */}
                <div
                  className={cn(
                    "relative border-2 border-dashed rounded-lg p-4 transition-colors",
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/20 hover:border-muted-foreground/30",
                    selectedFiles.length > 0 &&
                      "border-primary/30 bg-primary/5",
                    isSubmitting && "opacity-50 pointer-events-none",
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xls,.xlsx,.zip"
                    disabled={isSubmitting}
                  />

                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-sm font-medium">
                      {dragActive
                        ? "Drop files here"
                        : "Drag & drop files or click to browse"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, DOC, DOCX, TXT, Images, Excel, ZIP (Max 5 files, 10MB
                      each)
                    </p>
                  </div>
                </div>

                {/* Selected Files List - Enhanced */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground">
                        {selectedFiles.length} file(s) selected
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => setSelectedFiles([])}
                        disabled={isSubmitting}
                      >
                        Clear all
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-1">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="group flex items-center gap-3 bg-muted/30 hover:bg-muted/50 p-2 rounded-lg transition-colors"
                        >
                          <div className="h-8 w-8 rounded bg-background flex items-center justify-center">
                            {getFileIcon(file.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFile(index)}
                            disabled={isSubmitting}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </form>
          </Form>
        </div>

        {/* Fixed Footer */}
        <div className="flex-none bg-background border-t px-6 py-4 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              form.reset();
              setSelectedFiles([]);
              setDate(undefined);
            }}
            className="min-w-[80px]"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="homework-form"
            disabled={
              !form.formState.isValid ||
              isSubmitting ||
              createHomeworkMutation.isPending
            }
            className="min-w-[120px]"
          >
            {isSubmitting || createHomeworkMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Assign
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
