"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { NewInvoiceModal } from "@/components/modals/NewInvoiceModal";
import { EditInvoiceModal } from "@/components/modals/EditInvoiceModal";
import { Mail, Phone, Building2, MapPin, FileText, ExternalLink, Plus, Pencil, Trash2 } from "lucide-react";

interface ViewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
}

export function ViewClientModal({ isOpen, onClose, client }: ViewClientModalProps) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [editInvoice, setEditInvoice] = useState<any | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isOpen || !client) return;

    Promise.all([
      fetch("/api/invoices").then((r) => r.json()),
      fetch("/api/transactions").then((r) => r.json()),
    ])
      .then(([invoicesData, txnsData]) => {
        const allInvoices = Array.isArray(invoicesData) ? invoicesData : [];
        setInvoices(allInvoices.filter((inv: any) => inv.client_id === client.id));

        const allTxns = Array.isArray(txnsData) ? txnsData : [];
        setTransactions(allTxns.filter((t: any) => t.client_id === client.id));
      })
      .catch(() => {});
  }, [isOpen, client, refreshKey]);

  if (!client) return null;

  const invoiced = transactions
    .filter((t: any) => t.type === "invoice")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  const paid = transactions
    .filter((t: any) => t.type === "payment")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  const balance = invoiced - paid;

  const statusColors: Record<string, string> = {
    draft: "text-gray-400",
    sent: "text-blue-600",
    paid: "text-green-600",
    overdue: "text-red-600",
  };

  const statusBgColors: Record<string, string> = {
    draft: "bg-gray-100",
    sent: "bg-blue-100",
    paid: "bg-green-100",
    overdue: "bg-red-100",
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={client.name} maxWidth="max-w-2xl">
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-lg font-bold shrink-0">
                {client.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <div>
                <p className="text-sm text-gray-200">{client.email}</p>
                {client.phone && <p className="text-sm text-gray-400">{client.phone}</p>}
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              client.status === "active"
                ? "bg-green-500/10 text-green-400"
                : client.status === "lead"
                ? "bg-blue-500/10 text-blue-400"
                : "bg-gray-500/10 text-gray-400"
            }`}>
              {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#222226] rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <Building2 className="w-3.5 h-3.5" /> Company
              </div>
              <p className="text-sm text-white">{client.company || "—"}</p>
            </div>
            <div className="bg-[#222226] rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <FileText className="w-3.5 h-3.5" /> Projects
              </div>
              <p className="text-sm text-white">{client.projects_count || 0}</p>
            </div>
            <div className="bg-[#222226] rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <MapPin className="w-3.5 h-3.5" /> Address
              </div>
              <p className="text-sm text-white whitespace-pre-line">{client.address || "—"}</p>
            </div>
            <a
              href={`/payments`}
              className="bg-[#222226] rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors block"
            >
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <Mail className="w-3.5 h-3.5" /> Outstanding
              </div>
              <p className={`text-sm font-medium ${balance > 0 ? "text-red-400" : "text-gray-400"}`}>
                ₹{balance.toFixed(2)}
                <ExternalLink className="w-3 h-3 inline ml-1 opacity-50" />
              </p>
            </a>
          </div>

          {client.notes && (
            <div className="bg-[#222226] rounded-xl p-4 border border-white/5">
              <p className="text-xs text-gray-400 mb-1">Notes</p>
              <p className="text-sm text-white whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}

          <div className="border-t border-white/5 pt-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-white">Recent Invoices</h4>
              <button
                onClick={() => setShowNewInvoice(true)}
                className="flex items-center gap-1.5 text-sm text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> New Invoice
              </button>
            </div>
            {invoices.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">No invoices yet</p>
            ) : (
              <div className="space-y-2">
                {invoices.slice(0, 10).map((inv: any) => (
                  <div
                    key={inv.id}
                    className="flex items-center gap-2 p-3 rounded-xl bg-[#222226] border border-white/5 hover:border-white/10 transition-colors group"
                  >
                    <a
                      href={`/invoices/${inv.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-0 flex items-center gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{inv.invoice_number}</p>
                        <p className="text-xs text-gray-500">{inv.projects?.name || "No project"}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium text-white">{inv.currency === "USD" ? "$" : "₹"}{Number(inv.amount || 0).toFixed(2)}</p>
                        <p className={`text-xs ${statusColors[inv.status] || "text-gray-500"}`}>
                          {inv.status?.charAt(0).toUpperCase() + inv.status?.slice(1)}
                        </p>
                      </div>
                    </a>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setEditInvoice(inv); }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                        title="Edit invoice"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!confirm(`Delete invoice ${inv.invoice_number}?`)) return;
                          await fetch(`/api/invoices?id=${inv.id}`, { method: "DELETE" });
                          setRefreshKey((k) => k + 1);
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                        title="Delete invoice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <NewInvoiceModal
        isOpen={showNewInvoice}
        onClose={() => setShowNewInvoice(false)}
        onSuccess={() => {
          setShowNewInvoice(false);
          setRefreshKey((k) => k + 1);
        }}
        preselectedClientId={client?.id}
      />

      <EditInvoiceModal
        isOpen={!!editInvoice}
        onClose={() => setEditInvoice(null)}
        onSuccess={() => {
          setEditInvoice(null);
          setRefreshKey((k) => k + 1);
        }}
        invoice={editInvoice}
      />
    </>
  );
}
