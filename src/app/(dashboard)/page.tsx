"use client";

import { useState, useEffect } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  School,
  Bus,
  FileText,
  MessageSquare,
  UserPlus,
  Award,
  Bell,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { useRouter } from "next/navigation";

// ==================== PLACEHOLDER DATA ====================

const STATS_DATA = {
  totalStudents: 1248,
  totalTeachers: 86,
  totalClasses: 42,
  totalSubjects: 18,
  studentsTrend: "+8%",
  teachersTrend: "+3%",
  classesTrend: "+5%",
  subjectsTrend: "0%",
};

const ATTENDANCE_DATA = [
  { month: "Jan", present: 85, absent: 15 },
  { month: "Feb", present: 88, absent: 12 },
  { month: "Mar", present: 90, absent: 10 },
  { month: "Apr", present: 87, absent: 13 },
  { month: "May", present: 92, absent: 8 },
  { month: "Jun", present: 89, absent: 11 },
  { month: "Jul", present: 91, absent: 9 },
  { month: "Aug", present: 86, absent: 14 },
  { month: "Sep", present: 88, absent: 12 },
  { month: "Oct", present: 90, absent: 10 },
  { month: "Nov", present: 87, absent: 13 },
  { month: "Dec", present: 91, absent: 9 },
];

const FEE_COLLECTION_DATA = [
  { month: "Jan", collected: 85000, pending: 15000 },
  { month: "Feb", collected: 92000, pending: 8000 },
  { month: "Mar", collected: 88000, pending: 12000 },
  { month: "Apr", collected: 95000, pending: 5000 },
  { month: "May", collected: 91000, pending: 9000 },
  { month: "Jun", collected: 89000, pending: 11000 },
];

const SUBJECT_PERFORMANCE = [
  { name: "Mathematics", average: 78, color: "#0088FE" },
  { name: "Science", average: 82, color: "#00C49F" },
  { name: "English", average: 85, color: "#FFBB28" },
  { name: "Social Studies", average: 76, color: "#FF8042" },
  { name: "Computer Science", average: 88, color: "#8884D8" },
];

const RECENT_ACTIVITIES = [
  {
    id: 1,
    type: "homework",
    title: "Homework Assigned",
    description: "Mathematics homework assigned to Class 10-A",
    time: "2 hours ago",
  },
  {
    id: 2,
    type: "attendance",
    title: "Attendance Marked",
    description: "Class 9-B attendance marked for today",
    time: "5 hours ago",
  },
  {
    id: 3,
    type: "fee",
    title: "Fee Payment Received",
    description: "₹25,000 fee payment from John Doe",
    time: "1 day ago",
  },
  {
    id: 4,
    type: "message",
    title: "Notice Published",
    description: "Parent-Teacher meeting scheduled for next week",
    time: "2 days ago",
  },
  {
    id: 5,
    type: "homework",
    title: "Homework Submitted",
    description: "15 students submitted Science homework",
    time: "3 days ago",
  },
];

const UPCOMING_EVENTS = [
  {
    id: 1,
    day: "15",
    month: "May",
    title: "Mid-Term Exams Start",
    description: "First day of mid-term examinations",
    type: "exam",
  },
  {
    id: 2,
    day: "20",
    month: "May",
    title: "Parent-Teacher Meeting",
    description: "Annual parent-teacher interaction",
    type: "meeting",
  },
  {
    id: 3,
    day: "25",
    month: "May",
    title: "Sports Day",
    description: "Annual sports competition",
    type: "event",
  },
  {
    id: 4,
    day: "01",
    month: "Jun",
    title: "Summer Vacation",
    description: "School closes for summer break",
    type: "holiday",
  },
];

const NOTICES = [
  {
    id: 1,
    title: "School Reopening",
    content: "School will reopen on June 15th after summer break",
    date: "2024-05-01",
    isNew: true,
  },
  {
    id: 2,
    title: "Fee Submission Deadline",
    content: "Last date for fee submission is May 20th",
    date: "2024-04-28",
    isNew: false,
  },
  {
    id: 3,
    title: "Uniform Change",
    content: "New uniform will be mandatory from next session",
    date: "2024-04-25",
    isNew: false,
  },
];

const ATTENDANCE_SUMMARY = {
  today: 92,
  week: 88,
  month: 89,
  overall: 87,
};

// ==================== MAIN COMPONENT ====================

