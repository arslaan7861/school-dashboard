"use client";

import { format } from "date-fns";
import { Download, Calendar, User, BookOpen, Paperclip, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useHomework, useHomeworkStatus } from "@/features/homework";
import {
  closeViewHomeworkModal,
  useHomeworkModalStore,
} from "@/store/modals/homework.modal.store";

export function ViewHomeworkModal() {
  const { isOpen, homeworkId, onSuccess } = useHomeworkModalStore(
    (state) => state.viewHomeworkModal,
  );

  const { data: homework, isLoading } = useHomework(homeworkId || 0);
  const { statusLabel, statusColor } = useHomeworkStatus(
    homework?.dueDate || "",
  );

  return (
    <Dialog open={isOpen} onOpenChange={closeViewHomeworkModal}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>Homework Details</DialogTitle>
          <DialogDescription>
            View complete homework information and attachments.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ) : homework ? (
          <div className="space-y-6">
            {/* Title and Status */}
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold">{homework.title}</h2>
              <Badge className={statusColor}>{statusLabel}</Badge>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Description
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {homework.description}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Subject:</span>
                <span className="text-sm font-medium">
                  {homework.subject?.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Due Date:</span>
                <span className="text-sm font-medium">
                  {format(new Date(homework.dueDate), "dd MMM yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Assigned By:</span>
                <span className="text-sm font-medium">
                  {homework.assignedByUser?.name}
                </span>
              </div>
            </div>

            {/* Attachments */}
            {homework.attachments && homework.attachments.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Paperclip className="h-4 w-4 text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-500">
                    Attachments
                  </h3>
                </div>
                <div className="space-y-2">
                  {homework.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm">{attachment.fileName}</span>
                        {attachment.size && (
                          <span className="text-xs text-gray-400">
                            ({(attachment.size / 1024).toFixed(1)} KB)
                          </span>
                        )}
                      </div>
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Homework not found
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
