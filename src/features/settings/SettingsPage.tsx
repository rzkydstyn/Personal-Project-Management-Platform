import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Palette, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore, type ThemeMode } from '@/stores/useUIStore';
import { profileSchema, type ProfileFormValues } from '@/features/auth/schemas';

export const SettingsPage: React.FC = () => {
  const { user, profile, fetchProfile } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [timezone, setTimezone] = useState('Asia/Jakarta');
  const [dateFormat, setDateFormat] = useState('dd MMM yyyy');
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.full_name || '',
      avatarUrl: profile?.avatar_url || '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url || '',
      });
    }
  }, [profile, reset]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setTimezone(data.timezone);
          setDateFormat(data.date_format);
          setTheme(data.theme);
        }
      });
  }, [user, setTheme]);

  const onUpdateProfile = async (values: ProfileFormValues) => {
    if (!user) return;
    setStatusMessage(null);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: values.fullName,
        avatar_url: values.avatarUrl || null,
      })
      .eq('id', user.id);

    if (error) {
      setStatusMessage({ type: 'error', text: error.message });
      return;
    }

    await fetchProfile(user.id);
    setStatusMessage({
      type: 'success',
      text: 'Profile updated successfully.',
    });
  };

  const handleSavePreferences = async (newTheme: ThemeMode) => {
    if (!user) return;
    setIsSavingPrefs(true);
    setStatusMessage(null);
    setTheme(newTheme);

    const { error } = await supabase
      .from('user_settings')
      .upsert(
        {
          user_id: user.id,
          theme: newTheme,
          timezone,
          date_format: dateFormat,
        },
        { onConflict: 'user_id' }
      );

    setIsSavingPrefs(false);
    if (error) {
      setStatusMessage({ type: 'error', text: error.message });
    } else {
      setStatusMessage({
        type: 'success',
        text: 'Workspace preferences saved.',
      });
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {statusMessage && (
        <div
          className={`flex items-center gap-2.5 rounded-xl border p-4 text-[13px] ${
            statusMessage.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300'
              : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
          ) : (
            <AlertCircle className="h-4 w-4 text-[#EF4444]" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Profile Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-slate-800">
          <User className="h-5 w-5 text-[#6366F1]" />
          <div>
            <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">
              Profile Information
            </h2>
            <p className="text-[13px] text-slate-500 dark:text-slate-400">
              Update your personal details associated with your workspace.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onUpdateProfile)}
          className="mt-5 space-y-4"
        >
          <div>
            <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="mt-1.5 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3.5 py-2 text-[14px] text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">
              Full Name
            </label>
            <input
              type="text"
              {...register('fullName')}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-[14px] text-slate-900 focus:border-[#6366F1] focus:outline-hidden focus:ring-2 focus:ring-[#6366F1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {errors.fullName && (
              <p className="mt-1 text-[12px] text-[#EF4444]">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">
              Avatar URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              {...register('avatarUrl')}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-[14px] text-slate-900 focus:border-[#6366F1] focus:outline-hidden focus:ring-2 focus:ring-[#6366F1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {errors.avatarUrl && (
              <p className="mt-1 text-[12px] text-[#EF4444]">
                {errors.avatarUrl.message}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#4F46E5] disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Appearance & Regional Preferences */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-slate-800">
          <Palette className="h-5 w-5 text-[#6366F1]" />
          <div>
            <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">
              Appearance & Preferences
            </h2>
            <p className="text-[13px] text-slate-500 dark:text-slate-400">
              Customize theme, timezone, and date formatting.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-2">
              Theme Mode
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  disabled={isSavingPrefs}
                  onClick={() => handleSavePreferences(mode)}
                  className={`rounded-lg border px-4 py-2.5 text-[13px] font-medium capitalize transition-colors ${
                    theme === mode
                      ? 'border-[#6366F1] bg-[#6366F1]/10 text-[#6366F1] dark:text-indigo-400'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[14px] text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="Asia/Jakarta">Asia/Jakarta (WIB - UTC+7)</option>
                <option value="Asia/Makassar">Asia/Makassar (WITA - UTC+8)</option>
                <option value="Asia/Jayapura">Asia/Jayapura (WIT - UTC+9)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">
                Date Format
              </label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[14px] text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="dd MMM yyyy">16 Nov 2026 (dd MMM yyyy)</option>
                <option value="yyyy-MM-dd">2026-11-16 (yyyy-MM-dd)</option>
                <option value="MM/dd/yyyy">11/16/2026 (MM/dd/yyyy)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={isSavingPrefs}
              onClick={() => handleSavePreferences(theme)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {isSavingPrefs && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Save Regional Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};