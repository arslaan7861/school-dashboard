"use client";

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
import { Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

import { Homework } from "@/features/homework/types.homework";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  homework: Homework | null;
  isDeleting?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  homework,
  isDeleting = false,
}: DeleteConfirmDialogProps) {
  if (!homework) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Homework
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 pt-3">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this homework? This action cannot
              be undone.
            </p>

            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
              <div className="font-medium text-foreground">
                Homework Details:
              </div>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <span>Title:</span>
                <span className="font-medium text-foreground">
                  {homework.title}
                </span>

                <span>Subject:</span>
                <span className="font-medium text-foreground">
                  {homework.subject.name}
                </span>

                <span>Due Date:</span>
                <span className="font-medium text-foreground">
                  {format(new Date(homework.dueDate), "PPP")}
                </span>

                <span>Attachments:</span>
                <span className="font-medium text-foreground">
                  {homework.attachments.length} file(s)
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-lg p-2">
              <span className="font-medium text-amber-700">Warning:</span> All
              attachments will be permanently deleted.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Homework
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
