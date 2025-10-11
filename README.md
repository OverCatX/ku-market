# KU Market 🛒

A full-stack marketplace platform for Kasetsart University students to buy and sell items within the campus community.

## 🚀 Features

### Core Functionality

- **User Authentication**: Secure login/signup with KU email validation
- **Marketplace**: Browse, search, and filter items with pagination
- **Item Management**: Create, update, and delete product listings
- **Image Upload**: Multiple photo support with Cloudinary integration
- **User Profiles**: Manage personal information and view order history
- **Role-based Access**: Buyer and Seller roles with store request functionality

### Technical Features

- **Responsive Design**: Mobile-first approach with modern UI
- **Real-time Search**: Debounced search with advanced filtering
- **Image Optimization**: Cloudinary integration for efficient image handling
- **Type Safety**: Full TypeScript implementation
- **API Documentation**: RESTful API with proper error handling
- **Testing**: Comprehensive test coverage for both frontend and backend

## 🏗️ Tech Stack

### Frontend

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: React Hooks
- **HTTP Client**: Fetch API with custom config
- **Testing**: Jest + React Testing Library

### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **File Upload**: Multer + Cloudinary
- **Validation**: Custom middleware validators
- **Testing**: Jest + Supertest

### DevOps

- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint + Prettier
- **Version Control**: Git with feature branch workflow

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- MongoDB
- Docker (optional)

### Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/ku-market.git
   cd ku-market
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your environment variables
   npm run dev
   ```

3. **Frontend Setup**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Using Docker (Recommended)**
   ```bash
   docker-compose up -d
   ```

### Environment Variables

#### Backend (.env)

```env
JWT_SECRET=your-secret-key
MONGO_URI=mongodb://localhost:27017/ku-market
PORT=5000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Frontend (.env.local)

```env
NEXT_PUBLIC_API_BASE=http://localhost:5000/api
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test              # Unit tests
npm run test:watch    # Watch mode
```

### Frontend Tests

```bash
cd frontend
npm test              # Unit tests
npm run test:watch    # Watch mode
```

### Integration Tests

```bash
docker-compose up -d
# Run integration tests
```

## 📚 API Documentation

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Profile Management

- `GET /api/profile/view` - Get user profile
- `PUT /api/profile/update` - Update user profile

### Items

- `GET /api/items/list` - List items with pagination/filtering
- `GET /api/items/:id` - Get item details
- `POST /api/items/create` - Create new item
- `PATCH /api/items/update/:id` - Update item
- `DELETE /api/items/delete/:id` - Delete item

## 🎨 UI Features

- Modern responsive design with KU green theme
- Smooth animations and hover effects
- Advanced search and filtering
- Mobile-first approach

## 🔧 Development

- **Code Quality**: ESLint + Prettier + TypeScript
- **Git Workflow**: Feature branches → PR → Review → Merge
- **CI/CD**: Automated testing and deployment with GitHub Actions

## 🚀 Deployment

```bash
# Build and deploy
npm run build
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, create an issue in the repository.

---

**Built with ❤️ for Kasetsart University students**
