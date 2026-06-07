"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ChevronRight,
  Flame,
  Sparkles,
  FolderOpen,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    activeProjects: 0,
    completedProjects: 0,
    activeClients: 0,
    totalClients: 0,
    criticalRenewals: 0,
    totalBudget: 0,
    totalSpent: 0,
    pendingFollowUps: 0,
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [renewals, setRenewals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsRes, clientsRes, renewalsRes, followUpsRes, tasksRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/clients"),
          fetch("/api/renewals"),
          fetch("/api/follow-ups"),
          fetch("/api/tasks"),
        ]);

        const projectsData = await projectsRes.json();
        const clientsData = await clientsRes.json();
        const renewalsData = await renewalsRes.json();
        const followUpsData = await followUpsRes.json();
        const tasksData = await tasksRes.json();

        setProjects(projectsData || []);
        setTasks(tasksData || []);
        setRenewals(renewalsData || []);

        setStats({
          activeProjects: (projectsData || []).filter((p: any) => p.status !== "delivered" && p.status !== "completed").length,
          completedProjects: (projectsData || []).filter((p: any) => p.status === "delivered" || p.status === "completed").length,
          activeClients: (clientsData || []).filter((c: any) => c.status === "active").length,
          totalClients: (clientsData || []).length,
          criticalRenewals: (renewalsData || []).filter((r: any) => r.status === "critical" || r.status === "expired").length,
          totalBudget: (projectsData || []).reduce((acc: number, p: any) => acc + (p.budget || 0), 0),
          totalSpent: (projectsData || []).reduce((acc: number, p: any) => acc + (p.spent || 0), 0),
          pendingFollowUps: (followUpsData || []).filter((f: any) => f.status === "pending").length,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const weeklyTaskActivity = (() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const now = new Date();

    const openedMap: Record<string, number> = {};
    const fulfilledMap: Record<string, number> = {};
    days.forEach((d) => { openedMap[d] = 0; fulfilledMap[d] = 0; });

    (tasks || []).forEach((task: any) => {
      if (task.created_at) {
        const d = new Date(task.created_at);
        const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        if (diff < 7) {
          const dayName = days[d.getDay() === 0 ? 6 : d.getDay() - 1];
          openedMap[dayName] = (openedMap[dayName] || 0) + 1;
        }
      }
      if (task.status === "done" && task.updated_at) {
        const d = new Date(task.updated_at);
        const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        if (diff < 7) {
          const dayName = days[d.getDay() === 0 ? 6 : d.getDay() - 1];
          fulfilledMap[dayName] = (fulfilledMap[dayName] || 0) + 1;
        }
      }
    });

    return days.map((day) => ({
      day,
      opened: openedMap[day],
      fulfilled: fulfilledMap[day],
    }));
  })();

  const totalOpened = weeklyTaskActivity.reduce((acc, d) => acc + d.opened, 0);
  const totalFulfilled = weeklyTaskActivity.reduce((acc, d) => acc + d.fulfilled, 0);

  const recentProjects = (projects || [])
    .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 5);

  const budgetTrend = (() => {
    const allProjects = projects || [];
    const statuses = ["lead", "quoted", "active", "in-progress", "review", "delivered"];
    return statuses.map((status) => ({
      name: status === "in-progress" ? "In Prog." : status.charAt(0).toUpperCase() + status.slice(1),
      budget: allProjects.filter((p: any) => p.status === status).reduce((acc: number, p: any) => acc + (p.budget || 0), 0),
      count: allProjects.filter((p: any) => p.status === status).length,
    })).filter((d) => d.count > 0);
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-2 pb-4">
      <header className="flex justify-between items-center py-4 px-2 mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <Image src="/logo-wide.png" alt="AgencyDash" width={160} height={44} className="shrink-0" />
        </div>
        <div className="flex items-center gap-4">
          <div className="glass-panel px-4 py-2.5 rounded-full flex items-center gap-2 text-gray-300 border border-white/5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium">{stats.activeProjects} active</span>
          </div>
          {stats.criticalRenewals > 0 && (
            <div className="glass-panel px-4 py-2.5 rounded-full flex items-center gap-2 text-red-400 border border-red-500/20 bg-red-500/5">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">{stats.criticalRenewals} critical</span>
            </div>
          )}
          <NotificationBell />
          <ProfileMenu />
        </div>
      </header>

      <section className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 px-2 gap-6 shrink-0">
        <div className="flex-1">
          <h2 className="text-4xl font-semibold mb-3 tracking-tight text-white">
            Welcome back, Admin
          </h2>
          <p className="text-gray-400 text-lg">
            {stats.pendingFollowUps > 0
              ? `You have ${stats.pendingFollowUps} follow-up${stats.pendingFollowUps > 1 ? "s" : ""} pending.`
              : "All caught up — no pending follow-ups."}
          </p>
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2">
          <div className="glass-panel min-w-[180px] h-[72px] rounded-2xl flex items-center justify-between px-5 border border-white/5 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Projects</span>
                <FolderOpen className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-xs text-gray-400 mt-1">{stats.activeProjects} active</p>
            </div>
          </div>
          <div className="glass-panel min-w-[180px] h-[72px] rounded-2xl flex items-center justify-between px-5 border border-white/5 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Clients</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-gray-400 mt-1">{stats.activeClients} active</p>
            </div>
          </div>
          <div className="glass-panel min-w-[180px] h-[72px] rounded-2xl flex items-center justify-between px-5 border border-white/5 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Budget</span>
                <DollarSign className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-xs text-gray-400 mt-1">₹{(stats.totalBudget / 1000).toFixed(1)}k total</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2 mb-6 shrink-0">
        <div className="glass-panel rounded-2xl p-5 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10">
              <FolderOpen className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Active Projects</p>
              <p className="text-xl font-bold text-white">{stats.activeProjects}</p>
            </div>
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-5 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Completed</p>
              <p className="text-xl font-bold text-white">{stats.completedProjects}</p>
            </div>
          </div>
        </div>
<div className="glass-panel rounded-2xl p-5 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Clients</p>
                <p className="text-xl font-bold text-white">{stats.totalClients}</p>
              </div>
            </div>
          </div>
        <div className="glass-panel rounded-2xl p-5 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Renewals</p>
              <p className="text-xl font-bold text-white">{renewals.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 px-2 pb-6 flex-1">
        <div className="bg-[#222226] rounded-3xl p-8 relative flex flex-col shadow-lg overflow-hidden border border-white/5">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-medium text-white">Task Activity</h3>
              <span className="text-xs text-gray-500">This week</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-400 inline-block" /> Opened {totalOpened}</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" /> Fulfilled {totalFulfilled}</span>
            </div>
          </div>
          <div className="flex-1 relative z-10 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTaskActivity} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1a1a1e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
                  labelStyle={{ color: "#9ca3af" }}
                />
                <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: "11px", color: "#9ca3af" }} />
                <Bar dataKey="opened" name="Opened" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="fulfilled" name="Fulfilled" fill="#34d399" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="widget-shape-light p-8 flex flex-col shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-medium text-gray-900">Recent Projects</h3>
              <div className="h-4 w-px bg-gray-300" />
              <span className="text-sm text-gray-500">{projects.length} total</span>
            </div>
            <a href="/projects" className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-1">
              See all <ChevronRight className="w-3 h-3" />
            </a>
          </div>
          <div className="flex-1 overflow-x-auto">
            {recentProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FolderOpen className="w-12 h-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-500">No projects yet</p>
                <p className="text-sm text-gray-400 mt-1">Create your first project to get started.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-100">
                    <th className="pb-4 font-normal">Project</th>
                    <th className="pb-4 font-normal">Status</th>
                    <th className="pb-4 font-normal">Progress</th>
                    <th className="pb-4 font-normal">Budget</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {recentProjects.map((project: any) => {
                    const statusBadge: Record<string, string> = {
                      lead: "bg-gray-100 text-gray-700",
                      quoted: "bg-blue-100 text-blue-700",
                      active: "bg-green-100 text-green-700",
                      "in-progress": "bg-amber-100 text-amber-700",
                      review: "bg-purple-100 text-purple-700",
                      delivered: "bg-emerald-100 text-emerald-700",
                      maintenance: "bg-cyan-100 text-cyan-700",
                    };
                    return (
                      <tr key={project.id} className="border-b border-gray-100 border-dashed last:border-0">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                              {project.name?.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-900">{project.name}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[project.status] || "bg-gray-100 text-gray-600"}`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${project.progress || 0}%` }} />
                            </div>
                            <span className="text-xs text-gray-500">{project.progress || 0}%</span>
                          </div>
                        </td>
                        <td className="py-4 font-medium text-gray-900">₹{(project.budget || 0).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-2 pb-8">
        <div className="rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between shadow-lg h-[280px]" style={{ background: "linear-gradient(135deg, #BBF7D0 0%, #6EE7B7 100%)" }}>
          <div className="absolute bottom-0 right-0 w-full h-[60%] opacity-40 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(16,185,129,0.3), transparent)", clipPath: "polygon(0 40%, 100% 0, 100% 100%, 0% 100%)" }} />
          <div className="relative z-10 flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-medium text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> Budget by Status
              </h3>
              <p className="text-gray-800/80 text-sm mt-2">₹{(stats.totalBudget / 1000).toFixed(1)}k total value</p>
            </div>
          </div>
          <div className="relative z-10 flex-1 flex flex-col justify-center gap-3">
            {budgetTrend.length > 0 ? budgetTrend.slice(0, 4).map((item) => {
              const maxBudget = Math.max(...budgetTrend.map((b) => b.budget), 1);
              return (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-20 text-sm font-medium text-gray-900 truncate">{item.name}</div>
                  <div className="flex-1 h-3 bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gray-900" style={{ width: `${(item.budget / maxBudget) * 100}%` }} />
                  </div>
                  <div className="w-16 text-right text-sm font-bold text-gray-900">₹{(item.budget / 1000).toFixed(0)}k</div>
                </div>
              );
            }) : (
              <p className="text-sm text-gray-700/70">No budget data yet</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between shadow-lg h-[280px]" style={{ background: "linear-gradient(135deg, #C4B5FD 0%, #A78BFA 100%)" }}>
          <div className="absolute bottom-0 right-0 w-full h-[60%] opacity-40 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(120,80,200,0.3), transparent)", clipPath: "polygon(0 40%, 100% 0, 100% 100%, 0% 100%)" }} />
          <div className="relative z-10 flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-medium text-gray-900 flex items-center gap-2">
                <Flame className="w-5 h-5" /> Project Pipeline
              </h3>
              <p className="text-gray-800/80 text-sm mt-2">{projects.length} total projects</p>
            </div>
          </div>
          <div className="relative z-10 flex-1 flex flex-col justify-center gap-3">
            {(() => {
              const pipelineStats = [
                { label: "Lead", count: projects.filter((p: any) => p.status === "lead").length, color: "bg-gray-900/70" },
                { label: "Quoted", count: projects.filter((p: any) => p.status === "quoted").length, color: "bg-gray-900/70" },
                { label: "Active", count: projects.filter((p: any) => p.status === "active" || p.status === "in-progress").length, color: "bg-gray-900" },
                { label: "Review", count: projects.filter((p: any) => p.status === "review").length, color: "bg-gray-900/70" },
                { label: "Delivered", count: projects.filter((p: any) => p.status === "delivered" || p.status === "maintenance").length, color: "bg-gray-900/50" },
              ];
              const maxCount = Math.max(...pipelineStats.map((s) => s.count), 1);
              return pipelineStats.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-20 text-sm font-medium text-gray-900">{item.label}</div>
                  <div className="flex-1 h-3 bg-white/30 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${(item.count / maxCount) * 100}%`, minWidth: item.count > 0 ? '8px' : '0' }} />
                  </div>
                  <div className="w-8 text-right text-sm font-bold text-gray-900">{item.count}</div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}