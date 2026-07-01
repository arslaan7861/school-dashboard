"use client";

import { useState } from "react";
import { useClasses } from "@/features/class/hooks.class";
import {
  useClassFees,
  useCreateClassFee,
  useUpdateClassFee,
  useDeleteClassFee,
} from "@/features/fees/hooks.fees";
import { FeeType } from "@/features/fees/types.fees";
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
import { Plus, Edit, Trash2, Loader2, Coins } from "lucide-react";
import { toast } from "sonner";

interface ClassFeesConfigProps {
  sessionId: number;
}

export function ClassFeesConfig({ sessionId }: ClassFeesConfigProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<any>(null);

  // Form states
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<FeeType>(FeeType.MONTHLY);
  const [classId, setClassId] = useState("");
  const [applicableDay, setApplicableDay] = useState("1");
  const [dueDay, setDueDay] = useState("10");
  const [applicableDate, setApplicableDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  const { data: classesResponse, isLoading: loadingClasses } = useClasses(sessionId);
  const classes = classesResponse?.data || [];

  const { data: feesResponse, isLoading: loadingFees } = useClassFees({
    sessionId,
    classId: selectedClassId !== "all" ? Number(selectedClassId) : undefined,
  });
  const fees = feesResponse || [];

  const createMutation = useCreateClassFee();
  const updateMutation = useUpdateClassFee();
  const deleteMutation = useDeleteClassFee();

  const handleOpenCreate = () => {
    setEditingFee(null);
    setName("");
    setAmount("");
    setType(FeeType.MONTHLY);
    setClassId(selectedClassId !== "all" ? selectedClassId : "");
    setApplicableDay("1");
    setDueDay("10");
    setApplicableDate("");
    setDueDate("");
    setDialogOpen(true);
  };

  const handleOpenEdit = (fee: any) => {
    setEditingFee(fee);
    setName(fee.name);
    setAmount(String(fee.amount));
    setType(fee.type);
    setClassId(String(fee.classId));
    setApplicableDay(String(fee.applicableDay || "1"));
    setDueDay(String(fee.dueDay || "10"));
    setApplicableDate(fee.applicableDate ? fee.applicableDate.split("T")[0] : "");
    setDueDate(fee.dueDate ? fee.dueDate.split("T")[0] : "");
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter fee name");
    if (!amount || Number(amount) <= 0) return toast.error("Please enter a valid amount");
    if (!classId) return toast.error("Please select a class");

    const payload: any = {
      name,
      amount: Number(amount),
      type,
      classId: Number(classId),
      sessionId,
    };

    if (type === FeeType.MONTHLY) {
      payload.applicableDay = Number(applicableDay);
      payload.dueDay = Number(dueDay);
    } else {
      if (!applicableDate) return toast.error("Please select applicable date");
      if (!dueDate) return toast.error("Please select due date");
      payload.applicableDate = applicableDate;
      payload.dueDate = dueDate;
    }

    if (editingFee) {
      updateMutation.mutate(
        {
          id: editingFee.id,
          data: {
            name: payload.name,
            amount: payload.amount,
            applicableDay: payload.applicableDay,
            dueDay: payload.dueDay,
            applicableDate: payload.applicableDate,
            dueDate: payload.dueDate,
          },
        },
        {
          onSuccess: () => {
            toast.success("Class fee structure updated successfully");
            setDialogOpen(false);
          },
          onError: (err: any) => {
            toast.error(err.message || "Failed to update fee structure");
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Class fee structure created successfully");
          setDialogOpen(false);
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to create fee structure");
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this fee structure? This will not delete already generated invoices but will stop new ones from allocating.")) {
      return;
    }

    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Class fee structure deleted successfully");
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to delete fee structure");
      },
    });
  };

  const getClassName = (id: number) => {
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
          Create Class Fee
        </Button>
      </div>

      {loadingFees || loadingClasses ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading fee structures...</p>
        </div>
      ) : (
        <div className="border rounded-xl bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Fee Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Billing Schedule</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(fees) && fees.length > 0 ? (
                fees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">{fee.name}</TableCell>
                    <TableCell>{getClassName(fee.classId)}</TableCell>
                    <TableCell>
                      <Badge variant={fee.type === FeeType.MONTHLY ? "default" : "secondary"} className="capitalize">
                        {fee.type.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {fee.type === FeeType.MONTHLY ? (
                        <span>
                          Starts Day {fee.applicableDay} • Due Day {fee.dueDay}
                        </span>
                      ) : (
                        <span>
                          Due {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : "-"}
                        </span>
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
                    <Coins className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    No Class Fee structures configured.
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
            <DialogTitle>{editingFee ? "Edit Class Fee" : "Create Class Fee"}</DialogTitle>
            <DialogDescription>
              Set parameters for student billing. Monthly structures generate automatically.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="feeName">Fee Name</Label>
              <Input
                id="feeName"
                placeholder="e.g. Tuition Fee"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="feeAmount">Amount (₹)</Label>
                <Input
                  id="feeAmount"
                  type="number"
                  placeholder="500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="feeClass">Class</Label>
                <Select value={classId} onValueChange={setClassId} disabled={!!editingFee}>
                  <SelectTrigger id="feeClass">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
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
              <Label htmlFor="feeType">Billing Frequency</Label>
              <Select
                value={type}
                onValueChange={(val) => setType(val as FeeType)}
                disabled={!!editingFee}
              >
                <SelectTrigger id="feeType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FeeType.MONTHLY}>Monthly</SelectItem>
                  <SelectItem value={FeeType.ONE_TIME}>One Time</SelectItem>
                  <SelectItem value={FeeType.YEARLY}>Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === FeeType.MONTHLY ? (
              <div className="grid grid-cols-2 gap-4 border p-3 rounded-lg bg-muted/20">
                <div className="space-y-1.5">
                  <Label htmlFor="applicableDay">Bill Date (Day of Month)</Label>
                  <Input
                    id="applicableDay"
                    type="number"
                    min="1"
                    max="28"
                    value={applicableDay}
                    onChange={(e) => setApplicableDay(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dueDay">Due Date (Day of Month)</Label>
                  <Input
                    id="dueDay"
                    type="number"
                    min="1"
                    max="28"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 border p-3 rounded-lg bg-muted/20">
                <div className="space-y-1.5">
                  <Label htmlFor="applicableDate">Start Date</Label>
                  <Input
                    id="applicableDate"
                    type="date"
                    value={applicableDate}
                    onChange={(e) => setApplicableDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
            )}

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
