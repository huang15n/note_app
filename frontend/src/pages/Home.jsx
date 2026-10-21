import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Search, Clock, Eye, Sparkles } from 'lucide-react';
import api from '../api/client';
import { useLocale } from '../context/LocaleContext';

export default function Home() {
  const { t } = useLocale();
  const [posts, setPosts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = async (p = 1, q = search, cat = activeCat) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 9 };
      if (q) params.search = q;
      if (cat) params.category = cat;
      const [postsRes, featRes, catRes] = await Promise.all([
        api.get('/posts', { params }),
        api.get('/posts', { params: { featured: true, limit: 3 } }),
        api.get('/categories'),
      ]);
      setPosts(postsRes.data.posts);
      setPages(postsRes.data.pages);
      setPage(postsRes.data.page);
      setFeatured(featRes.data.posts);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(1, search, activeCat);
  };

  const heroLines = t('heroTitle').split('\n');

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 text-white">
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur">
            <Sparkles className="h-4 w-4" /> {t('tagline')}
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {heroLines.map((line, i) => (
              <span key={i}>
                {line}
                {i < heroLines.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-brand-100">{t('heroSubtitle')}</p>
          <form onSubmit={handleSearch} className="mx-auto flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border-0 bg-white/95 py-3 pl-10 pr-4 text-slate-900 shadow-lg outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-white/50"
              />
            </div>
            <button type="submit" className="rounded-xl bg-white px-5 py-3 font-semibold text-brand-700 shadow-lg transition hover:bg-brand-50">
              {t('search')}
            </button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => {
              setActiveCat('');
              load(1, search, '');
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              !activeCat ? 'bg-brand-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-300'
            }`}
          >
            {t('all')}
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => {
                setActiveCat(c._id);
                load(1, search, c._id);
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                activeCat === c._id ? 'text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-300'
              }`}
              style={activeCat === c._id ? { backgroundColor: c.color } : {}}
            >
              {c.name}
            </button>
          ))}
        </div>

        {featured.length > 0 && !search && !activeCat && (
          <section className="mb-12">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Sparkles className="h-5 w-5 text-brand-500" /> {t('featured')}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((post) => (
                <PostCard key={post._id} post={post} featured t={t} />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">{t('latestNotes')}</h2>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-200" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
              {t('noPosts')}
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} t={t} />
                ))}
              </div>
              {pages > 1 && (
                <div className="mt-10 flex justify-center gap-2">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => load(p)}
                      className={`h-10 w-10 rounded-lg text-sm font-medium transition ${
                        p === page ? 'bg-brand-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function PostCard({ post, featured, t }) {
  const excerpt =
    post.excerpt ||
    (post.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);

  return (
    <Link
      to={`/post/${post.slug}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        featured ? 'border-brand-200 ring-1 ring-brand-100' : 'border-slate-200'
      }`}
    >
      {post.coverImage ? (
        <div className="aspect-[16/9] overflow-hidden bg-slate-100">
          <img src={post.coverImage} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
        </div>
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-brand-100 to-indigo-100">
          <span className="text-4xl font-bold text-brand-300/60">{post.title?.charAt(0)}</span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2 text-xs">
          {post.category && (
            <span className="rounded-full px-2 py-0.5 font-medium text-white" style={{ backgroundColor: post.category.color || '#6366f1' }}>
              {post.category.name}
            </span>
          )}
          {post.publishedAt && <span className="text-slate-400">{format(new Date(post.publishedAt), 'MMM d, yyyy')}</span>}
        </div>
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-slate-900 transition group-hover:text-brand-700">{post.title}</h3>
        <p className="mb-4 line-clamp-2 flex-1 text-sm text-slate-500">{excerpt}</p>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700">
              {post.author?.name?.charAt(0)}
            </div>
            <span className="font-medium text-slate-600">{post.author?.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime || 1} min
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {post.views || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
