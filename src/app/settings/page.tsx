"use client";

import { useEffect, useState } from "react";
import { Building2, Banknote, MapPin, Phone, Mail, Tag, Save, Loader2, Check } from "lucide-react";

interface AgencySettings {
  agency_name: string;
  agency_address: string | null;
  agency_contact: string | null;
  agency_email: string | null;
  bank_name: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  gst_number: string | null;
  default_exchange_rate: number;
}

export default function SettingsPage() {
  const [form, setForm] = useState<AgencySettings>({
    agency_name: "",
    agency_address: "",
    agency_contact: "",
    agency_email: "",
    bank_name: "",
    bank_account_name: "",
    bank_account_number: "",
    bank_ifsc: "",
    gst_number: "",
    default_exchange_rate: 83,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setForm({
          agency_name: data.agency_name || "",
          agency_address: data.agency_address || "",
          agency_contact: data.agency_contact || "",
          agency_email: data.agency_email || "",
          bank_name: data.bank_name || "",
          bank_account_name: data.bank_account_name || "",
          bank_account_number: data.bank_account_number || "",
          bank_ifsc: data.bank_ifsc || "",
          gst_number: data.gst_number || "",
          default_exchange_rate: data.default_exchange_rate ?? 83,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function set(field: keyof AgencySettings, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-2 pb-4">
      <header className="flex justify-between items-center py-4 px-2 mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.6)]" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
        </div>
      </header>

      {error && (
        <div className="mx-2 mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="glass-panel p-8 rounded-3xl mx-2 mb-6 border border-white/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-emerald-500/10">
            <Building2 className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Agency Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1.5">
              <Building2 className="w-4 h-4 text-gray-500" />
              Agency Name
            </label>
            <input
              type="text"
              value={form.agency_name}
              onChange={(e) => set("agency_name", e.target.value)}
              className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
              placeholder="My Agency"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1.5">
              <Tag className="w-4 h-4 text-gray-500" />
              GST Number
            </label>
            <input
              type="text"
              value={form.gst_number || ""}
              onChange={(e) => set("gst_number", e.target.value)}
              className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
              placeholder="GSTIN"
            />
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1.5">
              <MapPin className="w-4 h-4 text-gray-500" />
              Address
            </label>
            <textarea
              rows={2}
              value={form.agency_address || ""}
              onChange={(e) => set("agency_address", e.target.value)}
              className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors resize-y min-h-[60px]"
              placeholder="Street, City, State, ZIP"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1.5">
              <Phone className="w-4 h-4 text-gray-500" />
              Contact Number
            </label>
            <input
              type="text"
              value={form.agency_contact || ""}
              onChange={(e) => set("agency_contact", e.target.value)}
              className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
              placeholder="+1 555-0000"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1.5">
              <Mail className="w-4 h-4 text-gray-500" />
              Email
            </label>
            <input
              type="email"
              value={form.agency_email || ""}
              onChange={(e) => set("agency_email", e.target.value)}
              className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
              placeholder="contact@agency.com"
            />
          </div>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-3xl mx-2 mb-6 border border-white/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-blue-500/10">
            <Banknote className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Bank Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1.5">
              <Banknote className="w-4 h-4 text-gray-500" />
              Bank Name
            </label>
            <input
              type="text"
              value={form.bank_name || ""}
              onChange={(e) => set("bank_name", e.target.value)}
              className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
              placeholder="Bank of America"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1.5">
              <Banknote className="w-4 h-4 text-gray-500" />
              Account Name
            </label>
            <input
              type="text"
              value={form.bank_account_name || ""}
              onChange={(e) => set("bank_account_name", e.target.value)}
              className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
              placeholder="AgencyDash"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1.5">
              <Banknote className="w-4 h-4 text-gray-500" />
              Account Number
            </label>
            <input
              type="text"
              value={form.bank_account_number || ""}
              onChange={(e) => set("bank_account_number", e.target.value)}
              className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
              placeholder="1234567890"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1.5">
              <Banknote className="w-4 h-4 text-gray-500" />
              IFSC Code
            </label>
            <input
              type="text"
              value={form.bank_ifsc || ""}
              onChange={(e) => set("bank_ifsc", e.target.value)}
              className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
              placeholder="BOFA0001234"
            />
          </div>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-3xl mx-2 mb-6 border border-white/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-amber-500/10">
            <Tag className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Currency</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1.5">
              <Tag className="w-4 h-4 text-gray-500" />
              Default USD→INR Exchange Rate
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.default_exchange_rate}
              onChange={(e) => set("default_exchange_rate", parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
              placeholder="83"
            />
            <p className="text-xs text-gray-500 mt-1.5">Used as default when creating USD invoices. Can be overridden per invoice.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end px-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform disabled:opacity-50 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
