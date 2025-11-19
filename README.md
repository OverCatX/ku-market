# KU Market

An online marketplace platform for Kasetsart University students to buy and sell items within the campus community.

![Backend Tests](https://img.shields.io/badge/backend%20tests-passing-brightgreen)
![Frontend Lint](https://img.shields.io/badge/frontend%20lint-passing-brightgreen)[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)](https://www.mongodb.com/)

## 🎯 Features

- **Authentication** - Email validation (@ku.th users, @ku.ac.th admins), OTP password reset, identity verification
- **Marketplace** - Browse, search, filter items. Create branded shops with custom categories
- **Payments** - Cash, PromptPay QR, Bank Transfer with instant QR generation
- **Delivery** - Pickup at meetup points or home delivery with interactive maps
- **Communication** - Real-time notifications, live chat between buyers/sellers
- **Orders** - Two-step confirmation workflow, complete order tracking
- **Admin Panel** - Dashboard, verification management, shop moderation, meetup preset manager

## 🚀 Quick Start

### Docker (Recommended)

```bash
git clone https://github.com/OverCatX/ku-market.git
cd ku-market

# Setup environment
cp .env.example backend/.env
cp .env.example frontend/.env.local
# Edit backend/.env (Backend section) and frontend/.env.local (Frontend section) with your credentials

# Start services
docker-compose up -d

# Create admin account
docker exec -it ku-market-backend npm run bootstrap-admin
```

**Access:** Frontend http://localhost:3000 | Backend http://localhost:8080

### Manual Installation

```bash
git clone https://github.com/OverCatX/ku-market.git
cd ku-market

# Backend
cd backend && cp ../.env.example .env
# Edit .env (Backend section) with your credentials
npm install && npm run dev

# Frontend (new terminal)
cd frontend && cp ../.env.example .env.local
# Edit .env.local (Frontend section) with your credentials
npm install && npm run dev
```

**Access:** Frontend http://localhost:3000 | Backend http://localhost:8080

📖 **Full setup guide:** [Installation Guide](docs/INSTALLATION.md)

## 📚 Documentation

- **[Installation Guide](docs/INSTALLATION.md)** - Setup instructions
- **[User Guide](docs/USER_GUIDE.md)** - How to use the platfor
- **[API Documentation](docs/API.md)** - API reference
- **[Project Wiki](https://github.com/OverCatX/ku-market/wiki)** - Project overview

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript, MongoDB
- **Auth:** JWT, bcrypt
- **Storage:** Cloudinary

## Project Structure

```
ku-market/
├── frontend/          # Next.js frontend
├── backend/           # Express backend
├── docs/              # Documentation
└── README.md          # This file
```

## Important Notes

- Email must be `@ku.th` for regular users, `@ku.ac.th` for admins
- Identity verification required before checkout
- Admin account creation: `npm run bootstrap-admin`
- Password reset uses OTP sent via email (60 seconds expiry)

## Testing

```bash
# Backend tests
cd backend && npm test

# Frontend lint
cd frontend && npm run lint
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️**

For more information, visit our [Wiki](https://github.com/OverCatX/ku-market/wiki)
