# User Guide

How to use KU Market platform.

## Table of Contents

- [For Buyers](#for-buyers)
- [For Sellers](#for-sellers)
- [For Admins](#for-admins)

---

## For Buyers

### 1. Create Account

1. Go to `/signup`
2. Fill in your information:
   - Name
   - KU Email (@ku.th required)
   - Password (minimum 6 characters)
   - Faculty
   - Phone number (10 digits, starting with 0)
3. Click "Sign Up"
4. Login with your credentials

### Forgot Password

1. Go to `/forgot-password`
2. Enter your KU email address
3. Check your email for 6-digit OTP (expires in 60 seconds)
4. Go to `/verify-otp` and enter the OTP
5. Set your new password

### 2. Verify Identity

⚠️ **Required before checkout!**

1. Go to `/verify-identity`
2. Choose document type:
   - Student ID
   - National ID
3. Upload clear photo of your document
4. Submit and wait for admin approval
5. Check status on the same page

### 3. Browse Products

1. Go to `/marketplace`
2. Use filters:
   - Category
   - Price range
   - Condition
3. Search by keyword
4. Click item to view details

### 4. Add to Cart

1. On item details page
2. Click "Add to Cart"
3. View cart at `/cart`
4. Adjust quantities or remove items

### 5. Checkout

1. Go to `/checkout`
2. Choose delivery method:
   - **Pickup** - Select meetup location from presets
   - **Delivery** - Provide shipping address
3. Select payment method:
   - **Cash** - Only available for pickup
   - **PromptPay** - QR code payment
   - **Transfer** - Bank transfer
4. Review order details
5. Confirm order
6. Wait for seller confirmation

### 6. Order Management

1. Go to `/orders` to view your orders
2. For **PromptPay/Transfer** orders:
   - After seller confirms, click "Show QR Code" to pay
   - Submit payment notification
3. For **Pickup** orders:
   - After payment (if applicable), click "I received the product"
   - Wait for seller to confirm delivery
   - Order completes when both parties confirm
4. View order details and pickup location on map

### 7. Manage Profile

1. Go to `/profile`
2. View/edit personal information
3. Check verification status
4. View order history

---

## For Sellers

### 1. Become a Seller

1. Complete identity verification first
2. Go to `/profile`
3. Click "Become a Seller"
4. Fill in shop information:
   - Shop name
   - Shop type
   - Product categories
   - Description
   - Shop photo
5. Submit application
6. Wait for admin approval

### 2. Access Seller Panel

After approval:

1. Go to `/seller/dashboard`
2. View sales statistics:
   - Total orders
   - Pending orders
   - Total items
   - Revenue

### 3. Add Products

1. Go to `/seller/add-item`
2. Fill in product details:
   - Title and description
   - Price and quantity
   - Category and condition
   - Delivery options
3. Upload photos (up to 5)
4. Click "List Item"

### 4. Manage Products

1. Go to `/seller/items`
2. View all your products
3. Edit or delete items
4. Update stock quantities

### 5. Manage Orders

1. Go to `/seller/orders`
2. View customer orders:
   - **Pending** - Awaiting your approval
   - **Confirmed** - Approved by you, waiting for payment/buyer
   - **Completed** - Order finished
3. Approve or reject orders
4. For **Pickup** orders:
   - After buyer confirms receipt, click "Mark as delivered"
   - Order completes when both parties confirm
5. View order details and contact buyer

---

## For Admins

### 1. Admin Login

1. Create admin account:
   ```bash
   cd backend
   npm run bootstrap-admin
   ```
2. Go to `/admin/login`
3. Use admin credentials

### 2. Dashboard

1. Go to `/admin/dashboard`
2. View system statistics:
   - Total users
   - Pending verifications
   - Pending shops

### 3. Approve Verifications

1. Go to `/admin/verifications`
2. Filter by status (all/pending/approved/rejected)
3. Click verification to view details
4. Review document photo
5. Approve or reject with reason

### 4. Approve Shops

1. Go to `/admin/shops`
2. Filter by status
3. Review shop information:
   - Shop details
   - Owner information
   - Shop photo
4. Approve or reject with reason

### 5. Manage Meetup Presets

1. Go to `/admin/meetup-presets`
2. View all predefined meetup locations
3. Actions:
   - **Add** - Create new meetup location
   - **Edit** - Update location details (label, address, coordinates)
   - **Delete** - Remove location
   - **Toggle Active** - Enable/disable location
4. Set location order for display

### 6. Manage Users

1. Go to `/admin/users`
2. View all users
3. Filter by role
4. Actions:
   - Promote to admin (requires @ku.ac.th email)
   - Demote from admin
   - Delete user

⚠️ **Cannot delete or demote yourself!**

### 7. Admin Best Practices

- ✅ Verify documents carefully
- ✅ Check shop information completeness
- ✅ Provide clear rejection reasons
- ✅ Monitor suspicious activities
- ❌ Never share admin credentials
- ❌ Don't approve incomplete submissions

---

## Need Help?

- Check [Installation Guide](INSTALLATION.md) for technical issues
- Visit [GitHub Issues](https://github.com/OverCatX/ku-market/issues)
- Contact support team
