import React, { useState } from 'react';
import { useStore, authErrorMessage } from '../context/StoreContext';
import { Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';

type Mode = 'signin' | 'signup' | 'reset';

const inputClass =
  'w-full pl-10 pr-3 py-3 bg-white border border-[#CBD5CF] rounded-xl text-sm text-[#0E2A23] placeholder:text-[#8A9C94] focus:outline-none focus:ring-2 focus:ring-[#2152B8]/40';

const Field: React.FC<{
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}> = ({ icon, label, children }) => (
  <label className="block space-y-1.5">
    <span className="text-xs font-bold text-[#0E2A23]">{label}</span>
    <span className="relative block">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B635A]">{icon}</span>
      {children}
    </span>
  </label>
);

// Sign in, create an account, or get a password reset link.
export const AuthPanel: React.FC = () => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } = useStore();
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
    setNotice('');
  };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await fn();
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signin') {
      void run(() => signInWithEmail(email, password));
    } else if (mode === 'signup') {
      if (name.trim().length < 2) {
        setError('Enter your full name.');
        return;
      }
      if (!/^\+?[0-9 -]{7,20}$/.test(phone.trim())) {
        setError('Enter a valid phone number, e.g. 98XXXXXXXX.');
        return;
      }
      if (password.length < 6) {
        setError('Use a password with at least 6 characters.');
        return;
      }
      void run(() => signUpWithEmail({ name, email, password, phone }));
    } else {
      void run(async () => {
        await resetPassword(email);
        setNotice(`If an account exists for ${email.trim()}, a reset link is on its way. Check your inbox and spam folder.`);
      });
    }
  };

  const title = mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create your account' : 'Reset your password';

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#CBD5CF] shadow-xs space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4B635A]">Customer Portal</span>
          <h1 className="text-2xl font-black text-[#0E2A23] tracking-tight">{title}</h1>
          {mode === 'signup' && (
            <p className="text-sm text-[#4B635A]">Save your delivery details and see your orders.</p>
          )}
        </div>

        {mode !== 'reset' && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#E4EBE7] rounded-full" role="tablist">
            {(['signin', 'signup'] as const).map(m => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => switchMode(m)}
                className={`py-2 rounded-full text-sm font-bold transition-colors ${
                  mode === m ? 'bg-[#0E2A23] text-white' : 'text-[#4B635A] hover:text-[#0E2A23]'
                }`}
              >
                {m === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {mode === 'signup' && (
            <Field icon={<User className="w-4 h-4" />} label="Full name">
              <input className={inputClass} value={name} onChange={e => setName(e.target.value)} autoComplete="name" required maxLength={120} placeholder="Your name" />
            </Field>
          )}

          <Field icon={<Mail className="w-4 h-4" />} label="Email">
            <input className={inputClass} type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required maxLength={254} placeholder="you@example.com" />
          </Field>

          {mode === 'signup' && (
            <Field icon={<Phone className="w-4 h-4" />} label="Phone (for delivery)">
              <input className={inputClass} type="tel" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" required maxLength={20} placeholder="98XXXXXXXX" />
            </Field>
          )}

          {mode !== 'reset' && (
            <Field icon={<Lock className="w-4 h-4" />} label="Password">
              <input
                className={inputClass}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
                minLength={6}
                placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
              />
            </Field>
          )}

          {mode === 'signin' && (
            <button type="button" onClick={() => switchMode('reset')} className="text-xs font-bold text-[#2152B8] hover:underline">
              Forgot password?
            </button>
          )}

          {error && <p className="text-sm text-red-700 font-medium" role="alert">{error}</p>}
          {notice && <p className="text-sm text-emerald-800 font-medium" role="status">{notice}</p>}

          <button
            type="submit"
            disabled={busy || !email.trim()}
            className="w-full py-3 rounded-xl bg-[#0E2A23] text-white text-sm font-bold hover:bg-[#10241E] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
            {!busy && <ArrowRight className="w-4 h-4" />}
          </button>

          {mode === 'reset' && (
            <button type="button" onClick={() => switchMode('signin')} className="w-full text-sm font-bold text-[#2152B8] hover:underline">
              Back to sign in
            </button>
          )}
        </form>

        {mode !== 'reset' && (
          <>
            <div className="flex items-center gap-3 text-xs text-[#8A9C94]">
              <span className="flex-1 h-px bg-[#E4EBE7]" />
              or
              <span className="flex-1 h-px bg-[#E4EBE7]" />
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => void run(signInWithGoogle)}
              className="w-full py-3 rounded-xl bg-white border border-[#CBD5CF] text-sm font-bold text-[#0E2A23] hover:bg-[#F2F5F3] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 48 48" className="w-4 h-4" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
              </svg>
              Continue with Google
            </button>
          </>
        )}
      </div>
    </div>
  );
};
