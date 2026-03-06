"use client";

import React, { useState } from "react";
import {
  Plus,
  Pencil,
  Power,
  Trash2,
  UserCog,
  Mail,
  Phone,
  Shield,
  ShieldAlert,
  ShieldCheck,
  MoreVertical,
  Search,
  Filter,
  Eye,
} from "lucide-react";

import { AdminFormDialog } from "@/components/modal/adminForm.modal";
import { useAdminCrud, useAdmins } from "@/features/admin/hooks.admin";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Admin } from "@/features/admin/types";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  createAdminSchemaType,
  updateAdminSchemaType,
} from "@/features/admin/validators.admin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function Admins() {
  const { data, isLoading, isError, error, refetch } = useAdmins();
  const {
    createAdminMutation,
    toggleAdminActiveStatusMutation,
    updateAdminMutation,
    deleteAdminMutation,
  } = useAdminCrud();
  const user = useAuthStore((s) => s.user!);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Admin | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const admins = data?.data ?? [];

  // Filter admins based on search and tab
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.name.toLowerCase().includes(search.toLowerCase()) ||
      admin.email.toLowerCase().includes(search.toLowerCase()) ||
      admin.phone?.toLowerCase().includes(search.toLowerCase());

    if (activeTab === "active") return matchesSearch && admin.isActive; // Changed
    if (activeTab === "inactive") return matchesSearch && !admin.isActive; // Changed
    return matchesSearch;
  });

  const activeAdmins = admins.filter((a) => a.isActive).length; // Changed
  const totalAdmins = admins.length;

  /* ---------- ACTIONS ---------- */
  const handleCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const handleEdit = (admin: Admin) => {
    setEditing(admin);
    setOpen(true);
  };

  const handleDelete = async (admin: Admin) => {
    await deleteAdminMutation.mutate(Number(admin.id));
  };

  const handleToggleStatus = (admin: Admin, checked: boolean) => {
    toggleAdminActiveStatusMutation.mutate({
      userId: Number(admin.id),
      isActive: checked, // Changed from 'active' to 'isActive'
    });
  };

  /* ---------- LOADING STATE ---------- */
  if (isLoading) {
    return (
      <div className="space-y-6 pt-4">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-20 mb-4" />
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-6" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---------- ERROR STATE ---------- */
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px] pt-4">
        <Card className="w-full max-w-md border-destructive/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <ShieldAlert className="w-12 h-12 text-destructive mx-auto" />
              <div>
                <h3 className="font-semibold text-lg">Failed to load admins</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {(error as any)?.message || "Unable to fetch admin data"}
                </p>
              </div>
              <Button onClick={() => refetch()} className="w-full">
                Retry Loading
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Admin Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage system administrators and their permissions
          </p>
        </div>

        <Button onClick={handleCreate} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Add Admin
        </Button>
      </div>

      {/* STATS CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Admins
                </p>
                <p className="text-3xl font-bold">{totalAdmins}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserCog className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Active Admins
                </p>
                <p className="text-3xl font-bold">{activeAdmins}</p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Inactive Admins
                </p>
                <p className="text-3xl font-bold">
                  {totalAdmins - activeAdmins}
                </p>
              </div>
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Shield className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ADMIN LIST SECTION */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Administrators</CardTitle>
              <CardDescription>
                Manage and organize system administrators
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search admins..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-[200px]"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="all">All Admins</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          {/* FORM DIALOG */}
          <AdminFormDialog
            open={open}
            onOpenChange={(state) => {
              if (!state) setTimeout(() => setEditing(null), 100);
              setOpen(state);
            }}
            initial={editing}
            onCreate={(data, form) =>
              createAdminMutation.mutate(data, {
                onError: (e) => {
                  toast.error(e.message);
                  if (e.errors && e.errors.length) {
                    e.errors.forEach(({ field, message }) => {
                      form.setError(field as keyof createAdminSchemaType, {
                        message,
                      });
                    });
                  }
                },
                onSuccess: () => {
                  toast.success("Admin created successfully!");
                  setOpen(false);
                },
              })
            }
            onUpdate={(id, data, form) =>
              updateAdminMutation.mutate(
                {
                  userId: Number(id),
                  ...data,
                },
                {
                  onError: (e) => {
                    toast.error(e.message);
                    if (e.errors && e.errors.length) {
                      e.errors.forEach(({ field, message }) => {
                        form.setError(field as keyof updateAdminSchemaType, {
                          message,
                        });
                      });
                    }
                  },
                  onSuccess: () => {
                    toast.success("Admin updated successfully!");
                    setOpen(false);
                  },
                },
              )
            }
            isCreatePending={createAdminMutation.isPending}
            isUpdatePending={updateAdminMutation.isPending}
          />

          {/* ADMIN CARDS GRID */}
          {filteredAdmins.length === 0 ? (
            <div className="text-center py-12">
              <UserCog className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No admins found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {search
                  ? "No admins match your search criteria"
                  : activeTab === "all"
                    ? "Get started by adding your first admin"
                    : `No ${activeTab} admins available`}
              </p>
              {!search && activeTab === "all" && (
                <Button onClick={handleCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Admin
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAdmins.map((admin) => {
                const isCurrentUser = admin.id === user.id;
                const initials = admin.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <Card
                    key={admin.id}
                    className={cn(
                      "overflow-hidden hover:shadow-md transition-shadow",
                      isCurrentUser && "border-primary/30 bg-primary/5",
                    )}
                  >
                    <CardContent className="pt-6">
                      {/* ADMIN HEADER */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={admin.profilePic || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {initials}
                            </AvatarFallback>
                          </Avatar>

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                {admin.name}
                                {isCurrentUser && (
                                  <Badge
                                    variant="outline"
                                    className="ml-2 text-xs border-primary/30"
                                  >
                                    You
                                  </Badge>
                                )}
                              </h3>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                "mt-1 text-xs",
                                admin.isActive // Changed
                                  ? "border-green-500/30 text-green-600"
                                  : "border-gray-300 text-gray-500",
                              )}
                            >
                              {admin.isActive ? "Active" : "Inactive"}{" "}
                              {/* Changed */}
                            </Badge>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(admin)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={
                                () => handleToggleStatus(admin, !admin.isActive) // Changed
                              }
                              disabled={
                                isCurrentUser ||
                                toggleAdminActiveStatusMutation.isPending
                              }
                            >
                              <Power className="w-4 h-4 mr-2" />
                              {admin.isActive ? "Deactivate" : "Activate"}{" "}
                              {/* Changed */}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(admin)}
                              disabled={isCurrentUser}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Admin
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* ADMIN DETAILS */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium truncate">
                            {admin.email}
                          </span>
                        </div>

                        {admin.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Phone:
                            </span>
                            <span className="font-medium">{admin.phone}</span>
                          </div>
                        )}

                        <Separator />

                        {/* VIEW DETAILS BUTTON */}
                        <div className="flex justify-between items-center pt-2">
                          <div className="flex items-center gap-2">
                            <Power
                              className={cn(
                                "w-4 h-4",
                                admin.isActive // Changed
                                  ? "text-green-500"
                                  : "text-gray-400",
                              )}
                            />
                            <span className="text-sm">Account Status</span>
                          </div>

                          <div className="flex gap-2">
                            <Switch
                              checked={admin.isActive} // Changed
                              onCheckedChange={(checked) =>
                                handleToggleStatus(admin, checked)
                              }
                              disabled={
                                isCurrentUser ||
                                toggleAdminActiveStatusMutation.isPending
                              }
                              className={cn(
                                admin.isActive && // Changed
                                  "data-[state=checked]:bg-green-500",
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Admins;
