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
    <div className="w-full flex flex-col min-h-full pr-2 pb-16">
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

      <div className="bg-[#1a1a1e] rounded-2xl border border-white/5 mx-2 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-white">Users Directory</h3>
            <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
              {displayUsers.length} users
            </span>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#222226] border border-white/10 rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 w-56"
            />
          </div>
        </div>

        {displayUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Users className="w-10 h-10 mb-3 text-gray-500" />
            <p className="text-base font-semibold text-white">No users found</p>
          </div>
        ) : (
          <div className="w-full">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="border-b border-white/5 text-[11px] text-gray-400 uppercase tracking-wider bg-white/[0.02]">
                  <th className="py-2.5 px-3 sm:px-4 font-semibold">User</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold">Email</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold text-center">Role</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold">Joined</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {displayUsers.map((user) => {
                  return (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3 sm:px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
                            {(user.email?.substring(0, 2) || "U").toUpperCase()}
                          </div>
                          <span className="font-semibold text-white truncate max-w-[160px]">{user.full_name || "Unnamed User"}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 sm:px-4">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Mail className="w-3 h-3 text-gray-500 shrink-0" />
                          <span className="truncate max-w-[180px]">{user.email}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          user.role === "admin"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            : user.role === "developer"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}>
                          {user.role === "admin" ? "Super Admin" : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-400 whitespace-nowrap">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-right whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => updateRole(user.id, e.target.value)}
                          disabled={updating === user.id}
                          className="px-2.5 py-1 bg-[#222226] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-white/20 disabled:opacity-50"
                        >
                          <option value="client" className="bg-[#222226]">Client</option>
                          <option value="developer" className="bg-[#222226]">Developer</option>
                          <option value="admin" className="bg-[#222226]">Super Admin</option>
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