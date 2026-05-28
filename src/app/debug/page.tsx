"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabaseClient";

export default function DebugPage() {
  const { user, role, loading, refreshRole } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      // Fetch current user's full profile
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setProfileData(data));

      // Fetch all profiles
      supabase
        .from('profiles')
        .select('*')
        .then(({ data }) => setAllProfiles(data || []));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Debug Info</h1>
        <p className="text-slate-500">Troubleshoot authentication and roles.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Current User</h2>
        <div className="space-y-2 text-sm font-mono bg-slate-50 p-4 rounded-lg">
          <p><span className="text-slate-500">User ID:</span> {user?.id || "Not logged in"}</p>
          <p><span className="text-slate-500">Email:</span> {user?.email || "N/A"}</p>
          <p><span className="text-slate-500">Role from Context:</span> {role || "Not loaded"}</p>
        </div>
        <button
          onClick={refreshRole}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          Refresh Role from Database
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Your Profile Record</h2>
        {profileData ? (
          <div className="space-y-2 text-sm font-mono bg-slate-50 p-4 rounded-lg">
            <p><span className="text-slate-500">Profile ID:</span> {profileData.id}</p>
            <p><span className="text-slate-500">Email:</span> {profileData.email}</p>
            <p><span className="text-slate-500">Role:</span> <span className="text-emerald-600 font-bold">{profileData.role}</span></p>
            <p><span className="text-slate-500">Created:</span> {profileData.created_at}</p>
          </div>
        ) : (
          <p className="text-red-500 text-sm">No profile record found! You need to run the SQL to create/update your profile.</p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">All Profiles in Database</h2>
        {allProfiles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {allProfiles.map((profile) => (
                  <tr key={profile.id}>
                    <td className="px-4 py-2">{profile.id.slice(0, 8)}...</td>
                    <td className="px-4 py-2">{profile.email}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        profile.role === 'admin' ? 'bg-purple-50 text-purple-700' :
                        profile.role === 'developer' ? 'bg-blue-50 text-blue-700' :
                        'bg-slate-50 text-slate-600'
                      }`}>
                        {profile.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-red-500 text-sm">No profiles found in database!</p>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-amber-900 mb-2">Fix Instructions</h2>
        <p className="text-sm text-amber-800 mb-2">If your role is not showing as admin, run this SQL in Supabase:</p>
        <code className="block bg-white p-3 rounded-lg text-xs font-mono text-slate-700 border border-slate-200">
          -- Check your user ID first<br/>
          select id, email from auth.users where email = 'your-email@example.com';<br/><br/>
          -- Update your role<br/>
          update profiles set role = 'admin' where email = 'your-email@example.com';<br/><br/>
          -- Or by ID (more reliable)<br/>
          update profiles set role = 'admin' where id = 'YOUR-USER-ID-HERE';
        </code>
      </div>
    </div>
  );
}
