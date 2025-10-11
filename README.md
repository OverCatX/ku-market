# KU Market 🛒

A full-stack marketplace platform for Kasetsart University students to buy and sell items within the campus community.

## ✨ Features

- **Authentication**: Secure login/signup with KU email validation
- **Marketplace**: Browse, search, and filter items with pagination
- **Item Management**: Create, update, and delete listings with multiple image support
- **User Profiles**: Personal information management and order history
- **Role-based Access**: Buyer and Seller roles with store request functionality
- **Responsive Design**: Mobile-first with modern UI and smooth animations
- **Type Safety**: Full TypeScript implementation across frontend and backend

## 🏗️ Tech Stack

**Frontend:** Next.js 14, Tailwind CSS, TypeScript, Framer Motion  
**Backend:** Node.js, Express, MongoDB, JWT, Cloudinary  
**DevOps:** Docker, GitHub Actions

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB
- Docker (optional)

### Installation

```bash
# Clone repository
git clone https://github.com/OverCatX/ku-market.git
cd ku-market

# Backend setup
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend setup (in new terminal)
cd frontend
npm install
npm run dev

# Or use Docker (Recommended)
docker-compose up -d
```

### Environment Variables

**Backend (.env)**
```env
JWT_SECRET=your-secret-key
MONGO_URI=mongodb://localhost:27017/ku-market
PORT=5000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_BASE=http://localhost:5000/api
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📚 Documentation

For detailed documentation, please visit our [Wiki](https://github.com/OverCatX/ku-market/wiki):

# - [API Documentation](https://github.com/OverCatX/ku-market/wiki/API-Documentation)
# - [Setup Guide](https://github.com/OverCatX/ku-market/wiki/Setup-Guide)
# - [Architecture](https://github.com/OverCatX/ku-market/wiki/Architecture)
# - [Contributing Guidelines](https://github.com/OverCatX/ku-market/wiki/Contributing)
## 📝 License

MIT License - see the [LICENSE](LICENSE) file for details.

---
