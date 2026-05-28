"use client";

import { useEffect, useState } from "react";
import { Globe, AlertTriangle, CheckCircle2, Clock, Search } from "lucide-react";

export default function PortalRenewalsPage() {
  const [renewals, setRenewals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/portal/renewals")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRenewals(data);
        } else {
          setRenewals([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const statusColors: Record<string, string> = {
    safe: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    critical: "bg-red-100 text-red-700",
    expired: "bg-gray-100 text-gray-600",
  };

  function getDaysUntil(date: string) {
    if (!date) return 0;
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  const filtered = renewals.filter((r) =>
    r.asset_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.provider || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-2 pb-4">
      <header className="flex justify-between items-center py-4 px-2 mb-6">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.6)]" />
          <h1 className="text-2xl font-bold tracking-tight text-white">My Renewals</h1>
          <span className="text-sm text-gray-500">{renewals.length} assets</span>
        </div>
      </header>

      <div className="widget-shape-light p-8 flex flex-col shadow-xl mx-2">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium text-gray-900">Renewals</h3>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-56"
            />
          </div>
        </div>

        {(searchQuery ? filtered : renewals).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Globe className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">No renewals to display</p>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-4 font-normal">Asset</th>
                  <th className="pb-4 font-normal">Type</th>
                  <th className="pb-4 font-normal">Provider</th>
                  <th className="pb-4 font-normal">Expiry</th>
                  <th className="pb-4 font-normal">Days Left</th>
                  <th className="pb-4 font-normal">Cost</th>
                  <th className="pb-4 font-normal">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {(searchQuery ? filtered : renewals).map((renewal) => {
                  const daysLeft = getDaysUntil(renewal.expiry_date);
                  return (
                    <tr key={renewal.id} className="border-b border-gray-100 border-dashed last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                            {renewal.asset_name?.charAt(0).toUpperCase()}
                          </div>
                          <p className="font-medium text-gray-900">{renewal.asset_name}</p>
                        </div>
                      </td>
                      <td className="py-5 text-gray-600 capitalize">{renewal.type}</td>
                      <td className="py-5 text-gray-600">{renewal.provider || "—"}</td>
                      <td className="py-5 text-gray-600">{renewal.expiry_date ? new Date(renewal.expiry_date).toLocaleDateString() : "—"}</td>
                      <td className="py-5">
                        <span className={`text-xs font-medium ${daysLeft < 0 ? "text-red-500" : daysLeft < 30 ? "text-red-500" : daysLeft < 90 ? "text-amber-500" : "text-emerald-500"}`}>
                          {daysLeft < 0 ? "Expired" : daysLeft === 0 ? "Today" : `${daysLeft}d`}
                        </span>
                      </td>
                      <td className="py-5 font-medium text-gray-900">${renewal.cost || 0}</td>
                      <td className="py-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[renewal.status] || "bg-gray-100 text-gray-600"}`}>
                          {renewal.status.charAt(0).toUpperCase() + renewal.status.slice(1)}
                        </span>
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