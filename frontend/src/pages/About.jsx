import { useLocale } from '../context/LocaleContext';

export default function About() {
  const { locale } = useLocale();
  const content = {
    en: {
      title: 'About NoteCraft',
      body: `NoteCraft is a modern note-taking and blogging platform built with the MERN stack. Write long-form notes, organize with categories and tags, embed images and videos, and share publicly or keep private.

We believe the best knowledge system is the one you actually use — simple structure, rich editing, and a clean reading experience.`,
    },
    fr: {
      title: 'À propos de NoteCraft',
      body: `NoteCraft est une plateforme moderne de notes et de blogs, construite avec le stack MERN. Rédigez des notes longues, organisez-les avec catégories et tags, intégrez images et vidéos, publiez ou gardez privé.

Nous pensons que le meilleur système de connaissance est celui que l’on utilise vraiment — structure simple, édition riche, lecture agréable.`,
    },
    es: {
      title: 'Acerca de NoteCraft',
      body: `NoteCraft es una plataforma moderna de notas y blogs construida con MERN. Escribe notas largas, organízalas con categorías y etiquetas, inserta imágenes y vídeos, publica o mantén privado.

Creemos que el mejor sistema de conocimiento es el que realmente usas.`,
    },
    'zh-TW': {
      title: '關於 NoteCraft',
      body: `NoteCraft 是以 MERN 堆疊打造的現代筆記與部落格平台。撰寫長文、以分類與標籤整理、插入圖片與影片，可公開發布或保持私人。

我們相信最好的知識系統，是你真的會持續使用的那一個。`,
    },
  };
  const c = content[locale] || content.en;
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-6 text-3xl font-bold text-slate-900 dark:text-white">{c.title}</h1>
      <div className="prose prose-slate dark:prose-invert whitespace-pre-line">{c.body}</div>
    </div>
  );
}
