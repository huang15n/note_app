import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Search, Clock } from 'lucide-react';
import api from '../api/client';
import { useLocale } from '../context/LocaleContext';

export default function Articles() {
  const { t } = useLocale();
  const [params, setParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(Number(params.get('page')) || 1);
  const [search, setSearch] = useState(params.get('q') || '');
  const [loading, setLoading] = useState(true);
  const sort = params.get('sort') || '-publishedAt';

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/posts', {
          params: {
            page,
            limit: 12,
            search: search || undefined,
            sort,
            category: params.get('category') || undefined,
          },
        });
        setPosts(data.posts);
        setPages(data.pages);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [page, search, sort, params]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-3xl font-bold text-slate-900 dark:text-white">{t('latestNotes')}</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
        }}
        className="mb-8 flex gap-2"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
        <button type="submit" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
          {t('search')}
        </button>
        <select
          value={sort}
          onChange={(e) => setParams({ sort: e.target.value })}
          className="rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="-publishedAt">Récent</option>
          <option value="-views">Populaire</option>
        </select>
      </form>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post._id}
              to={`/post/${post.slug}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              {post.category && (
                <span className="mb-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ backgroundColor: post.category.color }}>
                  {post.category.name}
                </span>
              )}
              <h2 className="mb-2 font-semibold text-slate-900 dark:text-white">{post.title}</h2>
              <p className="mb-3 line-clamp-2 text-sm text-slate-500">
                {post.excerpt || (post.content || '').replace(/<[^>]*>/g, ' ').slice(0, 100)}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                {post.publishedAt && <span>{format(new Date(post.publishedAt), 'MMM d, yyyy')}</span>}
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime} min</span>
                <span>{post.views} {t('views')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-10 w-10 rounded-lg text-sm font-medium ${p === page ? 'bg-brand-600 text-white' : 'border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
