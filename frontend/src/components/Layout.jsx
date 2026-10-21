import { Outlet, Link, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { PenLine, LogOut, Menu, X, BookOpen, Globe, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Layout() {
  const { user, logout, isAuthenticated } = useAuth();
  const { t, locale, setLocale, locales } = useLocale();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark') ||
        localStorage.getItem('notecraft_dark') === '1';
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('notecraft_dark', '1');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('notecraft_dark', '0');
    }
  }, [dark]);

  // Apply on first paint
  useEffect(() => {
    if (localStorage.getItem('notecraft_dark') === '1') {
      document.documentElement.classList.add('dark');
      setDark(true);
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'text-brand-600 dark:text-brand-400'
        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <BookOpen className="h-4 w-4" />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Note<span className="text-brand-600">Craft</span>
            </span>
          </Link>

          {/* Center nav — clean */}
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={linkClass}>{t('explore')}</NavLink>
            <NavLink to="/articles" className={linkClass}>Articles</NavLink>
            <NavLink to="/categories" className={linkClass}>{t('manageCategories')}</NavLink>
            {isAuthenticated && (
              <NavLink to="/dashboard" className={linkClass}>{t('dashboard')}</NavLink>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {(user?.role === 'author' || user?.role === 'admin') && (
              <Link
                to="/editor"
                className="hidden items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 sm:inline-flex"
              >
                <PenLine className="h-3.5 w-3.5" />
                {t('write')}
              </Link>
            )}

            <button
              type="button"
              onClick={() => setDark((d) => !d)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen((v) => !v)}
                className="flex items-center gap-1 rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <Globe className="h-4 w-4" />
                <span className="text-xs font-medium">{locales.find((l) => l.code === locale)?.short}</span>
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 z-50 mt-1 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                    {locales.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          setLocale(l.code);
                          setLangOpen(false);
                        }}
                        className={`block w-full px-3 py-2 text-left text-sm ${
                          locale === l.code
                            ? 'bg-brand-50 font-semibold text-brand-700 dark:bg-slate-800 dark:text-brand-400'
                            : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="hidden h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 sm:flex dark:bg-brand-900 dark:text-brand-300"
                  title={user.name}
                >
                  {user.name?.charAt(0)?.toUpperCase()}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title={t('logout')}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {t('login')}
              </Link>
            )}

            <button type="button" className="rounded-lg p-2 md:hidden" onClick={() => setOpen(!open)}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-slate-100 px-4 py-3 md:hidden dark:border-slate-800">
            <nav className="flex flex-col gap-1">
              {[
                ['/', t('explore')],
                ['/articles', 'Articles'],
                ['/categories', t('manageCategories')],
                ...(isAuthenticated ? [['/dashboard', t('dashboard')]] : []),
                ...((user?.role === 'author' || user?.role === 'admin') ? [['/editor', t('write')]] : []),
              ].map(([to, label]) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 py-6 dark:border-slate-800">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 text-xs text-slate-500 sm:flex-row sm:px-6">
          <span>© {new Date().getFullYear()} NoteCraft</span>
          <Link to="/privacy" className="hover:text-brand-600">
            Confidentialité
          </Link>
        </div>
      </footer>
    </div>
  );
}
