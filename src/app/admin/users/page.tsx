"use client";

import { useEffect, useState } from "react";
import { Shield, Users, Mail, Calendar, Search, UserPlus } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data || []);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateRole(userId: string, newRole: string) {
    setUpdating(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (error) {
      console.error("Failed to update role", error);
    } finally {
      setUpdating(null);
    }
  }

  const roleColors: Record<string, string> = {
    admin: "bg-purple-100 text-purple-700",
    developer: "bg-blue-100 text-blue-700",
    client: "bg-gray-100 text-gray-600",
  };

  const filtered = users.filter((u) =>
    (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  const displayUsers = searchQuery ? filtered : users;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const developerCount = users.filter((u) => u.role === "developer").length;
  const clientCount = users.filter((u) => u.role === "client").length;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-2 pb-6">
      <header className="flex justify-between items-center py-4 px-2 mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-purple-300 drop-shadow-[0_0_8px_rgba(196,181,253,0.6)]" />
          <h1 className="text-2xl font-bold tracking-tight text-white">User Management</h1>
          <span className="flex items-center gap-1 px-2.5 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs font-medium">
            Admin
          </span>
        </div>
      </header>

      <div className="flex gap-4 px-2 mb-6">
        <div className="glass-panel px-5 py-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Users</p>
              <p className="text-xl font-bold text-white">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="glass-panel px-5 py-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Admins</p>
              <p className="text-xl font-bold text-white">{adminCount}</p>
            </div>
          </div>
        </div>
        <div className="glass-panel px-5 py-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Developers</p>
              <p className="text-xl font-bold text-white">{developerCount}</p>
            </div>
          </div>
        </div>
        <div className="glass-panel px-5 py-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10">
              <UserPlus className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Clients</p>
              <p className="text-xl font-bold text-white">{clientCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="widget-shape-light p-8 flex flex-col shadow-xl mx-2">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium text-gray-900">Users</h3>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-56"
            />
          </div>
        </div>

        {displayUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Users className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[560px] scrollbar-light overscroll-x-contain">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="sticky top-0 bg-white z-10 shadow-xs">
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-4 pt-1 font-normal bg-white">User</th>
                  <th className="pb-4 pt-1 font-normal bg-white">Email</th>
                  <th className="pb-4 pt-1 font-normal bg-white">Role</th>
                  <th className="pb-4 pt-1 font-normal bg-white">Joined</th>
                  <th className="pb-4 pt-1 font-normal bg-white">Change Role</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {displayUsers.map((user) => {
                  const colorClass = roleColors[user.role] || roleColors.client;
                  return (
                    <tr key={user.id} className="border-b border-gray-100 border-dashed last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                            {(user.email?.substring(0, 2) || "U").toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{user.full_name || "Unnamed User"}</span>
                        </div>
                      </td>
                      <td className="py-5">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="py-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                          {user.role === "admin" ? "Super Admin" : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="py-5">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-5">
                        <select
                          value={user.role}
                          onChange={(e) => updateRole(user.id, e.target.value)}
                          disabled={updating === user.id}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                        >
                          <option value="client">Client</option>
                          <option value="developer">Developer</option>
                          <option value="admin">Super Admin</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}