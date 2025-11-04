# Installation Guide

Complete setup instructions for KU Market platform.

## Prerequisites

- **Node.js** 20+
- **MongoDB** (local or Atlas)
- **Cloudinary Account** (for image uploads)

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create `.env` file:

```env
PORT=8080
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ku-market
JWT_SECRET=your-super-secret-jwt-key-change-this
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

⚠️ **Security:**

- Never commit `.env` files
- Use strong secrets for production
- Generate JWT secret: `openssl rand -base64 32`

### 3. Start Backend

```bash
npm run dev
```

Server runs at http://localhost:8080

### 4. Create Admin Account

```bash
npm run bootstrap-admin
```

Follow the prompts to create your first admin account.

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create `.env.local` file:

```env
NEXT_PUBLIC_API_BASE=http://localhost:8080
```

### 3. Start Frontend

```bash
npm run dev
```

Open http://localhost:3000

## MongoDB Setup

### Option 1: Local MongoDB

```bash
# Install MongoDB
# macOS
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

### Option 2: MongoDB Atlas

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Update `MONGO_URI` in `.env`

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
```

## Cloudinary Setup

1. Create account at https://cloudinary.com
2. Go to Dashboard
3. Copy credentials:
   - Cloud Name
   - API Key
   - API Secret
4. Update `.env` file

## Troubleshooting

### Port Already in Use

```bash
# Backend (8080)
lsof -ti:8080 | xargs kill -9

# Frontend (3000)
npx kill-port 3000
```

### MongoDB Connection Failed

```env
# Try IPv4 instead of localhost
MONGO_URI=mongodb://127.0.0.1:27017/ku-market
```

### Module Not Found

```bash
rm -rf node_modules
npm install
```

## Production Build

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm start
```

## Docker Setup (Optional)

Coming soon...

## Next Steps

- Read [User Guide](USER_GUIDE.md) to learn how to use the platform
- Check [API Documentation](API.md) for API reference
- Visit [Contributing Guide](CONTRIBUTING.md) to start development
