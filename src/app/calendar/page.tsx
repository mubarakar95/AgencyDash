"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Clock,
  CalendarDays,
  Flame,
  AlertTriangle,
} from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "project" | "renewal" | "followup";
  status: string;
  subtitle?: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsRes, renewalsRes, followUpsRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/renewals"),
          fetch("/api/follow-ups"),
        ]);

        const projectsData = await projectsRes.json();
        const renewalsData = await renewalsRes.json();
        const followUpsData = await followUpsRes.json();

        const allEvents: CalendarEvent[] = [];

        (projectsData || []).forEach((p: any) => {
          if (p.deadline) {
            allEvents.push({
              id: `p-${p.id}`,
              title: p.name,
              date: p.deadline,
              type: "project",
              status: p.status,
              subtitle: `${p.status} · ${p.progress || 0}%`,
            });
          }
        });

        (renewalsData || []).forEach((r: any) => {
          allEvents.push({
            id: `r-${r.id}`,
            title: r.asset_name,
            date: r.expiry_date,
            type: "renewal",
            status: r.status,
            subtitle: `${r.type} · $${r.cost || 0}`,
          });
        });

        (followUpsData || []).forEach((f: any) => {
          allEvents.push({
            id: `f-${f.id}`,
            title: f.clients?.name || "Follow-up",
            date: f.scheduled_date,
            type: "followup",
            status: f.status,
            subtitle: f.type?.replace("_", " ") || "",
          });
        });

        setEvents(allEvents);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOffset = new Date(year, month, 1).getDay();
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [events]);

  const selectedDayEvents = selectedDay ? eventsByDay[selectedDay] || [] : [];

  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return events
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 10);
  }, [events]);

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  }

  function goToToday() {
    setCurrentDate(new Date());
    const today = new Date().toISOString().split("T")[0];
    setSelectedDay(today);
  }

  const today = new Date().toISOString().split("T")[0];

  const typeColors: Record<string, string> = {
    project: "bg-blue-500",
    renewal: "bg-amber-500",
    followup: "bg-purple-500",
  };

  const typeBadgeColors: Record<string, string> = {
    project: "bg-blue-100 text-blue-700",
    renewal: "bg-amber-100 text-amber-700",
    followup: "bg-purple-100 text-purple-700",
  };

  const renewalStatusColors: Record<string, string> = {
    safe: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    critical: "bg-red-100 text-red-700",
    expired: "bg-gray-100 text-gray-600",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const blankDays = Array.from({ length: firstDayOffset }, (_, i) => i);
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="w-full flex flex-col min-h-full pr-2 pb-16">
      <header className="flex justify-between items-center py-4 px-2 mb-6">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-6 h-6 text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.6)]" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Calendar</h1>
          <span className="text-sm text-gray-500">{events.length} events</span>
        </div>
        <button
          onClick={goToToday}
          className="px-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.15)]"
        >
          Today
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 px-2 flex-1">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="glass-panel rounded-3xl p-6 border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">{monthName}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 pb-3">
                  {day}
                </div>
              ))}
              {blankDays.map((_, i) => (
                <div key={`blank-${i}`} className="aspect-square" />
              ))}
              {calendarDays.map((day) => {
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayEvents = eventsByDay[dateStr] || [];
                const isToday = dateStr === today;
                const isSelected = dateStr === selectedDay;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(dateStr)}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all relative ${
                      isSelected
                        ? "bg-white/15 ring-2 ring-white/40"
                        : isToday
                        ? "bg-white/5"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <span className={`text-sm font-medium ${isToday ? "text-white" : "text-gray-400"}`}>
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dayEvents.slice(0, 3).map((e, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${typeColors[e.type]}`} />
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-[9px] text-gray-500">+{dayEvents.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Projects
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Renewals
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                Follow-ups
              </div>
            </div>
          </div>

          {selectedDay && selectedDayEvents.length > 0 && (
            <div className="widget-shape-light p-6 shadow-xl">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {new Date(selectedDay + "T00:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <div className="space-y-3">
                {selectedDayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-2 h-8 rounded-full ${typeColors[event.type]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.subtitle}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      event.type === "renewal"
                        ? renewalStatusColors[event.status] || "bg-gray-100 text-gray-600"
                        : event.type === "project"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="glass-panel rounded-3xl p-6 border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-4">Upcoming</h3>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No upcoming events</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => {
                  const daysUntil = Math.ceil(
                    (new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const daysText = daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil}d`;
                  const isUrgent = event.type === "renewal" && (event.status === "critical" || event.status === "expired");

                  return (
                    <div
                      key={event.id}
                      className={`p-3 rounded-xl cursor-pointer hover:bg-white/5 transition-colors ${
                        isUrgent ? "border border-red-500/20 bg-red-500/5" : ""
                      }`}
                      onClick={() => setSelectedDay(event.date)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${typeColors[event.type]}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{event.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{event.subtitle}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-xs font-medium ${isUrgent ? "text-red-400" : daysUntil <= 3 ? "text-amber-400" : "text-gray-400"}`}>
                            {daysText}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10">
                  <FolderOpen className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400">Project Deadlines</p>
                  <p className="text-lg font-bold text-white">
                    {events.filter((e) => e.type === "project").length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10">
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400">Renewals Expiring</p>
                  <p className="text-lg font-bold text-white">
                    {events.filter((e) => e.type === "renewal").length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10">
                  <CalendarDays className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400">Follow-ups Scheduled</p>
                  <p className="text-lg font-bold text-white">
                    {events.filter((e) => e.type === "followup").length}
                  </p>
                </div>
              </div>
              {events.filter((e) => e.type === "renewal" && (e.status === "critical" || e.status === "expired")).length > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="p-2.5 rounded-xl bg-red-500/20">
                    <Flame className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-red-400 font-medium">Critical Renewals</p>
                    <p className="text-lg font-bold text-white">
                      {events.filter((e) => e.type === "renewal" && (e.status === "critical" || e.status === "expired")).length}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}