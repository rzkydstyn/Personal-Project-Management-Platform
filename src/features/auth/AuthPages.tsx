import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layers, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  type LoginFormValues,
  type RegisterFormValues,
  type ForgotPasswordFormValues,
} from './schemas';

const AuthShell: React.FC<{
  title: string;
  subtitle: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 py-12 dark:bg-[#0F172A]">
    <div className="w-full max-w-md space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#6366F1] text-white shadow-sm">
          <Layers className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-[24px] font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        <p className="mt-1 text-[14px] text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        {children}
      </div>
    </div>
  </div>
);

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    navigate('/dashboard', { replace: true });
  };

  return (
    <AuthShell
      title="Welcome back to ProjectFlow"
      subtitle="Sign in to manage your projects, tasks, and time."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <div>
          <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">
            Email Address
          </label>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register('email')}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-[14px] text-slate-900 placeholder:text-slate-400 focus:border-[#6366F1] focus:outline-hidden focus:ring-2 focus:ring-[#6366F1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          {errors.email && (
            <p className="mt-1 text-[12px] text-[#EF4444]">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-[12px] font-medium text-[#6366F1] hover:text-[#4F46E5]"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password')}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-[14px] text-slate-900 placeholder:text-slate-400 focus:border-[#6366F1] focus:outline-hidden focus:ring-2 focus:ring-[#6366F1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          {errors.password && (
            <p className="mt-1 text-[12px] text-[#EF4444]">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2.5 text-[14px] font-medium text-white shadow-xs hover:bg-[#4F46E5] disabled:opacity-60 transition-colors"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>Sign In</span>
        </button>

        <p className="pt-2 text-center text-[13px] text-slate-600 dark:text-slate-400">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-[#6366F1] hover:text-[#4F46E5]"
          >
            Create account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    setSuccessMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
        },
      },
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    if (data.session) {
      navigate('/dashboard', { replace: true });
    } else {
      setSuccessMessage(
        'Registration successful! Please check your email inbox to confirm your account, or sign in directly.'
      );
    }
  };

  return (
    <AuthShell
      title="Create your ProjectFlow account"
      subtitle="Plan Smarter. Work Better. Track Everything."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[13px] text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-[#16A34A]" />
            <span>{successMessage}</span>
          </div>
        )}

        <div>
          <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">
            Full Name
          </label>
          <input
            type="text"
            autoComplete="name"
            placeholder="Muhammad Rizky"
            {...register('fullName')}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-[14px] text-slate-900 placeholder:text-slate-400 focus:border-[#6366F1] focus:outline-hidden focus:ring-2 focus:ring-[#6366F1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          {errors.fullName && (
            <p className="mt-1 text-[12px] text-[#EF4444]">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">
            Email Address
          </label>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register('email')}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-[14px] text-slate-900 placeholder:text-slate-400 focus:border-[#6366F1] focus:outline-hidden focus:ring-2 focus:ring-[#6366F1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          {errors.email && (
            <p className="mt-1 text-[12px] text-[#EF4444]">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">
            Password
          </label>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 chars, 1 uppercase, 1 number"
            {...register('password')}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-[14px] text-slate-900 placeholder:text-slate-400 focus:border-[#6366F1] focus:outline-hidden focus:ring-2 focus:ring-[#6366F1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          {errors.password && (
            <p className="mt-1 text-[12px] text-[#EF4444]">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">
            Confirm Password
          </label>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            {...register('confirmPassword')}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-[14px] text-slate-900 placeholder:text-slate-400 focus:border-[#6366F1] focus:outline-hidden focus:ring-2 focus:ring-[#6366F1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-[12px] text-[#EF4444]">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2.5 text-[14px] font-medium text-white shadow-xs hover:bg-[#4F46E5] disabled:opacity-60 transition-colors"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>Create Account</span>
        </button>

        <p className="pt-2 text-center text-[13px] text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#6366F1] hover:text-[#4F46E5]"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export const ForgotPasswordPage: React.FC = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setServerError(null);
    setSuccessMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/settings`,
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    setSuccessMessage(
      'Password reset instructions have been sent to your email.'
    );
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email address to receive a password reset link."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[13px] text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-[#16A34A]" />
            <span>{successMessage}</span>
          </div>
        )}

        <div>
          <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-[14px] text-slate-900 placeholder:text-slate-400 focus:border-[#6366F1] focus:outline-hidden focus:ring-2 focus:ring-[#6366F1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          {errors.email && (
            <p className="mt-1 text-[12px] text-[#EF4444]">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2.5 text-[14px] font-medium text-white shadow-xs hover:bg-[#4F46E5] disabled:opacity-60 transition-colors"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>Send Reset Link</span>
        </button>

        <p className="pt-2 text-center text-[13px] text-slate-600 dark:text-slate-400">
          Remember your password?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#6366F1] hover:text-[#4F46E5]"
          >
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};