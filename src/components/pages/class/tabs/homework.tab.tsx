"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Paperclip,
  Calendar,
  BookOpen,
  User,
  Clock,
  AlertCircle,
  Download,
  Filter,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  useHomeworkByClass,
  useDeleteHomework,
  useHomeworkStatus,
} from "@/features/homework";
import {
  openCreateHomeworkModal,
  openBulkCreateHomeworkModal,
  openEditHomeworkModal,
  openViewHomeworkModal,
  openDeleteHomeworkModal,
} from "@/store//modals/homework.modal.store";
import { useSubjectsByClass } from "@/features/subjects/hooks.subject";

interface HomeworkTabProps {
  classId: string;
  sessionId?: number;
}

const getStatusColor = (statusLabel: string) => {
  if (statusLabel.includes("Overdue")) return "bg-red-100 text-red-800";
  if (statusLabel.includes("Due Today")) return "bg-orange-100 text-orange-800";
  if (statusLabel.includes("days")) return "bg-yellow-100 text-yellow-800";
  return "bg-green-100 text-green-800";
};

export default function HomeworkTab({ classId, sessionId }: HomeworkTabProps) {
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const { data: subjects } = useSubjectsByClass(Number(classId));
  const {
    data: homework,
    isLoading,
    refetch,
  } = useHomeworkByClass(parseInt(classId), {
    sessionId,
  });

  const deleteHomework = useDeleteHomework();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Filter homework
  const filteredHomework = homework?.filter((hw) => {
    // Subject filter
    if (subjectFilter !== "all" && hw.subjectId !== parseInt(subjectFilter)) {
      return false;
    }

    // Status filter
    if (statusFilter !== "all") {
      const { statusLabel } = useHomeworkStatus(hw.dueDate);
      if (statusFilter === "overdue" && !statusLabel.includes("Overdue"))
        return false;
      if (statusFilter === "upcoming" && statusLabel.includes("Overdue"))
        return false;
    }

    // Search filter
    if (searchTerm) {
      return (
        hw.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hw.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hw.subject?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return true;
  });

  const handleDelete = (homeworkId: number, homeworkTitle: string) => {
    openDeleteHomeworkModal({
      homeworkId,
      homeworkTitle,
      onSuccess: () => {
        refetch();
        toast.success("Homework deleted successfully");
      },
    });
  };

  const handleEdit = (homework: any) => {
    openEditHomeworkModal({
      homework,
      onSuccess: () => {
        refetch();
        toast.success("Homework updated successfully");
      },
    });
  };

  const handleView = (homeworkId: number) => {
    openViewHomeworkModal({
      homeworkId,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2">
          <Button
            onClick={() =>
              openCreateHomeworkModal({
                classId: parseInt(classId),
                sessionId: sessionId || 1,
                onSuccess: () => {
                  refetch();
                  toast.success("Homework created successfully");
                },
              })
            }
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Homework
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              openBulkCreateHomeworkModal({
                classId: parseInt(classId),
                sessionId: sessionId || 1,
                onSuccess: () => {
                  refetch();
                  toast.success("Homework created successfully");
                },
              })
            }
          >
            Bulk Create
          </Button>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <Button
            variant={view === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("grid")}
          >
            Grid
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("list")}
          >
            List
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Search</Label>
              <Input
                placeholder="Search by title, subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Subject</Label>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects?.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              {(searchTerm ||
                subjectFilter !== "all" ||
                statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSubjectFilter("all");
                    setStatusFilter("all");
                  }}
                  className="gap-1"
                >
                  <X className="h-3 w-3" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Homework Count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Showing {filteredHomework?.length || 0} of {homework?.length || 0}{" "}
          assignments
        </p>
      </div>

      {/* Homework List/Grid */}
      {filteredHomework?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-2">
              <BookOpen className="h-12 w-12 text-gray-300" />
              <p className="text-gray-500">No homework assignments found</p>
              <Button
                variant="outline"
                onClick={() =>
                  openCreateHomeworkModal({
                    classId: parseInt(classId),
                    sessionId: sessionId || 1,
                    onSuccess: () => refetch(),
                  })
                }
              >
                Create First Homework
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHomework?.map((homework) => (
            <HomeworkGridCard
              key={homework.id}
              homework={homework}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHomework?.map((homework) => (
            <HomeworkListItem
              key={homework.id}
              homework={homework}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Grid Card Component
function HomeworkGridCard({
  homework,
  onView,
  onEdit,
  onDelete,
}: {
  homework: any;
  onView: (id: number) => void;
  onEdit: (homework: any) => void;
  onDelete: (id: number, title: string) => void;
}) {
  const { statusLabel } = useHomeworkStatus(homework.dueDate);
  const statusColor = getStatusColor(statusLabel);

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg line-clamp-1">
            {homework.title}
          </h3>
          <Badge className={statusColor}>{statusLabel}</Badge>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {homework.description}
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-gray-600">Subject:</span>
            <span className="font-medium">{homework.subject?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-gray-600">Due:</span>
            <span className="font-medium">
              {format(new Date(homework.dueDate), "dd MMM yyyy")}
            </span>
          </div>
          {homework.attachments && homework.attachments.length > 0 && (
            <div className="flex items-center gap-2">
              <Paperclip className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-600">
                {homework.attachments.length} attachment(s)
              </span>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4 pt-2 border-t">
          <Button variant="ghost" size="sm" onClick={() => onView(homework.id)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(homework)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(homework.id, homework.title)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// List Item Component
function HomeworkListItem({
  homework,
  onView,
  onEdit,
  onDelete,
}: {
  homework: any;
  onView: (id: number) => void;
  onEdit: (homework: any) => void;
  onDelete: (id: number, title: string) => void;
}) {
  const { statusLabel } = useHomeworkStatus(homework.dueDate);
  const statusColor = getStatusColor(statusLabel);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className="font-semibold text-lg">{homework.title}</h3>
              <Badge className={statusColor}>{statusLabel}</Badge>
              {homework.attachments && homework.attachments.length > 0 && (
                <Badge variant="outline" className="gap-1">
                  <Paperclip className="h-3 w-3" />
                  {homework.attachments.length}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-1 mb-2">
              {homework.description}
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-gray-600">{homework.subject?.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-gray-600">
                  Due: {format(new Date(homework.dueDate), "dd MMM yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-gray-600">
                  By: {homework.assignedByUser?.name}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(homework.id)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(homework)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(homework.id, homework.title)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
