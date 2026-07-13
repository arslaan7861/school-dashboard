"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RouteList } from "@/components/transport/route";
import { useRoutes, useDeleteRoute } from "@/features/transport";
import { useSessions } from "@/features/session/hooks.session";
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
import { CreateRouteModal } from "@/components/modals/transport/CreateRouteModal";

export default function TransportPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [routeToDelete, setRouteToDelete] = useState<number | null>(null);

  const { data: routes, isLoading, refetch } = useRoutes();
  const deleteRoute = useDeleteRoute();
  const { data: sessions } = useSessions();

  // Filter routes by search term
  const filteredRoutes = routes?.filter((route) =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDelete = async () => {
    if (!routeToDelete) return;

    try {
      await deleteRoute.mutateAsync(routeToDelete);
      toast.success("Route deleted successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete route");
    } finally {
      setRouteToDelete(null);
    }
  };

  return (
    <div className="space-y-6 pt-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Transport Routes</h1>
          <p className="text-gray-500 mt-1">
            Manage all transport routes, stops, and student assignments
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Route
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search routes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Routes List */}
      <RouteList
        routes={filteredRoutes}
        isLoading={isLoading}
        onDelete={(route) => setRouteToDelete(route.id)}
      />

      {/* Create Route Modal */}
      <CreateRouteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          refetch();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!routeToDelete}
        onOpenChange={() => setRouteToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              route and all associated stops and student assignments.
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
