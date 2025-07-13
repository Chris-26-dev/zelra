# Zelra – Slack Clone

Zelra is a real-time, multi-workspace chat application inspired by Slack. It uses **Next.js 15**, **Convex** for backend logic and database, **React 19**, **TailwindCSS**, and **Radix UI** to build a seamless messaging experience.

## ✨ Features

- ✅ Authentication using Convex Auth middleware
- 🏢 Workspace management (create, join, update, delete)
- 📚 Channels (create, join, threaded conversations)
- 💬 Real-time messages and threads
- 🔄 Message reactions (toggle emoji reactions)
- 📎 Image uploads with Convex storage
- 🔐 Authentication middleware
- 📱 Responsive layout with mobile detection for confirmation hooks
- 🎨 Clean UI powered by Shadcn, Radix, Tailwind, Lucide


---

## 📦 Tech Stack

- **Frontend**: React 19, Next.js 15 App Router
- **Backend**: Convex Functions (`convex/`)
- **Auth**: Convex + Next.js Middleware
- **State**: Jotai, Local React state
- **Styling**: TailwindCSS + clsx + tailwind-merge
- **UI**: Radix UI, ShadCN-inspired
- **Editor**: Quill rich text editor
- **Realtime**: Convex subscriptions

---

## 🧠 Folder Structure

src/
├── app/ # Route handlers (Next.js App Router)
├── components/ # Shared UI components (Button, Dialog, etc.)
├── features/ # Domain features (auth, messages, workspaces, etc.)
│ ├── workspaces/
│ ├── channels/
│ ├── messages/
│ └── reactions/
├── hooks/ # Custom reusable hooks (usePanel, useQueryParam, etc.)
├── lib/ # Utilities (cn, classnames, etc.)
├── convex/ # Convex functions & data model


What I Learned:
Throughout the project, I learned a lot about both frontend and backend aspects:

Frontend:
-How to build a real-time chat app UI with optimistic updates.
-Structuring modular React hooks like useToggleReaction, useGenerateUploadUrl, etc.
-Managing complex query param logic without third-party libraries.

Backend:
-Writing Convex functions and schemas for workspaces, channels, messages, reactions, etc.
-Using Convex storage for secure file uploads via signed URLs.
-Understanding how Convex handles reactive data (subscriptions) and background tasks.
-Handling middleware-based auth redirects based on route matchers.

Other:
-Importance of writing custom reusable hooks (use-confirm, use-query-param, use-mobile, etc.)
-How to manage URL state manually with custom hooks.
-Confidence in building production-level UI with app router + middleware