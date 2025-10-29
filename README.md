# KU Market

An online marketplace platform for Kasetsart University students to buy and sell items within the campus community.

## 🎯 Key Features

### For Buyers

- **Sign Up/Login** - Use @ku.ac.th email only
- **Identity Verification** - Upload student ID or national ID for security
- **Browse Products** - Search, filter, and browse available items
- **Shopping Cart** - Add items and checkout (self-pickup or delivery)
- **Profile** - Manage personal info and order history

### For Sellers

- **Create Shop** - Submit shop application and wait for admin approval
- **Manage Products** - Add, edit, delete items (up to 5 images per item)
- **Manage Orders** - View and approve customer orders

### For Admins

- **Approve Verifications** - Review and approve user identity documents
- **Approve Shops** - Review and approve shop applications
- **Manage Users** - View and modify user permissions

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+
- **MongoDB** (local or MongoDB Atlas)
- **Cloudinary Account** (for image uploads)

### Installation

**1. Clone Repository**

```bash
git clone https://github.com/your-username/ku-market.git
cd ku-market
```

**2. Setup Backend**

```bash
cd backend
npm install
cp .env.example .env
# Edit .env file with your credentials
npm run dev
```

**Backend .env**

```env
PORT=8080
MONGO_URI=mongodb://localhost:27017/ku-market
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**3. Setup Frontend**

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_BASE=http://localhost:8080" > .env.local
npm run dev
```

**4. Access Application**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080

---

## 📖 How to Use

### For Buyers

1. **Sign Up** → Go to `/signup` → Use @ku.ac.th email
2. **Verify Identity** → Go to `/verify-identity` → Upload ID document → Wait for admin approval (required before checkout)
3. **Shop** → Browse `/marketplace` → Add to cart → Checkout

### For Sellers

1. **Create Shop** → Go to `/profile` → Click "Become a Seller" → Fill form → Wait for approval
2. **Add Products** → Go to `/seller/dashboard` → Click "Add New Item"
3. **Manage Orders** → Go to `/seller/orders` → Approve or reject orders

### For Admins

1. **Create Admin Account** (first time only)

```bash
cd backend
npm run bootstrap-admin
```

2. **Login** → Go to `/admin/login`
3. **Manage** → Approve verifications at `/admin/verifications` → Approve shops at `/admin/shops`

---

## 🛠️ Tech Stack

| Component    | Technologies                                   |
| ------------ | ---------------------------------------------- |
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS |
| **Backend**  | Node.js, Express, TypeScript, MongoDB          |
| **Auth**     | JWT (JSON Web Tokens)                          |
| **Storage**  | Cloudinary (images)                            |
| **Testing**  | Jest, Supertest                                |

---

## 🔗 API Endpoints

### Authentication

```
POST   /api/auth/signup          - Register new user
POST   /api/auth/login           - Login
```

### Profile

```
GET    /api/profile/view         - Get profile
PUT    /api/profile/update       - Update profile
```

### Identity Verification

```
POST   /api/verification/request - Submit verification
GET    /api/verification/status  - Check verification status
```

### Items

```
GET    /api/items/list           - List all items
GET    /api/items/:id            - Get item details
POST   /api/items/create         - Create item (Seller)
PATCH  /api/items/update/:id     - Update item (Seller)
DELETE /api/items/delete/:id     - Delete item (Seller)
```

### Cart

```
GET    /api/cart                 - Get cart
POST   /api/cart/add             - Add to cart
PATCH  /api/cart/update          - Update quantity
DELETE /api/cart/remove/:itemId  - Remove item
DELETE /api/cart/clear           - Clear cart
```

### Shop

```
POST   /api/shop/request         - Submit shop application
GET    /api/shop/my-shop         - Get my shop
PUT    /api/shop/update          - Update shop
DELETE /api/shop/cancel          - Cancel application
```

### Admin

```
GET    /api/admin/verifications              - List verifications
PATCH  /api/admin/verifications/:id/approve  - Approve verification
GET    /api/admin/shops                      - List shops
PATCH  /api/admin/shops/:id/approve          - Approve shop
GET    /api/admin/users                      - List users
```

---

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend lint
cd frontend
npm run lint

# Production build
cd frontend
npm run build
```

---

## ⚠️ Important Notes

1. **Identity verification required** before checkout or creating shop
2. **Email must be** @ku.ac.th only
3. **Maximum 5 images** per product
4. **Admin account** must be created via command line using `npm run bootstrap-admin`

---

## 📞 Support

Found a bug or have questions? Open an issue on GitHub.

**Built with ❤️ for Kasetsart University Students**

---

## 📄 License

MIT License - Free to use
