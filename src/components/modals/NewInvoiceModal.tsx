"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Plus, Trash2 } from "lucide-react";

interface NewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedClientId?: string;
}

export function NewInvoiceModal({ isOpen, onClose, onSuccess, preselectedClientId }: NewInvoiceModalProps) {
  const [clientId, setClientId] = useState(preselectedClientId || "");
  const [projectId, setProjectId] = useState("");
  const [status, setStatus] = useState("draft");
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [exchangeRate, setExchangeRate] = useState("83");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<{ description: string; quantity: number; rate: number; amount: number }[]>([
    { description: "", quantity: 1, rate: 0, amount: 0 },
  ]);
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showBalanceSection, setShowBalanceSection] = useState(false);
  const [clientBalance, setClientBalance] = useState(0);
  const [redeemedAmount, setRedeemedAmount] = useState(0);
  const [discount, setDiscount] = useState(0);

  const currencySymbol = currency === "INR" ? "₹" : "$";

  useEffect(() => {
    if (isOpen) {
      fetch("/api/clients").then((r) => r.json()).then((d) => setClients(Array.isArray(d) ? d : [])).catch(() => {});
      fetch("/api/projects").then((r) => r.json()).then((d) => setProjects(Array.isArray(d) ? d : [])).catch(() => {});
      fetch("/api/settings").then((r) => r.json()).then((d) => {
        if (!d.error && d.default_exchange_rate) setExchangeRate(String(d.default_exchange_rate));
      }).catch(() => {});
      if (preselectedClientId) setClientId(preselectedClientId);
    } else {
      setClientBalance(0);
      setRedeemedAmount(0);
      setDiscount(0);
      setShowBalanceSection(false);
    }
  }, [isOpen, preselectedClientId]);

  useEffect(() => {
    setLineItems((items) =>
      items.map((item) => ({
        ...item,
        amount: Number((item.quantity * item.rate).toFixed(2)),
      }))
    );
  }, [lineItems.map((i) => i.quantity).join(","), lineItems.map((i) => i.rate).join(",")]);

  useEffect(() => {
    if (!clientId) {
      setClientBalance(0);
      setRedeemedAmount(0);
      setDiscount(0);
      setShowBalanceSection(false);
      return;
    }
    fetch(`/api/transactions?client_id=${clientId}`)
      .then((r) => r.json())
      .then((txns) => {
        if (!Array.isArray(txns)) return;
        const invoiced = txns.filter((t: any) => t.type === "invoice").reduce((s: number, t: any) => s + Number(t.amount), 0);
        const paid = txns.filter((t: any) => t.type === "payment").reduce((s: number, t: any) => s + Number(t.amount), 0);
        const balance = invoiced - paid;
        setClientBalance(balance);
        if (balance > 0) {
          setRedeemedAmount(balance);
          setShowBalanceSection(true);
        }
      })
      .catch(() => {});
  }, [clientId]);

  const total = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const netTotal = total - redeemedAmount - discount;

  function updateLineItem(index: number, field: string, value: any) {
    setLineItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        updated.amount = Number((Number(updated.quantity) * Number(updated.rate)).toFixed(2));
        return updated;
      })
    );
  }

  function addLineItem() {
    setLineItems((prev) => [...prev, { description: "", quantity: 1, rate: 0, amount: 0 }]);
  }

  function removeLineItem(index: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId) { setError("Please select a client"); return; }
    if (lineItems.every((item) => !item.description.trim())) { setError("Add at least one line item"); return; }

    setLoading(true);
    setError("");

    try {
      const body: any = {
        client_id: clientId,
        status,
        amount: Number(total.toFixed(2)),
        line_items: lineItems.filter((item) => item.description.trim()),
        notes: notes || null,
        currency,
        discount: showBalanceSection ? discount : 0,
        redeemed_amount: showBalanceSection ? redeemedAmount : 0,
      };
      if (currency === "USD") body.exchange_rate = parseFloat(exchangeRate) || 83;
      if (projectId) body.project_id = projectId;
      if (dueDate) body.due_date = dueDate;

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create invoice");

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Invoice" maxWidth="max-w-2xl">
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Client *</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors appearance-none"
              >
                <option value="" className="bg-[#222226]">Select client</option>
                {clients.map((c: any) => (
                  <option key={c.id} value={c.id} className="bg-[#222226]">{c.company || c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors appearance-none"
              >
                <option value="" className="bg-[#222226]">No project</option>
                {projects.filter((p: any) => !clientId || p.client_id === clientId).map((p: any) => (
                  <option key={p.id} value={p.id} className="bg-[#222226]">{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrency("INR")}
                  className={`flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    currency === "INR"
                      ? "bg-white text-gray-900 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                      : "bg-[#222226] text-gray-400 border border-white/10 hover:text-white hover:border-white/20"
                  }`}
                >
                  ₹ INR
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  className={`flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    currency === "USD"
                      ? "bg-white text-gray-900 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                      : "bg-[#222226] text-gray-400 border border-white/10 hover:text-white hover:border-white/20"
                  }`}
                >
                  $ USD
                </button>
              </div>
              {currency === "USD" && (
                <div className="mt-2">
                  <label className="block text-xs text-gray-400 mb-1">Exchange Rate (1 USD → INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#222226] border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
                    placeholder="83"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <div className="flex flex-wrap gap-2">
                {["draft", "sent", "paid", "overdue"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      status === s
                        ? "bg-white text-gray-900 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                        : "bg-[#222226] text-gray-400 border border-white/10 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors resize-none"
                placeholder="Payment terms, notes..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Line Items
              </label>
              <div className="space-y-2">
                {lineItems.map((item, i) => (
                  <div key={i} className="bg-[#1a1a1e] rounded-xl p-3 border border-white/5">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateLineItem(i, "description", e.target.value)}
                      className="w-full px-3 py-2 bg-[#222226] border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 mb-2"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Qty"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(i, "quantity", Number(e.target.value))}
                        className="w-20 px-3 py-2 bg-[#222226] border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20"
                      />
                      <input
                        type="number"
                        placeholder="Rate"
                        min="0"
                        step="0.01"
                        value={item.rate || ""}
                        onChange={(e) => updateLineItem(i, "rate", Number(e.target.value))}
                        className="w-28 px-3 py-2 bg-[#222226] border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20"
                      />
                      <span className="px-3 py-2 text-sm text-gray-400">
                        {currencySymbol}{item.amount.toFixed(2)}
                      </span>
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(i)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addLineItem}
                  className="w-full py-2 border-2 border-dashed border-white/10 rounded-xl text-sm text-gray-500 hover:text-white hover:border-white/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Line Item
                </button>
              </div>
            </div>

            <div className="bg-[#1a1a1e] rounded-xl p-4 border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-gray-300">{currencySymbol}{total.toFixed(2)}</span>
              </div>
              {showBalanceSection && (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Redeemed</span>
                    <span className="text-green-400">-{currencySymbol}{redeemedAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Discount</span>
                    <span className="text-green-400">-{currencySymbol}{discount.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="border-t border-white/5 pt-2 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-200">Total ({currency})</span>
                <span className="text-xl font-bold text-white">{currencySymbol}{Math.max(netTotal, 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-[#1a1a1e] rounded-xl border border-white/5 overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    if (showBalanceSection) {
                      setRedeemedAmount(0);
                      setDiscount(0);
                    } else if (clientBalance > 0) {
                      setRedeemedAmount(clientBalance);
                    }
                    setShowBalanceSection(!showBalanceSection);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  <span>Apply balance / discount</span>
                  <span className={`text-xs transition-transform ${showBalanceSection ? "rotate-180" : ""}`}>▼</span>
                </button>
                {showBalanceSection && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Previous balance</span>
                      <span className="text-gray-200">{currencySymbol}{clientBalance.toFixed(2)}</span>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Amount to redeem</label>
                      <input
                        type="number"
                        min="0"
                        max={Math.max(clientBalance, 0)}
                        step="0.01"
                        value={redeemedAmount}
                        onChange={(e) => setRedeemedAmount(Math.min(Number(e.target.value), Math.max(clientBalance, 0)))}
                        className="w-full px-3 py-2 bg-[#222226] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Discount</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={discount}
                        onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3 py-2 bg-[#222226] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !clientId}
            className="px-5 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform disabled:opacity-50 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
          >
            {loading ? "Creating..." : "Create Invoice"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
