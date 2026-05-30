# Backend Server

Express + TypeScript backend with Prisma, PostgreSQL, and Socket.IO.

## Requirements

- Node.js 20+
- PostgreSQL
- npm

## Setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mydb
FRONTEND_URL=http://localhost:3000
```

Run migrations:

```bash
npx prisma migrate dev
```

Start the server:

```bash
npm run dev
```

Server URL:

```txt
http://localhost:4000
```

## Env Variables

- `DATABASE_URL` - PostgreSQL connection string
- `FRONTEND_URL` - allowed frontend URL for CORS

## Scripts

- `npm run dev` - start in development
- `npm run build` - build TypeScript
- `npm start` - run production server
