import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { Save, Eye, ArrowLeft, ImagePlus } from 'lucide-react';
import RichEditor from '../components/editor/RichEditor';
import { useLocale } from '../context/LocaleContext';

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLocale();
  const coverRef = useRef(null);
  const autosaveTimer = useRef(null);
  const formRef = useRef(null);
  const postIdRef = useRef(id);

  const [form, setForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    status: 'draft',
    visibility: 'public',
    allowComments: true,
    featured: false,
    category: '',
    tags: [],
    metaTitle: '',
    metaDescription: '',
    scheduledAt: '',
  });
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [autoSavedAt, setAutoSavedAt] = useState(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [dirty, setDirty] = useState(false);

  formRef.current = form;
  postIdRef.current = id;

  useEffect(() => {
    const init = async () => {
      try {
        const [catRes, tagRes] = await Promise.all([api.get('/categories'), api.get('/tags')]);
        setCategories(catRes.data);
        setTags(tagRes.data);
        if (id) {
          const { data } = await api.get(`/posts/${id}`);
          setForm({
            title: data.title || '',
            content: data.content || '',
            excerpt: data.excerpt || '',
            coverImage: data.coverImage || '',
            status: data.status || 'draft',
            visibility: data.visibility || 'public',
            allowComments: data.allowComments !== false,
            featured: !!data.featured,
            category: data.category?._id || data.category || '',
            tags: (data.tags || []).map((x) => x._id || x),
            metaTitle: data.metaTitle || '',
            metaDescription: data.metaDescription || '',
            scheduledAt: data.scheduledAt ? data.scheduledAt.slice(0, 16) : '',
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  // Warn on leave if dirty
  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const saveDraft = useCallback(async (silent = false) => {
    const f = formRef.current;
    if (!f.title?.trim() && !f.content?.replace(/<[^>]*>/g, '').trim()) return;
    if (!silent) setSaving(true);
    try {
      const payload = {
        ...f,
        status: f.status === 'published' && !silent ? f.status : 'draft',
        category: f.category || undefined,
        scheduledAt: f.scheduledAt || undefined,
      };
      // silent autosave keeps published status if already published
      if (silent && f.status === 'published') payload.status = 'published';
      else if (silent) payload.status = 'draft';

      let currentId = postIdRef.current;
      if (currentId) {
        await api.put(`/posts/${currentId}`, payload);
      } else {
        const { data } = await api.post('/posts', { ...payload, status: 'draft' });
        currentId = data._id;
        postIdRef.current = data._id;
        navigate(`/editor/${data._id}`, { replace: true });
      }
      setDirty(false);
      setAutoSavedAt(new Date());
      if (!silent) setForm((prev) => ({ ...prev, status: payload.status }));
    } catch (err) {
      if (!silent) setError(err.response?.data?.message || 'Save failed');
    } finally {
      if (!silent) setSaving(false);
    }
  }, [navigate]);

  // Autosave every 20s when dirty
  useEffect(() => {
    if (!dirty) return;
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => saveDraft(true), 20000);
    return () => clearTimeout(autosaveTimer.current);
  }, [dirty, form, saveDraft]);

  const updateForm = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
  };

  const handlePublish = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        status: 'published',
        category: form.category || undefined,
        scheduledAt: form.scheduledAt || undefined,
      };
      if (id || postIdRef.current) {
        await api.put(`/posts/${id || postIdRef.current}`, payload);
      } else {
        await api.post('/posts', payload);
      }
      setDirty(false);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Publish failed');
    } finally {
      setSaving(false);
    }
  };

  const uploadCover = async (file) => {
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/posts/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateForm({ coverImage: data.url });
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    }
  };

  const createCategory = async () => {
    if (!newCat.trim()) return;
    try {
      const { data } = await api.post('/categories', { name: newCat.trim() });
      setCategories((c) => [...c, data]);
      updateForm({ category: data._id });
      setNewCat('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600">
            <ArrowLeft className="h-4 w-4" /> {t('dashboard')}
          </Link>
          {autoSavedAt && (
            <span className="text-xs text-slate-400">
              Brouillon auto · {autoSavedAt.toLocaleTimeString()}
            </span>
          )}
          {dirty && <span className="text-xs text-amber-600">Non enregistré</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setPreview(!preview)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Eye className="h-4 w-4" /> {preview ? t('edit') : t('preview')}
          </button>
          <button type="button" onClick={() => saveDraft(false)} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            <Save className="h-4 w-4" /> {t('saveDraft')}
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={saving || !form.title.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? t('saving') : t('publish')}
          </button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="space-y-5">
        <input
          type="text"
          placeholder={t('titlePlaceholder')}
          value={form.title}
          onChange={(e) => updateForm({ title: e.target.value })}
          className="w-full border-0 bg-transparent text-3xl font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none dark:text-white"
        />

        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-900">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">{t('coverImage')}</div>
          {form.coverImage ? (
            <div className="relative">
              <img src={form.coverImage} alt="" className="max-h-56 w-full rounded-xl object-cover" />
              <button type="button" onClick={() => updateForm({ coverImage: '' })} className="absolute right-2 top-2 rounded-lg bg-white/90 px-2 py-1 text-xs text-red-600 shadow">×</button>
            </div>
          ) : (
            <button type="button" onClick={() => coverRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-8 text-sm text-slate-500 hover:border-brand-300">
              <ImagePlus className="h-5 w-5" /> {t('uploadCover')}
            </button>
          )}
          <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => uploadCover(e.target.files?.[0])} />
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          <select value={form.category} onChange={(e) => updateForm({ category: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 dark:border-slate-600 dark:bg-slate-900">
            <option value="">{t('noCategory')}</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder={t('categoryName')} className="w-32 rounded-lg border border-slate-200 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900" />
            <button type="button" onClick={createCategory} className="rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-medium dark:bg-slate-800">{t('addCategory')}</button>
          </div>
          <select value={form.visibility} onChange={(e) => updateForm({ visibility: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 dark:border-slate-600 dark:bg-slate-900">
            <option value="public">{t('public')}</option>
            <option value="members">{t('membersOnly')}</option>
            <option value="private">{t('private')}</option>
          </select>
          <label className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <input type="checkbox" checked={form.allowComments} onChange={(e) => updateForm({ allowComments: e.target.checked })} />
            {t('commentsEnabled')}
          </label>
          <label className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <input type="checkbox" checked={form.featured} onChange={(e) => updateForm({ featured: e.target.checked })} />
            {t('featuredFlag')}
          </label>
          <label className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            Programmer
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => updateForm({ scheduledAt: e.target.value })}
              className="rounded-lg border border-slate-200 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-900"
            />
          </label>
        </div>

        <input
          type="text"
          placeholder={t('excerptPlaceholder')}
          value={form.excerpt}
          onChange={(e) => updateForm({ excerpt: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400 dark:border-slate-600 dark:bg-slate-900"
        />

        {/* SEO */}
        <details className="rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900">
          <summary className="cursor-pointer font-medium text-slate-700 dark:text-slate-300">SEO / partage</summary>
          <div className="mt-3 space-y-2">
            <input
              placeholder="Meta title"
              value={form.metaTitle}
              onChange={(e) => updateForm({ metaTitle: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-950"
            />
            <textarea
              placeholder="Meta description"
              value={form.metaDescription}
              onChange={(e) => updateForm({ metaDescription: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-950"
            />
          </div>
        </details>

        <RichEditor
          content={form.content}
          onChange={(html) => updateForm({ content: html })}
          editable={!preview}
        />

        <div>
          <label className="mb-2 block text-xs font-medium text-slate-500">{t('tags')}</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const selected = form.tags.includes(tag._id);
              return (
                <button
                  key={tag._id}
                  type="button"
                  onClick={() =>
                    updateForm({
                      tags: selected ? form.tags.filter((x) => x !== tag._id) : [...form.tags, tag._id],
                    })
                  }
                  className={`rounded-full px-3 py-1 text-xs font-medium ${selected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'}`}
                >
                  #{tag.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
