"use client";

import { useState } from "react";
import { useClasses } from "@/features/class/hooks.class";
import {
  useOptionalFees,
  useCreateOptionalFee,
  useUpdateOptionalFee,
  useDeleteOptionalFee,
} from "@/features/fees/hooks.fees";
import { OptionalFeeType } from "@/features/fees/types.fees";
import { Button } from "@/components/ui/button";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface OptionalFeesConfigProps {
  sessionId: number;
}

export function OptionalFeesConfig({ sessionId }: OptionalFeesConfigProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<any>(null);

  // Form states
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<OptionalFeeType>(OptionalFeeType.ACTIVITY);
  const [classId, setClassId] = useState("all");
  const [applicableDate, setApplicableDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: classesResponse, isLoading: loadingClasses } = useClasses(sessionId);
  const classes = classesResponse?.data || [];

  const { data: feesResponse, isLoading: loadingFees } = useOptionalFees({
    sessionId,
    classId: selectedClassId !== "all" ? Number(selectedClassId) : undefined,
  });
  const fees = feesResponse || [];

  const createMutation = useCreateOptionalFee();
  const updateMutation = useUpdateOptionalFee();
  const deleteMutation = useDeleteOptionalFee();

  const handleOpenCreate = () => {
    setEditingFee(null);
    setName("");
    setAmount("");
    setType(OptionalFeeType.ACTIVITY);
    setClassId(selectedClassId !== "all" ? selectedClassId : "all");
    setApplicableDate("");
    setDueDate("");
    setStartDate("");
    setEndDate("");
    setDialogOpen(true);
  };

  const handleOpenEdit = (fee: any) => {
    setEditingFee(fee);
    setName(fee.name);
    setAmount(String(fee.amount));
    setType(fee.type);
    setClassId(fee.classId ? String(fee.classId) : "all");
    setApplicableDate(fee.applicableDate ? fee.applicableDate.split("T")[0] : "");
    setDueDate(fee.dueDate ? fee.dueDate.split("T")[0] : "");
    setStartDate(fee.startDate ? fee.startDate.split("T")[0] : "");
    setEndDate(fee.endDate ? fee.endDate.split("T")[0] : "");
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter fee name");
    if (!amount || Number(amount) <= 0) return toast.error("Please enter a valid amount");

    const payload: any = {
      name,
      amount: Number(amount),
      type,
      classId: classId === "all" ? null : Number(classId),
      sessionId,
    };

    if (applicableDate) payload.applicableDate = applicableDate;
    if (dueDate) payload.dueDate = dueDate;
    if (startDate) payload.startDate = startDate;
    if (endDate) payload.endDate = endDate;

    if (editingFee) {
      updateMutation.mutate(
        {
          id: editingFee.id,
          data: {
            name: payload.name,
            amount: payload.amount,
            applicableDate: payload.applicableDate,
            dueDate: payload.dueDate,
            startDate: payload.startDate,
            endDate: payload.endDate,
          },
        },
        {
          onSuccess: () => {
            toast.success("Optional fee structure updated successfully");
            setDialogOpen(false);
          },
          onError: (err: any) => {
            toast.error(err.message || "Failed to update optional fee structure");
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Optional fee structure created successfully");
          setDialogOpen(false);
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to create optional fee structure");
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this optional fee structure?")) {
      return;
    }

    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Optional fee structure deleted successfully");
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to delete optional fee structure");
      },
    });
  };

  const getClassName = (id: number | null) => {
    if (!id) return "All Classes";
    const cls = classes.find((c) => c.id === id);
    return cls ? `${cls.name} - ${cls.section}` : `Class ID ${id}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card p-4 rounded-xl border">
        <div className="flex items-center gap-3">
          <Label className="text-sm font-semibold shrink-0">Filter Class:</Label>
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={String(cls.id)}>
                  {cls.name} - {cls.section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Add Optional Fee
        </Button>
      </div>

      {loadingFees || loadingClasses ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading optional fees...</p>
        </div>
      ) : (
        <div className="border rounded-xl bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Fee Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Applicable Class</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(fees) && fees.length > 0 ? (
                fees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">{fee.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {fee.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{getClassName(fee.classId)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {fee.dueDate ? (
                        <span>Due: {new Date(fee.dueDate).toLocaleDateString()}</span>
                      ) : (
                        <span>No due date</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-bold text-indigo-600 dark:text-indigo-400">
                      ₹{fee.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleOpenEdit(fee)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(fee.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    <Sparkles className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    No Optional Fee structures configured.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* CREATE/EDIT DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{editingFee ? "Edit Optional Fee" : "Create Optional Fee"}</DialogTitle>
            <DialogDescription>
              Configure custom optional billing items like events, clubs, or uniforms.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="optName">Fee Name</Label>
              <Input
                id="optName"
                placeholder="e.g. Annual Sports Event"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="optAmount">Amount (₹)</Label>
                <Input
                  id="optAmount"
                  type="number"
                  placeholder="300"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="optClass">Limit to Class</Label>
                <Select value={classId} onValueChange={setClassId} disabled={!!editingFee}>
                  <SelectTrigger id="optClass">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={String(cls.id)}>
                        {cls.name} - {cls.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="optType">Fee Type</Label>
              <Select
                value={type}
                onValueChange={(val) => setType(val as OptionalFeeType)}
                disabled={!!editingFee}
              >
                <SelectTrigger id="optType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={OptionalFeeType.ACTIVITY}>Activity / Club</SelectItem>
                  <SelectItem value={OptionalFeeType.EVENT}>Event</SelectItem>
                  <SelectItem value={OptionalFeeType.OTHER}>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4 border p-3 rounded-lg bg-muted/20">
              <div className="space-y-1.5">
                <Label htmlFor="appDate">Start Date (Optional)</Label>
                <Input
                  id="appDate"
                  type="date"
                  value={applicableDate}
                  onChange={(e) => setApplicableDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dueDate">Due Date (Optional)</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border p-3 rounded-lg bg-muted/10">
              <div className="space-y-1.5">
                <Label htmlFor="startDate">Event Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate">Event End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {editingFee ? "Save Changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
