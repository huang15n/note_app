import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-slate-200">404</h1>
      <p className="mt-2 text-lg text-slate-600">Page not found</p>
      <Link to="/" className="mt-6 text-brand-600 font-medium hover:underline">← Back home</Link>
    </div>
  );
}
