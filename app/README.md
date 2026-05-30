# Full-Stack Next.js Application

Production-ready React application with real-time collaboration, authentication, and persistent storage.

## Features

- Design management (CRUD operations)
- Real-time collaboration via Socket.IO
- User authentication
- PostgreSQL database with Prisma
- Layer management
- Undo/redo history

## Tech Stack

**Frontend:** Next.js 16, React 19, TypeScript, TanStack Query, Tailwind CSS

**Backend:** Express.js, Socket.IO, PostgreSQL, Prisma

## Getting Started

```bash
# Install dependencies
npm install
cd server && npm install

# Setup database
cd server && npx prisma migrate dev

# Run servers
npm run dev                    # Frontend (Terminal 1)
cd server && npm run dev       # Backend (Terminal 2)
```

Open http://localhost:3000 and click "Open design board" from the home page.

## Structure

```
app/
├── design/          # Design board and editor
├── login/           # Authentication
├── components/      # Shared UI components
├── features/        # API client and queries
└── types/           # TypeScript definitions
```

## Integration

```typescript
import { Editor } from '@/editor-engine';

function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const editorRef = useRef<Editor>();

  useEffect(() => {
    if (canvasRef.current) {
      editorRef.current = new Editor(canvasRef.current);
    }
  }, []);

  return <canvas ref={canvasRef} />;
}
```

For a simpler example, see [Vanilla JavaScript implementation](../public/vanilla-app/README.md).
