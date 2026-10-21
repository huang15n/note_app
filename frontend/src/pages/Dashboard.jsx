import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Eye, FileText } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLocale();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [confirmId, setConfirmId] = useState(null);

  const canWrite = user?.role === 'author' || user?.role === 'admin';

  const load = async () => {
    setLoading(true);
    try {
      if (!canWrite) {
        setPosts([]);
        return;
      }
      const drafts = await api.get('/posts', {
        params: { status: 'draft', author: user.role === 'author' ? user._id : undefined, limit: 50 },
      });
      const published = await api.get('/posts', {
        params: { status: 'published', author: user.role === 'author' ? user._id : undefined, limit: 50 },
      });
      const map = new Map();
      [...drafts.data.posts, ...published.data.posts].forEach((p) => map.set(p._id, p));
      let all = Array.from(map.values()).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      if (filter !== 'all') all = all.filter((p) => p.status === filter);
      setPosts(all);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter, user]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p._id !== id));
      setConfirmId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('dashboard')}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {user?.name} · <span className="capitalize">{user?.role}</span>
          </p>
        </div>
        {canWrite && (
          <Link
            to="/editor"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" /> {t('newNote')}
          </Link>
        )}
      </div>

      {canWrite && (
        <>
          <div className="mb-6 flex gap-2">
            {['all', 'published', 'draft'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
                  filter === f
                    ? 'bg-brand-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                }`}
              >
                {f === 'all' ? t('all') : t(f)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center dark:border-slate-700 dark:bg-slate-900">
              <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="mb-4 text-slate-500">{t('noNotesYet')}</p>
              <Link to="/editor" className="font-medium text-brand-600 hover:underline">
                {t('writeFirst')}
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3">{t('titlePlaceholder').replace('…', '').replace('...', '') || 'Titre'}</th>
                    <th className="hidden px-4 py-3 sm:table-cell">{t('status')}</th>
                    <th className="hidden px-4 py-3 md:table-cell">{t('views')}</th>
                    <th className="hidden px-4 py-3 md:table-cell">{t('updated')}</th>
                    <th className="px-4 py-3 text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {posts.map((post) => (
                    <tr key={post._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <Link to={`/post/${post.slug}`} className="line-clamp-1 font-medium text-slate-900 hover:text-brand-600 dark:text-white">
                          {post.title}
                        </Link>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            post.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                          }`}
                        >
                          {t(post.status)}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-slate-500 md:table-cell">{post.views || 0}</td>
                      <td className="hidden px-4 py-3 text-slate-500 md:table-cell">
                        {format(new Date(post.updatedAt), 'd MMM yyyy')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/post/${post.slug}`} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800" title="Voir">
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link to={`/editor/${post._id}`} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800" title={t('edit')}>
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setConfirmId(post._id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {!canWrite && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="mb-2 text-slate-600 dark:text-slate-300">{t('subscriberMsg')}</p>
          <p className="text-sm text-slate-500">{t('subscriberHint')}</p>
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">Supprimer cet article ?</h3>
            <p className="mb-6 text-sm text-slate-500">
              Cette action est définitive. L’article et ses commentaires seront effacés.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmId(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium dark:border-slate-600"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmId)}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
