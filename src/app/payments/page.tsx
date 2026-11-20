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

  const filtered = clientFilter
    ? transactions.filter((t) => t.client_id === clientFilter)
    : transactions;

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
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-2 pb-6">
      <header className="flex justify-between items-center py-4 px-2 mb-6">
        <div className="flex items-center gap-3">
          <Banknote className="w-6 h-6 text-green-300 drop-shadow-[0_0_8px_rgba(134,239,172,0.6)]" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Payments</h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.15)]"
        >
          <Plus className="w-4 h-4" /> Record Payment
        </button>
      </header>

      <div className="grid grid-cols-3 gap-4 px-2 mb-6">
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
            <Wallet className="w-3.5 h-3.5" /> Total Collected
          </div>
          <p className="text-2xl font-bold text-white">₹{totalCollected.toFixed(2)}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
            <TrendingUp className="w-3.5 h-3.5" /> Outstanding
          </div>
          <p className="text-2xl font-bold text-white">₹{totalOutstanding.toFixed(2)}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
            <ArrowUpRight className="w-3.5 h-3.5" /> Transactions
          </div>
          <p className="text-2xl font-bold text-white">{transactions.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 pt-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-medium text-gray-900">Transaction History</h3>
              <span className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">{filtered.length}</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-gray-300 transition-colors appearance-none min-w-[200px]"
              >
                <option value="" className="bg-white">All Clients</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white">{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-auto max-h-[480px] scrollbar-light overscroll-x-contain">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead className="sticky top-0 bg-white z-10 shadow-xs">
              <tr className="text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-3 pt-1 font-normal pr-4 bg-white">Date</th>
                <th className="pb-3 pt-1 font-normal pr-4 bg-white">Client</th>
                <th className="pb-3 pt-1 font-normal pr-4 bg-white">Type</th>
                <th className="pb-3 pt-1 font-normal pr-4 bg-white">Description</th>
                <th className="pb-3 pt-1 font-normal pr-4 bg-white">Method</th>
                <th className="pb-3 pt-1 font-normal pr-4 text-right bg-white">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">No transactions yet</td>
                </tr>
              ) : (
                filtered.map((txn) => (
                  <tr
                    key={txn.id}
                    onClick={() => txn.type === "invoice" && txn.reference_id && router.push(`/invoices/${txn.reference_id}`)}
                    className={`border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors ${txn.type === "invoice" ? "cursor-pointer" : ""}`}
                  >
                    <td className="py-3 pr-4 text-gray-400 text-xs">
                      {txn.date ? new Date(txn.date).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3 pr-4 text-gray-900 font-medium">
                      {txn.clients?.name || "—"}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        txn.type === "payment"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {txn.type === "payment" ? "Payment" : "Invoice"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-500 max-w-[200px] truncate">
                      {txn.description || "—"}
                    </td>
                    <td className="py-3 pr-4 text-gray-400 text-xs">
                      {txn.payment_method || "—"}
                    </td>
                    <td className={`py-3 text-right font-medium ${
                      txn.type === "payment" ? "text-green-600" : "text-blue-600"
                    }`}>
                      {txn.type === "payment" ? "+" : ""}₹{Number(txn.amount).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-6">
        <div className="px-8 pt-6 pb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Client Balances</h3>
          <div className="overflow-x-auto overflow-y-auto max-h-[420px] scrollbar-light overscroll-x-contain">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead className="sticky top-0 bg-white z-10 shadow-xs">
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-3 pt-1 font-normal pr-4 bg-white">Client</th>
                  <th className="pb-3 pt-1 font-normal pr-4 text-right bg-white">Invoiced</th>
                  <th className="pb-3 pt-1 font-normal pr-4 text-right bg-white">Paid</th>
                  <th className="pb-3 pt-1 font-normal text-right bg-white">Balance</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {clientBalances.filter((c) => c.invoiced > 0 || c.paid > 0).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">No activity yet</td>
                  </tr>
                ) : (
                  clientBalances
                    .filter((c) => c.invoiced > 0 || c.paid > 0)
                    .map((cb) => (
                      <tr key={cb.client_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 pr-4 text-gray-900">{cb.client_name}</td>
                        <td className="py-3 pr-4 text-gray-600 text-right">₹{cb.invoiced.toFixed(2)}</td>
                        <td className="py-3 pr-4 text-green-600 text-right">₹{cb.paid.toFixed(2)}</td>
                        <td className={`py-3 text-right font-medium ${
                          cb.balance > 0 ? "text-red-600" : "text-gray-400"
                        }`}>
                          ₹{cb.balance.toFixed(2)}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
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
