# KU Market - Frontend 🎨

Next.js 15 frontend application for KU Market platform.

## 📦 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **State**: React Context API
- **Notifications**: React Hot Toast

## 🚀 Setup

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE=http://localhost:8080
```

### Development

```bash
npm run dev
```

Open http://localhost:3000

### Production

```bash
npm run build
npm start
```

### Code Quality

```bash
npm run lint        # Run linter
npm run build       # Type check
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/              # Pages (App Router)
│   │   ├── (admin)/     # Admin pages
│   │   ├── (seller)/    # Seller pages
│   │   ├── marketplace/ # Shop pages
│   │   └── ...
│   ├── components/       # React components
│   ├── contexts/         # Context API (Cart)
│   ├── config/           # API calls
│   ├── lib/              # Utilities
│   └── types/            # TypeScript types
├── public/               # Static files
└── tailwind.config.ts    # Tailwind config
```

## 🎯 Routes

### Public (No Auth)

- `/` - Home
- `/marketplace` - Browse items
- `/marketplace/[slug]` - Item details
- `/login`, `/signup` - Authentication

### User (Auth Required)

- `/profile` - User profile
- `/verify-identity` - Identity verification
- `/cart` - Shopping cart
- `/checkout` - Checkout
- `/request-store` - Seller application

### Seller (Approved Shop)

- `/seller/dashboard` - Seller dashboard
- `/seller/items` - Manage products
- `/seller/add-item` - Add new item
- `/seller/orders` - Manage orders

### Admin (Admin Only)

- `/admin/login` - Admin login
- `/admin/dashboard` - Admin dashboard
- `/admin/verifications` - Manage verifications
- `/admin/shops` - Manage shops
- `/admin/users` - Manage users

## 🔐 Authentication

### Token Storage

```typescript
localStorage.getItem("authentication"); // JWT token
localStorage.getItem("user"); // User data
```

### Protected Routes

```typescript
useEffect(() => {
  const token = localStorage.getItem("authentication");
  if (!token) {
    router.replace("/login");
    return;
  }

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!user.isVerified) {
    router.replace("/verify-identity");
  }
}, [router]);
```

## 🛒 Cart Context

Cart uses Context API for state management:

- **Guest**: localStorage only
- **Logged-in**: Synced with backend + localStorage backup

### Usage

```typescript
import { useCart } from "@/contexts/CartContext";

function Component() {
  const { items, addToCart, removeFromCart, updateQuantity, clearCart } =
    useCart();

  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>
          {item.title} - {item.quantity}
          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
            +
          </button>
        </div>
      ))}
    </div>
  );
}
```

## 🎨 Styling

### Tailwind CSS

```tsx
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  <h2 className="text-2xl font-bold text-gray-900 mb-4">Title</h2>
  <p className="text-gray-600">Content</p>
</div>
```

### Responsive Breakpoints

- `sm:` - 640px+
- `md:` - 768px+
- `lg:` - 1024px+
- `xl:` - 1280px+

## 🧪 Best Practices

- ✅ Use TypeScript types everywhere
- ✅ Avoid `any` type
- ✅ Use `async/await` for async operations
- ✅ Handle errors on all API calls
- ✅ Use `useCallback` and `useMemo` when needed

## 📱 Responsive Support

- 📱 Mobile (375px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)

## ⚙️ Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm start           # Start production server
npm run lint         # Run ESLint
```

## 🐛 Debugging

### Next.js Debug

```bash
NODE_OPTIONS='--inspect' npm run dev
```

### Build Errors

```bash
npm run build
```

## 🚨 Common Issues

### Port Already in Use

```bash
npx kill-port 3000
# Or use different port
PORT=3001 npm run dev
```

### Module Not Found

```bash
rm -rf node_modules .next
npm install
```

## 📦 Key Dependencies

```json
{
  "next": "15.5.2",
  "react": "19.0.0",
  "typescript": "5.x",
  "tailwindcss": "3.x",
  "framer-motion": "^11.x",
  "lucide-react": "^0.x",
  "react-hot-toast": "^2.x"
}
```

---

**Happy Coding! 🚀**
