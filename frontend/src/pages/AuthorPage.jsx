import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../api/client';

export default function AuthorPage() {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [uRes, pRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get('/posts', { params: { author: id, limit: 20 } }),
        ]);
        setAuthor(uRes.data);
        setPosts(pRes.data.posts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!author) {
    return <div className="py-20 text-center text-slate-500">Author not found</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-10 flex items-start gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 text-2xl font-bold">
          {author.name?.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{author.name}</h1>
          <p className="text-sm text-slate-500 capitalize mt-0.5">{author.role} · {author.postsCount || posts.length} posts</p>
          {author.bio && <p className="mt-3 text-slate-600">{author.bio}</p>}
          {author.website && (
            <a href={author.website} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-brand-600 hover:underline">
              {author.website}
            </a>
          )}
        </div>
      </div>

      <h2 className="text-lg font-semibold text-slate-900 mb-4">Published notes</h2>
      <div className="space-y-3">
        {posts.map((post) => (
          <Link
            key={post._id}
            to={`/post/${post.slug}`}
            className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-300 hover:shadow-sm transition"
          >
            <h3 className="font-medium text-slate-900">{post.title}</h3>
            <p className="text-sm text-slate-500 mt-1 line-clamp-1">{post.excerpt}</p>
            <p className="text-xs text-slate-400 mt-2">
              {post.publishedAt && format(new Date(post.publishedAt), 'MMM d, yyyy')} · {post.readTime} min
            </p>
          </Link>
        ))}
        {posts.length === 0 && <p className="text-slate-400 text-sm">No published posts yet.</p>}
      </div>
    </div>
  );
}
