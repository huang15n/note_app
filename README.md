# NoteCraft

**Universal note-taking & blogging CMS** built with the **MERN** stack  
(MongoDB · Express · React · Node.js)

Inspired by WordPress-style content management: authors, posts, drafts, categories, tags, comments, roles, and a polished public reading experience.

---

## Features

| Area | Capabilities |
|------|--------------|
| **Auth & roles** | Register / Login (JWT), roles: `admin`, `author`, `subscriber` |
| **Posts / Notes** | Markdown editor, drafts & publish, public / members / private visibility, featured flag, read time, views |
| **Taxonomy** | Categories (with color) + Tags |
| **Comments** | Nested-ready comments with likes support, enable/disable per post |
| **Authors** | Public author pages, profile bio & website |
| **Dashboard** | Manage your notes, filter by status, quick edit/delete |
| **UI** | Modern React + Tailwind, responsive |
| **Rich editor** | TipTap WYSIWYG: H1–H5, paragraph, bold, lists, **images**, **YouTube/Vimeo videos** |
| **i18n** | English · Français · Español · 繁體中文 |
| **Categories** | Create & assign from the editor |

---

## Quick start

### Prerequisites

- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env if needed (MONGODB_URI, JWT_SECRET, …)

npm install
npm run seed          # creates demo users + sample posts
npm run dev           # http://localhost:5001
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev           # http://localhost:5173
```

Open **http://localhost:5173**

### Demo accounts (after seed)

| Role       | Email                   | Password      |
|------------|-------------------------|---------------|
| Admin      | admin@notecraft.app     | admin123456   |
| Author     | alice@notecraft.app     | author123456  |
| Author     | bob@notecraft.app       | author123456  |
| Subscriber | claire@notecraft.app    | reader123456  |

---

## Project structure

```
notecraft/
├── backend/
│   ├── config/db.js
│   ├── models/          # User, Post, Comment, Category, Tag
│   ├── routes/          # auth, posts, comments, categories, tags, users
│   ├── middleware/      # JWT auth, upload
│   ├── seed.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/  # Layout, ProtectedRoute
│   │   ├── context/     # AuthContext
│   │   ├── pages/       # Home, PostDetail, Dashboard, Editor, …
│   │   └── …
│   └── …
└── README.md
```

---

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login → JWT |
| GET  | `/api/auth/me` | Current user |
| GET  | `/api/posts` | List (search, category, tag, featured, pagination) |
| GET  | `/api/posts/:slug` | Single post |
| POST | `/api/posts` | Create (author/admin) |
| PUT  | `/api/posts/:id` | Update |
| DELETE | `/api/posts/:id` | Delete |
| GET/POST | `/api/comments` | List / create comments |
| GET/POST | `/api/categories` | Categories |
| GET/POST | `/api/tags` | Tags |
| GET  | `/api/users/:id` | Public author profile |

---

## Environment variables (backend)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/notecraft
JWT_SECRET=change_this_to_a_long_random_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
UPLOAD_DIR=uploads
```

---

## Tech stack

- **MongoDB** + Mongoose
- **Express** 4
- **React** 18 + Vite + React Router
- **Tailwind CSS** 4
- **JWT** authentication
- **Markdown** (react-markdown + remark-gfm)
- **lucide-react** icons

---

## License

MIT — feel free to adapt for your own projects.
