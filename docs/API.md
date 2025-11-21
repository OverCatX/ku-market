# API Documentation

Complete API reference for KU Market backend.

**Base URL:** `http://localhost:8080`  
**Production:** `https://your-backend-domain.com`

---

## Authentication

All authenticated endpoints require JWT token:

```
Authorization: Bearer <token>
```

Get token from `/api/auth/login` or `/api/auth/signup`.

---

## Authentication Endpoints

### Sign Up

**POST** `/api/auth/signup`

```json
{
  "name": "John Doe",
  "kuEmail": "john.d@ku.th",
  "password": "password123",
  "confirmPassword": "password123",
  "faculty": "Engineering",
  "contact": "0812345678"
}
```

**Response:** `201`

```json
{ "success": true, "message": "User registered successfully" }
```

---

### Login

**POST** `/api/auth/login`

```json
{
  "kuEmail": "john.d@ku.th",
  "password": "password123"
}
```

**Response:** `200`

```json
{
  "token": "jwt.token.here",
  "user": { "id": "...", "name": "...", "email": "...", "role": "buyer" }
}
```

---

### Forgot Password

**POST** `/api/auth/forgot-password`

```json
{ "email": "john.d@ku.th" }
```

Sends OTP to email (expires in 60 seconds).

---

### Verify OTP

**POST** `/api/auth/verify-otp`

```json
{
  "email": "john.d@ku.th",
  "otp": "123456"
}
```

**Response:** Returns `resetToken` for password reset.

---

### Reset Password

**POST** `/api/auth/reset-password`

```json
{
  "token": "reset.token.here",
  "new_password": "newpassword123"
}
```

---

### Google OAuth Login

**GET** `/api/auth/google`

Initiates Google OAuth flow. Redirects to Google login page.

**Requirements:**

- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` must be configured in backend `.env`
- Only `@ku.th` email addresses are accepted
- Users with non-`@ku.th` emails will receive an error

**Flow:**

1. User clicks "Continue with Google" button
2. Redirects to Google OAuth consent screen
3. User authorizes application
4. Google redirects to `/api/auth/google/callback`
5. Backend validates email domain (`@ku.th` required)
6. Creates account if user doesn't exist
7. Returns JWT token and user data

**Callback Endpoint:**

**GET** `/api/auth/google/callback`

Internal endpoint. Handles OAuth callback from Google.

**Data Endpoint:**

**GET** `/api/auth/google/callback/data`

Returns OAuth data (token and user) stored in cookies after successful authentication.

**Response:** `200`

```json
{
  "token": "jwt.token.here",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john.d@ku.th",
    "role": "buyer",
    "isVerified": false
  }
}
```

**Error Response:** `400`

```json
{
  "error": "Email must be @ku.th domain. Please use your KU email address."
}
```

---

## Profile Endpoints

### Get Profile

**GET** `/api/profile/view`  
**Auth:** Required

**Response:** `200`

```json
{
  "success": true,
  "user": {
    "name": "John Doe",
    "kuEmail": "john.d@ku.th",
    "faculty": "Engineering",
    "contact": "0812345678",
    "role": "buyer",
    "isVerified": true
  }
}
```

---

### Update Profile

**PUT** `/api/profile/update`  
**Auth:** Required

```json
{
  "name": "John Updated",
  "faculty": "Science",
  "contact": "0887654321"
}
```

---

## Verification Endpoints

### Submit Verification

**POST** `/api/verification/request`  
**Auth:** Required  
**Content-Type:** `multipart/form-data`

**Form Data:**

- `documentType`: `"student_id"` | `"citizen_id"`
- `document`: File (image)

---

### Check Status

**GET** `/api/verification/status`  
**Auth:** Required

**Response:** `200`

```json
{
  "success": true,
  "verification": {
    "status": "pending",
    "documentType": "student_id"
  }
}
```

---

## Items Endpoints

### List Items

**GET** `/api/items/list`

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `category`: Category slug
- `search`: Search query
- `status`: `available` | `sold` | `reserved`

**Example:** `/api/items/list?page=1&limit=20&category=electronics&search=phone`

---

### Get Item

**GET** `/api/items/:id`

---

### Create Item

**POST** `/api/items/create`  
**Auth:** Required  
**Content-Type:** `multipart/form-data`

**Form Data:**

- `title`, `description`, `price`, `quantity`, `category` (required)
- `condition`, `deliveryOption`, `photo` (max 5 images)

---

### Update Item

**PATCH** `/api/items/update/:id`  
**Auth:** Required

---

### Delete Item

**DELETE** `/api/items/delete/:id`  
**Auth:** Required

---

## Cart Endpoints

### Get Cart

**GET** `/api/cart`  
**Auth:** Required

---

### Add to Cart

**POST** `/api/cart/add`  
**Auth:** Required

```json
{
  "itemId": "507f1f77bcf86cd799439011",
  "quantity": 1
}
```

---

### Update Quantity

**PATCH** `/api/cart/update`  
**Auth:** Required

```json
{
  "itemId": "507f1f77bcf86cd799439011",
  "quantity": 2
}
```

---

### Remove Item

**DELETE** `/api/cart/remove/:itemId`  
**Auth:** Required

---

### Clear Cart

**DELETE** `/api/cart/clear`  
**Auth:** Required

---

## Order Endpoints

### Checkout

**POST** `/api/orders/checkout`  
**Auth:** Required

```json
{
  "deliveryMethod": "pickup",
  "paymentMethod": "promptpay",
  "buyerContact": {
    "phone": "0812345678",
    "email": "buyer@ku.th"
  },
  "pickupDetails": {
    "locationName": "Central Library",
    "address": "Kasetsart University",
    "coordinates": { "lat": 13.8479, "lng": 100.5703 }
  }
}
```

**Delivery:** `pickup` | `delivery`  
**Payment:** `cash` | `promptpay` | `transfer`

---

### Get Orders

**GET** `/api/orders`  
**Auth:** Required

**Query:** `?status=pending`

---

### Get Order Details

**GET** `/api/orders/:id`  
**Auth:** Required

---

### Submit Payment

**POST** `/api/orders/:id/payment`  
**Auth:** Required

Notify seller that payment has been made.

---

### Get Payment QR

**GET** `/api/orders/:id/payment-qr`  
**Auth:** Required

Get PromptPay QR code data.

---

### Buyer Received

**POST** `/api/orders/:id/buyer-received`  
**Auth:** Required

Buyer confirms receipt (pickup orders only).

---

## Shop Endpoints

### Submit Shop Application

**POST** `/api/shop/request`  
**Auth:** Required  
**Content-Type:** `multipart/form-data`

**Form Data:**

- `shopName`, `shopType`, `productCategory[]` (required)
- `shopdescription` (min 10 chars), `photo`

---

### Get My Shop

**GET** `/api/shop/my-shop`  
**Auth:** Required

---

### List Shops

**GET** `/api/shop`

**Query:** `?page=1&limit=10&shopType=Electronics`

---

## Seller Endpoints

**All require:** `role: "seller"` and approved shop.

### Get Stats

**GET** `/api/seller/stats`  
**Auth:** Required (Seller)

**Response:** `200`

```json
{
  "totalOrders": 50,
  "pendingOrders": 5,
  "totalItems": 20,
  "totalRevenue": 500000
}
```

---

### List Orders

**GET** `/api/seller/orders`  
**Auth:** Required (Seller)

**Query:** `?status=pending`

---

### Get Order Detail

**GET** `/api/seller/orders/:orderId`  
**Auth:** Required (Seller)

---

### Confirm Order

**PATCH** `/api/seller/orders/:orderId/confirm`  
**Auth:** Required (Seller)

---

### Reject Order

**PATCH** `/api/seller/orders/:orderId/reject`  
**Auth:** Required (Seller)

```json
{ "reason": "Out of stock" }
```

---

### Mark Delivered

**POST** `/api/seller/orders/:orderId/delivered`  
**Auth:** Required (Seller)

Seller confirms delivery (pickup orders only).

---

### List Items

**GET** `/api/seller/items`  
**Auth:** Required (Seller)

---

### Update Item Status

**PATCH** `/api/seller/items/:itemId/status`  
**Auth:** Required (Seller)

```json
{ "status": "available" }
```

**Status:** `available` | `reserved` | `sold`

---

## Admin Endpoints

**All require:** `role: "admin"` and `@ku.ac.th` email.

### Get Stats

**GET** `/api/admin/stats`  
**Auth:** Required (Admin)

---

### List Verifications

**GET** `/api/admin/verifications`  
**Auth:** Required (Admin)

**Query:** `?status=pending&page=1&limit=20`

---

### Approve Verification

**PATCH** `/api/admin/verifications/:id/approve`  
**Auth:** Required (Admin)

---

### Reject Verification

**PATCH** `/api/admin/verifications/:id/reject`  
**Auth:** Required (Admin)

```json
{ "reason": "Document is not clear" }
```

---

### List Shop Applications

**GET** `/api/admin/shops`  
**Auth:** Required (Admin)

**Query:** `?status=pending`

---

### Approve Shop

**PATCH** `/api/admin/shops/:id/approve`  
**Auth:** Required (Admin)

---

### Reject Shop

**PATCH** `/api/admin/shops/:id/reject`  
**Auth:** Required (Admin)

```json
{ "reason": "Incomplete information" }
```

---

### List Users

**GET** `/api/admin/users`  
**Auth:** Required (Admin)

**Query:** `?page=1&limit=20&role=buyer`

---

### Promote to Admin

**PATCH** `/api/admin/users/:id/promote`  
**Auth:** Required (Admin)

User must have `@ku.ac.th` email.

---

### Delete User

**DELETE** `/api/admin/users/:id`  
**Auth:** Required (Admin)

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Status Codes

- **200** - OK
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **500** - Server Error

---

## WebSocket Events

Real-time features use Socket.IO:

```javascript
const socket = io("http://localhost:8080", {
  auth: { token: "your-jwt-token" },
});
```

**Events:**

- `notification` - New notification
- `message` - New chat message
- `order_update` - Order status changed

---

**Last Updated:** November 2025
