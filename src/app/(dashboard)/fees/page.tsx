"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useClasses } from "@/features/class/hooks.class";
import { useStudents } from "@/features/students/hooks.student";
import { ClassFeesConfig } from "@/features/fees/components/ClassFeesConfig";
import { ExamFeesConfig } from "@/features/fees/components/ExamFeesConfig";
import { OptionalFeesConfig } from "@/features/fees/components/OptionalFeesConfig";
import { StudentFeeLedger } from "@/features/fees/components/StudentFeeLedger";
import { BillingGenerator } from "@/features/fees/components/BillingGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Coins,
  Search,
  UserCheck,
  ShieldAlert,
  CreditCard,
  Settings,
  CalendarDays,
  Loader2,
} from "lucide-react";

export default function FeesDashboard() {
  const activeSessionId = useAuthStore((s) => s.activeSessionId);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial states from URL
  const initialActiveTab = searchParams.get("tab") || "collect";
  const initialConfigTab = searchParams.get("configTab") || "class-fees";
  const initialClassId = searchParams.get("classId") || "";
  const initialSearch = searchParams.get("search") || "";
  const initialPage = Number(searchParams.get("page")) || 1;

  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [configTab, setConfigTab] = useState(initialConfigTab);
  const [selectedClassId, setSelectedClassId] =
    useState<string>(initialClassId);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);
  const [billingOpen, setBillingOpen] = useState(false);

  // Selected Student for Ledger Sheet
  const [ledgerStudent, setLedgerStudent] = useState<{
    classStudentId: number;
    name: string;
    admissionNo: string;
    classDisplayName: string;
    classId: number;
  } | null>(null);

  // Fetch Classes for dropdown
  const { data: classesResponse, isLoading: loadingClasses } = useClasses(
    activeSessionId ? Number(activeSessionId) : undefined,
  );
  const classes = classesResponse?.data || [];

  // Sync state changes with URL query parameters
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    if (activeTab !== "collect") params.set("tab", activeTab);
    if (activeTab === "config" && configTab !== "class-fees")
      params.set("configTab", configTab);
    if (selectedClassId) params.set("classId", selectedClassId);
    if (searchTerm) params.set("search", searchTerm);
    if (page > 1) params.set("page", String(page));

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [
    activeTab,
    configTab,
    selectedClassId,
    searchTerm,
    page,
    pathname,
    router,
  ]);

  useEffect(() => {
    updateUrlParams();
  }, [updateUrlParams]);

  // Automatically select first class if none selected AND URL didn't specify one
  useEffect(() => {
    if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(String(classes[0].id));
    }
  }, [selectedClassId, classes]);

  // Fetch Students for selected class
  const { data: studentsData, isLoading: loadingStudents } = useStudents({
    sessionId: activeSessionId ? Number(activeSessionId) : 0,
    classId: selectedClassId ? Number(selectedClassId) : undefined,
    search: searchTerm || undefined,
    page,
    limit: 50,
  });

  const students = studentsData?.students || [];

  if (!activeSessionId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <ShieldAlert className="w-12 h-12 text-destructive animate-bounce" />
        <h2 className="text-xl font-bold">No Active Session Selected</h2>
        <p className="text-sm text-muted-foreground">
          Please select or activate an academic session using the switcher at
          the sidebar.
        </p>
      </div>
    );
  }

  const getClassName = (clsId: number | null) => {
    const cls = classes.find((c) => c.id === clsId);
    return cls ? `${cls.name} - ${cls.section}` : "Unenrolled";
  };

  return (
    <div className="space-y-6">
      {/* Unified sticky header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pt-4 pb-4 border-b">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <Coins className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight leading-none">
                Fees & Billing Hub
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage tuition profiles, record payments, allocate balances, and
                run billing cycles.
              </p>
            </div>
          </div>

          {/* Action Trigger for Billing Modal */}
          <div className="shrink-0">
            <Dialog open={billingOpen} onOpenChange={setBillingOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1.5 shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
                  <CalendarDays className="w-4 h-4" />
                  Run Billing Cycle
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Run Academic Billing Cycle</DialogTitle>
                  <DialogDescription>
                    Generate invoices for all students enrolled in the selected
                    academic session.
                  </DialogDescription>
                </DialogHeader>
                <div className="pt-2">
                  <BillingGenerator
                    sessionId={Number(activeSessionId)}
                    onSuccess={() => setBillingOpen(false)}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Tabs switcher */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="collect">
            <CreditCard className="w-4 h-4 mr-2" />
            Payments & Ledgers
          </TabsTrigger>
          <TabsTrigger value="config">
            <Settings className="w-4 h-4 mr-2" />
            Fee Configurations
          </TabsTrigger>
        </TabsList>

        {/* PAYMENTS & LEDGERS TAB */}
        <TabsContent value="collect" className="space-y-4">
          {/* Horizontal Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-muted/20 p-3 rounded-lg border">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search student or adm no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-8 h-9 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select
                value={selectedClassId}
                onValueChange={setSelectedClassId}
              >
                <SelectTrigger className="w-[180px] h-9 text-sm">
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
              {searchTerm && (
                <Button
                  variant="ghost"
                  onClick={() => setSearchTerm("")}
                  className="h-9 px-2 text-muted-foreground text-sm hover:bg-transparent"
                >
                  Clear Search
                </Button>
              )}
            </div>
          </div>

          {/* Students Table */}
          <Card className="shadow-sm border overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <CardTitle className="text-base font-bold">
                    Roster Listing
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Click Manage Fees to open student ledgers, record payments,
                    and configure discounts.
                  </CardDescription>
                </div>
                <div className="text-xs text-muted-foreground font-medium bg-muted/50 px-2.5 py-1 rounded-md border">
                  {students.length} students in list
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loadingStudents ? (
                <div className="flex flex-col items-center justify-center p-16 space-y-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    Fetching student enrollments...
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="w-[120px]">Adm No.</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Roll No.</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right w-[150px]">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.length > 0 ? (
                        students.map((student) => {
                          const isEnrolled = !!student.classRelation;
                          return (
                            <TableRow key={student.id}>
                              <TableCell className="font-semibold text-xs text-muted-foreground">
                                {student.admissionNo}
                              </TableCell>
                              <TableCell className="font-medium text-sm">
                                {student.name}
                              </TableCell>
                              <TableCell className="text-sm">
                                {student.classRelation?.rollNumber || "—"}
                              </TableCell>
                              <TableCell>
                                {isEnrolled ? (
                                  <Badge
                                    variant="default"
                                    className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-500/20"
                                  >
                                    <UserCheck className="w-3.5 h-3.5 mr-1" />
                                    Enrolled
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">Unenrolled</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={!isEnrolled}
                                  onClick={() =>
                                    isEnrolled &&
                                    setLedgerStudent({
                                      classStudentId: student.classRelation!.id,
                                      name: student.name,
                                      admissionNo: student.admissionNo,
                                      classDisplayName: getClassName(
                                        student.class?.id || null,
                                      ),
                                      classId: student.class?.id || 0,
                                    })
                                  }
                                >
                                  Manage Fees
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="h-48 text-center text-muted-foreground"
                          >
                            No students found in this class session.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FEE CONFIGURATIONS TAB */}
        <TabsContent value="config" className="space-y-6">
          <Tabs
            value={configTab}
            onValueChange={setConfigTab}
            className="space-y-4"
          >
            <div className="border-b">
              <TabsList className="bg-transparent h-10 p-0 gap-6">
                <TabsTrigger value="class-fees">Class Tuition Fees</TabsTrigger>
                <TabsTrigger value="exam-fees">Exam Fees</TabsTrigger>
                <TabsTrigger value="optional-fees">
                  Optional & Event Fees
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="class-fees" className="m-0">
              <ClassFeesConfig sessionId={Number(activeSessionId)} />
            </TabsContent>

            <TabsContent value="exam-fees" className="m-0">
              <ExamFeesConfig sessionId={Number(activeSessionId)} />
            </TabsContent>

            <TabsContent value="optional-fees" className="m-0">
              <OptionalFeesConfig sessionId={Number(activeSessionId)} />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* STUDENT FEE DETAIL SHEET */}
      {ledgerStudent && (
        <StudentFeeLedger
          classStudentId={ledgerStudent.classStudentId}
          studentName={ledgerStudent.name}
          admissionNo={ledgerStudent.admissionNo}
          classDisplayName={ledgerStudent.classDisplayName}
          classId={ledgerStudent.classId}
          sessionId={Number(activeSessionId)}
          isOpen={ledgerStudent !== null}
          onClose={() => setLedgerStudent(null)}
        />
      )}
    </div>
  );
}
