"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/invoices")
      .then((r) => r.json())
      .then((data) => {
        const found = (Array.isArray(data) ? data : []).find((inv: any) => inv.id === invoiceId);
        setInvoice(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#111111]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#111111]">
        <p className="text-gray-400 text-lg">Invoice not found</p>
      </div>
    );
  }

  const lineItems = Array.isArray(invoice.line_items) ? invoice.line_items : [];
  const total = lineItems.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    sent: "bg-blue-100 text-blue-700",
    paid: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-[#111111]">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <a href="/clients" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </a>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.15)]"
          >
            <Printer className="w-4 h-4" /> Print Invoice
          </button>
        </div>

        <div className="bg-white rounded-2xl p-10 shadow-xl print:shadow-none print:rounded-none">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{invoice.invoice_number}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Issued: {invoice.issued_date ? new Date(invoice.issued_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A"}
              </p>
              {invoice.due_date && (
                <p className="text-sm text-gray-500">
                  Due: {new Date(invoice.due_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[invoice.status] || statusColors.draft}`}>
              {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Bill From</p>
              <p className="text-sm font-medium text-gray-900">AgencyDash</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Bill To</p>
              <p className="text-sm font-medium text-gray-900">{invoice.clients?.name || "—"}</p>
              {invoice.clients?.company && (
                <p className="text-sm text-gray-600">{invoice.clients.company}</p>
              )}
              {invoice.clients?.email && (
                <p className="text-sm text-gray-600">{invoice.clients.email}</p>
              )}
            </div>
          </div>

          {invoice.projects?.name && (
            <div className="mb-8 p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Project</p>
              <p className="text-sm font-medium text-gray-900">{invoice.projects.name}</p>
            </div>
          )}

          <table className="w-full text-left border-collapse mb-8">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Qty</th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Rate</th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item: any, i: number) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-4 text-sm text-gray-900">{item.description || "—"}</td>
                  <td className="py-4 text-sm text-gray-600 text-right">{item.quantity}</td>
                  <td className="py-4 text-sm text-gray-600 text-right">${Number(item.rate).toFixed(2)}</td>
                  <td className="py-4 text-sm font-medium text-gray-900 text-right">${Number(item.amount).toFixed(2)}</td>
                </tr>
              ))}
              {lineItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-gray-400">No line items</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-sm text-gray-900">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-gray-900">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-base font-bold text-gray-900">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Notes</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}