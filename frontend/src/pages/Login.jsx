import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { BookOpen } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t('welcomeBack')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('signInSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('email')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('password')}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition"
          >
            {loading ? '…' : t('signIn')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {t('noAccount')}{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:underline">{t('createOne')}</Link>
        </p>

        <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500 space-y-1">
          <p className="font-medium text-slate-700">{t('demoAccounts')}</p>
          <p>Admin: admin@notecraft.app / admin123456</p>
          <p>Author: alice@notecraft.app / author123456</p>
          <p>Reader: claire@notecraft.app / reader123456</p>
        </div>
      </div>
    </div>
  );
}
