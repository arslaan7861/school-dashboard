"use client";

import { useState, useMemo } from "react";
import {
  format,
  isToday,
  isYesterday,
  isThisWeek,
  startOfDay,
  differenceInDays,
  parseISO,
} from "date-fns";
import {
  Calendar,
  FileText,
  Trash2,
  Eye,
  Download,
  User,
  BookOpen,
  Paperclip,
  X,
  MoreVertical,
  Clock,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  DownloadCloud,
  FileImage,
  FileArchive,
  FileSpreadsheet,
  File,
  AlertTriangle,
  Loader2,
  Save,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import JSZip from "jszip";

import {
  Homework,
  HomeworkAttachment,
} from "@/features/homework/types.homework";
import { useHomeworkMutations } from "@/features/homework/hooks.homework";
import { DeleteConfirmDialog } from "./delete.confirm.homework";
import { EditHomeworkDialog } from "./edit.homework";
import { Subject } from "@/features/subjects/types.subject";

interface HomeworkListProps {
  homework: Homework[];
  classId: number;
  subjects: Subject[];
  userRole?: string;
  sessionId?: string;
}

type SortOption = "newest" | "oldest" | "dueSoon" | "dueLater";

export function HomeworkList({
  homework,
  classId,
  subjects,
  userRole,
  sessionId,
}: HomeworkListProps) {
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(
    null,
  );
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [homeworkToDelete, setHomeworkToDelete] = useState<Homework | null>(
    null,
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [homeworkToEdit, setHomeworkToEdit] = useState<Homework | null>(null);
  const [attachmentToDelete, setAttachmentToDelete] =
    useState<HomeworkAttachment | null>(null);
  const [deleteAttachmentDialogOpen, setDeleteAttachmentDialogOpen] =
    useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [showAttachmentUpload, setShowAttachmentUpload] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    today: true,
    yesterday: true,
    thisWeek: true,
    earlier: false,
  });

  const {
    deleteHomeworkMutation,
    deleteAttachmentMutation,
    addAttachmentsMutation,
  } = useHomeworkMutations(classId, sessionId);

  // Sort homework based on selected option
  const sortedHomework = useMemo(() => {
    const sorted = [...homework];

    switch (sortBy) {
      case "newest":
        return sorted.sort(
          (a, b) =>
            parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime(),
        );
      case "oldest":
        return sorted.sort(
          (a, b) =>
            parseISO(a.createdAt).getTime() - parseISO(b.createdAt).getTime(),
        );
      case "dueSoon":
        return sorted.sort(
          (a, b) =>
            parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime(),
        );
      case "dueLater":
        return sorted.sort(
          (a, b) =>
            parseISO(b.dueDate).getTime() - parseISO(a.dueDate).getTime(),
        );
      default:
        return sorted;
    }
  }, [homework, sortBy]);

  // Group homework by date
  const groupedHomework = useMemo(() => {
    const groups: Record<string, Homework[]> = {
      today: [],
      yesterday: [],
      thisWeek: [],
      earlier: [],
    };

    const today = startOfDay(new Date());

    sortedHomework.forEach((hw) => {
      const createdDate = parseISO(hw.createdAt);

      if (isToday(createdDate)) {
        groups.today.push(hw);
      } else if (isYesterday(createdDate)) {
        groups.yesterday.push(hw);
      } else if (isThisWeek(createdDate, { weekStartsOn: 1 })) {
        groups.thisWeek.push(hw);
      } else {
        groups.earlier.push(hw);
      }
    });

    return groups;
  }, [sortedHomework]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleView = (hw: Homework) => {
    setSelectedHomework(hw);
    setViewDialogOpen(true);
  };

  const handleEditClick = (hw: Homework) => {
    setHomeworkToEdit(hw);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (hw: Homework) => {
    setHomeworkToDelete(hw);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!homeworkToDelete) return;

    try {
      await deleteHomeworkMutation.mutateAsync(homeworkToDelete.id);
      setDeleteDialogOpen(false);
      setHomeworkToDelete(null);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleDeleteAttachmentClick = (attachment: HomeworkAttachment) => {
    setAttachmentToDelete(attachment);
    setDeleteAttachmentDialogOpen(true);
  };

  const handleDeleteAttachmentConfirm = async () => {
    if (!attachmentToDelete) return;

    try {
      await deleteAttachmentMutation.mutateAsync(attachmentToDelete.id);
      toast.success("Attachment deleted successfully");
      setDeleteAttachmentDialogOpen(false);
      setAttachmentToDelete(null);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleAddAttachments = async () => {
    if (!selectedHomework || uploadingFiles.length === 0) return;

    try {
      await addAttachmentsMutation.mutateAsync({
        homeworkId: selectedHomework.id,
        attachments: uploadingFiles,
      });
      setUploadingFiles([]);
      setShowAttachmentUpload(false);
      // Refresh the homework data
      const updatedHomework = { ...selectedHomework };
      setSelectedHomework(updatedHomework);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const downloadAttachment = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
      toast.success(`Downloaded ${fileName}`);
    } catch (error) {
      toast.error("Failed to download file");
      console.error("Download error:", error);
    }
  };

  const downloadAllAttachments = async (
    attachments: HomeworkAttachment[],
    homeworkTitle: string,
  ) => {
    if (attachments.length === 0) {
      toast.error("No attachments to download");
      return;
    }

    setDownloadingAll(true);
    const zip = new JSZip();
    const failedDownloads: string[] = [];

    try {
      // Download each file and add to zip
      for (const attachment of attachments) {
        try {
          const response = await fetch(attachment.url);
          const blob = await response.blob();
          zip.file(attachment.fileName, blob);
        } catch (error) {
          console.error(`Failed to download ${attachment.fileName}:`, error);
          failedDownloads.push(attachment.fileName);
        }
      }

      if (failedDownloads.length > 0) {
        toast.error(`Failed to download: ${failedDownloads.join(", ")}`);
      }

      // Generate zip file
      const content = await zip.generateAsync({ type: "blob" });

      // Create download link
      const zipUrl = window.URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = zipUrl;
      link.download = `${homeworkTitle.replace(/\s+/g, "_")}_attachments.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(zipUrl);

      if (failedDownloads.length === 0) {
        toast.success("All attachments downloaded successfully");
      } else {
        toast.warning(
          `Downloaded ${attachments.length - failedDownloads.length} of ${attachments.length} attachments`,
        );
      }
    } catch (error) {
      toast.error("Failed to create zip file");
      console.error("Zip creation error:", error);
    } finally {
      setDownloadingAll(false);
    }
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

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case "newest":
        return "Newest first";
      case "oldest":
        return "Oldest first";
      case "dueSoon":
        return "Due soon";
      case "dueLater":
        return "Due later";
    }
  };

  const renderHomeworkCard = (hw: Homework) => {
    const dueDate = parseISO(hw.dueDate);
    const createdDate = parseISO(hw.createdAt);
    const now = new Date();
    const isActive = dueDate > now;
    const daysUntilDue = differenceInDays(dueDate, now);
    const formattedDueDate = format(dueDate, "MMM d, yyyy");
    const formattedCreatedDate = format(createdDate, "MMM d");

    return (
      <div
        key={hw.id}
        className="group relative bg-card hover:bg-accent/5 rounded-lg border p-3 transition-all hover:shadow-md flex flex-col h-full"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="font-semibold text-sm truncate">{hw.title}</h3>
              <Badge
                variant={isActive ? "default" : "destructive"}
                className="shrink-0 text-[10px] px-1.5 py-0"
              >
                {isActive ? "Active" : "Expired"}
              </Badge>
            </div>

            {/* Subject & Teacher */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <BookOpen className="w-3 h-3 shrink-0" />
              <span className="truncate">{hw.subject.name}</span>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem
                onClick={() => handleView(hw)}
                className="text-xs"
              >
                <Eye className="h-3.5 w-3.5 mr-2" />
                View
              </DropdownMenuItem>
              {(userRole === "admin" || userRole === "teacher") && (
                <>
                  <DropdownMenuItem
                    onClick={() => handleEditClick(hw)}
                    className="text-xs"
                  >
                    <Save className="h-3.5 w-3.5 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  {hw.attachments.length > 0 && (
                    <DropdownMenuItem
                      onClick={() =>
                        downloadAllAttachments(hw.attachments, hw.title)
                      }
                      className="text-xs"
                      disabled={downloadingAll}
                    >
                      <DownloadCloud className="h-3.5 w-3.5 mr-2" />
                      Download All
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedHomework(hw);
                      setShowAttachmentUpload(true);
                      setViewDialogOpen(true);
                    }}
                    className="text-xs"
                  >
                    <Paperclip className="h-3.5 w-3.5 mr-2" />
                    Add Files
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive text-xs"
                    onClick={() => handleDeleteClick(hw)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description Preview */}
        <p className="text-xs text-muted-foreground/80 line-clamp-2 mb-2 flex-1">
          {hw.description}
        </p>

        {/* Metadata */}
        <div className="space-y-1.5 mb-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="w-3 h-3 shrink-0" />
            <span className="truncate">{hw.assignedBy.name}</span>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <Calendar
              className={cn(
                "w-3 h-3 shrink-0",
                !isActive && "text-destructive",
              )}
            />
            <span
              className={cn(
                "truncate",
                !isActive ? "text-destructive" : "text-muted-foreground",
              )}
            >
              Due {formattedDueDate}
              {isActive && daysUntilDue <= 3 && daysUntilDue >= 0 && (
                <span className="ml-1 text-amber-600 font-medium">
                  ({daysUntilDue}d)
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
            <Clock className="w-3 h-3 shrink-0" />
            <span>Posted {formattedCreatedDate}</span>
          </div>
        </div>

        {/* Attachment Chips with Download */}
        {hw.attachments.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 mt-1 pt-2 border-t">
            {hw.attachments.slice(0, 2).map((att) => (
              <div
                key={att.id}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-muted/50 rounded text-[10px] group/chip"
              >
                <span className="shrink-0">{getFileIcon(att.fileType)}</span>
                <span className="max-w-[60px] truncate">{att.fileName}</span>
                <button
                  onClick={() => downloadAttachment(att.url, att.fileName)}
                  className="ml-0.5 hover:text-primary transition-colors"
                  title={`Download ${att.fileName}`}
                >
                  <Download className="w-2.5 h-2.5" />
                </button>
                {(userRole === "admin" || userRole === "teacher") && (
                  <button
                    onClick={() => handleDeleteAttachmentClick(att)}
                    className="ml-0.5 hover:text-destructive transition-colors"
                    title={`Delete ${att.fileName}`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            ))}
            {hw.attachments.length > 2 && (
              <span className="text-[10px] text-muted-foreground">
                +{hw.attachments.length - 2}
              </span>
            )}
            {hw.attachments.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 ml-auto"
                onClick={() => downloadAllAttachments(hw.attachments, hw.title)}
                disabled={downloadingAll}
                title="Download all attachments"
              >
                {downloadingAll ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <DownloadCloud className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  if (homework.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
        <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
        <p className="text-lg font-medium text-muted-foreground">
          No homework assigned yet
        </p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Click the "Assign Homework" button to get started
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Sort Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          {homework.length} assignment{homework.length !== 1 ? "s" : ""}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>Sort: {getSortLabel(sortBy)}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuRadioGroup
              value={sortBy}
              onValueChange={(v) => setSortBy(v as SortOption)}
            >
              <DropdownMenuRadioItem value="newest">
                Newest first
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="oldest">
                Oldest first
              </DropdownMenuRadioItem>
              <DropdownMenuSeparator />
              <DropdownMenuRadioItem value="dueSoon">
                Due soon
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dueLater">
                Due later
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Grouped Homework Sections */}
      <div className="space-y-6">
        {/* Today */}
        {groupedHomework.today.length > 0 && (
          <Collapsible
            open={openSections.today}
            onOpenChange={() => toggleSection("today")}
          >
            <div className="flex items-center gap-2 mb-3">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 gap-1">
                  {openSections.today ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <div className="flex items-center gap-2">
                <Badge
                  variant="default"
                  className="bg-primary/10 text-primary hover:bg-primary/20 border-0"
                >
                  Today
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {groupedHomework.today.length} assignment
                  {groupedHomework.today.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <CollapsibleContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupedHomework.today.map(renderHomeworkCard)}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Yesterday */}
        {groupedHomework.yesterday.length > 0 && (
          <Collapsible
            open={openSections.yesterday}
            onOpenChange={() => toggleSection("yesterday")}
          >
            <div className="flex items-center gap-2 mb-3">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 gap-1">
                  {openSections.yesterday ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-muted/50">
                  Yesterday
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {groupedHomework.yesterday.length} assignment
                  {groupedHomework.yesterday.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <CollapsibleContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupedHomework.yesterday.map(renderHomeworkCard)}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* This Week */}
        {groupedHomework.thisWeek.length > 0 && (
          <Collapsible
            open={openSections.thisWeek}
            onOpenChange={() => toggleSection("thisWeek")}
          >
            <div className="flex items-center gap-2 mb-3">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 gap-1">
                  {openSections.thisWeek ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-muted/50">
                  This Week
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {groupedHomework.thisWeek.length} assignment
                  {groupedHomework.thisWeek.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <CollapsibleContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupedHomework.thisWeek.map(renderHomeworkCard)}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Earlier */}
        {groupedHomework.earlier.length > 0 && (
          <Collapsible
            open={openSections.earlier}
            onOpenChange={() => toggleSection("earlier")}
          >
            <div className="flex items-center gap-2 mb-3">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 gap-1">
                  {openSections.earlier ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-muted/50">
                  Earlier
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {groupedHomework.earlier.length} assignment
                  {groupedHomework.earlier.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <CollapsibleContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupedHomework.earlier.map(renderHomeworkCard)}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      {/* View Homework Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedHomework && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedHomework.title}</DialogTitle>
                <DialogDescription className="space-y-1" asChild>
                  <div>
                    <div>
                      {selectedHomework.class.name} - Section{" "}
                      {selectedHomework.class.section}
                    </div>
                    {selectedHomework.class.classTeacher && (
                      <div className="text-xs">
                        Class Teacher:{" "}
                        {selectedHomework.class.classTeacher.name}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      Posted on{" "}
                      {format(
                        parseISO(selectedHomework.createdAt),
                        "MMMM d, yyyy 'at' h:mm a",
                      )}
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-muted/50 p-3 rounded-lg">
                  <div className="space-y-1">
                    <span className="text-muted-foreground block">Subject</span>
                    <span className="font-medium">
                      {selectedHomework.subject.name}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground block">
                      Subject Teacher
                    </span>
                    <span className="font-medium">
                      {selectedHomework.subject.teacher.name}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground block">
                      Due Date
                    </span>
                    <span
                      className={cn(
                        "font-medium",
                        parseISO(selectedHomework.dueDate) <= new Date() &&
                          "text-destructive",
                      )}
                    >
                      {format(parseISO(selectedHomework.dueDate), "PPP")}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground block">
                      Assigned By
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">
                        {selectedHomework.assignedBy.name}
                      </span>
                      <Badge variant="outline" className="text-[10px] px-1">
                        {selectedHomework.assignedBy.role}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Description</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded-lg">
                    {selectedHomework.description}
                  </p>
                </div>

                {/* Attachments */}
                {selectedHomework.attachments.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">
                        Attachments ({selectedHomework.attachments.length})
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() =>
                          downloadAllAttachments(
                            selectedHomework.attachments,
                            selectedHomework.title,
                          )
                        }
                        disabled={downloadingAll}
                      >
                        {downloadingAll ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <DownloadCloud className="h-3.5 w-3.5" />
                        )}
                        Download All
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedHomework.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center justify-between bg-muted/30 hover:bg-muted/50 p-2 rounded-lg group transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="shrink-0">
                              {getFileIcon(att.fileType)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium truncate">
                                {att.fileName}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {att.fileType.split("/")[1]?.toUpperCase() ||
                                  "Unknown"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                downloadAttachment(att.url, att.fileName)
                              }
                              title="Download"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                            {(userRole === "admin" ||
                              userRole === "teacher") && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteAttachmentClick(att)}
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Attachments Section */}
                {showAttachmentUpload && (
                  <div className="border rounded-lg p-3 space-y-3">
                    <h4 className="text-sm font-medium">Add More Files</h4>
                    <Input
                      type="file"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          setUploadingFiles(Array.from(e.target.files));
                        }
                      }}
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xls,.xlsx,.zip"
                      className="text-sm"
                    />
                    {uploadingFiles.length > 0 && (
                      <>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto">
                          {uploadingFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-muted/30 p-1.5 rounded text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="truncate">{file.name}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  ({(file.size / 1024).toFixed(1)} KB)
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => {
                                  setUploadingFiles((prev) =>
                                    prev.filter((_, i) => i !== index),
                                  );
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => {
                              setUploadingFiles([]);
                              setShowAttachmentUpload(false);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 text-xs"
                            onClick={handleAddAttachments}
                            disabled={addAttachmentsMutation.isPending}
                          >
                            {addAttachmentsMutation.isPending ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              "Upload Files"
                            )}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        homework={homeworkToDelete}
        isDeleting={deleteHomeworkMutation.isPending}
      />

      {/* Delete Attachment Confirmation Dialog */}
      <AlertDialog
        open={deleteAttachmentDialogOpen}
        onOpenChange={setDeleteAttachmentDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Attachment
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Are you sure you want to delete this attachment?</p>
              {attachmentToDelete && (
                <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    {getFileIcon(attachmentToDelete.fileType)}
                    <span className="font-medium">
                      {attachmentToDelete.fileName}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This action cannot be undone. The file will be permanently
                    deleted.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAttachmentMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAttachmentConfirm}
              disabled={deleteAttachmentMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAttachmentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Homework Dialog */}
      <EditHomeworkDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        homework={homeworkToEdit}
        subjects={subjects}
        classId={classId}
        sessionId={sessionId || null}
      />
    </>
  );
}
