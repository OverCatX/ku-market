# KU Market - Backend API 🔧

RESTful API for KU Market platform built with Express.js and TypeScript.

## 📦 Tech Stack

- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Cloudinary
- **Validation**: Joi
- **Testing**: Jest + Supertest
- **Security**: bcrypt, cors

## 🚀 Setup

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create `.env`:

```env
PORT=8080
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ku-market
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Development

```bash
npm run dev
```

Server runs at http://localhost:8080

### Production

```bash
npm run build
npm start
```

### Testing

```bash
npm test
npm run test:watch
npm run test:coverage
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── application/
│   │   ├── controllers/    # Request handlers
│   │   ├── middlewares/    # Custom middleware
│   │   └── routes/         # API routes
│   ├── data/
│   │   └── models/         # Mongoose models
│   ├── lib/                # Utilities (Cloudinary)
│   └── tests/              # Jest tests
├── dist/                   # Compiled JS
└── .env                    # Environment variables
```

## 🔌 API Endpoints

### Authentication (`/api/auth`)

```
POST   /signup          - Register new user
POST   /login           - Login
```

### Profile (`/api/profile`)

```
GET    /view           - Get profile [Auth]
PUT    /update         - Update profile [Auth]
```

### Verification (`/api/verification`)

```
POST   /request        - Submit verification [Auth]
GET    /status         - Check verification status [Auth]
```

### Items (`/api/items`)

```
GET    /list           - List all items
GET    /:id            - Get item details
POST   /create         - Create item [Auth]
PATCH  /update/:id     - Update item [Auth]
DELETE /delete/:id     - Delete item [Auth]
```

### Cart (`/api/cart`)

```
GET    /               - Get cart [Auth]
POST   /add            - Add to cart [Auth]
PATCH  /update         - Update quantity [Auth]
DELETE /remove/:itemId - Remove item [Auth]
DELETE /clear          - Clear cart [Auth]
```

### Shop (`/api/shop`)

```
POST   /request        - Submit shop application [Auth]
GET    /my-shop        - Get my shop [Auth]
PUT    /update         - Update shop [Auth]
DELETE /cancel         - Cancel application [Auth]
GET    /               - List approved shops
```

### Admin (`/api/admin`)

```
POST   /bootstrap      - Create first admin (no auth)
GET    /stats          - Get statistics [Admin]

# Verifications
GET    /verifications              - List verifications [Admin]
PATCH  /verifications/:id/approve  - Approve verification [Admin]
PATCH  /verifications/:id/reject   - Reject verification [Admin]

# Shops
GET    /shops                   - List shops [Admin]
PATCH  /shops/:id/approve       - Approve shop [Admin]
PATCH  /shops/:id/reject        - Reject shop [Admin]

# Users
GET    /users                   - List users [Admin]
PATCH  /users/:id/promote       - Promote to admin [Admin]
PATCH  /users/:id/demote        - Demote from admin [Admin]
DELETE /users/:id               - Delete user [Admin]
```

### Seller (`/api/seller`)

```
GET    /stats          - Get sales stats [Seller]
GET    /orders         - List orders [Seller]
GET    /items          - List items [Seller]
```

## 🔐 Authentication

### JWT Token Payload

```typescript
{
  id: string,           // User ID
  email: string,        // User email
  role: string,         // "buyer" | "seller" | "admin"
  isVerified: boolean,  // Verification status
  exp: number          // Expiration timestamp
}
```

### Middleware Usage

```typescript
// Protect routes
router.get("/profile", authenticate, profileController.view);

// Admin only
router.get(
  "/admin/stats",
  authenticate,
  adminMiddleware,
  adminController.getStats
);
```

## 💾 Database Models

### User

```typescript
{
  name: String,
  kuEmail: String (unique),
  password: String (hashed),
  faculty: String,
  contact: String (unique),
  role: "buyer" | "seller" | "admin",
  isVerified: Boolean
}
```

### Item

```typescript
{
  title: String,
  description: String,
  price: Number,
  quantity: Number,
  category: String,
  photo: [String],
  owner: ObjectId (ref: User),
  status: "available" | "sold" | "reserved"
}
```

### Shop

```typescript
{
  owner: ObjectId (ref: User),
  shopName: String,
  shopType: String,
  productCategory: [String],
  shopdescription: String,
  shopPhoto: String,
  shopStatus: "pending" | "approved" | "rejected"
}
```

## 📤 File Upload

### Cloudinary Integration

```typescript
import { uploadToCloudinary } from "../lib/cloudinary";

const photoUrl = await uploadToCloudinary(req.file.buffer, "folder-name");
```

### Limits

- Formats: JPEG, PNG, WebP
- Max size: 10MB per image
- Max files: 5 images per item

## 🧪 Testing

### Run Tests

```bash
npm test                # All tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

### Test Example

```typescript
describe("Auth Controller", () => {
  it("should create new user", async () => {
    const response = await request(app).post("/api/auth/signup").send({
      name: "Test User",
      kuEmail: "test@ku.ac.th",
      password: "password123",
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

## 🔧 Utilities

### Password Hashing

```typescript
import bcrypt from "bcrypt";

const hashedPassword = await bcrypt.hash(password, 10);
const isMatch = await bcrypt.compare(password, user.password);
```

### JWT Token

```typescript
import jwt from "jsonwebtoken";

const token = jwt.sign(
  { id: user._id, email: user.kuEmail, role: user.role },
  process.env.JWT_SECRET!,
  { expiresIn: "1h" }
);
```

## ⚙️ Scripts

```bash
npm run dev          # Development server
npm run build        # Compile TypeScript
npm start           # Production server
npm test            # Run tests
npm run bootstrap-admin # Create admin account
```

## 🐛 Debugging

### Enable Debug Logs

```bash
DEBUG=app:* npm run dev
```

### TypeScript Check

```bash
npx tsc --noEmit
```

## 🚨 Common Issues

### Port Already in Use

```bash
lsof -ti:8080 | xargs kill -9
# Or change port
PORT=3001 npm run dev
```

### MongoDB Connection

```env
# Use IPv4
MONGO_URI=mongodb://127.0.0.1:27017/ku-market

# Or use Atlas
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/ku-market
```

### JWT Secret Missing

```bash
echo "JWT_SECRET=your-secret-key" >> .env
```

## 📦 Key Dependencies

```json
{
  "express": "^4.x",
  "mongoose": "^8.x",
  "typescript": "^5.x",
  "jsonwebtoken": "^9.x",
  "bcrypt": "^5.x",
  "cloudinary": "^2.x",
  "joi": "^17.x",
  "multer": "^1.x"
}
```

## 🔒 Security

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens expire after 1 hour
- ✅ CORS enabled with origin validation
- ✅ Input validation with Joi
- ✅ MongoDB injection protection (Mongoose)

---

**Happy Coding! 🚀**
