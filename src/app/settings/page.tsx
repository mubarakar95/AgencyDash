"use client";

import { useState } from "react";
import { Settings, Bell, Globe, Building2 } from "lucide-react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [digest, setDigest] = useState("daily");

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-2 pb-4">
      <header className="flex justify-between items-center py-4 px-2 mb-6">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.6)]" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
        </div>
      </header>

      <div className="glass-panel p-8 rounded-3xl mx-2 mb-6 border border-white/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-blue-500/10">
            <Bell className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Notifications</h3>
        </div>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Email Notifications</p>
              <p className="text-xs text-gray-400 mt-0.5">Receive alerts for renewals and deadlines.</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications ? "bg-blue-500" : "bg-gray-600"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Digest Frequency</p>
              <p className="text-xs text-gray-400 mt-0.5">How often to receive summary emails.</p>
            </div>
            <select
              value={digest}
              onChange={(e) => setDigest(e.target.value)}
              className="px-4 py-2 bg-[#222226] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors appearance-none"
            >
              <option value="daily" className="bg-[#222226]">Daily</option>
              <option value="weekly" className="bg-[#222226]">Weekly</option>
              <option value="never" className="bg-[#222226]">Never</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-3xl mx-2 mb-6 border border-white/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-emerald-500/10">
            <Building2 className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Account</h3>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Agency Name</label>
            <input
              type="text"
              defaultValue="My Software Agency"
              className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Timezone</label>
            <select className="w-full px-4 py-3 bg-[#222226] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors appearance-none">
              <option className="bg-[#222226]">UTC</option>
              <option className="bg-[#222226]">America/New_York</option>
              <option className="bg-[#222226]">Europe/London</option>
              <option className="bg-[#222226]">Asia/Dubai</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end px-2">
        <button className="px-6 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.15)]">
          Save Changes
        </button>
      </div>
    </div>
  );
}