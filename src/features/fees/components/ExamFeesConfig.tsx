"use client";

import { useState } from "react";
import { useClasses } from "@/features/class/hooks.class";
import { useExams } from "@/features/exam/hooks.exam";
import {
  useExamFees,
  useCreateExamFee,
  useUpdateExamFee,
  useDeleteExamFee,
} from "@/features/fees/hooks.fees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Edit, Trash2, Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface ExamFeesConfigProps {
  sessionId: number;
}

export function ExamFeesConfig({ sessionId }: ExamFeesConfigProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<any>(null);

  // Form states
  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [amount, setAmount] = useState("");
  const [isOptional, setIsOptional] = useState(false);
  const [applicableDate, setApplicableDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  const { data: classesResponse, isLoading: loadingClasses } = useClasses(sessionId);
  const classes = classesResponse?.data || [];

  const { data: exams, isLoading: loadingExams } = useExams({ sessionId });

  const { data: feesResponse, isLoading: loadingFees } = useExamFees({
    sessionId,
    classId: selectedClassId !== "all" ? Number(selectedClassId) : undefined,
  });
  const fees = feesResponse || [];

  const createMutation = useCreateExamFee();
  const updateMutation = useUpdateExamFee();
  const deleteMutation = useDeleteExamFee();

  const handleOpenCreate = () => {
    setEditingFee(null);
    setExamId("");
    setClassId(selectedClassId !== "all" ? selectedClassId : "");
    setAmount("");
    setIsOptional(false);
    setApplicableDate("");
    setDueDate("");
    setDialogOpen(true);
  };

  const handleOpenEdit = (fee: any) => {
    setEditingFee(fee);
    setExamId(String(fee.examId));
    setClassId(String(fee.classId));
    setAmount(String(fee.amount));
    setIsOptional(fee.isOptional);
    setApplicableDate(fee.applicableDate ? fee.applicableDate.split("T")[0] : "");
    setDueDate(fee.dueDate ? fee.dueDate.split("T")[0] : "");
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examId) return toast.error("Please select an exam");
    if (!classId) return toast.error("Please select a class");
    if (!amount || Number(amount) <= 0) return toast.error("Please enter a valid amount");

    const payload: any = {
      examId: Number(examId),
      classId: Number(classId),
      amount: Number(amount),
      isOptional,
      sessionId,
    };

    if (applicableDate) payload.applicableDate = applicableDate;
    if (dueDate) payload.dueDate = dueDate;

    if (editingFee) {
      updateMutation.mutate(
        {
          id: editingFee.id,
          data: {
            amount: payload.amount,
            isOptional: payload.isOptional,
            applicableDate: payload.applicableDate,
            dueDate: payload.dueDate,
          },
        },
        {
          onSuccess: () => {
            toast.success("Exam fee structure updated successfully");
            setDialogOpen(false);
          },
          onError: (err: any) => {
            toast.error(err.message || "Failed to update exam fee structure");
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Exam fee structure created successfully");
          setDialogOpen(false);
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to create exam fee structure");
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this exam fee structure?")) {
      return;
    }

    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Exam fee structure deleted successfully");
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to delete exam fee structure");
      },
    });
  };

  const getClassName = (id: number) => {
    const cls = classes.find((c) => c.id === id);
    return cls ? `${cls.name} - ${cls.section}` : `Class ID ${id}`;
  };

  const getExamName = (id: number) => {
    const ex = exams?.find((e) => e.id === id);
    return ex ? ex.name : `Exam ID ${id}`;
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
          Add Exam Fee
        </Button>
      </div>

      {loadingFees || loadingClasses || loadingExams ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading exam fees...</p>
        </div>
      ) : (
        <div className="border rounded-xl bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Exam Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(fees) && fees.length > 0 ? (
                fees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">{getExamName(fee.examId)}</TableCell>
                    <TableCell>{getClassName(fee.classId)}</TableCell>
                    <TableCell>
                      <Badge variant={fee.isOptional ? "outline" : "default"}>
                        {fee.isOptional ? "Optional Assignment" : "Compulsory"}
                      </Badge>
                    </TableCell>
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
                    <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    No Exam Fee structures configured.
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
            <DialogTitle>{editingFee ? "Edit Exam Fee" : "Create Exam Fee"}</DialogTitle>
            <DialogDescription>
              Assign fee amounts to specific examination classes.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="examSelect">Select Exam</Label>
              <Select value={examId} onValueChange={setExamId} disabled={!!editingFee}>
                <SelectTrigger id="examSelect">
                  <SelectValue placeholder="Choose Active Exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams?.map((ex) => (
                    <SelectItem key={ex.id} value={String(ex.id)}>
                      {ex.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="examAmount">Amount (₹)</Label>
                <Input
                  id="examAmount"
                  type="number"
                  placeholder="200"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="examClass">Class</Label>
                <Select value={classId} onValueChange={setClassId} disabled={!!editingFee}>
                  <SelectTrigger id="examClass">
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

            <div className="flex items-center justify-between border p-3 rounded-lg bg-muted/10">
              <div className="space-y-0.5">
                <Label htmlFor="isOptional">Optional Fee Option</Label>
                <p className="text-xs text-muted-foreground">
                  If optional, fees are manually applied per student.
                </p>
              </div>
              <Switch
                id="isOptional"
                checked={isOptional}
                onCheckedChange={setIsOptional}
              />
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
