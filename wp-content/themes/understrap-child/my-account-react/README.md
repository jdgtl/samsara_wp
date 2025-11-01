# Samsara My Account Dashboard

A modern React-based customer dashboard for WordPress/WooCommerce that provides a seamless interface for managing subscriptions, orders, payments, and account details.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Architecture](#architecture)
- [API Integration](#api-integration)
- [Making Changes](#making-changes)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Overview

This React application replaces the default WooCommerce My Account pages with a modern, single-page application (SPA) that provides:

- Real-time subscription management (pause, resume, cancel)
- Order history and detailed tracking
- Payment method management (add, edit, delete)
- Gift card management and redemption
- Account details editing (profile, addresses)
- Dashboard with subscription and membership overview
- Membership content access via visual card grid with featured images
- Clean URL structure for program pages

**Status:** 98% Complete - All core features migrated to live WordPress/WooCommerce with enhanced user experience.

**Recent Updates (November 2025):**

### Gift Cards Feature (November 1, 2025)
- **Full Gift Card Management** - Complete integration with WooCommerce Gift Cards plugin
  - View all gift cards (received and purchased) in unified list
  - Filter by status (All, Active, Used, Expired)
  - Search by gift card code
  - Detailed transaction history for each card
  - Visual differentiation: Gift icon for received, Shopping cart for purchased
- **Gift Card Redemption** - Add gift cards to account balance for checkout
  - "Add to Account Balance" button on unredeemed gift cards
  - One-click redemption links gift card to user ID
  - Automatic balance application at checkout
  - Status badges: "In Account" (blue) vs "Ready to Redeem" (amber)
  - CTA hidden once redeemed to prevent confusion
- **Balance Checking** - Public gift card balance lookup
  - Check any gift card balance without login
  - Shows remaining balance, expiry date, and status
  - Validates gift card codes
- **Transaction History** - Detailed activity tracking
  - All transactions: issued, used, credited, refunded, redeemed
  - Visual formatting: Green +amount for credits, Red -amount for debits
  - Chronological display with dates and notes
  - Integrated with WooCommerce Gift Cards activity log

**Previous Updates (January 2025):**

### User Experience Enhancements
- **Semantic Navigation Links:** Full implementation of proper HTML link semantics (January 30, 2025)
  - All clickable cards and navigation elements now use `<a>` or `<Link>` tags
  - Right-click "Open in new tab" functionality enabled
  - URL preview in browser status bar on hover
  - Middle-click opens links in new tab
  - Improved keyboard navigation (Tab + Enter)
  - Enhanced screen reader accessibility
  - Better SEO with crawlable navigation
  - Affected pages: Dashboard (Basecamp card, memberships), Orders, Subscriptions, OrderDetail, SubscriptionDetail
- **Custom Avatar System:** Full avatar customization with real-time updates
  - Upload custom photos (JPG, PNG, GIF, WebP, max 5MB)
  - Choose from 11 outdoor-themed icon avatars (Mountain, Pine Tree, Tent, etc.)
  - Reset to default Gravatar/initials option
  - Global state management - updates reflected instantly across all pages
  - Avatar preferences persist via user meta
- **Basecamp Training Hub Card:** Redesigned prominent side-by-side CTA on Dashboard
  - Hero image background with gradient overlay
  - Bottom-aligned content for better visual impact
  - Updated messaging: "Click here to access your basecamp training hub"
  - 50/50 responsive layout (stacks on mobile < 1024px)
  - Now a proper `<a>` tag with external URL support
- **Empty State CTAs:** Consistent call-to-action buttons across all empty states
  - "Join Athlete Team" and "Join Basecamp" buttons
  - Unified design pattern on Dashboard, Orders, and Subscriptions pages
  - Gold brand styling for consistency

### Responsive Design Improvements
- **Breakpoint Optimization:** Adjusted responsive breakpoints for better UX
  - Additional Memberships: 1 column (mobile) → 2 columns (640px+) → 3 columns (1024px+)
  - Primary subscription + Basecamp cards stack below 1024px
  - View toggle and filters reorganized for mobile devices
- **Sidebar Navigation:** Fixed positioning for optimal visibility
  - Accounts for top navigation height (64px offset)
  - Logout button always visible at bottom (no scrolling required)
  - Mobile: Logout button in top user card (bottom-right position)
- **List/Card View Toggle:** Added for Additional Memberships section
  - Card view: Visual grid with large featured images
  - List view: Compact rows with thumbnails (96x64px)
  - Matches Payments page toggle pattern

### Technical Architecture
- **Semantic HTML Implementation:** Proper use of navigation elements
  - External links: `<a href target="_blank" rel="noopener noreferrer">`
  - Internal navigation: React Router `<Link to>`
  - Hybrid approach: Links wrapping buttons/cards for proper semantics
  - All visual designs preserved while improving HTML structure
- **Avatar Context Provider:** Implemented React Context for global avatar state
  - Located: `src/contexts/AvatarContext.jsx`
  - Manages avatarType, selectedEmoji, uploadedAvatarUrl globally
  - Real-time updates across Sidebar, Dashboard, and Account Details
- **Avatar REST API:** Three new endpoints for avatar management
  - `POST /wp-json/samsara/v1/avatar/upload` - Upload and validate images
  - `GET /wp-json/samsara/v1/avatar/preferences` - Retrieve saved preferences
  - `PUT /wp-json/samsara/v1/avatar/preferences` - Save avatar settings
- **Reusable Components:** New AvatarDisplay component with loading state support

### Previous Updates (2024-2025)
- **Mobile-First Navigation:** Bottom nav bar for mobile (< 768px), sidebar for desktop
- **Dashboard Welcome Section:** User profile (avatar, name, member since) on mobile Dashboard
- Changed dashboard URL from `/athlete/` to `/account/` with redirects
- Updated brand styling: Gold (#E2B72D) primary CTAs, black navigation, green for success states
- Card-based grid layout for membership content with featured images
- WordPress menu integration for top navigation with FontAwesome support
- Clean URL structure for program pages (organized under `/programs/` with public URL rewriting)

---

## Technology Stack

### Core
- **React 18.3.1** - UI framework
- **React Router v7** - Client-side routing
- **Axios** - HTTP client for API calls

### Styling
- **Tailwind CSS 3.4** - Utility-first CSS framework with custom Samsara brand colors
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Pre-built component library
- **Lucide React** - Icon library

**Brand Colors:**
- Gold (#E2B72D) - Primary CTAs and interactive elements
- Spanish Green (#2E9754) - Success states and positive feedback
- Deep Cinnabar (#BA4542) - Errors and destructive actions
- Xikectic (#0C0004) - Dark UI elements and navigation

### Build Tools
- **Webpack 5** - Module bundler
- **Babel** - JavaScript compiler
- **PostCSS** - CSS processor
- **Autoprefixer** - CSS vendor prefixing

### WordPress Integration
- **WordPress REST API** - Core WordPress data
- **WooCommerce REST API** - E-commerce data
- **WooCommerce Subscriptions** - Subscription management
- **WooCommerce Memberships** - Legacy membership content access
- **WooCommerce Gift Cards** - Gift card management and redemption (by SomewhereWarm)
- **Stripe Payment Gateway** - Payment method management
- **Custom REST Endpoints** - Extended functionality

---

## Project Structure

```
my-account-react/
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # Reusable UI components (shadcn/ui)
│   │   ├── AvatarDisplay.jsx # Reusable avatar component
│   │   ├── Layout.jsx       # Main layout wrapper
│   │   ├── Sidebar.jsx      # Responsive navigation (sidebar on desktop, bottom nav on mobile)
│   │   └── TopNavigation.jsx # Public site navigation header
│   │
│   ├── pages/               # Page components (routes)
│   │   ├── Dashboard.jsx
│   │   ├── Orders.jsx
│   │   ├── OrderDetail.jsx
│   │   ├── Subscriptions.jsx
│   │   ├── SubscriptionDetail.jsx
│   │   ├── Payments.jsx
│   │   ├── GiftCards.jsx
│   │   ├── GiftCardDetail.jsx
│   │   └── AccountDetails.jsx
│   │
│   ├── contexts/            # React Context providers
│   │   └── AvatarContext.jsx # Global avatar state management
│   │
│   ├── services/            # API service layer
│   │   ├── api.js          # Base Axios configuration
│   │   └── woocommerce.js  # WooCommerce API methods (including avatarApi)
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useOrders.js
│   │   ├── useSubscriptions.js
│   │   ├── useCustomer.js
│   │   ├── usePaymentMethods.js
│   │   ├── useMemberships.js
│   │   ├── useGiftCards.js
│   │   └── useDashboard.js
│   │
│   ├── lib/                 # Utility functions
│   │   └── utils.js
│   │
│   ├── App.js               # Main app component (wrapped with AvatarProvider)
│   └── index.js             # Entry point
│
├── build/                   # Production build output
│   ├── js/
│   │   └── index.js        # Bundled JavaScript (~392 KB)
│   └── css/
│       └── my-account.css  # Compiled CSS
│
├── node_modules/            # Dependencies
├── package.json             # Dependencies and scripts
├── webpack.config.js        # Webpack configuration
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
└── README.md                # This file
```

---

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- WordPress 5.8+ with WooCommerce installed
- WooCommerce Subscriptions plugin (for subscription management)
- WooCommerce Memberships plugin (for legacy membership content)
- WooCommerce Gift Cards plugin v2.7.1+ by SomewhereWarm (for gift card features)
- WooCommerce Stripe Payment Gateway plugin (for payment methods)
- Local WP or similar WordPress development environment

### Installation

1. Navigate to the project directory:
```bash
cd wp-content/themes/understrap-child/my-account-react
```

2. Install dependencies:
```bash
npm install
```

3. Verify WordPress configuration in `functions.php` (parent directory):
   - Ensure `samsara_enqueue_my_account_react()` function exists
   - Confirm REST API endpoints are registered
   - Check that user data is localized to `window.samsaraMyAccount`

---

## Development

### Development Server

Start the webpack dev server with hot reload:

```bash
npm start
```

This will:
- Start webpack dev server on port 8080 (configurable)
- Enable hot module replacement
- Watch for file changes
- Serve assets from memory

### Available Scripts

```bash
# Start development server
npm start

# Build for production (JS only)
npm run build

# Build CSS only
npm run build:css

# Build everything (JS + CSS)
npm run build:all
```

### Development Workflow

1. **Make changes** to files in `src/`
2. **Dev server auto-reloads** - see changes immediately
3. **Test** in browser at the WordPress site URL + `/account`
4. **Build** for production when ready
5. **Commit** changes to git

---

## Architecture

### Data Flow

```
WordPress/WooCommerce
        ↓
   REST APIs
        ↓
  API Service Layer (services/api.js, woocommerce.js)
        ↓
  React Hooks (hooks/*.js)
        ↓
  Page Components (pages/*.jsx)
        ↓
  UI Components (components/ui/*.jsx)
```

### Key Concepts

#### 1. Service Layer (`src/services/`)

Handles all HTTP communication with WordPress/WooCommerce:

**`api.js`**
- Axios instance configuration
- WordPress nonce authentication
- Request/response interceptors
- Error handling
- Session expiration detection

**`woocommerce.js`**
- API methods for orders, subscriptions, customers, payments
- Data transformers (convert WC format → app format)
- CRUD operations

#### 2. React Hooks (`src/hooks/`)

Custom hooks encapsulate data fetching logic:

- **useOrders** - Fetch orders with filtering/pagination
- **useSubscriptions** - Manage subscriptions with actions
- **useCustomer** - Get/update customer profile
- **usePaymentMethods** - Payment method CRUD
- **useMemberships** - Fetch user memberships
- **useDashboard** - Unified dashboard data

Each hook returns:
```javascript
{
  data,         // The fetched data
  loading,      // Boolean loading state
  error,        // Error object or null
  refetch       // Function to refetch data
}
```

#### 3. Page Components (`src/pages/`)

Each page corresponds to a route and uses hooks to fetch data:

```javascript
function Dashboard() {
  const { subscriptions, memberships, loading, error } = useDashboard();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return <DashboardContent data={...} />;
}
```

#### 4. UI Components (`src/components/ui/`)

Reusable components from shadcn/ui:
- Built on Radix UI primitives
- Styled with Tailwind CSS
- Accessible by default
- Customizable via `className`

#### 5. Responsive Navigation Pattern

The app uses a mobile-first navigation approach with different patterns based on screen size:

**Mobile (< 768px / md breakpoint):**
- **Bottom Navigation Bar** - Fixed to bottom of screen (app-style)
  - 5 navigation items displayed horizontally
  - Icon + label layout (vertical stack)
  - Gold color for active state (#E2B72D)
  - Stone color for inactive state
  - Always visible (no hamburger menu)
- **User Profile in Dashboard** - Avatar, name, and "Member since" appear at top of Dashboard page
- **Content Padding** - Bottom padding (pb-24) prevents content from being hidden behind nav

**Desktop (≥ 768px / md breakpoint):**
- **Full Left Sidebar** - Sticky positioned with full height
  - User profile at top (avatar, name, member since)
  - Navigation items in vertical list
  - Logout button at bottom
  - Gold background for active state
- **Dashboard Welcome Header** - Simple text-based welcome

**Implementation:**
- `Sidebar.jsx` contains both navigation patterns with responsive classes
- Desktop sidebar: `hidden md:flex` - Hidden on mobile, flex layout on desktop
- Mobile bottom nav: `md:hidden` - Visible on mobile, hidden on desktop
- `Layout.jsx` provides consistent padding across all pages

**Breakpoint:** 768px (Tailwind's `md` breakpoint)

---

## API Integration

### WordPress Configuration

The app requires WordPress to inject configuration via `wp_localize_script()`:

```javascript
window.samsaraMyAccount = {
  apiUrl: '/wp-json',
  nonce: 'abc123...',
  userId: 123,
  siteUrl: 'https://example.com',
  userData: {
    firstName: 'John',
    lastName: 'Doe',
    displayName: 'John Doe',
    email: 'john@example.com',
    avatarUrl: 'https://...',
    memberSince: '2024-01-01'
  },
  logoutUrl: '/wp-login.php?action=logout&_wpnonce=...'
}
```

### REST API Endpoints Used

#### WooCommerce Core Endpoints

```
GET    /wp-json/wc/v3/orders
GET    /wp-json/wc/v3/orders/{id}
GET    /wp-json/wc/v3/subscriptions
GET    /wp-json/wc/v3/subscriptions/{id}
PUT    /wp-json/wc/v3/subscriptions/{id}
GET    /wp-json/wc/v3/customers/{id}
PUT    /wp-json/wc/v3/customers/{id}
```

#### Custom Samsara Endpoints

Defined in `wp-content/themes/understrap-child/functions.php`:

```
GET    /wp-json/samsara/v1/payment-methods          # Get user's Stripe payment methods
POST   /wp-json/samsara/v1/payment-methods          # Add new payment method
PUT    /wp-json/samsara/v1/payment-methods/{id}     # Set default payment method
DELETE /wp-json/samsara/v1/payment-methods/{id}     # Delete payment method
GET    /wp-json/samsara/v1/memberships              # Get user's memberships with restricted pages
GET    /wp-json/samsara/v1/stats                    # Get dashboard statistics
GET    /wp-json/samsara/v1/user-subscriptions       # Get user subscriptions (bypasses User Switching issues)
GET    /wp-json/samsara/v1/customer-addresses       # Get billing/shipping addresses
PUT    /wp-json/samsara/v1/customer-addresses       # Update addresses
POST   /wp-json/samsara/v1/avatar/upload            # Upload custom avatar image (max 5MB, validates type)
GET    /wp-json/samsara/v1/avatar/preferences       # Get user's saved avatar preferences
PUT    /wp-json/samsara/v1/avatar/preferences       # Save avatar type and selection
GET    /wp-json/samsara/v1/gift-cards               # Get user's gift cards (received and purchased)
GET    /wp-json/samsara/v1/gift-cards/{id}          # Get single gift card details with transaction history
GET    /wp-json/samsara/v1/gift-cards/balance/{code} # Check gift card balance by code (public)
POST   /wp-json/samsara/v1/gift-cards/{id}/redeem   # Redeem gift card to account for checkout use
GET    /wp-json/samsara/v1/orders/{id}/gift-cards   # Get gift cards purchased in specific order
```

### Authentication

All requests use WordPress nonce authentication:

```javascript
headers: {
  'X-WP-Nonce': window.samsaraMyAccount.nonce
}
```

The nonce is automatically injected in request headers via the Axios interceptor in `api.js`.

---

## Making Changes

### Adding a New Page

1. **Create page component** in `src/pages/`:

```javascript
// src/pages/NewPage.jsx
import React from 'react';
import { useCustomHook } from '../hooks/useCustomHook';

function NewPage() {
  const { data, loading, error } = useCustomHook();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>New Page</h1>
      {/* Your content */}
    </div>
  );
}

export default NewPage;
```

2. **Add route** in `src/App.js`:

```javascript
import NewPage from './pages/NewPage';

<Route path="new-page" element={<NewPage />} />
```

3. **Add navigation item** in `src/components/Sidebar.jsx`:

```javascript
const navItems = [
  // ... existing items
  { icon: SomeIcon, label: 'New Page', path: '/new-page' },
];
```

### Adding a New API Method

1. **Add to service** in `src/services/woocommerce.js`:

```javascript
export const customApi = {
  getCustomData: () => get('/samsara/v1/custom-endpoint'),
  updateCustomData: (data) => post('/samsara/v1/custom-endpoint', data),
};
```

2. **Create hook** in `src/hooks/useCustomData.js`:

```javascript
import { useState, useEffect } from 'react';
import { customApi } from '../services/woocommerce';

export const useCustomData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await customApi.getCustomData();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, loading, error };
};
```

3. **Add WordPress endpoint** in `functions.php`:

```php
add_action('rest_api_init', function () {
  register_rest_route('samsara/v1', '/custom-endpoint', array(
    'methods' => 'GET',
    'callback' => 'samsara_get_custom_data',
    'permission_callback' => 'samsara_check_authentication',
  ));
});

function samsara_get_custom_data($request) {
  $user_id = get_current_user_id();
  // Your logic here
  return rest_ensure_response($data);
}
```

### Adding a New UI Component

1. **Use existing components** from `src/components/ui/` when possible

2. **Add new shadcn/ui component**:
   - Copy component from [ui.shadcn.com](https://ui.shadcn.com)
   - Place in `src/components/ui/`
   - Import and use

3. **Create custom component**:

```javascript
// src/components/CustomComponent.jsx
import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';

export function CustomComponent({ title, onAction }) {
  return (
    <Card>
      <h3>{title}</h3>
      <Button onClick={onAction}>Action</Button>
    </Card>
  );
}
```

### Styling Changes

#### Using Tailwind Classes

```javascript
<div className="flex items-center gap-4 p-6 bg-stone-50 rounded-lg">
  <h2 className="text-2xl font-bold text-stone-900">Title</h2>
</div>
```

#### Customizing Theme

Edit `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Samsara brand colors
        samsara: {
          gold: '#E2B72D',     // PRIMARY - main CTAs
          green: '#2E9754',    // SECONDARY - success states
          red: '#BA4542',      // Alerts/errors
          black: '#0C0004',    // Dark UI
        },
        // Tailwind theme colors use gold as primary
        primary: {
          DEFAULT: "#E2B72D",
          foreground: "#0C0004",
        }
      }
    }
  }
}
```

#### Custom CSS

Add to `src/styles/input.css` (if needed):

```css
@layer components {
  .custom-class {
    @apply flex items-center gap-4;
  }
}
```

---

## Building for Production

### Build Process

1. **Clean previous build** (optional):
```bash
rm -rf build/
```

2. **Build JavaScript**:
```bash
npm run build
```

This creates:
- `build/js/index.js` - Minified, optimized bundle

3. **Build CSS**:
```bash
npm run build:css
```

This creates:
- `build/css/my-account.css` - Compiled Tailwind styles

4. **Or build everything**:
```bash
npm run build:all
```

### Build Output

The build process:
- Minifies JavaScript
- Removes dead code
- Optimizes React for production
- Compiles Tailwind (removes unused styles)
- Adds vendor prefixes
- Creates source maps (optional)

**File locations:**
- JS: `build/js/index.js`
- CSS: `build/css/my-account.css`

### WordPress Integration

WordPress loads the built files via `functions.php`:

```php
function samsara_enqueue_my_account_react() {
  wp_enqueue_script(
    'samsara-my-account-react',
    get_stylesheet_directory_uri() . '/my-account-react/build/js/index.js',
    array('wp-element'),
    filemtime(get_stylesheet_directory() . '/my-account-react/build/js/index.js'),
    true
  );

  wp_enqueue_style(
    'samsara-my-account-react-styles',
    get_stylesheet_directory_uri() . '/my-account-react/build/css/my-account.css',
    array(),
    filemtime(get_stylesheet_directory() . '/my-account-react/build/css/my-account.css')
  );
}
```

---

## Deployment

### Deployment Checklist

1. [ ] Run tests (if implemented)
2. [ ] Build for production (`npm run build:all`)
3. [ ] Commit changes to git
4. [ ] Push to repository
5. [ ] Deploy to staging environment
6. [ ] Test all features in staging
7. [ ] Deploy to production
8. [ ] Monitor error logs

### Deployment Steps

#### Option 1: Git Deployment

```bash
# Commit changes
git add .
git commit -m "Update my-account dashboard"

# Push to repository
git push origin my-account

# SSH to server and pull changes
ssh user@server
cd /path/to/wordpress/wp-content/themes/understrap-child
git pull origin my-account
```

#### Option 2: FTP/SFTP

Upload these files to server:
```
my-account-react/
├── build/
│   ├── js/index.js
│   └── css/my-account.css
└── (src/ if needed for debugging)
```

#### Option 3: WordPress Plugin/Theme Update

Package the theme with updated files and use WordPress update mechanism.

### Post-Deployment

1. **Clear caches**:
   - WordPress object cache
   - Page cache (if using caching plugin)
   - CDN cache (if applicable)
   - Browser cache (hard refresh)

2. **Verify functionality**:
   - Test all pages load correctly
   - Check API calls work
   - Verify authentication
   - Test CRUD operations

3. **Monitor**:
   - Check WordPress error logs
   - Monitor JavaScript console for errors
   - Watch for API errors in network tab

---

## Troubleshooting

### Common Issues

#### 1. White Screen / Blank Page

**Symptoms:** Page loads but shows nothing

**Solutions:**
- Check browser console for JavaScript errors
- Verify build files exist: `build/js/index.js` and `build/css/my-account.css`
- Confirm WordPress is enqueueing scripts correctly
- Check that `<div id="samsara-my-account-root"></div>` exists in DOM

#### 2. Authentication Errors (401/403)

**Symptoms:** API calls fail with "Unauthorized" errors

**Solutions:**
- Verify user is logged into WordPress
- Check nonce is being passed: `window.samsaraMyAccount.nonce`
- Confirm nonce hasn't expired (WordPress nonces expire after 24 hours)
- Reload page to get fresh nonce

#### 3. API Endpoints Not Found (404)

**Symptoms:** API calls return 404 errors

**Solutions:**
- Flush WordPress rewrite rules: Settings → Permalinks → Save
- Verify endpoints are registered in `functions.php`
- Check endpoint URL is correct in service files
- Confirm WooCommerce REST API is enabled

#### 4. Build Errors

**Symptoms:** `npm run build` fails

**Solutions:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear webpack cache
rm -rf node_modules/.cache

# Check Node version (requires 16+)
node --version
```

#### 5. Styles Not Applying

**Symptoms:** Components have no styling

**Solutions:**
- Verify CSS file is loaded: check Network tab for `my-account.css`
- Rebuild CSS: `npm run build:css`
- Clear browser cache
- Check for CSS conflicts with WordPress theme

#### 6. Development Server Not Starting

**Symptoms:** `npm start` fails or port conflicts

**Solutions:**
```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Or use different port in webpack.config.js
devServer: {
  port: 3000
}
```

### Debug Mode

Enable verbose logging in `src/services/api.js`:

```javascript
// Add to response interceptor
console.log('API Response:', response);
console.log('API Error:', error);
```

### Getting Help

1. Check browser console for errors
2. Review WordPress debug log: `wp-content/debug.log`
3. Check network tab for failed API calls
4. Review git commit history for recent changes

---

## Additional Resources

### Documentation

- [React Documentation](https://react.dev)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [WooCommerce REST API](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)

### Related Files

- `../functions.php` - WordPress integration and custom REST API endpoints
- `package.json` - Dependencies and build scripts
- `webpack.config.js` - Webpack build configuration
- `tailwind.config.js` - Tailwind CSS theme configuration

---

## Contributing

### Code Style

- Use functional components with hooks
- Follow React best practices
- Use Tailwind utility classes
- Keep components small and focused
- Add loading and error states to all data fetching
- Include comments for complex logic

### Git Workflow

1. Create feature branch from `my-account`
2. Make changes with descriptive commits
3. Test thoroughly
4. Create pull request
5. Review and merge

### Testing

Before committing:
- [ ] Test all affected pages
- [ ] Check mobile responsiveness
- [ ] Verify API calls work
- [ ] Check browser console for errors
- [ ] Test loading and error states
- [ ] Build successfully completes

---

## Roadmap / Future Enhancements

### Completed (January 2025)
- [x] **Custom Avatar System** - Full avatar customization with upload and icons
- [x] **Responsive Breakpoint Optimization** - Better mobile/tablet experience
- [x] **List/Card View Toggle** - For Additional Memberships section
- [x] **Logout Button Positioning** - Always visible without scrolling
- [x] **Empty State CTAs** - Consistent "Join" buttons across all pages
- [x] **Basecamp Card Redesign** - Hero image with gradient overlay

### High Priority
- [ ] **Download Receipt** - Implement PDF receipt generation for orders
  - Add PDF generation library (jsPDF or similar)
  - Create branded receipt template
  - Include order details, line items, totals
  - Location: `OrderDetail.jsx` (currently hidden)

- [ ] **Contact Support** - Implement support contact functionality
  - Add contact form integration
  - Or link to existing support system
  - Location: `OrderDetail.jsx` (currently hidden)

### Medium Priority
- [ ] **Subscription Upgrade/Downgrade** - Enable plan changes
  - UI exists but functionality disabled
  - Requires proper subscription type configuration in WooCommerce

- [ ] **Bundle Size Optimization** - Reduce JavaScript bundle size
  - Currently 392 KiB (exceeds recommended 244 KiB)
  - Implement code splitting
  - Lazy load routes
  - Tree-shake unused components

- [ ] **Staging Payment Method Save** - Debug test mode token persistence
  - Tokens save successfully in production (live mode)
  - Test mode on staging: tokens created but not persisting to database
  - Investigating WooCommerce payment token caching and database write issues

### Low Priority
- [ ] **Enhanced Error Handling** - More user-friendly error messages
- [ ] **Loading States** - Skeleton screens for better UX
- [ ] **Offline Support** - Service worker for offline functionality
- [ ] **Performance Monitoring** - Add analytics/monitoring

### URL Structure

**Current Structure (Updated 2025):**
- Main dashboard: `/account/` (replaces WooCommerce My Account)
- Membership content: Top-level clean URLs (e.g., `/bodyweight-level-1/`)
  - WordPress admin: Organized under `/programs/` parent page
  - User-facing: Clean URLs without `/programs/` prefix
  - Automatic URL rewriting via `page_link` filter in functions.php

**Redirects (Backward Compatibility):**
- `/my-account/*` → `/account/*` (301 redirect)
- `/athlete/*` → `/account/*` (301 redirect)
- `/account-dashboard/*` → `/account/*` (301 redirect)
- `/programs/page-slug/` → `/page-slug/` (301 redirect)

**How URL Rewriting Works:**
1. Admin creates page under `/programs/` parent (e.g., `/programs/bodyweight-level-1/`)
2. `samsara_programs_rewrite_rules()` catches requests to `/bodyweight-level-1/`
3. WordPress internally routes to `/programs/bodyweight-level-1/`
4. `samsara_remove_programs_from_permalink()` filters `get_permalink()` to return clean URLs
5. User only sees `/bodyweight-level-1/` in browser and dashboard links

---

## License

Proprietary - Samsara Fitness Platform

---

## Questions?

For questions or issues:
1. Check this README
2. Check git commit history
3. Review WordPress debug logs
4. Contact development team
