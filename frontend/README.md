# KU Market - Frontend

Next.js 15 frontend application for KU Market.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Environment

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE=http://localhost:8080
```

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm start           # Start production server
npm run lint         # Check code quality
```

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion

## Documentation

For complete documentation:

- **[Installation Guide](../docs/INSTALLATION.md)**
- **[User Guide](../docs/USER_GUIDE.md)**
- **[Contributing Guide](../docs/CONTRIBUTING.md)**
- **[Project Wiki](https://github.com/OverCatX/ku-market/wiki)**

## Troubleshooting

**Port in use:**

```bash
npx kill-port 3000
```

**Module not found:**

```bash
rm -rf node_modules .next && npm install
```

---

For more details, see main [README](../README.md)
