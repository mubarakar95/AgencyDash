"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, Plus, Search, Download, ChevronRight, TrendingUp, Wallet, ArrowUpRight } from "lucide-react";

interface Transaction {
  id: string;
  client_id: string;
  type: "payment" | "invoice";
  amount: number;
  description: string | null;
  payment_method: string | null;
  reference_id: string | null;
  date: string;
  clients: { name: string; company: string | null } | null;
}

interface ClientBalance {
  client_id: string;
  client_name: string;
  invoiced: number;
  paid: number;
  balance: number;
}

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientFilter, setClientFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  function fetchData() {
    Promise.all([
      fetch("/api/transactions").then((r) => r.json()),
      fetch("/api/clients").then((r) => r.json()),
    ])
      .then(([txns, clts]) => {
        setTransactions(Array.isArray(txns) ? txns : []);
        setClients(Array.isArray(clts) ? clts : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchData();
  }, []);

  const [typeFilter, setTypeFilter] = useState<"all" | "payment" | "invoice">("all");

  const filtered = transactions.filter((t) => {
    if (clientFilter && t.client_id !== clientFilter) return false;
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    return true;
  });

  const totalCollected = transactions
    .filter((t) => t.type === "payment")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Compute per-client balances
  const clientBalances = clients.map((c) => {
    const clientTxns = transactions.filter((t) => t.client_id === c.id);
    const invoiced = clientTxns
      .filter((t) => t.type === "invoice")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const paid = clientTxns
      .filter((t) => t.type === "payment")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return { client_id: c.id, client_name: c.name, invoiced, paid, balance: invoiced - paid };
  });

  const totalOutstanding = clientBalances.reduce((sum, c) => sum + c.balance, 0);

  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-full pr-2 pb-16">
      <header className="flex justify-between items-center py-4 px-2 mb-6">
        <div className="flex items-center gap-3">
          <Banknote className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Payments & Ledger</h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-xl text-xs font-bold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.15)]"
        >
          <Plus className="w-4 h-4" /> Record Payment
        </button>
      </header>

      {/* Direct Data KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-2 mb-6 shrink-0">
        <div className="bg-[#1a1a1e] rounded-xl p-3.5 border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Total Collected</span>
            <span className="text-lg font-bold text-emerald-400">₹{totalCollected.toFixed(2)}</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {transactions.filter((t) => t.type === "payment").length} payments
          </span>
        </div>

        <div className="bg-[#1a1a1e] rounded-xl p-3.5 border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Pending Receivables</span>
            <span className="text-lg font-bold text-red-400">₹{totalOutstanding.toFixed(2)}</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            {clientBalances.filter((c) => c.balance > 0).length} clients due
          </span>
        </div>

        <div className="bg-[#1a1a1e] rounded-xl p-3.5 border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Total Records</span>
            <span className="text-lg font-bold text-white">{transactions.length}</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-gray-300 border border-white/10">
            Invoices & Payments
          </span>
        </div>
      </div>

      {/* Transaction History Table - Dark Theme & Single Sight */}
      <div className="bg-[#1a1a1e] rounded-2xl border border-white/5 mx-2 overflow-hidden mb-6">
        <div className="p-4 sm:p-5 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-white">Transaction History</h3>
            <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
              {filtered.length} entries
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Type filter */}
            <div className="flex items-center bg-[#222226] p-0.5 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  typeFilter === "all" ? "bg-white text-gray-900 font-semibold shadow-sm" : "text-gray-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTypeFilter("payment")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  typeFilter === "payment" ? "bg-emerald-500 text-white font-semibold shadow-sm" : "text-gray-400 hover:text-white"
                }`}
              >
                Payments
              </button>
              <button
                onClick={() => setTypeFilter("invoice")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  typeFilter === "invoice" ? "bg-blue-600 text-white font-semibold shadow-sm" : "text-gray-400 hover:text-white"
                }`}
              >
                Invoices
              </button>
            </div>

            {/* Client Select */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="pl-8 pr-6 py-1.5 bg-[#222226] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-white/20 transition-colors appearance-none min-w-[150px]"
              >
                <option value="" className="bg-[#222226]">All Clients</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#222226]">{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="w-full">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="border-b border-white/5 text-[11px] text-gray-400 uppercase tracking-wider bg-white/[0.02]">
                <th className="py-2.5 px-3 sm:px-4 font-semibold">Date</th>
                <th className="py-2.5 px-3 sm:px-4 font-semibold">Client</th>
                <th className="py-2.5 px-3 sm:px-4 font-semibold">Type</th>
                <th className="py-2.5 px-3 sm:px-4 font-semibold">Description</th>
                <th className="py-2.5 px-3 sm:px-4 font-semibold">Method</th>
                <th className="py-2.5 px-3 sm:px-4 font-semibold text-right">Amount</th>
                <th className="py-2.5 px-3 sm:px-4 font-semibold text-center w-12">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No transactions match the selected filter.
                  </td>
                </tr>
              ) : (
                filtered.map((txn) => (
                  <tr
                    key={txn.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-2.5 px-3 sm:px-4 text-gray-400 whitespace-nowrap">
                      {txn.date ? new Date(txn.date).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4">
                      <div className="font-semibold text-white truncate max-w-[150px] sm:max-w-[200px]">
                        {txn.clients?.name || "—"}
                      </div>
                      {txn.clients?.company && (
                        <div className="text-[10px] text-gray-400 truncate max-w-[150px] sm:max-w-[200px]">
                          {txn.clients.company}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        txn.type === "payment"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}>
                        {txn.type === "payment" ? "Payment" : "Invoice"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-gray-300 max-w-[220px] truncate">
                      {txn.description || "—"}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-gray-400 whitespace-nowrap capitalize">
                      {txn.payment_method ? txn.payment_method.replace("_", " ") : "—"}
                    </td>
                    <td className={`py-2.5 px-3 sm:px-4 text-right font-mono font-semibold whitespace-nowrap ${
                      txn.type === "payment" ? "text-emerald-400" : "text-blue-400"
                    }`}>
                      {txn.type === "payment" ? "+" : ""}₹{Number(txn.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-center whitespace-nowrap">
                      {txn.type === "invoice" && txn.reference_id ? (
                        <button
                          onClick={() => router.push(`/invoices/${txn.reference_id}`)}
                          className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[11px] font-medium transition-colors"
                          title="View Invoice"
                        >
                          View
                        </button>
                      ) : txn.client_id ? (
                        <button
                          onClick={() => router.push(`/clients/${txn.client_id}`)}
                          className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-[11px] font-medium transition-colors"
                          title="View Client Ledger"
                        >
                          Ledger
                        </button>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Balances Directory - Dark Theme & Single Sight */}
      <div className="bg-[#1a1a1e] rounded-2xl border border-white/5 mx-2 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-white">Client Financial Balances</h3>
            <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
              {clientBalances.filter((c) => c.invoiced > 0 || c.paid > 0).length} active accounts
            </span>
          </div>
        </div>

        <div className="w-full">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="border-b border-white/5 text-[11px] text-gray-400 uppercase tracking-wider bg-white/[0.02]">
                <th className="py-2.5 px-3 sm:px-4 font-semibold">Client</th>
                <th className="py-2.5 px-3 sm:px-4 font-semibold text-right">Total Invoiced</th>
                <th className="py-2.5 px-3 sm:px-4 font-semibold text-right">Total Paid</th>
                <th className="py-2.5 px-3 sm:px-4 font-semibold text-right">Balance Due</th>
                <th className="py-2.5 px-3 sm:px-4 font-semibold text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {clientBalances.filter((c) => c.invoiced > 0 || c.paid > 0).length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">
                    No client balances recorded yet.
                  </td>
                </tr>
              ) : (
                clientBalances
                  .filter((c) => c.invoiced > 0 || c.paid > 0)
                  .map((cb) => (
                    <tr key={cb.client_id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3 sm:px-4">
                        <span className="font-semibold text-white">{cb.client_name}</span>
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-300 font-mono text-right whitespace-nowrap">
                        ₹{cb.invoiced.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-emerald-400 font-mono text-right whitespace-nowrap">
                        ₹{cb.paid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-right font-mono font-semibold whitespace-nowrap">
                        {cb.balance > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                            ₹{cb.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })} Due
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Settled
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => router.push(`/clients/${cb.client_id}`)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[11px] font-medium transition-colors"
                        >
                          View Ledger
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <RecordPaymentModal
          clients={clients}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function RecordPaymentModal({
  clients,
  onClose,
  onSuccess,
}: {
  clients: any[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [clientId, setClientId] = useState("");
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [exchangeRate, setExchangeRate] = useState("83");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId || !amount) {
      setError("Client and amount are required");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const body: any = {
        client_id: clientId,
        type: "payment",
        amount: parseFloat(amount),
        payment_method: paymentMethod || null,
        description: description || null,
        date,
        currency,
      };
      if (currency === "USD") body.exchange_rate = parseFloat(exchangeRate) || 83;

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record payment");
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-lg mx-4 border border-white/10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">Record Payment</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Client *</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors appearance-none"
              required
            >
              <option value="" className="bg-[#222226]">Select client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#222226]">{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Amount *</label>
            <div className="flex gap-2">
              <div className="flex bg-[#222226] rounded-xl border border-white/10 p-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setCurrency("INR")}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    currency === "INR"
                      ? "bg-white text-gray-900 shadow-[0_0_8px_rgba(255,255,255,0.15)]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  ₹ INR
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    currency === "USD"
                      ? "bg-white text-gray-900 shadow-[0_0_8px_rgba(255,255,255,0.15)]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  $ USD
                </button>
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
                placeholder="0.00"
                required
              />
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
                  className="w-full px-4 py-2 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="83"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors appearance-none"
              >
                <option value="" className="bg-[#222226]">Select...</option>
                <option value="bank_transfer" className="bg-[#222226]">Bank Transfer</option>
                <option value="cash" className="bg-[#222226]">Cash</option>
                <option value="cheque" className="bg-[#222226]">Cheque</option>
                <option value="credit_card" className="bg-[#222226]">Credit Card</option>
                <option value="online" className="bg-[#222226]">Online Payment</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
              placeholder="Payment for..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform disabled:opacity-50 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
            >
              {saving ? "Recording..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
