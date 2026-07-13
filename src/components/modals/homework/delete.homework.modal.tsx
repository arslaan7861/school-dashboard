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
import { toast } from "sonner";

import { useDeleteHomework } from "@/features/homework";
import {
  closeDeleteHomeworkModal,
  useHomeworkModalStore,
} from "@/store/modals/homework.modal.store";

export function DeleteHomeworkModal() {
  const { isOpen, homeworkId, homeworkTitle, onSuccess } =
    useHomeworkModalStore((state) => state.deleteHomeworkModal);

  const deleteHomework = useDeleteHomework();

  const handleDelete = async () => {
    if (!homeworkId) return;

    await deleteHomework.mutateAsync(homeworkId, {
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete homework");
      },
      onSuccess: (response) => {
        toast.success(response.message || "Homework deleted successfully");
        onSuccess?.();
        closeDeleteHomeworkModal();
      },
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={closeDeleteHomeworkModal}>
      <AlertDialogContent className="max-h-[90vh] flex flex-col p-0 gap-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Homework</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{homeworkTitle}"? This action
              cannot be undone. All attachments will also be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter className="px-6 py-4 border-t bg-gray-50/50 shrink-0">
          <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={deleteHomework.isPending}
          >
            {deleteHomework.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
