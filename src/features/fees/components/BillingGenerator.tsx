"use client";

import { useState, useEffect } from "react";
import { useGenerateMonthlyInvoices } from "@/features/fees-allocation/hooks.fees-allocation";
import { useSession } from "@/features/session/hooks.session";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Loader2, Play } from "lucide-react";
import { toast } from "sonner";

interface BillingGeneratorProps {
  sessionId: number;
  onSuccess?: () => void;
}

export function BillingGenerator({ sessionId, onSuccess }: BillingGeneratorProps) {
  const { data: sessionData, isLoading: loadingSession } = useSession(String(sessionId));
  const session = sessionData?.data;

  const [selectedMonth, setSelectedMonth] = useState("");

  const monthOptions: { label: string; value: string }[] = [];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (session?.startDate && session?.endDate) {
    const start = new Date(session.startDate);
    const end = new Date(session.endDate);

    // Iterating year and month from start to end
    let curr = new Date(start.getFullYear(), start.getMonth(), 1);
    const last = new Date(end.getFullYear(), end.getMonth(), 1);

    while (curr <= last) {
      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, "0");
      const label = `${monthNames[curr.getMonth()]} ${y}`;
      const value = `${y}-${m}`;
      monthOptions.push({ label, value });

      // Move to next month
      curr.setMonth(curr.getMonth() + 1);
    }
  }

  // Automatically select default month once options are available
  useEffect(() => {
    if (monthOptions.length > 0 && !selectedMonth) {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      const currentVal = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;

      const hasCurrent = monthOptions.find((opt) => opt.value === currentVal);
      if (hasCurrent) {
        setSelectedMonth(currentVal);
      } else {
        setSelectedMonth(monthOptions[0].value);
      }
    }
  }, [monthOptions, selectedMonth]);

  const generateMutation = useGenerateMonthlyInvoices();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMonth) return toast.error("Please select a month");

    generateMutation.mutate(
      {
        sessionId,
        monthYear: selectedMonth,
      },
      {
        onSuccess: (res: any) => {
          const generatedCount = Array.isArray(res?.data) ? res.data.length : 0;
          const message = res?.message || `Success! Generated billing run. New invoices generated: ${generatedCount}`;
          toast.success(message);
          onSuccess?.();
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to generate monthly invoices");
        },
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border border-indigo-100 dark:border-indigo-900 bg-indigo-50/5 dark:bg-indigo-950/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300">
            <CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Bulk Monthly Billing Run
          </CardTitle>
          <CardDescription>
            This operation evaluates all active student enrollments, transport stop assignments, and monthly fee configurations to automatically generate corresponding pending invoices for the selected month.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="billingMonth" className="font-semibold text-sm">Select Billing Month</Label>
              {loadingSession ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground h-9">
                  <Loader2 className="w-4.5 h-4.5 animate-spin text-indigo-600" />
                  Loading session months...
                </div>
              ) : (
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger id="billingMonth" className="w-full sm:w-[320px]">
                    <SelectValue placeholder="Choose month" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Note: Invoices are idempotent. Regenerating for the same month will only invoice newly enrolled students or transport riders.
              </p>
            </div>

            <div className="border-t pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-muted-foreground max-w-sm">
                Make sure class fees and transport structures are configured correctly before running.
              </div>
              <Button
                type="submit"
                disabled={generateMutation.isPending}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              >
                {generateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Run Billing Engine
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
