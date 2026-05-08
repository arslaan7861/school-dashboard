"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import {
  useRoute,
  useDisabledMonths,
  useRemoveDisabledMonth,
} from "@/features/transport";
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
import { AddDisabledMonthModal } from "@/components/modals/transport/AddDisabledMonthModal";

export default function RouteDisabledTab() {
  const params = useParams();
  const routeId = parseInt(params.routeId as string);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [monthToDelete, setMonthToDelete] = useState<number | null>(null);

  const { data: route, isLoading: routeLoading } = useRoute(routeId);
  const {
    data: disabledMonths,
    isLoading: monthsLoading,
    refetch,
  } = useDisabledMonths(routeId);
  const removeDisabledMonth = useRemoveDisabledMonth();

  const handleDelete = async () => {
    if (!monthToDelete) return;

    try {
      await removeDisabledMonth.mutateAsync(monthToDelete);
      toast.success("Disabled month removed successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove");
    } finally {
      setMonthToDelete(null);
    }
  };

  if (routeLoading || monthsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  // Get month name from YYYY-MM format
  const getMonthName = (yearMonth: string) => {
    const [year, month] = yearMonth.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">
            Disabled Months for {route?.name}
          </h2>
          <p className="text-sm text-gray-500">
            Months when this route is inactive (e.g., vacations, maintenance)
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          size="sm"
          className="gap-1"
        >
          <Plus className="w-4 h-4" />
          Disable Month
        </Button>
      </div>

      {/* Disabled Months List */}
      {!disabledMonths || disabledMonths.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No disabled months set. This route is active year-round.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {disabledMonths.map((month) => (
            <Card key={month.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      {getMonthName(month.yearMonth)}
                    </h3>
                    {month.reason && (
                      <p className="text-sm text-gray-500 mt-1">
                        {month.reason}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMonthToDelete(month.id)}
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Disabled Month Modal */}
      <AddDisabledMonthModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        routeId={routeId}
        onSuccess={() => {
          refetch();
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!monthToDelete}
        onOpenChange={() => setMonthToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Disabled Month</AlertDialogTitle>
            <AlertDialogDescription>
              This will re-activate the route for this month. Transport fees
              will be applicable for students assigned to this route.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
