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

# Email Configuration (using Resend API)
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
# Get API key from: https://resend.com/api-keys
# For testing: use onboarding@resend.dev (no domain verification needed)
# For production: verify your domain in Resend dashboard
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

### Email Setup (Resend)

1. **Sign up** at [Resend](https://resend.com)
2. **Get API Key**:
   - Go to [API Keys](https://resend.com/api-keys)
   - Create a new API key
   - Copy the key → Use as `RESEND_API_KEY`
3. **For Development/Testing**:
   - Use `onboarding@resend.dev` as `RESEND_FROM_EMAIL` (no verification needed)
4. **For Production**:
   - Go to [Domains](https://resend.com/domains)
   - Add and verify your domain
   - Use verified email as `RESEND_FROM_EMAIL` (e.g., `noreply@yourdomain.com`)
5. **Free Tier**: 3,000 emails/month

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
