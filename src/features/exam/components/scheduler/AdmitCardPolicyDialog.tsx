"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Settings, ShieldAlert, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdmitCardPolicy, useUpsertAdmitCardPolicy } from "../../hooks.exam";
import { AdmitCardPolicyType } from "../../types.exam";

interface AdmitCardPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examId: number;
  sessionId: number;
}

const SOURCE_TYPES = [
  { value: "fee", label: "Tuition / Class Fees" },
  { value: "transport", label: "Transport Fees" },
  { value: "exam", label: "Exam Fees" },
  { value: "optional", label: "Optional / Event Fees" },
];

export function AdmitCardPolicyDialog({
  open,
  onOpenChange,
  examId,
  sessionId,
}: AdmitCardPolicyDialogProps) {
  const { data: policy, isLoading: policyLoading } = useAdmitCardPolicy(examId);
  const upsertPolicyMutation = useUpsertAdmitCardPolicy();

  // Local state
  const [policyType, setPolicyType] = useState<AdmitCardPolicyType>(
    AdmitCardPolicyType.ALL_CLEAR,
  );
  const [allowedSources, setAllowedSources] = useState<string[]>([
    "fee",
    "transport",
    "exam",
    "optional",
  ]);
  const [cutoffDate, setCutoffDate] = useState<string>("");
  const [minPaidPercentage, setMinPaidPercentage] = useState<number>(100);
  const [graceDays, setGraceDays] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);

  // Prefill state from fetched policy
  useEffect(() => {
    if (policy) {
      setPolicyType(policy.policyType);
      setAllowedSources(
        policy.allowedSources || ["fee", "transport", "exam", "optional"],
      );
      setCutoffDate(policy.cutoffDate || "");
      setMinPaidPercentage(policy.minPaidPercentage ?? 100);
      setGraceDays(policy.graceDays ?? 0);
      setIsActive(policy.isActive);
    }
  }, [policy]);

  const handleSourceToggle = (source: string) => {
    setAllowedSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source],
    );
  };

  const handleSave = () => {
    const data = {
      policyType,
      allowedSources:
        policyType === AdmitCardPolicyType.SPECIFIC_TYPES
          ? allowedSources
          : null,
      cutoffDate: cutoffDate || null,
      minPaidPercentage:
        policyType !== AdmitCardPolicyType.DATE_BASED
          ? Number(minPaidPercentage)
          : null,
      graceDays:
        policyType !== AdmitCardPolicyType.DATE_BASED
          ? Number(graceDays)
          : null,
      isActive,
      sessionId,
    };

    upsertPolicyMutation.mutate(
      { examId, data },
      {
        onSuccess: () => {
          toast.success("Admit card clearance policy saved successfully");
          onOpenChange(false);
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to save policy");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden rounded-2xl bg-white dark:bg-slate-950 p-6 shadow-xl border border-slate-100 dark:border-slate-800">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Settings className="w-5 h-5 animate-spin-slow" />
            <DialogTitle className="text-xl font-bold tracking-tight">
              Admit Card Clearance Policy
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure automated rules determining student admit card print
            eligibility based on fee dues.
          </DialogDescription>
        </DialogHeader>

        {policyLoading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <span className="text-xs text-muted-foreground font-medium animate-pulse">
              Fetching current policy...
            </span>
          </div>
        ) : (
          <div className="space-y-5 py-3">
            {/* Active Switch */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold">Enforce Policy</Label>
                <p className="text-[11px] text-muted-foreground">
                  If disabled, all students bypass checks.
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            {isActive && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Policy Type Selection */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Clearance Criteria
                  </Label>
                  <Select
                    value={policyType}
                    onValueChange={(val) =>
                      setPolicyType(val as AdmitCardPolicyType)
                    }
                  >
                    <SelectTrigger className="w-full h-10 rounded-lg">
                      <SelectValue placeholder="Select Criteria Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={AdmitCardPolicyType.ALL_CLEAR}>
                        All Fees Cleared (Default)
                      </SelectItem>
                      <SelectItem value={AdmitCardPolicyType.SPECIFIC_TYPES}>
                        Specific Fee Types Only
                      </SelectItem>
                      <SelectItem value={AdmitCardPolicyType.DATE_BASED}>
                        Date-Based (No Fee Checks)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Specific Fee checkboxes */}
                {policyType === AdmitCardPolicyType.SPECIFIC_TYPES && (
                  <div className="space-y-2 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 animate-in slide-in-from-top-2 duration-200">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Include Checked Fee Sources
                    </Label>
                    <div className="grid grid-cols-1 gap-2 mt-1">
                      {SOURCE_TYPES.map((src) => {
                        const checked = allowedSources.includes(src.value);
                        return (
                          <div
                            key={src.value}
                            onClick={() => handleSourceToggle(src.value)}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition border text-xs font-medium ${
                              checked
                                ? "bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/60 text-indigo-950 dark:text-indigo-200"
                                : "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800/80 hover:border-slate-200"
                            }`}
                          >
                            <span>{src.label}</span>
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                                checked
                                  ? "bg-indigo-600 border-indigo-600 text-white"
                                  : "border-slate-300 dark:border-slate-700"
                              }`}
                            >
                              {checked && (
                                <Check className="w-3 h-3 stroke-[3]" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Min Paid Percentage & Cutoff & Grace days (Enabled unless Date-based) */}
                {policyType !== AdmitCardPolicyType.DATE_BASED && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Min Paid %
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        className="h-10 rounded-lg"
                        value={minPaidPercentage}
                        onChange={(e) =>
                          setMinPaidPercentage(Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Grace Days
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        className="h-10 rounded-lg"
                        value={graceDays}
                        onChange={(e) => setGraceDays(Number(e.target.value))}
                      />
                    </div>
                  </div>
                )}

                {/* Cutoff Date */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    Invoice Due Date Cutoff
                    <span className="text-[10px] text-muted-foreground font-normal">
                      (Optional)
                    </span>
                  </Label>
                  <Input
                    type="date"
                    className="h-10 rounded-lg"
                    value={cutoffDate}
                    onChange={(e) => setCutoffDate(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Only evaluates student invoices with due dates on or before
                    this date.
                  </p>
                </div>
              </div>
            )}

            {!isActive && (
              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 flex items-start gap-3 animate-in fade-in duration-300">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-amber-800 dark:text-amber-400">
                    Policy Enforcement Off
                  </span>
                  <p className="text-[10px] text-amber-700 dark:text-amber-500 leading-normal">
                    All students registered in assigned classes will be fully
                    cleared for admit cards. Checks are completely bypassed.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="mt-4 border-t pt-4 gap-2">
          <Button
            variant="outline"
            className="rounded-lg text-xs"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5"
            disabled={upsertPolicyMutation.isPending || policyLoading}
            onClick={handleSave}
          >
            {upsertPolicyMutation.isPending && (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            )}
            Save Policy Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
