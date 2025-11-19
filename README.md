# KU Market

An online marketplace platform for Kasetsart University students to buy and sell items within the campus community.

![Backend Tests](https://img.shields.io/badge/backend%20tests-passing-brightgreen)
![Frontend Lint](https://img.shields.io/badge/frontend%20lint-passing-brightgreen)[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)](https://www.mongodb.com/)

## 🎯 Features

### 🔐 Security & Authentication

- **Smart Email Validation** - Strict domain enforcement (@ku.th for users, @ku.ac.th for admins)
- **OTP Password Reset** - Secure 60-second OTP verification via email
- **Identity Verification** - Multi-document support (Student ID / National ID) with admin approval

### 🛒 Marketplace & Commerce

- **Full-Featured Marketplace** - Browse, search, and filter thousands of items
- **Seller Shops** - Create your own branded shop with custom categories
- **Smart Cart System** - Real-time inventory management and quantity controls
- **Advanced Order Management** - Two-step confirmation workflow for secure transactions

### 💳 Payment & Delivery

- **Multiple Payment Methods** - Cash, PromptPay QR code, Bank Transfer
- **QR Code Integration** - Instant PromptPay QR generation for seamless payments
- **Flexible Delivery** - Pickup at predefined meetup points or home delivery
- **Interactive Maps** - Visual location picker with static map display

### 👥 User Experience

- **Real-time Notifications** - Instant updates for orders, messages, and verifications
- **Live Chat System** - Direct messaging between buyers and sellers
- **Order Tracking** - Complete order lifecycle with status updates
- **Profile Management** - Comprehensive user dashboard with order history

### ⚙️ Admin Power Tools

- **Centralized Dashboard** - System-wide statistics and analytics
- **Verification Management** - Streamlined document review and approval
- **Shop Moderation** - Complete shop application workflow
- **Meetup Preset Manager** - CRUD operations for pickup locations
- **User Management** - Role-based access control and user administration

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
