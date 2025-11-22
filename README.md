# 🛒 KU Market

An online marketplace platform for Kasetsart University students to buy and sell items within the campus community.

[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)](https://www.mongodb.com/)

## ✨ Features

- **Authentication** - Email validation (@ku.th users, @ku.ac.th admins), Google OAuth login, OTP password reset, identity verification
- **Marketplace** - Browse, search, filter items. Create branded shops with custom categories
- **Payments** - Cash, PromptPay QR, Bank Transfer with instant QR generation and comprehensive payment logging
- **Delivery** - Pickup at meetup points or home delivery with interactive maps
- **Communication** - Real-time notifications, live chat between buyers/sellers
- **Orders** - Two-step confirmation workflow, complete order tracking with detailed status updates
- **Reviews & Ratings** - Product reviews with verified purchase badges, rate limiting (5 reviews/hour), and anti-abuse protection
- **Admin Panel** - Dashboard, verification management, shop moderation, meetup preset manager, comprehensive activity logging
- **Activity Logging** - Complete audit trail of all user, seller, and admin actions with IP tracking and timestamps for security and non-repudiation
- **Security & Compliance** - Rate limiting, identity verification, payment transaction logging, and comprehensive activity monitoring

## Prerequisites

- **Node.js** 20.x or higher
- **MongoDB** 6.x or higher (or use Docker)
- **Docker & Docker Compose** (optional, for containerized setup)
- **npm** or **yarn**

## Build & Run

### Option 1: Docker (Recommended)

**Step 1: Clone the repository**

```bash
git clone https://github.com/OverCatX/ku-market.git
cd ku-market
```

**Step 2: Configure environment variables**

```bash
# Copy environment template
cp .env.example backend/.env
cp .env.example frontend/.env.local

# Edit backend/.env and frontend/.env.local
# Minimum required: MONGO_URL, JWT_SECRET
```

**Step 3: Build and start services**

```bash
docker-compose up -d --build
```

**Step 4: Create admin account**

```bash
docker exec -it ku-market-backend npm run bootstrap-admin
```

**Access:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

**Stop services:**

```bash
docker-compose down
```

### Option 2: Manual Setup

**Step 1: Clone and install dependencies**

```bash
git clone https://github.com/OverCatX/ku-market.git
cd ku-market
```

**Step 2: Setup Backend**

```bash
cd backend
cp ../.env.example .env
# Edit .env with your MongoDB connection and other credentials
npm install
npm run build
```

**Step 3: Setup Frontend**

```bash
cd ../frontend
cp ../.env.example .env.local
# Edit .env.local with your API URL and other credentials
npm install
npm run build
```

**Step 4: Start MongoDB** (if not using Docker)

```bash
# Make sure MongoDB is running on localhost:27017
# Or update MONGO_URL in backend/.env
```

**Step 5: Run the application**

```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

**Step 6: Create admin account**

```bash
cd backend
npm run bootstrap-admin
```

**Access:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Environment Variables

**Backend (.env):**

- `MONGO_URL` - MongoDB connection string (required)
- `JWT_SECRET` - Secret key for JWT tokens (required)
- `PORT` - Backend server port (default: 5000)
- `CORS_ORIGIN` - Comma-separated list of allowed origins (e.g., `https://ku-market-mu.vercel.app,http://localhost:3000`)
- `RESEND_API_KEY` - Resend API key for email sending (required)
- `RESEND_FROM_EMAIL` - Email address to send from (use `onboarding@resend.dev` for testing)
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- See `.env.example` or `docs/INSTALLATION.md` for complete list

**Frontend (.env.local):**

- `NEXT_PUBLIC_API_BASE` - Backend API URL (default: http://localhost:8080)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- See `.env.example` or `docs/INSTALLATION.md` for complete list

## Development

**Run tests:**

```bash
# Frontend
cd frontend && npm test

# Backend
cd backend && npm test
```

**Lint code:**

```bash
# Frontend
cd frontend && npm run lint

# Backend
cd backend && npm run lint
```

## Tech Stack

**Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS  
**Backend:** Node.js, Express, TypeScript, MongoDB  
**Auth:** JWT, bcrypt | **Storage:** Cloudinary

## 📚 Documentation

- [Installation Guide](docs/INSTALLATION.md) - Detailed setup instructions
- [User Guide](docs/USER_GUIDE.md) - How to use the platform
- [API Documentation](docs/API.md) - API reference
- [Code Guidelines](docs/CODE_GUIDELINES.md) - Performance optimization techniques and coding standards
- [Frontend Project Structure](frontend/PROJECT_STRUCTURE.md) - Frontend architecture
- [Backend Project Structure](backend/PROJECT_STRUCTURE.md) - Backend architecture

**Interactive Guide:** Visit `/guide` in the application for a visual, step-by-step guide with role-specific instructions (Buyer, Seller, Admin).

## Important Notes

- Email: `@ku.th` for users, `@ku.ac.th` for admins
- Google OAuth: Only `@ku.th` emails are accepted for Google login
- Identity verification required before checkout
- Admin account: Run `npm run bootstrap-admin` in backend directory
- Password reset: OTP via email (60 seconds expiry)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
