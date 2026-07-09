"use client";

import React from "react";
import { toast } from "sonner";
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

import { useDeleteAnnouncement } from "@/features/announcement/hooks.announcement";
import { useAnnouncementModalStore, closeDeleteAnnouncementModal } from "@/store/modals/announcement.modal.store";

export function DeleteAnnouncementModal() {
  const { isOpen, announcementData, onSuccess } = useAnnouncementModalStore((s) => s.deleteAnnouncementModal);
  
  const deleteMutation = useDeleteAnnouncement();

  if (!isOpen || !announcementData) return null;

  const confirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(announcementData.id);
      toast.success("Announcement deleted successfully");
      closeDeleteAnnouncementModal();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete announcement");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={closeDeleteAnnouncementModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the announcement "{announcementData.title}"? 
            This action cannot be undone and it will be removed from all student dashboards immediately.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={closeDeleteAnnouncementModal}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
