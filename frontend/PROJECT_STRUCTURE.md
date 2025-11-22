# Frontend Project Structure

## Overview

KU Market frontend is built with Next.js 15 using the App Router architecture. The project follows a modular structure with clear separation of concerns.

## Directory Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (admin)/           # Admin route group
│   │   │   ├── admin/         # Admin pages
│   │   │   │   ├── activity-logs/
│   │   │   │   ├── categories/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── items/
│   │   │   │   ├── login/
│   │   │   │   ├── meetup-presets/
│   │   │   │   ├── reports/
│   │   │   │   ├── shops/
│   │   │   │   ├── users/
│   │   │   │   └── verifications/
│   │   │   └── layout.tsx     # Admin layout
│   │   ├── (seller)/          # Seller route group
│   │   │   ├── seller/        # Seller pages
│   │   │   │   ├── add-item/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── edit-item/[id]/
│   │   │   │   ├── items/
│   │   │   │   └── orders/
│   │   │   └── layout.tsx     # Seller layout
│   │   ├── auth/              # Authentication pages
│   │   │   └── google/callback/
│   │   ├── marketplace/       # Marketplace pages
│   │   │   ├── [slug]/        # Product detail
│   │   │   │   └── reviews/   # Product reviews
│   │   │   ├── __tests__/     # Marketplace tests
│   │   │   └── page.tsx       # Marketplace listing
│   │   ├── payment/           # Payment pages
│   │   │   └── [orderId]/
│   │   │       ├── success/
│   │   │       └── page.tsx
│   │   ├── order/[id]/        # Order detail page
│   │   ├── orders/            # Orders list page
│   │   ├── checkout/          # Checkout page
│   │   ├── cart/              # Shopping cart
│   │   ├── profile/           # User profile
│   │   │   └── reports/       # User reports
│   │   ├── guide/             # Interactive user guide
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   ├── forgot-password/   # Password reset
│   │   ├── reset-password/    # Reset password
│   │   ├── verify-identity/   # Identity verification
│   │   ├── verify-otp/        # OTP verification
│   │   ├── request-store/     # Shop request
│   │   ├── report/            # Report user
│   │   ├── report-item/       # Report item
│   │   ├── chats/             # Chat page
│   │   ├── notifications/     # Notifications
│   │   ├── aboutus/           # About us
│   │   ├── privacy/           # Privacy policy
│   │   ├── terms/             # Terms of service
│   │   ├── success/           # Success page
│   │   ├── cancel/            # Cancel page
│   │   ├── items/new/         # New item (legacy)
│   │   ├── meetup-sandbox/    # Meetup map sandbox
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── admin/             # Admin components
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── DeleteConfirmModal.tsx
│   │   │   ├── EditItemModal.tsx
│   │   │   ├── ImagePreviewModal.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── RejectModal.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── auth/              # Authentication components
│   │   │   ├── ForgotPasswordForm.tsx
│   │   │   ├── login-form.tsx
│   │   │   ├── ResetPasswordModal.tsx
│   │   │   └── signup-form.tsx
│   │   ├── chats/             # Chat components
│   │   │   ├── ChatHeader.tsx
│   │   │   ├── ChatList.tsx
│   │   │   ├── ChatListItem.tsx
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── Composer.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── index.ts
│   │   ├── home/              # Homepage components
│   │   │   ├── AboutSection.tsx
│   │   │   ├── FAQSection.tsx
│   │   │   ├── FeaturedProducts.tsx
│   │   │   ├── FooterSection.tsx
│   │   │   └── HeroSection.tsx
│   │   ├── maps/              # Map components
│   │   │   ├── MeetupLeafletMap.tsx
│   │   │   └── StaticMap.tsx
│   │   ├── Marketplace/       # Marketplace components
│   │   │   ├── ItemCard.tsx
│   │   │   └── Pagination.tsx
│   │   ├── modals/            # Modal components
│   │   │   ├── PrivacyPolicyModal.tsx
│   │   │   └── TermsOfServiceModal.tsx
│   │   ├── notifications/     # Notification components
│   │   │   ├── __tests__/
│   │   │   ├── NotificationBell.tsx
│   │   │   └── index.ts
│   │   ├── payment/           # Payment components
│   │   │   └── PromptPayPaymentForm.tsx
│   │   ├── Profile/           # Profile components
│   │   │   ├── LogoutButton.tsx
│   │   │   ├── OrderHistory.tsx
│   │   │   ├── ProfileForm.tsx
│   │   │   └── ProfileHeader.tsx
│   │   ├── report/            # Report components
│   │   │   ├── ReportForm.tsx
│   │   │   └── ReportSuccessModal.tsx
│   │   ├── report-item/       # Report item components
│   │   │   ├── ReportItemForm.tsx
│   │   │   └── ReportItemSuccessModal.tsx
│   │   ├── Reviews/           # Review components
│   │   │   ├── DeleteReviewModal.tsx
│   │   │   ├── ReviewForm.tsx
│   │   │   ├── ReviewItem.tsx
│   │   │   ├── ReviewList.tsx
│   │   │   ├── ReviewSummary.tsx
│   │   │   ├── StarRating.tsx
│   │   │   └── index.ts
│   │   ├── ui/                # UI components
│   │   │   └── Modal.tsx
│   │   ├── aboutus/           # About us components
│   │   │   ├── AboutHero.tsx
│   │   │   ├── AboutHowItWorks.tsx
│   │   │   ├── AboutTeamContact.tsx
│   │   │   ├── AboutWhy.tsx
│   │   │   ├── MotionFadeIn.tsx
│   │   │   └── SectionColors.ts
│   │   ├── ConditionalHeader.tsx
│   │   └── Navbar.tsx
│   ├── config/                # Configuration files
│   │   ├── admin.ts           # Admin API config
│   │   ├── auth.ts            # Auth API config
│   │   ├── cart.ts            # Cart API config
│   │   ├── categories.ts      # Categories API config
│   │   ├── constants.ts       # Constants
│   │   ├── faqdata.ts         # FAQ data
│   │   ├── items.ts           # Items API config
│   │   ├── notifications.ts   # Notifications API config
│   │   ├── profile.ts         # Profile API config
│   │   ├── reports.ts         # Reports API config
│   │   ├── reviews.ts         # Reviews API config
│   │   ├── verification.ts    # Verification API config
│   │   └── README.md
│   ├── contexts/              # React contexts
│   │   └── CartContext.tsx    # Shopping cart context
│   ├── lib/                   # Utility libraries
│   │   ├── auth.ts            # Auth utilities
│   │   └── jwt.ts             # JWT utilities
│   ├── types/                 # TypeScript types
│   │   ├── report.ts          # Report types
│   │   └── review.ts          # Review types
│   ├── utils/                 # Utility functions
│   │   └── reviewUtils.ts     # Review utilities
│   ├── constants/             # Constants
│   │   ├── faq.ts             # FAQ constants
│   │   └── index.ts
│   └── test/                  # Test utilities
│       └── types/
│           └── test-types.ts
├── public/                    # Static assets
├── .env.local                 # Environment variables (not in git)
├── next.config.ts             # Next.js configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── jest.config.ts             # Jest configuration
├── jest.setup.ts              # Jest setup
└── package.json               # Dependencies
```

## Key Features

### App Router Structure

- Uses Next.js 15 App Router with route groups `(admin)` and `(seller)`
- Server and client components are clearly separated
- Dynamic routes for product details, orders, and payments

### Component Organization

- Components are organized by feature/domain
- Reusable UI components in `components/ui/`
- Feature-specific components in their respective folders

### Configuration

- API configuration files in `config/` directory
- Centralized constants and types
- Environment variables in `.env.local`

### State Management

- React Context API for global state (Cart)
- Local state with React hooks
- Server state via API calls

## Environment Variables

See `.env.example` or root `.env.example` (Frontend section) for required variables:

```env
NEXT_PUBLIC_API_BASE=http://localhost:8080
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

## Testing

- Unit tests: `__tests__/` directories
- Test utilities: `src/test/`
- Jest configuration: `jest.config.ts`

## Build & Deployment

- Production build: `npm run build`
- Output: `.next/` directory
- Static assets: `public/` directory
