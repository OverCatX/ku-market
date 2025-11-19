# 🛒 KU Market

An online marketplace platform for Kasetsart University students to buy and sell items within the campus community.

![Backend Tests](https://img.shields.io/badge/backend%20tests-passing-brightgreen)
![Frontend Lint](https://img.shields.io/badge/frontend%20lint-passing-brightgreen)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)](https://www.mongodb.com/)

## ✨ Features

- **Authentication** - Email validation (@ku.th users, @ku.ac.th admins), OTP password reset, identity verification
- **Marketplace** - Browse, search, filter items. Create branded shops with custom categories
- **Payments** - Cash, PromptPay QR, Bank Transfer with instant QR generation
- **Delivery** - Pickup at meetup points or home delivery with interactive maps
- **Communication** - Real-time notifications, live chat between buyers/sellers
- **Orders** - Two-step confirmation workflow, complete order tracking
- **Admin Panel** - Dashboard, verification management, shop moderation, meetup preset manager

## Quick Start

### 🐳 Docker

```bash
git clone https://github.com/OverCatX/ku-market.git
cd ku-market

cp .env.example backend/.env
cp .env.example frontend/.env.local
# Edit backend/.env and frontend/.env.local with your credentials

docker-compose up -d
docker exec -it ku-market-backend npm run bootstrap-admin
```

**Access:** Frontend http://localhost:3000 | Backend http://localhost:8080

### Manual

```bash
git clone https://github.com/OverCatX/ku-market.git
cd ku-market

# Backend
cd backend && cp ../.env.example .env
npm install && npm run dev

# Frontend (new terminal)
cd frontend && cp ../.env.example .env.local
npm install && npm run dev
```

**Full guide:** [Installation Guide](docs/INSTALLATION.md)

## 📚 Documentation

- [Installation Guide](docs/INSTALLATION.md) - Setup instructions
- [User Guide](docs/USER_GUIDE.md) - How to use the platform
- [API Documentation](docs/API.md) - API reference
- [Project Wiki](https://github.com/OverCatX/ku-market/wiki) - Project overview

## Tech Stack

**Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS  
**Backend:** Node.js, Express, TypeScript, MongoDB  
**Auth:** JWT, bcrypt | **Storage:** Cloudinary

## Important Notes

- Email: `@ku.th` for users, `@ku.ac.th` for admins
- Identity verification required before checkout
- Admin account: `npm run bootstrap-admin`
- Password reset: OTP via email (60 seconds expiry)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
