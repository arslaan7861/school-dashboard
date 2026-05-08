"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  BookOpen,
  Calendar,
  ChevronRight,
  Eye,
  Filter,
  Plus,
  Search,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAuthStore } from "@/store/authStore";
import { useAllHomework } from "@/features/homework/hooks.homework";
import { useClasses } from "@/features/class/hooks.class";
import { HomeworkStatusBadge } from "@/components/pages/homework/HomeworkStatusBadge";

export default function GlobalHomeworkPage() {
  const router = useRouter();
  const activeSessionId = useAuthStore((s) => s.activeSessionId);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const {
    data: homeworkData,
    isLoading,
    refetch,
  } = useAllHomework(activeSessionId ?? undefined);
  const { data: classesData } = useClasses();

  const homework = homeworkData || [];
  const classes = classesData?.data || [];

  // Extract unique subjects from homework
  const subjects = Array.from(
    new Set(homework.map((hw) => hw.subject?.name).filter(Boolean)),
  );

  // Filter homework based on search and filters
  const filteredHomework = homework.filter((hw) => {
    // Search filter
    if (searchTerm) {
      const matchesSearch =
        hw.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hw.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hw.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
    }

    // Subject filter
    if (selectedSubject !== "all" && hw.subject?.name !== selectedSubject) {
      return false;
    }

    // Class filter
    if (selectedClass !== "all" && hw.classId !== parseInt(selectedClass)) {
      return false;
    }

    return true;
  });

  // Group homework by created date
  const groupedHomework = filteredHomework.reduce(
    (acc, hw) => {
      const date = format(new Date(hw.createdAt), "dd MMM yyyy");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(hw);
      return acc;
    },
    {} as Record<string, typeof filteredHomework>,
  );

  // Sort dates descending
  const sortedDates = Object.keys(groupedHomework).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  const handleViewHomework = (homeworkId: number) => {
    router.push(`/homework/${homeworkId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Homework</h1>
          <p className="text-gray-500 mt-1">
            View all homework assignments across all classes
          </p>
        </div>
        <Button
          onClick={() => router.push("/homework/create")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Homework
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title, subject, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject!}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>
                    {cls.name} - {cls.section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear filters button */}
            {(searchTerm ||
              selectedSubject !== "all" ||
              selectedClass !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSubject("all");
                  setSelectedClass("all");
                }}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Showing {filteredHomework.length} of {homework.length} assignments
        </p>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            List
          </Button>
        </div>
      </div>

      {/* Homework List grouped by date */}
      {sortedDates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No homework found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/homework/create")}
            >
              Create First Homework
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="space-y-8">
          {sortedDates.map((date) => (
            <div key={date}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {date}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedHomework[date].map((hw) => (
                  <HomeworkGridCard
                    key={hw.id}
                    homework={hw}
                    onView={() => handleViewHomework(hw.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map((date) => (
            <div key={date}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {date}
              </h2>
              <div className="space-y-2">
                {groupedHomework[date].map((hw) => (
                  <HomeworkListItem
                    key={hw.id}
                    homework={hw}
                    onView={() => handleViewHomework(hw.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== Grid Card Component ====================

function HomeworkGridCard({
  homework,
  onView,
}: {
  homework: any;
  onView: () => void;
}) {
  const router = useRouter();

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onView}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg line-clamp-1">
            {homework.title}
          </h3>
          <HomeworkStatusBadge dueDate={homework.dueDate} />
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {homework.description}
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-gray-600">Subject:</span>
            <span className="font-medium">{homework.subject?.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-600">Due:</span>
              <span className="font-medium text-sm">
                {format(new Date(homework.dueDate), "dd MMM yyyy")}
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              {homework.class?.name} {homework.class?.section}
            </Badge>
          </div>
        </div>
        <div className="flex justify-end mt-4 pt-2 border-t">
          <Button variant="ghost" size="sm" onClick={onView}>
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== List Item Component ====================

function HomeworkListItem({
  homework,
  onView,
}: {
  homework: any;
  onView: () => void;
}) {
  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onView}
    >
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className="font-semibold text-lg">{homework.title}</h3>
              <HomeworkStatusBadge dueDate={homework.dueDate} />
              <Badge variant="outline">
                {homework.class?.name} {homework.class?.section}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 line-clamp-1 mb-2">
              {homework.description}
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-gray-600">{homework.subject?.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-gray-600">
                  Due: {format(new Date(homework.dueDate), "dd MMM yyyy")}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onView}
            className="shrink-0"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
