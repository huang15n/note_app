import { useState } from 'react';
import { useLocale } from '../context/LocaleContext';

export default function Contact() {
  const { t, locale } = useLocale();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const title = { en: 'Contact', fr: 'Contact', es: 'Contacto', 'zh-TW': '聯絡我們' }[locale] || 'Contact';

  const handleSubmit = (e) => {
    e.preventDefault();
    // Demo: no backend mail — show success
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <h1 className="mb-6 text-3xl font-bold text-slate-900 dark:text-white">{title}</h1>
      {sent ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          ✓ Message reçu (démo). Nous vous répondrons bientôt.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <div>
            <label className="mb-1 block text-sm font-medium">{t('name')}</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-950" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('email')}</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-950" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Message</label>
            <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-950" />
          </div>
          <button type="submit" className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            Envoyer
          </button>
        </form>
      )}
    </div>
  );
}
