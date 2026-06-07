"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, AlertCircle, Search, FileText, Eye } from "lucide-react";

export default function PortalInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/portal/invoices")
      .then((res) => res.json())
      .then((data) => {
        setInvoices(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    sent: "bg-blue-100 text-blue-700",
    paid: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-red-700",
  };

  const totalOutstanding = invoices
    .filter((inv) => inv.status !== "paid")
    .reduce((acc, inv) => acc + Number(inv.amount || 0), 0);

  const filtered = invoices.filter((inv) =>
    (inv.invoice_number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (inv.projects?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
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
          <FileText className="w-6 h-6 text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.6)]" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Invoices</h1>
          <span className="text-sm text-gray-500">{invoices.length} total</span>
        </div>
      </header>

      <div className="flex gap-4 px-2 mb-6">
        <div className="glass-panel px-5 py-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Outstanding</p>
              <p className="text-xl font-bold text-white">₹{totalOutstanding.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="glass-panel px-5 py-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-500/10">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Paid</p>
              <p className="text-xl font-bold text-white">{invoices.filter((i) => i.status === "paid").length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="widget-shape-light p-8 flex flex-col shadow-xl mx-2">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium text-gray-900">Invoices</h3>
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

        {(searchQuery ? filtered : invoices).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FileText className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">No invoices yet</p>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-4 font-normal">Invoice</th>
                  <th className="pb-4 font-normal">Project</th>
                  <th className="pb-4 font-normal">Issued</th>
                  <th className="pb-4 font-normal">Due Date</th>
                  <th className="pb-4 font-normal">Amount</th>
                  <th className="pb-4 font-normal">Status</th>
                  <th className="pb-4 font-normal"></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {(searchQuery ? filtered : invoices).map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-100 border-dashed last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="py-5 font-medium text-gray-900">{invoice.invoice_number}</td>
                    <td className="py-5 text-gray-600">{invoice.projects?.name || "—"}</td>
                    <td className="py-5 text-gray-600">{invoice.issued_date ? new Date(invoice.issued_date).toLocaleDateString() : "—"}</td>
                    <td className="py-5 text-gray-600">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "—"}</td>
                    <td className="py-5 font-medium text-gray-900">₹{Number(invoice.amount || 0).toLocaleString()}</td>
                    <td className="py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[invoice.status] || statusColors.draft}`}>
                        {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
                      </span>
                    </td>
                    <td className="py-5">
                      <a
                        href={`/invoices/${invoice.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors inline-flex"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}