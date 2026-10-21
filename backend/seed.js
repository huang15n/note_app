import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Category from './models/Category.js';
import Tag from './models/Tag.js';
import Post from './models/Post.js';
import connectDB from './config/db.js';

dotenv.config();

const seed = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Tag.deleteMany({}),
    Post.deleteMany({}),
  ]);

  console.log('Creating users...');
  const admin = await User.create({
    name: 'Admin NoteCraft',
    email: 'admin@notecraft.app',
    password: 'admin123456',
    role: 'admin',
    bio: 'Platform administrator',
  });

  const author1 = await User.create({
    name: 'Alice Martin',
    email: 'alice@notecraft.app',
    password: 'author123456',
    role: 'author',
    bio: 'Writer & productivity enthusiast. Sharing thoughts on notes, systems and creativity.',
  });

  const author2 = await User.create({
    name: 'Bob Chen',
    email: 'bob@notecraft.app',
    password: 'author123456',
    role: 'author',
    bio: 'Software engineer who loves second-brain systems and evergreen notes.',
  });

  const subscriber = await User.create({
    name: 'Claire Reader',
    email: 'claire@notecraft.app',
    password: 'reader123456',
    role: 'subscriber',
    bio: 'Just here to read and comment.',
  });

  console.log('Creating categories & tags...');
  const catProductivity = await Category.create({
    name: 'Productivity',
    description: 'Systems, habits and tools to get things done',
    color: '#8b5cf6',
  });
  const catTech = await Category.create({
    name: 'Technology',
    description: 'Software, tools and digital life',
    color: '#06b6d4',
  });
  const catPersonal = await Category.create({
    name: 'Personal',
    description: 'Reflections, journals and life notes',
    color: '#f59e0b',
  });
  const catLearning = await Category.create({
    name: 'Learning',
    description: 'Knowledge management and lifelong learning',
    color: '#10b981',
  });

  const tagPKM = await Tag.create({ name: 'PKM' });
  const tagZettel = await Tag.create({ name: 'Zettelkasten' });
  const tagMarkdown = await Tag.create({ name: 'Markdown' });
  const tagReact = await Tag.create({ name: 'React' });
  const tagHabits = await Tag.create({ name: 'Habits' });

  console.log('Creating sample posts...');
  await Post.create([
    {
      title: 'Building a Second Brain with NoteCraft',
      content: `<h1>Building a Second Brain with NoteCraft</h1>
<p>A second brain is not just another note-taking app. It is a <strong>trusted system</strong> where you capture ideas, refine them, and resurface them when needed.</p>
<h2>Why most note apps fail</h2>
<p>Most people collect notes but never connect them. The result is a digital junk drawer.</p>
<p>With NoteCraft you can:</p>
<ul>
<li>Write long-form evergreen notes</li>
<li>Organize with categories and tags</li>
<li>Publish publicly or keep private</li>
<li>Invite comments and collaboration</li>
</ul>
<h2>Getting started</h2>
<ol>
<li>Create an author account</li>
<li>Write your first note</li>
<li>Add a category and a few tags</li>
<li>Publish when ready</li>
</ol>
<blockquote><p>"The best way to organize your notes is the way you will actually use."</p></blockquote>
<p>Happy note-taking!</p>`,
      excerpt: 'How to turn scattered ideas into a reliable second brain using a modern note CMS.',
      author: author1._id,
      category: catLearning._id,
      tags: [tagPKM._id, tagZettel._id],
      status: 'published',
      featured: true,
      allowComments: true,
      publishedAt: new Date(),
    },
    {
      title: 'The Power of Markdown for Long-form Writing',
      content: `# The Power of Markdown

Markdown remains one of the best formats for writing that needs to last.

## Benefits

- Portable
- Readable in plain text
- Easy to version control
- Works everywhere

In NoteCraft the editor supports full Markdown so your content stays clean and future-proof.`,
      excerpt: 'Why Markdown is still the best format for durable writing.',
      author: author2._id,
      category: catTech._id,
      tags: [tagMarkdown._id],
      status: 'published',
      featured: true,
      publishedAt: new Date(Date.now() - 86400000),
    },
    {
      title: 'Five Habits of Highly Effective Note-Takers',
      content: `# Five Habits

1. **Capture everything** – but process regularly
2. **Link ideas** instead of filing them in deep folders
3. **Review weekly**
4. **Write for future you**
5. **Publish or share** selected notes

These habits compound over time.`,
      excerpt: 'Simple habits that turn note-taking into a superpower.',
      author: author1._id,
      category: catProductivity._id,
      tags: [tagHabits._id, tagPKM._id],
      status: 'published',
      publishedAt: new Date(Date.now() - 172800000),
    },
    {
      title: 'Draft: My private thinking space',
      content: 'This is a private draft only visible to the author and admins.',
      excerpt: 'Work in progress...',
      author: author2._id,
      category: catPersonal._id,
      status: 'draft',
      visibility: 'private',
    },
  ]);

  console.log('Seed completed successfully!');
  console.log('\nDemo accounts:');
  console.log('  Admin      → admin@notecraft.app / admin123456');
  console.log('  Author     → alice@notecraft.app / author123456');
  console.log('  Author     → bob@notecraft.app / author123456');
  console.log('  Subscriber → claire@notecraft.app / reader123456');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
