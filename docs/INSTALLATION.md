# Installation Guide

Complete setup instructions for KU Market platform.

## Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **MongoDB** (Local or Atlas)
- **Cloudinary Account** ([Sign up](https://cloudinary.com))
- **Gmail Account** (for SMTP email)
- **Docker** (optional, for Docker setup)

---

## Installation Methods

### 🐳 Method 1: Docker (Easiest)

**Requirements:** Docker & Docker Compose

```bash
# 1. Clone repository
git clone https://github.com/OverCatX/ku-market.git
cd ku-market

# 2. Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Edit backend/.env with your credentials (see below)
# 4. Edit frontend/.env.local:
#    NEXT_PUBLIC_API_BASE=http://localhost:8080

# 5. Start all services
docker-compose up -d

# 6. Create admin account
docker exec -it ku-market-backend npm run bootstrap-admin
```

**Access:**

- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- MongoDB: localhost:27017

**Stop services:**

```bash
docker-compose down
```

---

### 💻 Method 2: Manual Installation

#### Step 1: Clone Repository

```bash
git clone https://github.com/OverCatX/ku-market.git
cd ku-market
```

#### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials (see Environment Variables section)
# Then start server
npm run dev
```

#### Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local:
# NEXT_PUBLIC_API_BASE=http://localhost:8080

# Start frontend
npm run dev
```

#### Step 4: Create Admin Account

```bash
cd backend
npm run bootstrap-admin
```

Follow prompts to create admin account (must use `@ku.ac.th` email).

---

## Environment Variables

### Backend (.env)

Copy from root `.env.example` (Backend section) or `backend/.env.example` and fill in:

```env
MONGO_URL=mongodb://localhost:27017/ku_market
# For MongoDB Atlas: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

JWT_SECRET=your-super-secret-jwt-key-change-this
# Generate secure secret: openssl rand -base64 32

PORT=8080

CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
# Get credentials from: https://cloudinary.com/console

STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
# Get credentials from: https://dashboard.stripe.com/apikeys

# SMTP Configuration (for email sending - forgot password, etc.)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
# Gmail: Enable 2-Step Verification, then generate App Password
# App Password: https://myaccount.google.com/apppasswords

FRONTEND_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8080/api/auth/google/callback
# Get credentials from: https://console.cloud.google.com/apis/credentials

SESSION_SECRET=your-session-secret-here
# Generate secure secret: openssl rand -base64 32
```

### Frontend (.env.local)

Copy from root `.env.example` (Frontend section) or `frontend/.env.example`:

```env
# NEXT_PUBLIC_API_BASE=https://ku-market.onrender.com
NEXT_PUBLIC_API_BASE=http://localhost:8080

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
# Get credentials from: https://dashboard.stripe.com/apikeys
```

---

## Getting Credentials

### 1. MongoDB

**Local:**

```env
MONGO_URL=mongodb://localhost:27017/ku_market
```

**Atlas (Cloud):**

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (for development)
5. Get connection string:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```

### 2. Cloudinary

1. Sign up at [Cloudinary](https://cloudinary.com)
2. Go to Dashboard
3. Copy: Cloud Name, API Key, API Secret

### 3. SMTP (Gmail)

1. **Enable 2-Step Verification** on Google Account
2. **Generate App Password:**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" → "Other" → Enter "KU Market"
   - Copy 16-character password → Use as `SMTP_PASS`

### 4. JWT Secret

```bash
openssl rand -base64 32
```

### 5. Google OAuth (Optional)

**For Google login feature:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen:
   - User Type: External
   - App name: KU Market
   - Authorized domains: your domain (or localhost for development)
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Name: KU Market Web Client
   - **Authorized JavaScript origins:**
     - `http://localhost:3000` (development)
     - `https://your-frontend-domain.com` (production)
   - **Authorized redirect URIs:**
     - `http://localhost:8080/api/auth/google/callback` (development)
     - `https://your-backend-domain.com/api/auth/google/callback` (production)
7. Copy **Client ID** and **Client Secret** to `.env`

**Note:** Google login only accepts `@ku.th` email addresses. Users with other email domains will see an error message.

---

## Verification

✅ Backend running: http://localhost:8080  
✅ Frontend running: http://localhost:3000  
✅ Can access homepage  
✅ Admin account created

---

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
# Try IPv4
MONGO_URL=mongodb://127.0.0.1:27017/ku_market

# Check MongoDB is running
mongosh
```

### SMTP Email Not Sending

- Verify 2-Step Verification enabled
- Check App Password is correct (16 chars, no spaces)
- Ensure `SMTP_USER` is full email address

### Module Not Found

```bash
rm -rf node_modules package-lock.json
npm install
```

---

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

**Important:** Update environment variables for production (strong secrets, production URLs, etc.)

---

## Next Steps

- 📖 Read [User Guide](USER_GUIDE.md)
- 📚 Check [API Documentation](API.md)
- 🐛 Report issues on [GitHub](https://github.com/OverCatX/ku-market/issues)
