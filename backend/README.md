# KU Market - Backend

Express.js backend API for KU Market.

## Quick Start

```bash
npm install
npm run dev
```

Server runs at http://localhost:8080

## Environment

Create `.env`:

```env
MONGO_URL=mongodb://localhost:27017/ku_market
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=8080
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here

# SMTP Configuration (for email sending - forgot password, etc.)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
FRONTEND_URL=http://localhost:3000

# CORS Configuration (comma-separated list of allowed origins)
# For production: https://ku-market-mu.vercel.app,https://your-domain.com
# For development: http://localhost:3000
CORS_ORIGIN=http://localhost:3000

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8080/api/auth/google/callback
SESSION_SECRET=your-session-secret-here
```

### SMTP Setup (Gmail)

1. **Enable 2-Step Verification** on your Google Account
2. **Generate App Password**:
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" → "Other" → Enter "KU Market"
   - Copy 16-character password → Use as `SMTP_PASS`

⚠️ **Security:** Never commit `.env` files! Generate secure secret: `openssl rand -base64 32`

## Scripts

```bash
npm run dev          # Development server
npm run build        # Compile TypeScript
npm start           # Production server
npm test            # Run tests
npm run bootstrap-admin  # Create admin account
```

## Tech Stack

- Express.js
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary (images)

## Documentation

For complete documentation:

- **[Installation Guide](../docs/INSTALLATION.md)**
- **[API Documentation](../docs/API.md)**
- **[Contributing Guide](../docs/CONTRIBUTING.md)**
- **[Project Wiki](https://github.com/OverCatX/ku-market/wiki)**

## Troubleshooting

**Port in use:**

```bash
lsof -ti:8080 | xargs kill -9
```

**MongoDB connection:**

```env
# Try IPv4
MONGO_URL=mongodb://127.0.0.1:27017/ku_market
```

---

For more details, see main [README](../README.md)
