# Backend Project Structure

## Overview

KU Market backend is built with Express.js 5 and TypeScript, following a layered architecture pattern with clear separation of concerns.

## Directory Structure

```
backend/
├── src/
│   ├── server.ts              # Application entry point
│   ├── app.ts                 # Express app configuration
│   ├── socket.ts              # Socket.io configuration
│   ├── application/           # Application layer
│   │   ├── controllers/       # Request handlers
│   │   │   ├── admin.controller.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── cart.controller.ts
│   │   │   ├── category.controller.ts
│   │   │   ├── chat.controller.ts
│   │   │   ├── checkout.controller.ts
│   │   │   ├── health.controller.ts
│   │   │   ├── items.controller.ts
│   │   │   ├── meetup-preset.controller.ts
│   │   │   ├── notification.controller.ts
│   │   │   ├── order.controller.ts
│   │   │   ├── profile.controller.ts
│   │   │   ├── report.controller.ts
│   │   │   ├── review.controller.ts
│   │   │   ├── seller.controller.ts
│   │   │   ├── shop.controller.ts
│   │   │   └── verification.controller.ts
│   │   ├── middlewares/       # Express middlewares
│   │   │   ├── admin.ts       # Admin authorization
│   │   │   ├── authentication.ts  # JWT authentication
│   │   │   ├── optionalAuth.ts    # Optional authentication
│   │   │   ├── rateLimit.ts       # Rate limiting
│   │   │   └── validators/        # Request validation
│   │   │       ├── auth.validation.ts
│   │   │       ├── cart.validation.ts
│   │   │       ├── items.validation.ts
│   │   │       ├── profile.validation.ts
│   │   │       ├── shop.validation.ts
│   │   │       └── verification.validation.ts
│   │   └── routes/            # API routes
│   │       ├── admin.ts
│   │       ├── auth.ts
│   │       ├── cart.ts
│   │       ├── category.ts
│   │       ├── chat.ts
│   │       ├── checkout.ts
│   │       ├── health.ts
│   │       ├── items.ts
│   │       ├── meetup-preset.ts
│   │       ├── notifications.ts
│   │       ├── order.ts
│   │       ├── profile.ts
│   │       ├── report.ts
│   │       ├── review.ts
│   │       ├── seller.ts
│   │       ├── shop.ts
│   │       └── verification.ts
│   ├── data/                  # Data layer
│   │   └── models/            # Mongoose models
│   │       ├── ActivityLog.ts
│   │       ├── Cart.ts
│   │       ├── Category.ts
│   │       ├── ChatMessage.ts
│   │       ├── ChatThread.ts
│   │       ├── HelpfulVote.ts
│   │       ├── Item.ts
│   │       ├── MeetupPreset.ts
│   │       ├── Notification.ts
│   │       ├── Order.ts
│   │       ├── Report.ts
│   │       ├── Review.ts
│   │       ├── Shop.ts
│   │       ├── User.ts
│   │       └── Verification.ts
│   ├── lib/                   # Utility libraries
│   │   ├── activityLogger.ts  # Activity logging utility
│   │   ├── cloudinary.ts      # Cloudinary configuration
│   │   ├── email.ts           # Email service (Nodemailer)
│   │   ├── notifications.ts   # Notification service
│   │   ├── passport.ts        # Passport.js configuration
│   │   ├── upload.ts          # File upload utilities
│   │   └── wake-up.service.ts # Keep-alive service
│   ├── scripts/               # Utility scripts
│   │   ├── bootstrap-admin.ts # Create admin account
│   │   └── seed-meetup-presets.ts
│   ├── tests/                 # Test files
│   │   └── application/
│   │       └── controllers/
│   │           ├── auth.test.ts
│   │           ├── cart.test.ts
│   │           ├── items.test.ts
│   │           ├── notification.test.ts
│   │           ├── profile.test.ts
│   │           ├── shop.test.ts
│   │           └── verification.test.ts
│   └── types/                 # TypeScript types
├── dist/                      # Compiled JavaScript (generated)
├── .env                       # Environment variables (not in git)
├── tsconfig.json              # TypeScript configuration
├── jest.config.js             # Jest configuration
└── package.json               # Dependencies
```

## Architecture

### Layered Architecture

1. **Application Layer** (`application/`)
   - Controllers: Handle HTTP requests and responses
   - Routes: Define API endpoints
   - Middlewares: Authentication, authorization, validation, rate limiting

2. **Data Layer** (`data/`)
   - Mongoose models: Database schemas and models
   - Type definitions for database entities

3. **Library Layer** (`lib/`)
   - Utility functions and service integrations
   - Third-party service configurations (Cloudinary, Email, etc.)

### Request Flow

```
Request → Route → Middleware → Controller → Service/Model → Response
```

## Key Features

### Controllers
- Handle business logic
- Interact with models
- Return JSON responses
- Handle errors appropriately

### Middlewares
- **Authentication**: JWT token verification
- **Authorization**: Role-based access control (admin, seller)
- **Validation**: Request body/query validation using Joi
- **Rate Limiting**: Prevent abuse (reviews, API calls)

### Models
- Mongoose schemas with TypeScript interfaces
- Validation at schema level
- Indexes for performance
- Virtual fields and methods

### Routes
- RESTful API design
- Organized by feature/domain
- Versioned if needed (`/api/...`)

## Environment Variables

See `.env.example` or root `.env.example` (Backend section) for required variables:

```env
MONGO_URL=mongodb://localhost:27017/ku_market
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=8080
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
FRONTEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8080/api/auth/google/callback
SESSION_SECRET=your-session-secret-here
```

## Testing

- Unit tests: `tests/application/controllers/`
- Integration tests: Uses MongoDB Memory Server
- Test configuration: `jest.config.js`

## Scripts

- `npm run dev`: Development server with hot reload
- `npm run build`: Compile TypeScript to JavaScript
- `npm start`: Run production server
- `npm test`: Run tests
- `npm run bootstrap-admin`: Create admin account interactively

## Build & Deployment

- Production build: `npm run build`
- Output: `dist/` directory
- Run: `node dist/server.js`

