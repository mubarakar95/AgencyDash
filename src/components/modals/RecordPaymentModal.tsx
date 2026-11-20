"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId: string;
  clientName: string;
  outstandingBalance?: number;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  clientId,
  clientName,
  outstandingBalance = 0,
}: RecordPaymentModalProps) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [exchangeRate, setExchangeRate] = useState("83");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [description, setDescription] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid payment amount");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const numAmount = parseFloat(amount);
      const inrAmount = currency === "USD" ? Math.round(numAmount * parseFloat(exchangeRate) * 100) / 100 : numAmount;

      const body: any = {
        client_id: clientId,
        type: "payment",
        amount: inrAmount,
        currency,
        date: date || new Date().toISOString().slice(0, 10),
        payment_method: paymentMethod || "bank_transfer",
        description: description || `Payment from ${clientName}`,
        reference_id: referenceId || null,
      };

      if (currency === "USD") {
        body.original_amount = numAmount;
      }

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record payment");

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Record Payment — ${clientName}`} maxWidth="max-w-lg">
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {outstandingBalance > 0 && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex justify-between items-center">
          <span>Current Outstanding Balance:</span>
          <span className="font-bold text-sm">₹{outstandingBalance.toFixed(2)}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Amount *</label>
          <div className="flex gap-2">
            <div className="flex bg-[#222226] border border-white/10 rounded-xl p-1 shrink-0">
              <button
                type="button"
                onClick={() => setCurrency("INR")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
              min="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
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
                className="w-full px-3 py-2 bg-[#222226] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Payment Date *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Payment Method *</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors appearance-none"
            >
              <option value="bank_transfer" className="bg-[#222226]">Bank Transfer (NEFT/IMPS)</option>
              <option value="online" className="bg-[#222226]">Online / UPI / GPay</option>
              <option value="cash" className="bg-[#222226]">Cash</option>
              <option value="cheque" className="bg-[#222226]">Cheque</option>
              <option value="credit_card" className="bg-[#222226]">Card</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Description / Note</label>
          <input
            type="text"
            placeholder="e.g. Milestone 2 payment, Advance, Part payment..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Transaction / UPI Reference #</label>
          <input
            type="text"
            placeholder="e.g. UTR / Transaction ID (optional)"
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform disabled:opacity-50 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
          >
            {loading ? "Recording..." : "Record Payment"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
