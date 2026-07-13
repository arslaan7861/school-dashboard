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
    <div className="space-y-4 pt-6">
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
        <div className="relative pl-6 ml-2 space-y-6 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
          {stops.map((stop, index) => (
            <div key={stop.id} className="relative flex items-center justify-between group">
              {/* Timeline dot */}
              <div className="absolute left-[-35px] flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-blue-500 shadow-sm z-10 group-hover:scale-110 group-hover:bg-blue-50 transition-all">
                <span className="text-xs font-bold text-blue-600">
                  {stop.stopOrder || index + 1}
                </span>
              </div>
              
              <div 
                className="flex-1 bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
                onClick={() => router.push(`/transport/routes/${routeId}/stops/${stop.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{stop.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        ₹{stop.monthlyFee.toLocaleString()} / month
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setStopToEdit(stop)}
                      className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setStopToDelete(stop.id)}
                      className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
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
