import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Articles from './pages/Articles';
import CategoriesPage from './pages/CategoriesPage';
import PostDetail from './pages/PostDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Profile from './pages/Profile';
import AuthorPage from './pages/AuthorPage';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="articles" element={<Articles />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="post/:slug" element={<PostDetail />} />
        <Route path="author/:id" element={<AuthorPage />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute roles={['admin', 'author', 'subscriber']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="editor"
          element={
            <ProtectedRoute roles={['admin', 'author']}>
              <Editor />
            </ProtectedRoute>
          }
        />
        <Route
          path="editor/:id"
          element={
            <ProtectedRoute roles={['admin', 'author']}>
              <Editor />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
