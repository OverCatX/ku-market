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
PORT=8080
MONGO_URI=mongodb://localhost:27017/ku-market
JWT_SECRET=your-super-secret-jwt-key-change-this
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

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
MONGO_URI=mongodb://127.0.0.1:27017/ku-market
```

---

For more details, see main [README](../README.md)