export default function DashboardPage() {
  const router = useRouter();
  const [greeting, setGreeting] = useState("");
  const [selectedChart, setSelectedChart] = useState<"attendance" | "fee">(
    "attendance",
  );

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{greeting}, Admin!</h1>
          <p className="text-gray-500 mt-1">
            Welcome back to your school management dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.push("/calendar")}
          >
            <Calendar className="h-4 w-4" />
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={STATS_DATA.totalStudents}
          icon={Users}
          trend={STATS_DATA.studentsTrend}
          trendUp={true}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Teachers"
          value={STATS_DATA.totalTeachers}
          icon={GraduationCap}
          trend={STATS_DATA.teachersTrend}
          trendUp={true}
          color="bg-green-500"
        />
        <StatCard
          title="Total Classes"
          value={STATS_DATA.totalClasses}
          icon={School}
          trend={STATS_DATA.classesTrend}
          trendUp={true}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Subjects"
          value={STATS_DATA.totalSubjects}
          icon={BookOpen}
          trend={STATS_DATA.subjectsTrend}
          trendUp={false}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance & Fee Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Overview</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={selectedChart === "attendance" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedChart("attendance")}
              >
                Attendance
              </Button>
              <Button
                variant={selectedChart === "fee" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedChart("fee")}
              >
                Fee Collection
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedChart === "attendance" ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={ATTENDANCE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="present"
                      stackId="1"
                      stroke="#0088FE"
                      fill="#0088FE"
                      fillOpacity={0.6}
                      name="Present (%)"
                    />
                    <Area
                      type="monotone"
                      dataKey="absent"
                      stackId="1"
                      stroke="#FF8042"
                      fill="#FF8042"
                      fillOpacity={0.6}
                      name="Absent (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-sm">Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full" />
                    <span className="text-sm">Absent</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={FEE_COLLECTION_DATA}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="collected"
                      fill="#00C49F"
                      name="Collected (₹)"
                    />
                    <Bar dataKey="pending" fill="#FFBB28" name="Pending (₹)" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm">Collected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <span className="text-sm">Pending</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Attendance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AttendanceSummaryItem
              label="Today"
              value={ATTENDANCE_SUMMARY.today}
            />
            <AttendanceSummaryItem
              label="This Week"
              value={ATTENDANCE_SUMMARY.week}
            />
            <AttendanceSummaryItem
              label="This Month"
              value={ATTENDANCE_SUMMARY.month}
            />
            <AttendanceSummaryItem
              label="Overall"
              value={ATTENDANCE_SUMMARY.overall}
            />
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Subject Performance (Average Marks)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={SUBJECT_PERFORMANCE}
              layout="vertical"
              margin={{ left: 100 }}
            >
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="name" />
              <Tooltip />
              <Bar dataKey="average" fill="#8884D8" radius={[0, 4, 4, 0]}>
                {SUBJECT_PERFORMANCE.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Activities</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/activities")}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
            {RECENT_ACTIVITIES.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-full shrink-0">
                  {activity.type === "homework" && (
                    <FileText className="h-4 w-4 text-blue-500" />
                  )}
                  {activity.type === "attendance" && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {activity.type === "fee" && (
                    <DollarSign className="h-4 w-4 text-yellow-500" />
                  )}
                  {activity.type === "message" && (
                    <MessageSquare className="h-4 w-4 text-purple-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-gray-500">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Events & Notices */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/calendar")}
              >
                View Calendar
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {UPCOMING_EVENTS.map((event) => (
                <div key={event.id} className="flex items-center gap-3">
                  <div className="text-center min-w-[60px]">
                    <div className="text-xl font-bold text-blue-600">
                      {event.day}
                    </div>
                    <div className="text-xs text-gray-500">{event.month}</div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-gray-500">{event.description}</p>
                  </div>
                  <Badge
                    variant={
                      event.type === "exam"
                        ? "destructive"
                        : event.type === "holiday"
                          ? "secondary"
                          : "default"
                    }
                  >
                    {event.type}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Notices */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Notices</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/notices")}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {NOTICES.map((notice) => (
                <div
                  key={notice.id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => router.push(`/notices/${notice.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium flex items-center gap-2">
                        {notice.title}
                        {notice.isNew && (
                          <Badge variant="default" className="text-xs">
                            New
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {notice.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notice.date}
                      </p>
                    </div>
                    <Bell className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <QuickActionButton
              icon={UserPlus}
              label="Add Student"
              onClick={() => router.push("/students/create")}
            />
            <QuickActionButton
              icon={GraduationCap}
              label="Add Teacher"
              onClick={() => router.push("/teachers/create")}
            />
            <QuickActionButton
              icon={School}
              label="Add Class"
              onClick={() => router.push("/classes/create")}
            />
            <QuickActionButton
              icon={BookOpen}
              label="Add Subject"
              onClick={() => router.push("/subjects/create")}
            />
            <QuickActionButton
              icon={Bus}
              label="Transport"
              onClick={() => router.push("/transport")}
            />
            <QuickActionButton
              icon={Award}
              label="Exams"
              onClick={() => router.push("/exams")}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================

interface StatCardProps {
  title: string;
  value: number;
  icon: any;
  trend: string;
  trendUp: boolean;
  color: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  color,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl md:text-3xl font-bold mt-2">
              {value.toLocaleString()}
            </p>
            <div className="flex items-center gap-1 mt-2">
              {trendUp ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`text-sm ${trendUp ? "text-green-500" : "text-red-500"}`}
              >
                {trend}
              </span>
              <span className="text-sm text-gray-500">vs last month</span>
            </div>
          </div>
          <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
            <Icon
              className={`h-5 w-5 md:h-6 md:w-6 ${color.replace("bg-", "text-")}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickActionButtonProps {
  icon: any;
  label: string;
  onClick: () => void;
}

function QuickActionButton({
  icon: Icon,
  label,
  onClick,
}: QuickActionButtonProps) {
  return (
    <Button
      variant="outline"
      className="h-auto py-3 md:py-4 flex flex-col gap-1 md:gap-2"
      onClick={onClick}
    >
      <Icon className="h-4 w-4 md:h-5 md:w-5" />
      <span className="text-xs md:text-sm">{label}</span>
    </Button>
  );
}

interface AttendanceSummaryItemProps {
  label: string;
  value: number;
}

function AttendanceSummaryItem({ label, value }: AttendanceSummaryItemProps) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}
