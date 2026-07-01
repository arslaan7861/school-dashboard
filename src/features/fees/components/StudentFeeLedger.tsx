"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useStudentOutstanding,
  useStudentPayments,
  useCreatePayment,
} from "@/features/fees-payment/hooks.fees-payment";
import {
  useStudentFees,
  useStudentExamFees,
  useStudentOptionalFees,
  useAssignStudentFee,
  useAssignStudentExamFee,
  useAssignStudentOptionalFee,
  useGenerateOneTimeInvoices,
} from "@/features/fees-allocation/hooks.fees-allocation";
import {
  useClassFees,
  useExamFees,
  useOptionalFees,
} from "@/features/fees/hooks.fees";
import { PaymentMode, DiscountType } from "@/features/fees/types.fees";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Receipt,
  CreditCard,
  History,
  Settings,
  Plus,
  Sparkles,
  Coins,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface StudentFeeLedgerProps {
  classStudentId: number | null;
  studentName: string;
  admissionNo: string;
  classDisplayName: string;
  classId: number | null;
  sessionId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function StudentFeeLedger({
  classStudentId,
  studentName,
  admissionNo,
  classDisplayName,
  classId,
  sessionId,
  isOpen,
  onClose,
}: StudentFeeLedgerProps) {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("dues");
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Payment Form State
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState<PaymentMode>(PaymentMode.CASH);
  const [payRef, setPayRef] = useState("");
  const [payDate, setPayDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [payRemarks, setPayRemarks] = useState("");

  // Assign Fee Form State
  const [assignType, setAssignType] = useState<"class" | "exam" | "optional">(
    "class",
  );
  const [selectedFeeId, setSelectedFeeId] = useState("");
  const [assignAmount, setAssignAmount] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType | undefined>(
    undefined,
  );
  const [discountValue, setDiscountValue] = useState("");
  const [assignStartDate, setAssignStartDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );

  // Hooks
  const { data: outstandingData, isLoading: loadingOutstanding } =
    useStudentOutstanding(classStudentId || 0);
  const { data: payments, isLoading: loadingPayments } = useStudentPayments(
    classStudentId || 0,
  );

  const { data: studentFees, isLoading: loadingStudentFees } = useStudentFees(
    classStudentId || 0,
  );
  const { data: studentExamFees } = useStudentExamFees(classStudentId || 0);
  const { data: studentOptionalFees } = useStudentOptionalFees(
    classStudentId || 0,
  );

  // Available fees to allocate
  const { data: classFees } = useClassFees({
    sessionId,
    classId: classId || undefined,
  });
  const { data: examFees } = useExamFees({
    sessionId,
    classId: classId || undefined,
  });
  const { data: optionalFees } = useOptionalFees({
    sessionId,
    classId: classId || undefined,
  });

  // Mutations
  const collectPaymentMutation = useCreatePayment();
  const assignClassFeeMutation = useAssignStudentFee();
  const assignExamFeeMutation = useAssignStudentExamFee();
  const assignOptionalFeeMutation = useAssignStudentOptionalFee();
  const generateOneTimeInvoicesMutation = useGenerateOneTimeInvoices();

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classStudentId) return;
    if (!payAmount || Number(payAmount) <= 0) {
      return toast.error("Please enter a valid payment amount");
    }

    const advanceAmt = outstandingData?.unallocatedAmount || 0;
    if (advanceAmt > 0) {
      const confirmProceed = window.confirm(
        `This student has ₹${advanceAmt} in unallocated advance credit. Any existing advance credit will be automatically applied to outstanding invoices first. Do you want to proceed with recording this new payment of ₹${payAmount}?`
      );
      if (!confirmProceed) return;
    }

    collectPaymentMutation.mutate(
      {
        classStudentId,
        sessionId,
        totalAmount: Number(payAmount),
        paymentDate: payDate,
        mode: payMode,
        referenceId: payRef || undefined,
        remarks: payRemarks || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Payment recorded and allocated successfully!");
          setShowPaymentForm(false);
          setPayAmount("");
          setPayRef("");
          setPayRemarks("");
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to record payment");
        },
      },
    );
  };

  const handleGenerateOneTime = (silent = false) => {
    if (!classStudentId) return;
    generateOneTimeInvoicesMutation.mutate(
      { classStudentIds: [classStudentId] },
      {
        onSuccess: (res: any) => {
          queryClient.invalidateQueries({
            queryKey: ["fees-payment"],
          });
          queryClient.invalidateQueries({
            queryKey: ["fees-allocation"],
          });
          if (!silent) {
            const generatedCount = Array.isArray(res?.data) ? res.data.length : 0;
            const message = res?.message || `Successfully generated ${generatedCount} one-time/exam invoice(s).`;
            toast.success(message);
          }
        },
        onError: (err: any) => {
          if (!silent) {
            toast.error(err.message || "Failed to generate one-time invoices");
          }
        },
      }
    );
  };

  const handleAssignFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classStudentId || !selectedFeeId)
      return toast.error("Please select a fee");

    if (assignType === "class") {
      const selectedClassFee = classFees?.find(
        (cf) => cf.id === Number(selectedFeeId),
      );
      const baseAmount = assignAmount
        ? Number(assignAmount)
        : selectedClassFee?.amount || 0;

      assignClassFeeMutation.mutate(
        {
          classStudentId,
          classFeeId: Number(selectedFeeId),
          amount: baseAmount,
          discountType,
          discountValue: discountValue ? Number(discountValue) : undefined,
          startDate: assignStartDate,
        },
        {
          onSuccess: () => {
            toast.success("Fee rule assigned to student");
            setSelectedFeeId("");
            setAssignAmount("");
            setDiscountValue("");
            setDiscountType(undefined);
            if (selectedClassFee?.type === "one_time") {
              handleGenerateOneTime(true);
            }
          },
          onError: (err: any) => {
            toast.error(err.message || "Failed to assign fee");
          },
        },
      );
    } else if (assignType === "exam") {
      assignExamFeeMutation.mutate(
        {
          classStudentId,
          examFeeId: Number(selectedFeeId),
          isApplicable: true,
        },
        {
          onSuccess: () => {
            toast.success("Exam fee assigned to student");
            setSelectedFeeId("");
            handleGenerateOneTime(true);
          },
          onError: (err: any) => {
            toast.error(err.message || "Failed to assign exam fee");
          },
        },
      );
    } else if (assignType === "optional") {
      assignOptionalFeeMutation.mutate(
        {
          classStudentId,
          optionalFeeId: Number(selectedFeeId),
        },
        {
          onSuccess: () => {
            toast.success("Optional fee assigned to student");
            setSelectedFeeId("");
            handleGenerateOneTime(true);
          },
          onError: (err: any) => {
            toast.error(err.message || "Failed to assign optional fee");
          },
        },
      );
    }
  };

  const handleSelectFee = (idStr: string) => {
    setSelectedFeeId(idStr);
    if (assignType === "class") {
      const selected = classFees?.find((f) => f.id === Number(idStr));
      if (selected) setAssignAmount(String(selected.amount));
    }
  };

  const getSourceTypeLabel = (source: string) => {
    switch (source) {
      case "fee":
        return "Tuition/Class Fee";
      case "transport":
        return "Transport Fee";
      case "exam":
        return "Exam Fee";
      case "optional":
        return "Optional Fee";
      default:
        return source;
    }
  };

  if (!classStudentId) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-[700px] w-full flex flex-col h-full overflow-hidden p-0">
        <div className="p-6 border-b shrink-0 bg-muted/20">
          <SheetHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-xl font-bold">
                {studentName}
              </SheetTitle>
              <Badge variant="outline" className="text-xs">
                Adm: {admissionNo}
              </Badge>
            </div>
            <SheetDescription className="text-sm">
              Class:{" "}
              <span className="font-semibold text-foreground">
                {classDisplayName}
              </span>
            </SheetDescription>
          </SheetHeader>

          {/* Quick Metrics */}
          {loadingOutstanding ? (
            <div className="grid grid-cols-5 gap-2 mt-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-muted/40 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-2 mt-4 text-center">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                  Outstanding
                </p>
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  ₹{outstandingData?.totalOutstanding || 0}
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-100 dark:border-amber-900/30">
                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                  Pending
                </p>
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  ₹{outstandingData?.pendingAmount || 0}
                </p>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/30 p-2 rounded-lg border border-rose-100 dark:border-rose-900/30">
                <p className="text-[10px] text-rose-700 dark:text-rose-400 font-medium">
                  Overdue
                </p>
                <p className="text-xs font-bold text-rose-800 dark:text-rose-300">
                  ₹{outstandingData?.overdueAmount || 0}
                </p>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-950/30 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                <p className="text-[10px] text-indigo-700 dark:text-indigo-400 font-medium">
                  Partial Paid
                </p>
                <p className="text-xs font-bold text-indigo-800 dark:text-indigo-300">
                  ₹{outstandingData?.partialAmount || 0}
                </p>
              </div>
              <div className="bg-teal-50 dark:bg-teal-950/30 p-2 rounded-lg border border-teal-100 dark:border-teal-900/30">
                <p className="text-[10px] text-teal-700 dark:text-teal-400 font-medium">
                  Advance Credit
                </p>
                <p className="text-xs font-bold text-teal-800 dark:text-teal-300">
                  ₹{outstandingData?.unallocatedAmount || 0}
                </p>
              </div>
            </div>
          )}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-6 border-b bg-card">
            <TabsList className="w-full justify-start   h-12 p-0 gap-6">
              <TabsTrigger value="dues">
                <Receipt className="w-4 h-4" />
                Dues & Invoices
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="w-4 h-4" />
                Payment Ledger
              </TabsTrigger>
              <TabsTrigger value="setup">
                <Settings className="w-4 h-4" />
                Fee Rules Setup
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {/* DUES & INVOICES TAB */}
            <TabsContent value="dues" className="m-0 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base">
                  Outstanding Invoices
                </h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateOneTime(false)}
                    disabled={generateOneTimeInvoicesMutation.isPending}
                    className="gap-1.5"
                  >
                    {generateOneTimeInvoicesMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    Bill One-Time Fees
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowPaymentForm(!showPaymentForm)}
                    className="gap-1.5"
                  >
                    <CreditCard className="w-4 h-4" />
                    Record Payment
                  </Button>
                </div>
              </div>

              {/* Collapsible Record Payment Form */}
              {showPaymentForm && (
                <Card className="border-indigo-100 dark:border-indigo-900 bg-indigo-50/20 dark:bg-indigo-950/10">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-semibold">
                      Collect Student Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <form onSubmit={handleRecordPayment} className="space-y-3">
                      {outstandingData && outstandingData.unallocatedAmount > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                          <p className="font-semibold flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
                            Advance Credit Available: ₹{outstandingData.unallocatedAmount}
                          </p>
                          <p className="text-[11px] text-amber-700/90 dark:text-amber-400/90">
                            The student has unallocated advance credit. This advance credit will be automatically applied to outstanding invoices first, and then the new payment of ₹{payAmount || "0"} will be applied to any remaining balance.
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="payAmt" className="text-xs">
                            Amount Received (₹)
                          </Label>
                          <Input
                            id="payAmt"
                            type="number"
                            placeholder="e.g. 1500"
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="payMode" className="text-xs">
                            Payment Mode
                          </Label>
                          <Select
                            value={payMode}
                            onValueChange={(val) =>
                              setPayMode(val as PaymentMode)
                            }
                          >
                            <SelectTrigger id="payMode">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={PaymentMode.CASH}>
                                Cash
                              </SelectItem>
                              <SelectItem value={PaymentMode.UPI}>
                                UPI / QR
                              </SelectItem>
                              <SelectItem value={PaymentMode.CARD}>
                                Card Swipe
                              </SelectItem>
                              <SelectItem value={PaymentMode.BANK}>
                                Bank Transfer
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="payRef" className="text-xs">
                            Reference No. (Txn/Check)
                          </Label>
                          <Input
                            id="payRef"
                            placeholder="e.g. TXN987654"
                            value={payRef}
                            onChange={(e) => setPayRef(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="payDate" className="text-xs">
                            Payment Date
                          </Label>
                          <Input
                            id="payDate"
                            type="date"
                            value={payDate}
                            onChange={(e) => setPayDate(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="payRem" className="text-xs">
                          Internal Remarks
                        </Label>
                        <Input
                          id="payRem"
                          placeholder="e.g. Paid by father"
                          value={payRemarks}
                          onChange={(e) => setPayRemarks(e.target.value)}
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPaymentForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={collectPaymentMutation.isPending}
                        >
                          {collectPaymentMutation.isPending && (
                            <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                          )}
                          Post & Auto-Allocate
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {loadingOutstanding ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-12 bg-muted/30 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {outstandingData?.invoices &&
                      outstandingData.invoices.length > 0 ? (
                        outstandingData.invoices.map((inv: any) => (
                          <TableRow key={inv.id}>
                            <TableCell className="py-2.5">
                              <div className="flex flex-col">
                                <span className="font-semibold text-xs capitalize">
                                  {getSourceTypeLabel(inv.sourceType || "fee")}
                                </span>
                                {inv.billingMonth && (
                                  <span className="text-[10px] text-muted-foreground">
                                    Month: {inv.billingMonth}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-2.5 text-xs">
                              {new Date(inv.dueDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="py-2.5 text-xs">
                              ₹{inv.totalAmount}
                            </TableCell>
                            <TableCell className="py-2.5 text-xs">
                              ₹{inv.paidAmount}
                            </TableCell>
                            <TableCell className="py-2.5">
                              <Badge
                                variant={
                                  inv.status === "paid"
                                    ? "secondary"
                                    : inv.status === "partial"
                                      ? "outline"
                                      : inv.status === "overdue"
                                        ? "destructive"
                                        : "default"
                                }
                                className={`text-[10px] uppercase font-semibold tracking-wider ${
                                  inv.status === "paid"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900"
                                    : inv.status === "partial"
                                      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900"
                                      : ""
                                }`}
                              >
                                {inv.status}
                              </Badge>
                            </TableCell>
                            <TableCell
                              className={`py-2.5 text-right font-bold text-xs ${
                                inv.status === "paid" ||
                                inv.outstandingAmount === 0
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              ₹{inv.outstandingAmount}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="h-24 text-center text-xs text-muted-foreground"
                          >
                            No invoices found!
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* PAYMENT HISTORY TAB */}
            <TabsContent value="history" className="m-0 space-y-4">
              <h3 className="font-semibold text-base">Transaction Log</h3>

              {loadingPayments ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-12 bg-muted/30 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Ref ID</TableHead>
                        <TableHead className="text-right">
                          Amount Paid
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments && payments.length > 0 ? (
                        payments.map((p: any) => (
                          <TableRow key={p.id}>
                            <TableCell className="py-2.5 text-xs">
                              {new Date(p.paymentDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="py-2.5 text-xs uppercase">
                              {p.mode}
                            </TableCell>
                            <TableCell className="py-2.5 text-xs max-w-[120px] truncate">
                              {p.referenceId || "—"}
                            </TableCell>
                            <TableCell className="py-2.5 text-right font-bold text-xs text-emerald-600 dark:text-emerald-400">
                              ₹{p.totalAmount}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="h-24 text-center text-xs text-muted-foreground"
                          >
                            No payment history recorded for this student.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* FEE SETUP TAB */}
            <TabsContent value="setup" className="m-0 space-y-6">
              {/* Assignment Form */}
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Plus className="w-4 h-4 text-primary" />
                    Assign Individual Fee Rule
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <form onSubmit={handleAssignFee} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Fee Category</Label>
                        <Select
                          value={assignType}
                          onValueChange={(val) => {
                            setAssignType(val as any);
                            setSelectedFeeId("");
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="class">
                              Class Fee Structure
                            </SelectItem>
                            <SelectItem value="exam">
                              Exam Fee Structure
                            </SelectItem>
                            <SelectItem value="optional">
                              Optional Fee Structure
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Select Structure</Label>
                        <Select
                          value={selectedFeeId}
                          onValueChange={handleSelectFee}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose structure..." />
                          </SelectTrigger>
                          <SelectContent>
                            {assignType === "class" &&
                              classFees?.map((f) => (
                                <SelectItem key={f.id} value={String(f.id)}>
                                  {f.name} (₹{f.amount})
                                </SelectItem>
                              ))}
                            {assignType === "exam" &&
                              examFees?.map((f) => (
                                <SelectItem key={f.id} value={String(f.id)}>
                                  Exam ID {f.examId} (₹{f.amount})
                                </SelectItem>
                              ))}
                            {assignType === "optional" &&
                              optionalFees?.map((f) => (
                                <SelectItem key={f.id} value={String(f.id)}>
                                  {f.name} (₹{f.amount})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {assignType === "class" && (
                      <div className="border p-3 rounded-lg bg-muted/20 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="customAmt" className="text-xs">
                              Custom Amount (Optional)
                            </Label>
                            <Input
                              id="customAmt"
                              type="number"
                              placeholder="Overrides default"
                              value={assignAmount}
                              onChange={(e) => setAssignAmount(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="appStartDate" className="text-xs">
                              Start Date
                            </Label>
                            <Input
                              id="appStartDate"
                              type="date"
                              value={assignStartDate}
                              onChange={(e) =>
                                setAssignStartDate(e.target.value)
                              }
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Discount Type</Label>
                            <Select
                              value={discountType || "none"}
                              onValueChange={(val) =>
                                setDiscountType(
                                  val === "none"
                                    ? undefined
                                    : (val as DiscountType),
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">
                                  No Discount
                                </SelectItem>
                                <SelectItem value={DiscountType.FIXED}>
                                  Fixed Amount (₹)
                                </SelectItem>
                                <SelectItem value={DiscountType.PERCENTAGE}>
                                  Percentage (%)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {discountType && (
                            <div className="space-y-1">
                              <Label htmlFor="discVal" className="text-xs">
                                Discount Value
                              </Label>
                              <Input
                                id="discVal"
                                type="number"
                                placeholder={
                                  discountType === DiscountType.FIXED
                                    ? "₹100"
                                    : "15%"
                                }
                                value={discountValue}
                                onChange={(e) =>
                                  setDiscountValue(e.target.value)
                                }
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={
                          assignClassFeeMutation.isPending ||
                          assignExamFeeMutation.isPending ||
                          assignOptionalFeeMutation.isPending
                        }
                      >
                        Assign Structure
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* List of active allocations */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Active Assignments</h4>
                {loadingStudentFees ? (
                  <div className="h-10 bg-muted/20 animate-pulse rounded" />
                ) : (
                  <div className="border rounded-lg overflow-hidden bg-card">
                    <Table>
                      <TableHeader className="bg-muted/20">
                        <TableRow>
                          <TableHead className="py-2">Fee Name</TableHead>
                          <TableHead className="py-2">Allocated Amt</TableHead>
                          <TableHead className="py-2 text-right">
                            Discount
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentFees && studentFees.length > 0 ? (
                          studentFees.map((sf: any) => (
                            <TableRow key={sf.id}>
                              <TableCell className="py-2 text-xs font-medium">
                                {sf.classFee?.name || "Standard Fee Rule"}
                              </TableCell>
                              <TableCell className="py-2 text-xs">
                                ₹{sf.amount}
                              </TableCell>
                              <TableCell className="py-2 text-xs text-right text-emerald-600 font-semibold">
                                {sf.discountType ? (
                                  <span>
                                    {sf.discountValue}
                                    {sf.discountType === DiscountType.PERCENTAGE
                                      ? "%"
                                      : "₹"}{" "}
                                    off
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="h-16 text-center text-xs text-muted-foreground"
                            >
                              No special class fee assignments. Default rules
                              apply.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
