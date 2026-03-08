"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format, parse, differenceInMinutes } from "date-fns";
import {
  Calendar,
  ExternalLink,
  GraduationCap,
  Users,
  BookOpen,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { useClassTimetable } from "@/features/timetable/hooks.timetable";
import { WEEK_DAYS, WeekDay } from "@/features/timetable/types.timetable";
import { useAuthStore } from "@/store/authStore";

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const LECTURES = [1, 2, 3, 4, 5, 6, 7, 8];

// One accent color per subject slot — stays within the light system palette
const SUBJECT_ACCENTS = [
  {
    bar: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-600 border-blue-200/60",
  },
  {
    bar: "bg-violet-500",
    bg: "bg-violet-50",
    text: "text-violet-700",
    badge: "bg-violet-100 text-violet-600 border-violet-200/60",
  },
  {
    bar: "bg-emerald-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-600 border-emerald-200/60",
  },
  {
    bar: "bg-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-600 border-amber-200/60",
  },
  {
    bar: "bg-rose-500",
    bg: "bg-rose-50",
    text: "text-rose-700",
    badge: "bg-rose-100 text-rose-600 border-rose-200/60",
  },
  {
    bar: "bg-cyan-500",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    badge: "bg-cyan-100 text-cyan-600 border-cyan-200/60",
  },
];

const getAccent = (id: number) => SUBJECT_ACCENTS[id % SUBJECT_ACCENTS.length];

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

const fmt12 = (time?: string) => {
  if (!time) return null;
  const t = time.split(":").slice(0, 2).join(":");
  try {
    return format(parse(t, "HH:mm", new Date()), "h:mm a");
  } catch {
    return t;
  }
};

const getDuration = (start?: string, end?: string): number | null => {
  if (!start || !end) return null;
  try {
    const s = parse(start.slice(0, 5), "HH:mm", new Date());
    const e = parse(end.slice(0, 5), "HH:mm", new Date());
    const d = differenceInMinutes(e, s);
    return isNaN(d) ? null : d;
  } catch {
    return null;
  }
};

const fmtDur = (m: number) => {
  const h = Math.floor(m / 60),
    rem = m % 60;
  if (h === 0) return `${rem}m`;
  if (rem === 0) return `${h}h`;
  return `${h}h ${rem}m`;
};

const getCurrentDay = (): WeekDay => {
  const map: WeekDay[] = [
    WeekDay.MONDAY,
    WeekDay.TUESDAY,
    WeekDay.WEDNESDAY,
    WeekDay.THURSDAY,
    WeekDay.FRIDAY,
    WeekDay.SATURDAY,
  ];
  const today = new Date().getDay();
  return map[today === 0 ? 5 : today - 1];
};

/* ─── Day Selector ───────────────────────────────────────────────────────────── */

const DAY_ABBR: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
};

