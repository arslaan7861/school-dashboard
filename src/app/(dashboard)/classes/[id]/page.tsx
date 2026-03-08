"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  BookOpen,
  Users,
  User,
  Calendar,
  GraduationCap,
  Clock,
  ChevronRightIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

import { useAuthStore } from "@/store/authStore";
import { useClass } from "@/features/class/hooks.class";
import { useTeacher } from "@/features/teachers/hooks.teacher";
import { useSessions } from "@/features/session/hooks.session";
import Link from "next/link";
import SubjectsTab from "@/components/pages/class/tabs/subjects.tab";
import StudentsTab from "@/components/pages/class/tabs/students.tab";
import TimetableTab from "@/components/pages/class/tabs/timetable.tab";
import { UpdateClassDialog } from "@/components/pages/class/dialog/updateClass.dialog";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

function InfoCard({
  title,
  icon: Icon,
  value,
  subtitle,
}: {
  title: string;
  icon: any;
  value: string;
  subtitle?: string;
}) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-xl font-semibold">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Valid tab values
type TabValue = "subjects" | "students" | "timetable" | "exams";

export default function ClassDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const classId = params.id as string;
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  // Get tab from URL or default to "subjects"
  const tabFromUrl = searchParams.get("tab") as TabValue | null;
  const [activeTab, setActiveTab] = useState<TabValue>(
    tabFromUrl &&
      ["subjects", "students", "timetable", "exams"].includes(tabFromUrl)
      ? tabFromUrl
      : "subjects",
  );

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    const tabValue = value as TabValue;
    setActiveTab(tabValue);

    // Update URL without refreshing the page
    const newUrl = `/classes/${classId}?tab=${tabValue}`;
    router.push(newUrl, { scroll: false });
  };

  // Sync tab state with URL on mount and when URL changes
  useEffect(() => {
    const currentTab = searchParams.get("tab") as TabValue | null;
    if (
      currentTab &&
      ["subjects", "students", "timetable", "exams"].includes(currentTab)
    ) {
      setActiveTab(currentTab);
    }
  }, [searchParams]);

  const { data: classData, isLoading } = useClass(classId);
  const classInfo = classData?.data;

  const { data: classTeacherData } = useTeacher(
    Number(classInfo?.classTeacherId),
  );
  const classTeacher = classTeacherData?.data;

  const { data: sessions } = useSessions();
  const classSession = sessions?.data.find(
    (s) => s.id === Number(classInfo?.sessionId),
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-56" />
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!classInfo) {
    return (
      <div className="flex justify-center items-center h-full">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Class not found</p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => router.push("/classes")}
            >
              Back to Classes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/classes")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <h1 className="text-2xl font-semibold">
              {classInfo.name} • Section {classInfo.section}
            </h1>
            <p className="text-sm text-muted-foreground">
              Created {formatDate(classInfo.createdAt)}
            </p>
          </div>
        </div>

        {isAdmin && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsUpdateDialogOpen(true)}
            >
              <Edit className="h-3 w-3 mr-2" />
              Edit
            </Button>

            <UpdateClassDialog
              classData={classInfo}
              open={isUpdateDialogOpen}
              onOpenChange={setIsUpdateDialogOpen}
            />
          </>
        )}
      </div>

      <Separator />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard
          title="Class"
          icon={GraduationCap}
          value={classInfo.name}
          subtitle={`Section ${classInfo.section}`}
        />

        <InfoCard
          title="Session"
          icon={Calendar}
          value={classSession?.name || "—"}
        />

        <InfoCard
          title="Class Teacher"
          icon={User}
          value={classTeacher?.name || "Not Assigned"}
          subtitle={classTeacher?.employeeCode}
        />
      </div>

      {/* Teacher Section */}
      {classTeacher && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Class Teacher</CardTitle>
              <CardDescription>Assigned teacher details</CardDescription>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/teachers/${classTeacher.id}`)}
            >
              View Profile
              <ChevronRightIcon />
            </Button>
          </CardHeader>

          <CardContent className="flex flex-col md:flex-row gap-6 items-start">
            <Link
              href={`/teachers/${classTeacher.id}`}
              className="cursor-pointer"
            >
              <Avatar className="h-14 w-14">
                <AvatarImage src={classTeacher.profilePic || undefined} />
                <AvatarFallback>
                  {getInitials(classTeacher.name)}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="grid md:grid-cols-3 gap-6 w-full">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{classTeacher.name}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{classTeacher.email || "—"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{classTeacher.phone || "—"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Employee Code</p>
                <p className="font-medium">{classTeacher.employeeCode}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Qualification</p>
                <p className="font-medium">
                  {classTeacher.qualification || "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  variant={classTeacher.isActive ? "default" : "secondary"}
                >
                  {classTeacher.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs - Synced with URL */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-4 w-full md:w-[500px]">
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects">
          <SubjectsTab classId={classId} />
        </TabsContent>

        <TabsContent value="students">
          <StudentsTab classId={classId} />
        </TabsContent>

        <TabsContent value="timetable">
          <TimetableTab classId={classId} />
        </TabsContent>

        <TabsContent value="exams">
          <PlaceholderCard icon={GraduationCap} title="Exams" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PlaceholderCard({ title, icon: Icon }: { title: string; icon: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
        <CardDescription>{title} feature coming soon</CardDescription>
      </CardHeader>

      <CardContent className="flex items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground">Coming soon</p>
      </CardContent>
    </Card>
  );
}
