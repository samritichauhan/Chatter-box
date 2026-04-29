# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Chatterbox** — a full-stack real-time chat application.

- `server/` — Node.js/Express backend (ESM modules, `"type": "module"`)
- `client/` — Frontend (React, likely Vite — no package.json yet)

## Server Commands

```bash
cd server
npm install
npm run dev      # nodemon server.js (development with auto-restart)
npm start        # node server.js (production)
```

No test runner is configured yet. No lint config found.

## Architecture

### Server (MVC + Socket.io)

The server follows a layered MVC pattern:

- `server.js` — entry point; mounts Express app and attaches Socket.io
- `config/` — DB connection (mongoose/MongoDB), env vars, Cloudinary config
- `models/` — Mongoose schemas (likely User, Message, Conversation)
- `routes/` — Express routers; map HTTP endpoints to controllers
- `controllers/` — business logic called by routes
- `middleware/` — JWT auth verification, rate limiting, input validation (express-validator), multer file upload
- `socket/` — Socket.io event handlers for real-time messaging (separate from Express routes)
- `utils/` — shared helpers (token generation, etc.)

**Key dependencies:**
- Auth: `jsonwebtoken` + `bcryptjs`, cookies via `cookie-parser`
- Media: `cloudinary` + `multer` for image/file uploads
- Security: `helmet`, `cors`, `express-rate-limit`
- Real-time: `socket.io`

### Client (React SPA)

- `src/pages/` — route-level page components
- `src/components/` — reusable UI components
- `src/hooks/` — custom React hooks
- `src/store/` — global state management (likely Zustand)
- `src/lib/` — API client utilities (axios instance, socket client setup)
- `src/styles/` — global CSS / Tailwind config

### Data Flow

HTTP requests → `routes/` → `middleware/` (auth, validation) → `controllers/` → `models/`

Real-time events → `socket/` handlers → emit to rooms/clients

## Environment Variables

The server uses `dotenv`. Expected `.env` variables (create `server/.env`):

```
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
PORT=
NODE_ENV=
CLIENT_URL=
```