const DaySelector = ({
  selected,
  onChange,
}: {
  selected: WeekDay;
  onChange: (d: WeekDay) => void;
}) => {
  const today = getCurrentDay();

  return (
    <div className="flex gap-1 border-b">
      {WEEK_DAYS.map(({ value, label }) => {
        const active = selected === value;
        const isToday = value === today;

        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={cn(
              "relative flex flex-col items-center px-3.5 pb-2.5 pt-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-t-md",
              active
                ? "text-foreground border-b-2 border-primary -mb-px"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="text-xs font-semibold">{DAY_ABBR[value]}</span>
            {isToday && (
              <span
                className={cn(
                  "mt-1 w-1 h-1 rounded-full",
                  active ? "bg-primary" : "bg-muted-foreground/40",
                )}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

/* ─── Entry Card ─────────────────────────────────────────────────────────────── */

const EntryCard = ({ entry }: { entry: any }) => {
  const a = getAccent(entry.subject.id);

  return (
    <div className={cn("flex rounded-lg border overflow-hidden", a.bg)}>
      {/* Accent bar */}
      <div className={cn("w-1 shrink-0", a.bar)} />

      <div className="flex-1 px-3 py-2.5 min-w-0">
        {/* Subject + type */}
        <div className="flex items-start justify-between gap-2">
          <span
            className={cn(
              "font-semibold text-sm leading-snug truncate",
              a.text,
            )}
          >
            {entry.subject.name}
          </span>
          <span
            className={cn(
              "shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded border",
              a.badge,
            )}
          >
            {entry.component.type}
          </span>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            Batch {entry.batch.name}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <GraduationCap className="w-3 h-3" />
            {entry.teacher.name}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ─── Slot Row ───────────────────────────────────────────────────────────────── */

const SlotRow = ({
  slot,
  lecture,
  isLast,
}: {
  slot: any;
  lecture: number;
  isLast: boolean;
}) => {
  const start = fmt12(slot?.startTime);
  const end = fmt12(slot?.endTime);
  const dur = getDuration(slot?.startTime, slot?.endTime);
  const isEmpty = !slot?.entries?.length;

  return (
    <div
      className={cn(
        "grid grid-cols-[80px_1fr] gap-4 py-3",
        !isLast && "border-b",
      )}
    >
      {/* Time column */}
      <div className="flex flex-col justify-start pt-0.5 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">
            L{lecture}
          </span>
        </div>
        {start && (
          <>
            <span className="text-xs font-semibold text-foreground tabular-nums mt-0.5">
              {start}
            </span>
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {end}
            </span>
            {dur && (
              <span className="text-[10px] text-muted-foreground/50 mt-0.5">
                {fmtDur(dur)}
              </span>
            )}
          </>
        )}
      </div>

      {/* Content column */}
      <div className="space-y-2 min-w-0">
        {isEmpty ? (
          <div className="h-[46px] rounded-lg border border-dashed bg-muted/30 flex items-center justify-center gap-2 text-xs text-muted-foreground/50 font-medium">
            <BookOpen className="w-3.5 h-3.5" />
            Free period
          </div>
        ) : (
          slot.entries.map((entry: any) => (
            <EntryCard key={entry.id} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
};

/* ─── Stats Strip ────────────────────────────────────────────────────────────── */

const StatsStrip = ({ slots }: { slots: any[] }) => {
  const classes = slots.reduce((n, s) => n + (s?.entries?.length ?? 0), 0);
  const subjects = new Set(
    slots.flatMap((s) => s?.entries?.map((e: any) => e.subject.id) ?? []),
  ).size;
  const free = slots.filter((s) => !s?.entries?.length).length;

  return (
    <div className="flex items-center gap-4 px-1 py-2 border-b text-xs text-muted-foreground">
      <span>
        <span className="font-semibold text-foreground">{classes}</span> classes
      </span>
      <span className="text-muted-foreground/30">·</span>
      <span>
        <span className="font-semibold text-foreground">{subjects}</span>{" "}
        subjects
      </span>
      <span className="text-muted-foreground/30">·</span>
      <span>
        <span className="font-semibold text-foreground">{free}</span> free
      </span>
    </div>
  );
};

/* ─── Loading Skeleton ───────────────────────────────────────────────────────── */

const TimetableSkeleton = () => (
  <div className="space-y-0">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="grid grid-cols-[80px_1fr] gap-4 py-3 border-b last:border-0"
      >
        <div className="flex flex-col items-end gap-1.5 pt-0.5">
          <Skeleton className="h-2.5 w-5" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-2.5 w-14" />
        </div>
        <Skeleton
          className={cn("rounded-lg", i % 2 === 1 ? "h-[46px]" : "h-[62px]")}
        />
      </div>
    ))}
  </div>
);

/* ─── Main Component ─────────────────────────────────────────────────────────── */

export default function TimetableTab({ classId }: { classId: string }) {
  const router = useRouter();
  const sessionId = useAuthStore((s) => s.activeSessionId);
  const [selectedDay, setSelectedDay] = useState<WeekDay>(getCurrentDay());

  const { data, isLoading } = useClassTimetable(
    Number(classId),
    Number(sessionId),
  );

  const timetable = useMemo(() => {
    const grid: Record<WeekDay, Record<number, any>> = {
      monday: {},
      tuesday: {},
      wednesday: {},
      thursday: {},
      friday: {},
      saturday: {},
    };
    LECTURES.forEach((l) =>
      Object.keys(grid).forEach((d) => {
        grid[d as WeekDay][l] = null;
      }),
    );
    data?.slots?.forEach((slot) => {
      grid[slot.day][slot.lectureNo] = slot;
    });
    return grid;
  }, [data]);

  const selectedSlots = LECTURES.map((l) => timetable[selectedDay]?.[l]);

  return (
    <Card>
      {/* ── Header ── */}
      <CardHeader className="flex flex-row items-center justify-between pb-0">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          Class Schedule
        </CardTitle>

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/timetable/${classId}`)}
        >
          Manage Timetable
          <ExternalLink className="h-3 w-3 ml-2" />
        </Button>
      </CardHeader>

      <CardContent className="pt-4 space-y-0">
        {/* ── Day Tabs ── */}
        <DaySelector selected={selectedDay} onChange={setSelectedDay} />

        {/* ── Stats ── */}
        {!isLoading && <StatsStrip slots={selectedSlots} />}

        {/* ── Slots ── */}
        <div className="pt-1">
          {isLoading ? (
            <TimetableSkeleton />
          ) : (
            LECTURES.map((lecture, i) => (
              <SlotRow
                key={lecture}
                lecture={lecture}
                slot={timetable[selectedDay][lecture]}
                isLast={i === LECTURES.length - 1}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
