import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../lib/admin-api';
import type { AdminSession, Profile } from '../types/admin';
import { Button } from '../components/ui/button';

interface SettingsPageProps {
  session: AdminSession | null;
}

export function SettingsPage({ session }: SettingsPageProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session?.isAuthenticated) {
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await getProfile();
        setProfile(response);
        setFullName(response.fullName);
        setUserName(response.userName);
        setEmail(response.email);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load profile.');
      }
    };

    void loadProfile();
  }, [session?.isAuthenticated]);

  if (!session?.isAuthenticated) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await updateProfile({ fullName, userName, email });
      setProfile(response);
      setFullName(response.fullName);
      setUserName(response.userName);
      setEmail(response.email);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-medium uppercase tracking-[0.28em] text-accent-600">Settings</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Update profile</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
        Keep your storefront profile current here. Role and account status are shown from the backend, while profile fields can be updated directly.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Full name</span>
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none dark:border-slate-700 dark:bg-slate-950" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Username</span>
            <input value={userName} onChange={(event) => setUserName(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none dark:border-slate-700 dark:bg-slate-950" />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none dark:border-slate-700 dark:bg-slate-950" />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Role</p>
            <p className="mt-2 text-lg font-semibold capitalize text-slate-950 dark:text-white">{profile?.role ?? session.role ?? 'Unknown'}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Approval</p>
            <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{profile?.isApproved ? 'Approved' : 'Pending'}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Status</p>
            <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{profile?.isLocked ? 'Locked' : 'Active'}</p>
          </div>
        </div>

        {error ? <p className="text-sm text-rose-500">{error}</p> : null}

        <Button type="submit" variant="secondary" disabled={saving}>
          {saving ? 'Saving...' : 'Save profile'}
        </Button>
      </form>
    </section>
  );
}
