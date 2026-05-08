"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { useRoute, useStopsByRoute, useDeleteStop } from "@/features/transport";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { CreateStopModal } from "@/components/modals/transport/CreateStopModal";
import { EditStopModal } from "@/components/modals/transport/EditStopModal";

export default function RouteStopsTab() {
  const params = useParams();
  const routeId = parseInt(params.routeId as string);
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [stopToEdit, setStopToEdit] = useState<any>(null);
  const [stopToDelete, setStopToDelete] = useState<number | null>(null);

  const { data: route, isLoading: routeLoading } = useRoute(routeId);
  const {
    data: stops,
    isLoading: stopsLoading,
    refetch,
  } = useStopsByRoute(routeId);
  const deleteStop = useDeleteStop();

  const handleDelete = async () => {
    if (!stopToDelete) return;

    try {
      await deleteStop.mutateAsync(stopToDelete);
      toast.success("Stop deleted successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete stop");
    } finally {
      setStopToDelete(null);
    }
  };

  if (routeLoading || stopsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Stops on {route?.name}</h2>
          <p className="text-sm text-gray-500">
            Manage pickup/drop points and their monthly fees
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="sm"
          className="gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Stop
        </Button>
      </div>

      {/* Stops List */}
      {!stops || stops.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No stops added yet. Click "Add Stop" to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {stops.map((stop, index) => (
            <Card
              onClick={() =>
                router.push(`/transport/routes/${routeId}/stops/${stop.id}`)
              }
              key={stop.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                      <span className="text-sm font-medium">
                        {stop.stopOrder || index + 1}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">{stop.name}</h3>
                      <p className="text-sm text-gray-500">
                        ₹{stop.monthlyFee.toLocaleString()} / month
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setStopToEdit(stop)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setStopToDelete(stop.id)}
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateStopModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        routeId={routeId}
        onSuccess={() => {
          refetch();
        }}
      />

      <EditStopModal
        isOpen={!!stopToEdit}
        onClose={() => setStopToEdit(null)}
        stop={stopToEdit}
        onSuccess={() => {
          refetch();
          setStopToEdit(null);
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!stopToDelete}
        onOpenChange={() => setStopToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Stop</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the stop from the route. Students assigned to
              this stop will need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
