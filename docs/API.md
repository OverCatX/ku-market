# API Documentation

Complete API reference for KU Market backend.

**Base URL:** `http://localhost:8080`

## Authentication

All authenticated endpoints require JWT token in header:

```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Sign Up

```
POST /api/auth/signup
```

**Body:**

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

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "User registered successfully"
}
```

### Login

```
POST /api/auth/login
```

**Body:**

```json
{
  "kuEmail": "john.d@ku.th",
  "password": "password123"
}
```

**Response:** `200 OK`

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

### Forgot Password

```
POST /api/auth/forgot-password
```

**Body:**

```json
{
  "email": "john.d@ku.th"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "OTP has been sent to your email. Please check your inbox."
}
```

### Verify OTP

```
POST /api/auth/verify-otp
```

**Body:**

```json
{
  "email": "john.d@ku.th",
  "otp": "123456"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "OTP verified successfully",
  "resetToken": "reset.token.here"
}
```

### Reset Password

```
POST /api/auth/reset-password
```

**Body:**

```json
{
  "token": "reset.token.here",
  "new_password": "newpassword123"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

---

## Profile Endpoints

### Get Profile

```
GET /api/profile/view
Auth: Required
```

**Response:** `200 OK`

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

### Update Profile

```
PUT /api/profile/update
Auth: Required
```

**Body:**

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

```
POST /api/verification/request
Auth: Required
Content-Type: multipart/form-data
```

**Form Data:**

- `documentType`: "student_id" | "citizen_id"
- `document`: File (image)

**Response:** `201 Created`

### Check Verification Status

```
GET /api/verification/status
Auth: Required
```

**Response:** `200 OK`

```json
{
  "success": true,
  "verification": {
    "status": "pending",
    "documentType": "student_id",
    "submittedAt": "2025-10-29T..."
  }
}
```

---

## Items Endpoints

### List Items

```
GET /api/items/list?page=1&limit=20&category=electronics&search=phone
```

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `category`: Filter by category
- `search`: Search query
- `status`: "available" | "sold" | "reserved"

**Response:** `200 OK`

### Get Item Details

```
GET /api/items/:id
```

### Create Item

```
POST /api/items/create
Auth: Required
Content-Type: multipart/form-data
```

**Form Data:**

- `title`: string
- `description`: string
- `price`: number
- `quantity`: number
- `category`: string
- `condition`: string
- `deliveryOption`: string[]
- `photo`: File[] (max 5)

### Update Item

```
PATCH /api/items/update/:id
Auth: Required
```

### Delete Item

```
DELETE /api/items/delete/:id
Auth: Required
```

---

## Cart Endpoints

### Get Cart

```
GET /api/cart
Auth: Required
```

### Add to Cart

```
POST /api/cart/add
Auth: Required
```

**Body:**

```json
{
  "itemId": "...",
  "quantity": 1
}
```

### Update Quantity

```
PATCH /api/cart/update
Auth: Required
```

**Body:**

```json
{
  "itemId": "...",
  "quantity": 2
}
```

### Remove Item

```
DELETE /api/cart/remove/:itemId
Auth: Required
```

### Clear Cart

```
DELETE /api/cart/clear
Auth: Required
```

---

## Shop Endpoints

### Submit Shop Application

```
POST /api/shop/request
Auth: Required
Content-Type: multipart/form-data
```

**Form Data:**

- `shopName`: string
- `shopType`: string
- `productCategory`: string[]
- `shopdescription`: string (min 10 chars)
- `photo`: File

### Get My Shop

```
GET /api/shop/my-shop
Auth: Required
```

### Update Shop

```
PUT /api/shop/update
Auth: Required
```

### Cancel Shop Application

```
DELETE /api/shop/cancel
Auth: Required
```

### List Approved Shops

```
GET /api/shop?page=1&limit=10&shopType=Electronics
```

---

## Admin Endpoints

All admin endpoints require `role: "admin"`.

### Get Statistics

```
GET /api/admin/stats
Auth: Required (Admin)
```

### List Verifications

```
GET /api/admin/verifications?status=pending&page=1&limit=20
Auth: Required (Admin)
```

### Approve Verification

```
PATCH /api/admin/verifications/:id/approve
Auth: Required (Admin)
```

### Reject Verification

```
PATCH /api/admin/verifications/:id/reject
Auth: Required (Admin)
```

**Body:**

```json
{
  "reason": "Document is not clear"
}
```

### List Shop Applications

```
GET /api/admin/shops?status=pending
Auth: Required (Admin)
```

### Approve Shop

```
PATCH /api/admin/shops/:id/approve
Auth: Required (Admin)
```

### Reject Shop

```
PATCH /api/admin/shops/:id/reject
Auth: Required (Admin)
```

**Body:**

```json
{
  "reason": "Incomplete information"
}
```

### List Users

```
GET /api/admin/users?page=1&limit=20&role=buyer
Auth: Required (Admin)
```

### Promote User to Admin

```
PATCH /api/admin/users/:id/promote
Auth: Required (Admin)
```

### Demote Admin

```
PATCH /api/admin/users/:id/demote
Auth: Required (Admin)
```

### Delete User

```
DELETE /api/admin/users/:id
Auth: Required (Admin)
```

---

## Seller Endpoints

All seller endpoints require `role: "seller"` and approved shop.

### Get Sales Statistics

```
GET /api/seller/stats
Auth: Required (Seller)
```

### List Orders

```
GET /api/seller/orders?status=pending
Auth: Required (Seller)
```

### List My Items

```
GET /api/seller/items
Auth: Required (Seller)
```

---

## Error Responses

Standard error codes:

- **400** - Bad Request (invalid input)
- **401** - Unauthorized (missing/invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **500** - Server Error

**Response Format:**

```json
{
  "success": false,
  "error": "Error message"
}
```
