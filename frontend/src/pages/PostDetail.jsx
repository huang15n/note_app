import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { fr, enUS, es } from 'date-fns/locale';
import { Clock, Eye, MessageCircle, ArrowLeft, Send, Pencil, Trash2 } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';

function isHtmlContent(s) {
  if (!s) return false;
  return /<(p|h[1-6]|div|ul|ol|table|pre|img|blockquote|iframe)[\s>]/i.test(s);
}

function extractToc(htmlOrMd) {
  const items = [];
  if (!htmlOrMd) return items;
  if (isHtmlContent(htmlOrMd)) {
    const re = /<h([1-3])[^>]*>(.*?)<\/h\1>/gi;
    let m;
    while ((m = re.exec(htmlOrMd))) {
      const text = m[2].replace(/<[^>]+>/g, '').trim();
      if (text) items.push({ level: Number(m[1]), text });
    }
  } else {
    const re = /^(#{1,3})\s+(.+)$/gm;
    let m;
    while ((m = re.exec(htmlOrMd))) {
      items.push({ level: m[1].length, text: m[2].trim() });
    }
  }
  return items;
}

const dateLocales = { fr, en: enUS, es, 'zh-TW': enUS };

export default function PostDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t, locale } = useLocale();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/posts/${slug}`);
        setPost(data);
        const cRes = await api.get('/comments', { params: { post: data._id } });
        setComments(cRes.data.comments);
        if (data.category?._id) {
          const r = await api.get('/posts', { params: { category: data.category._id, limit: 4 } });
          setRelated(r.data.posts.filter((p) => p._id !== data._id).slice(0, 3));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Post not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const toc = useMemo(() => extractToc(post?.content), [post?.content]);
  const html = post ? isHtmlContent(post.content) : false;
  const canEdit =
    user && (user.role === 'admin' || (user.role === 'author' && post?.author?._id === user._id));

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post('/comments', { post: post._id, content: commentText });
      setComments((prev) => [data, ...prev]);
      setCommentText('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/posts/${post._id}`);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="mb-2 text-2xl font-bold">{t('pageNotFound')}</h1>
        <Link to="/" className="text-brand-600 hover:underline">{t('backHomeLink')}</Link>
      </div>
    );
  }

  const dfnsLocale = dateLocales[locale] || fr;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
        <article className="min-w-0 flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Link to="/articles" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600">
              <ArrowLeft className="h-4 w-4" /> Articles
            </Link>
            {canEdit && (
              <div className="flex gap-2">
                <Link
                  to={`/editor/${post._id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                >
                  <Pencil className="h-3.5 w-3.5" /> {t('edit')}
                </Link>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:bg-slate-900"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Supprimer
                </button>
              </div>
            )}
          </div>

          {post.category && (
            <Link
              to={`/articles?category=${post.category._id}`}
              className="mb-3 inline-block text-xs font-semibold uppercase tracking-wide text-brand-600"
            >
              {post.category.name}
            </Link>
          )}

          <h1 className="mb-5 text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-[2.25rem]">
            {post.title}
          </h1>

          <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            <Link to={`/author/${post.author?._id}`} className="flex items-center gap-2 font-medium text-slate-800 hover:text-brand-600 dark:text-slate-200">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                {post.author?.name?.charAt(0)}
              </span>
              {post.author?.name}
            </Link>
            {post.publishedAt && (
              <time>{format(new Date(post.publishedAt), 'd MMMM yyyy', { locale: dfnsLocale })}</time>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {post.readTime} {t('minRead')}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> {post.views} {t('views')}
            </span>
          </div>

          {post.coverImage && (
            <img src={post.coverImage} alt="" className="mb-10 w-full rounded-2xl object-cover shadow-sm" />
          )}

          {/* Blog body — rendered content, not raw markdown */}
          <div className="article-body mb-12">
            {html ? (
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
            )}
          </div>

          {post.tags?.length > 0 && (
            <div className="mb-12 flex flex-wrap gap-2 border-t border-slate-100 pt-6 dark:border-slate-800">
              {post.tags.map((tag) => (
                <span key={tag._id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {post.allowComments && (
            <section className="border-t border-slate-200 pt-10 dark:border-slate-800">
              <h2 className="mb-6 text-lg font-semibold">
                {t('comments')} ({comments.length})
              </h2>
              {isAuthenticated ? (
                <form onSubmit={submitComment} className="mb-8">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={t('shareThoughts')}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting || !commentText.trim()}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" /> {t('postComment')}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mb-8 rounded-xl border border-dashed border-slate-300 py-6 text-center text-sm text-slate-500">
                  <Link to="/login" className="font-medium text-brand-600 hover:underline">{t('login')}</Link>
                  {' — '}
                  {t('loginToComment')}
                </div>
              )}
              <div className="space-y-5">
                {comments.map((c) => (
                  <div key={c._id} className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                      {c.author?.name?.charAt(0)}
                    </div>
                    <div>
                      <div className="mb-0.5 flex items-center gap-2 text-sm">
                        <span className="font-medium">{c.author?.name}</span>
                        <span className="text-xs text-slate-400">{format(new Date(c.createdAt), 'd MMM yyyy')}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{c.content}</p>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && <p className="text-center text-sm text-slate-400">{t('noComments')}</p>}
              </div>
            </section>
          )}
        </article>

        <aside className="w-full shrink-0 space-y-6 lg:w-56">
          {toc.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 lg:sticky lg:top-20">
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Sommaire</h3>
              <nav className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
                {toc.map((item, i) => (
                  <div key={i} style={{ paddingLeft: (item.level - 1) * 10 }}>
                    {item.text}
                  </div>
                ))}
              </nav>
            </div>
          )}
          {related.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Similaires</h3>
              <div className="space-y-3">
                {related.map((r) => (
                  <Link key={r._id} to={`/post/${r.slug}`} className="block text-sm font-medium leading-snug text-slate-800 hover:text-brand-600 dark:text-slate-200">
                    {r.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <h3 className="mb-2 text-lg font-semibold">Supprimer cet article ?</h3>
            <p className="mb-6 text-sm text-slate-500">Action définitive : article et commentaires seront effacés.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-600">
                Annuler
              </button>
              <button type="button" onClick={handleDelete} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
