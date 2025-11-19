# KU Market

An online marketplace platform for Kasetsart University students to buy and sell items within the campus community.

![Backend Tests](https://img.shields.io/badge/backend%20tests-passing-brightgreen)
![Frontend Lint](https://img.shields.io/badge/frontend%20lint-passing-brightgreen)[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)](https://www.mongodb.com/)

## 🎯 Features

- **Authentication** - KU email required (@ku.th)
- **Identity Verification** - Student ID or national ID verification
- **Marketplace** - Buy and sell items within campus
- **Seller Shops** - Create and manage your own shop
- **User Profiles** - Manage personal information and orders
- **Admin Panel** - Approve verifications and shops

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/OverCatX/ku-market.git
cd ku-market

# Backend
cd backend && npm install && npm run dev

# Frontend (in new terminal)
cd frontend && npm install && npm run dev
```

**Frontend:** http://localhost:3000  
**Backend:** http://localhost:8080

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

- Email must be `@ku.th`
- Identity verification required before checkout
- Admin account creation: `npm run bootstrap-admin`

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
