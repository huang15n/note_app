import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useEffect, useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  ImageIcon,
  Youtube as YoutubeIcon,
  Undo,
  Redo,
  Quote,
  Code2,
  Table as TableIcon,
  Minus,
  Link as LinkIcon,
} from 'lucide-react';
import api from '../../api/client';
import { useLocale } from '../../context/LocaleContext';

const lowlight = createLowlight(common);

export default function RichEditor({ content, onChange, editable = true }) {
  const { t } = useLocale();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
      }),
      Heading.configure({ levels: [1, 2, 3, 4, 5] }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { class: 'rounded-xl max-w-full my-4' },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: 'rounded-xl overflow-hidden my-4 aspect-video w-full',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-brand-600 underline' },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: { class: 'rounded-xl bg-slate-900 text-slate-100 p-4 text-sm overflow-x-auto my-4' },
      }),
      Placeholder.configure({ placeholder: t('editorPlaceholder') }),
    ],
    content: content || '',
    editable,
    onUpdate: ({ editor: ed }) => onChange?.(ed.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none min-h-[320px] px-4 py-3 focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (content !== undefined && content !== current) {
      editor.commands.setContent(content || '', false);
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) editor.setEditable(editable);
  }, [editable, editor]);

  if (!editor) return null;

  const setBlock = (type) => {
    if (type === 'paragraph') editor.chain().focus().setParagraph().run();
    else editor.chain().focus().toggleHeading({ level: Number(type.replace('h', '')) }).run();
  };

  const currentBlock = () => {
    for (let level = 1; level <= 5; level++) {
      if (editor.isActive('heading', { level })) return `h${level}`;
    }
    return 'paragraph';
  };

  const insertImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post('/posts/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const insertVideo = () => {
    const url = window.prompt(t('videoUrlPrompt'));
    if (url) editor.commands.setYoutubeVideo({ src: url });
  };

  const insertLink = () => {
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('URL', prev || 'https://');
    if (url === null) return;
    if (url === '') editor.chain().focus().extendMarkRange('link').unsetLink().run();
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const btn = (active) =>
    `rounded-lg p-2 transition ${
      active ? 'bg-brand-100 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {editable && (
        <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-2 dark:border-slate-700 dark:bg-slate-800">
          <select
            value={currentBlock()}
            onChange={(e) => setBlock(e.target.value)}
            className="mr-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="paragraph">{t('paragraph')}</option>
            <option value="h1">{t('heading1')}</option>
            <option value="h2">{t('heading2')}</option>
            <option value="h3">{t('heading3')}</option>
            <option value="h4">{t('heading4')}</option>
            <option value="h5">{t('heading5')}</option>
          </select>

          <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-600" />

          <button type="button" className={btn(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()} title={t('bold')}>
            <Bold className="h-4 w-4" />
          </button>
          <button type="button" className={btn(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()} title={t('italic')}>
            <Italic className="h-4 w-4" />
          </button>
          <button type="button" className={btn(editor.isActive('strike'))} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
            <Strikethrough className="h-4 w-4" />
          </button>
          <button type="button" className={btn(editor.isActive('code'))} onClick={() => editor.chain().focus().toggleCode().run()} title="Inline code">
            <Code2 className="h-4 w-4" />
          </button>

          <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-600" />

          <button type="button" className={btn(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()} title={t('bulletList')}>
            <List className="h-4 w-4" />
          </button>
          <button type="button" className={btn(editor.isActive('orderedList'))} onClick={() => editor.chain().focus().toggleOrderedList().run()} title={t('orderedList')}>
            <ListOrdered className="h-4 w-4" />
          </button>
          <button type="button" className={btn(editor.isActive('blockquote'))} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote">
            <Quote className="h-4 w-4" />
          </button>
          <button type="button" className={btn(editor.isActive('codeBlock'))} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block">
            <Code2 className="h-4 w-4" />
          </button>

          <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-600" />

          <button type="button" className={btn(false)} onClick={insertTable} title="Table">
            <TableIcon className="h-4 w-4" />
          </button>
          <button type="button" className={btn(false)} onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
            <Minus className="h-4 w-4" />
          </button>
          <button type="button" className={btn(editor.isActive('link'))} onClick={insertLink} title="Link">
            <LinkIcon className="h-4 w-4" />
          </button>

          <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-600" />

          <button type="button" className={btn(false)} onClick={() => fileRef.current?.click()} disabled={uploading} title={t('insertImage')}>
            <ImageIcon className="h-4 w-4" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => insertImage(e.target.files?.[0])} />
          <button type="button" className={btn(false)} onClick={insertVideo} title={t('insertVideo')}>
            <YoutubeIcon className="h-4 w-4" />
          </button>

          <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-600" />

          <button type="button" className={btn(false)} onClick={() => editor.chain().focus().undo().run()}>
            <Undo className="h-4 w-4" />
          </button>
          <button type="button" className={btn(false)} onClick={() => editor.chain().focus().redo().run()}>
            <Redo className="h-4 w-4" />
          </button>

          {uploading && <span className="ml-2 text-xs text-brand-600">{t('uploading')}</span>}
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
