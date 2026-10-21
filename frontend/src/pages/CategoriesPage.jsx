import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import api from '../api/client';
import { useLocale } from '../context/LocaleContext';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function CategoriesPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'author';

  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({});
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
      const entries = await Promise.all(
        data.map(async (c) => {
          try {
            const r = await api.get('/posts', { params: { category: c._id, limit: 1 } });
            return [c._id, r.data.total];
          } catch {
            return [c._id, 0];
          }
        })
      );
      setCounts(Object.fromEntries(entries));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    try {
      await api.post('/categories', { name: name.trim(), color });
      setName('');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (id, catName) => {
    if (!window.confirm(`Supprimer la catégorie « ${catName} » ?`)) return;
    try {
      await api.delete(`/categories/${id}`);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Suppression impossible');
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">{t('manageCategories')}</h1>
      <p className="mb-8 text-sm text-slate-500">Organisez vos articles par thème.</p>

      {canManage && (
        <form onSubmit={handleAdd} className="mb-8 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="min-w-[180px] flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-500">{t('categoryName')}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('categoryName')}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Couleur</label>
            <div className="flex gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-lg border-2 ${color === c ? 'border-slate-900 dark:border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" /> {t('addCategory')}
          </button>
          {error && <p className="w-full text-sm text-red-600">{error}</p>}
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="text-center text-slate-500 py-12">Aucune catégorie.</p>
      ) : (
        <ul className="space-y-2">
          {categories.map((c) => (
            <li
              key={c._id}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="h-10 w-10 shrink-0 rounded-lg" style={{ backgroundColor: c.color }} />
              <div className="min-w-0 flex-1">
                <Link to={`/articles?category=${c._id}`} className="font-medium text-slate-900 hover:text-brand-600 dark:text-white">
                  {c.name}
                </Link>
                <p className="text-xs text-slate-500">{counts[c._id] ?? 0} articles</p>
              </div>
              {canManage && (
                <button
                  type="button"
                  onClick={() => handleDelete(c._id, c.name)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
