# Native WooCommerce My Account Migration Plan
## Simplified Approach - Let Plugins Do Their Job

---

## Executive Summary

**Goal:** Migrate from React SPA to native WooCommerce My Account templates, eliminating custom REST API layer and letting WooCommerce + plugins handle functionality natively.

**Core Principle:** Use what WooCommerce and plugins already provide instead of rebuilding it.

**Timeline:** 2-3 weeks full-time (or 4-6 weeks part-time)

**Complexity Reduction:**
- Delete ~1,200-1,500 lines of custom REST endpoints
- Delete ~400KB React bundle
- Remove custom integration layers for plugins
- Use native forms, handlers, and workflows

---

## Key Benefits

### Immediate
✅ **Plugin Auto-Integration** - Cancellation surveys, gift cards work automatically
✅ **90% Less Custom Code** - Remove entire REST API layer
✅ **Zero JavaScript Bundle** - Or tiny Alpine.js (~15KB) for interactivity
✅ **Faster Development** - Future features use native WooCommerce patterns
✅ **Easier Maintenance** - Any WordPress developer can work on it

### Long-term
✅ **Future-Proof** - Plugin updates bring new features automatically
✅ **No Integration Debt** - New plugins work out-of-box
✅ **Standard Patterns** - Follow WooCommerce best practices
✅ **Better Performance** - Server-rendered, cacheable pages
✅ **Lower Costs** - Less custom development time

---

## Migration Architecture

### Technology Stack (After Migration)

**Backend:**
- PHP templates (WooCommerce child theme overrides)
- Direct WooCommerce/Plugin function calls
- WordPress hooks and filters

**Frontend:**
- Tailwind CSS 3.4.18 (existing config)
- Alpine.js 3.x (~15KB) for interactivity OR vanilla JavaScript
- Lucide icons (SVG)

**Data Access:**
- Direct PHP: `wcs_get_users_subscriptions()`
- No REST API for data fetching
- Standard form POST for actions

**Plugins (Work Automatically):**
- WooCommerce Subscriptions
- WooCommerce Gift Cards
- Cancellation Surveys & Offers
- Stripe Payment Gateway
- Any future WooCommerce plugins

### File Structure

```
wp-content/themes/understrap-child/
├── woocommerce/myaccount/
│   ├── dashboard.php                    (NEW - Tailwind styled)
│   ├── navigation.php                   (NEW - Custom sidebar/mobile nav)
│   ├── my-subscriptions.php             (NEW - Override with Tailwind)
│   ├── view-subscription.php            (NEW - Subscription detail)
│   ├── my-orders.php                    (NEW - Orders list)
│   ├── view-order.php                   (NEW - Order detail)
│   ├── payment-methods.php              (OPTIONAL - Can use WC default)
│   ├── form-add-payment-method.php      (OPTIONAL - Can use WC default)
│   ├── form-edit-account.php            (NEW - With avatar upload)
│   └── giftcards.php                    (OPTIONAL - Override GC plugin)
│
├── css/
│   └── my-account.css                   (Compiled Tailwind)
│
├── js/
│   └── my-account.js                    (Alpine.js components)
│
└── functions.php                        (Reduced by ~1,500 lines)
```

### What Gets DELETED

```
❌ my-account-react/src/                  (Entire React app)
❌ my-account-react/build/                (React bundle)
❌ my-account-react/package.json          (React dependencies)
❌ ~1,200-1,500 lines from functions.php  (REST endpoints)
```

### What Gets KEPT/REUSED

```
✅ my-account-react/tailwind.config.js    (Reuse for PHP templates)
✅ Brand colors, spacing, design system
✅ UX patterns (status badges, countdowns, layouts)
✅ Payment method workaround (if still needed for WPEngine)
✅ Avatar upload concept (simplified to form POST)
```

---

## Phase-by-Phase Implementation

### Phase 1: Foundation & Build Process (Days 1-2)

**Tasks:**
1. Configure Tailwind to compile CSS for PHP templates
2. Set up Alpine.js (CDN or local)
3. Create template override directory structure
4. Configure enqueue scripts in functions.php

**Deliverables:**
- Tailwind build process working
- Alpine.js loaded on My Account pages
- Template override structure ready

**Technical Details:**
```bash
# Tailwind build command
npx tailwindcss -i ./css/input.css -o ./css/my-account.css --watch

# Or add to package.json
"scripts": {
  "build:css": "tailwindcss -i ./css/input.css -o ./css/my-account.css --minify"
}
```

```php
// functions.php - Enqueue assets
function samsara_my_account_assets() {
    if (!is_account_page()) return;

    // Dequeue default WooCommerce styles
    wp_dequeue_style('woocommerce-general');
    wp_dequeue_style('woocommerce-layout');

    // Enqueue Tailwind
    wp_enqueue_style('samsara-my-account',
        get_stylesheet_directory_uri() . '/css/my-account.css',
        [],
        filemtime(get_stylesheet_directory() . '/css/my-account.css')
    );

    // Enqueue Alpine.js
    wp_enqueue_script('alpinejs',
        'https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js',
        [],
        '3.13.0',
        true
    );

    // Enqueue custom JS
    wp_enqueue_script('samsara-my-account',
        get_stylesheet_directory_uri() . '/js/my-account.js',
        ['alpinejs'],
        filemtime(get_stylesheet_directory() . '/js/my-account.js'),
        true
    );
}
add_action('wp_enqueue_scripts', 'samsara_my_account_assets');
```

---

### Phase 2: Navigation (Days 2-3)

**Goal:** Create custom responsive navigation matching React design

**Tasks:**
1. Override `navigation.php` template
2. Desktop: Left sidebar with user profile at top
3. Mobile: Bottom navigation bar (app-style)
4. Gold active states, icons for menu items
5. Logout button positioned correctly

**Template Example:**
```php
<!-- woocommerce/myaccount/navigation.php -->
<nav class="wc-account-navigation">
    <!-- Desktop Sidebar (hidden on mobile) -->
    <div class="hidden md:block md:sticky md:top-4 md:w-64">
        <!-- User Profile Section -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <?php
            $user = wp_get_current_user();
            $avatar_url = get_user_meta($user->ID, 'avatar_url', true);
            ?>
            <div class="text-center">
                <img src="<?php echo esc_url($avatar_url ?: get_avatar_url($user->ID)); ?>"
                     class="w-20 h-20 rounded-full mx-auto mb-3" />
                <h3 class="font-semibold text-lg"><?php echo esc_html($user->display_name); ?></h3>
                <p class="text-sm text-stone-500">Member since <?php echo date('Y', strtotime($user->user_registered)); ?></p>
            </div>
        </div>

        <!-- Navigation Links -->
        <ul class="space-y-2">
            <?php foreach (wc_get_account_menu_items() as $endpoint => $label) : ?>
                <li>
                    <a href="<?php echo esc_url(wc_get_account_endpoint_url($endpoint)); ?>"
                       class="<?php echo wc_get_account_menu_item_classes($endpoint); ?> block px-4 py-3 rounded-lg transition-colors
                              <?php echo (is_wc_endpoint_url($endpoint) ? 'bg-samsara-gold text-white' : 'text-stone-700 hover:bg-stone-100'); ?>">
                        <?php
                        // Add icons
                        echo get_menu_icon($endpoint);
                        echo esc_html($label);
                        ?>
                    </a>
                </li>
            <?php endforeach; ?>
        </ul>

        <!-- Logout Button -->
        <a href="<?php echo esc_url(wc_logout_url()); ?>"
           class="block mt-6 px-4 py-3 text-center text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            Logout
        </a>
    </div>

    <!-- Mobile Bottom Nav (visible on mobile only) -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 md:hidden z-50">
        <div class="flex justify-around">
            <?php
            $mobile_items = ['dashboard', 'subscriptions', 'orders', 'payment-methods', 'edit-account'];
            foreach ($mobile_items as $endpoint) :
                $label = wc_get_account_menu_items()[$endpoint];
                $is_active = is_wc_endpoint_url($endpoint);
            ?>
                <a href="<?php echo esc_url(wc_get_account_endpoint_url($endpoint)); ?>"
                   class="flex flex-col items-center py-3 px-4 <?php echo $is_active ? 'text-samsara-gold' : 'text-stone-600'; ?>">
                    <?php echo get_menu_icon($endpoint, 'w-6 h-6'); ?>
                    <span class="text-xs mt-1"><?php echo esc_html($label); ?></span>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
</nav>
```

**Helper Function:**
```php
// functions.php
function get_menu_icon($endpoint, $classes = 'w-5 h-5 inline-block mr-2') {
    $icons = [
        'dashboard' => '<svg class="' . $classes . '" fill="none" stroke="currentColor">...</svg>',
        'subscriptions' => '...',
        'orders' => '...',
        // etc.
    ];
    return $icons[$endpoint] ?? '';
}
```

---

### Phase 3: Dashboard (Days 3-4)

**Goal:** Convert Dashboard.jsx to native PHP template

**Tasks:**
1. Create `dashboard.php` template
2. Fetch primary subscription (server-side)
3. Display Athlete Team badge with team colors
4. Show Basecamp Training Hub card
5. Display additional memberships grid
6. Add countdown timers (Alpine.js)
7. Payment method expiry warnings

**Data Fetching (Direct PHP):**
```php
<?php
// Get user data
$user = wp_get_current_user();

// Get subscriptions
$subscriptions = wcs_get_users_subscriptions();
$primary_subscription = get_primary_subscription($user->ID); // Custom helper

// Get memberships
$memberships = wc_memberships_get_user_memberships($user->ID);

// Get payment methods
$tokens = WC_Payment_Tokens::get_customer_tokens($user->ID);

// Check for expiring cards
$expiring_soon = array_filter($tokens, function($token) {
    $expiry = strtotime($token->get_expiry_year() . '-' . $token->get_expiry_month() . '-01');
    $days_until_expiry = ($expiry - time()) / (60 * 60 * 24);
    return $days_until_expiry < 30;
});
?>
```

**Template Structure:**
```php
<div class="max-w-7xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-8">Dashboard</h1>

    <!-- Payment Method Alerts -->
    <?php if (!empty($expiring_soon)) : ?>
        <div class="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
            <p class="text-amber-800">
                Your credit card is expiring soon.
                <a href="<?php echo wc_get_account_endpoint_url('payment-methods'); ?>"
                   class="underline font-semibold">Update payment method</a>
            </p>
        </div>
    <?php endif; ?>

    <!-- Two Column Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Primary Subscription Card -->
        <?php if ($primary_subscription) : ?>
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-2xl font-semibold mb-4">
                    <?php echo $primary_subscription->get_name(); ?>
                </h2>

                <?php
                $status = $primary_subscription->get_status();
                $is_trial = is_subscription_trial($primary_subscription);
                ?>

                <!-- Status Badge -->
                <span class="px-3 py-1 rounded-full text-sm inline-block
                    <?php echo get_status_badge_classes($is_trial ? 'trial' : $status); ?>">
                    <?php echo $is_trial ? 'Trial' : ucfirst($status); ?>
                </span>

                <!-- Trial Warning -->
                <?php if ($is_trial) : ?>
                    <div class="bg-purple-50 border-l-4 border-purple-500 p-4 mt-4">
                        <p class="text-sm text-purple-800">
                            Trial ends in
                            <span x-data="countdown('<?php echo $primary_subscription->get_date('trial_end'); ?>')">
                                <strong x-text="daysRemaining"></strong> days
                            </span>
                            <br>
                            Converts to $<?php echo $primary_subscription->get_total(); ?>/<?php echo $primary_subscription->get_billing_period(); ?>
                        </p>
                    </div>
                <?php elseif ($status === 'active') : ?>
                    <!-- Next Payment Countdown -->
                    <div class="mt-4">
                        <p class="text-stone-600">
                            Next payment in
                            <span x-data="countdown('<?php echo $primary_subscription->get_date('next_payment'); ?>')">
                                <strong x-text="daysRemaining"></strong> days
                            </span>
                        </p>
                    </div>
                <?php endif; ?>
            </div>
        <?php else : ?>
            <!-- Empty State: Join Athlete Team -->
            <div class="bg-gradient-to-br from-stone-100 to-stone-200 rounded-lg p-8 text-center">
                <h3 class="text-xl font-semibold mb-3">Join Athlete Team</h3>
                <a href="/product/athlete-team/"
                   class="bg-samsara-gold text-white px-6 py-3 rounded-lg inline-block hover:bg-yellow-600">
                    Get Started
                </a>
            </div>
        <?php endif; ?>

        <!-- Basecamp Training Hub -->
        <div class="relative rounded-lg overflow-hidden h-64 bg-cover bg-center"
             style="background-image: url('<?php echo get_stylesheet_directory_uri(); ?>/images/basecamp-hero.jpg');">
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h2 class="text-2xl font-bold mb-2">Basecamp Training Hub</h2>
                <a href="<?php echo esc_url(get_option('basecamp_url')); ?>"
                   target="_blank"
                   class="bg-samsara-gold text-white px-6 py-2 rounded-lg inline-block hover:bg-yellow-600">
                    Open Basecamp →
                </a>
            </div>
        </div>
    </div>
</div>

<!-- Alpine.js Countdown Component -->
<script>
document.addEventListener('alpine:init', () => {
    Alpine.data('countdown', (endDate) => ({
        daysRemaining: 0,
        init() {
            this.calculate();
            setInterval(() => this.calculate(), 60000);
        },
        calculate() {
            const end = new Date(endDate);
            const now = new Date();
            const diff = end - now;
            this.daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
        }
    }));
});
</script>
```

**Helper Functions:**
```php
// functions.php

function get_primary_subscription($user_id) {
    $subscriptions = wcs_get_users_subscriptions($user_id);

    // Priority: Active Athlete Team > Active Basecamp > Any Active > Trial
    $priority = ['athlete-team', 'basecamp'];

    foreach ($priority as $slug) {
        foreach ($subscriptions as $sub) {
            if ($sub->has_status('active') && strpos($sub->get_name(), $slug) !== false) {
                return $sub;
            }
        }
    }

    // Fallback to first active or trial
    foreach ($subscriptions as $sub) {
        if ($sub->has_status(['active', 'trialling'])) {
            return $sub;
        }
    }

    return null;
}

function is_subscription_trial($subscription) {
    $trial_end = $subscription->get_date('trial_end');
    return $trial_end && strtotime($trial_end) > time() && $subscription->has_status('active');
}

function get_status_badge_classes($status) {
    $classes = [
        'active' => 'bg-green-100 text-green-800',
        'trial' => 'bg-purple-100 text-purple-800',
        'cancelled' => 'bg-amber-100 text-amber-800',
        'on-hold' => 'bg-red-100 text-red-800',
        'pending' => 'bg-blue-100 text-blue-800',
    ];
    return $classes[$status] ?? 'bg-stone-100 text-stone-600';
}
```

---

### Phase 4: Subscriptions (Days 5-7)

**Goal:** Native subscription list and detail pages

#### 4A: Subscriptions List

**Override:** `my-subscriptions.php`

**Template:**
```php
<!-- woocommerce/myaccount/my-subscriptions.php -->
<?php
$subscriptions = wcs_get_users_subscriptions();
?>

<div class="max-w-7xl mx-auto p-6" x-data="subscriptionFilter()">
    <h1 class="text-3xl font-bold mb-6">Subscriptions</h1>

    <!-- Filters -->
    <div class="flex gap-4 mb-6">
        <select x-model="statusFilter" class="px-4 py-2 border rounded-lg">
            <option value="all">All Subscriptions</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="cancelled">Cancelled</option>
        </select>
    </div>

    <!-- Subscriptions Table -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <table class="w-full">
            <thead class="bg-stone-50 border-b">
                <tr>
                    <th class="px-6 py-3 text-left text-sm font-semibold">Plan</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold">Next Payment</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                    <th class="px-6 py-3"></th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($subscriptions as $subscription) :
                    $is_trial = is_subscription_trial($subscription);
                    $status = $is_trial ? 'trial' : $subscription->get_status();
                ?>
                    <tr class="border-b hover:bg-stone-50">
                        <td class="px-6 py-4">
                            <a href="<?php echo $subscription->get_view_order_url(); ?>"
                               class="font-semibold text-samsara-gold hover:underline">
                                <?php echo $subscription->get_name(); ?>
                            </a>
                        </td>
                        <td class="px-6 py-4">
                            <span class="px-3 py-1 rounded-full text-sm <?php echo get_status_badge_classes($status); ?>">
                                <?php echo $is_trial ? 'Trial' : ucfirst($status); ?>
                            </span>
                        </td>
                        <td class="px-6 py-4 text-stone-600">
                            <?php
                            $next_payment = $subscription->get_date('next_payment');
                            echo $next_payment ? date('M j, Y', strtotime($next_payment)) : '—';
                            ?>
                        </td>
                        <td class="px-6 py-4 font-semibold">
                            $<?php echo $subscription->get_total(); ?>
                        </td>
                        <td class="px-6 py-4 text-right">
                            <a href="<?php echo $subscription->get_view_order_url(); ?>"
                               class="text-samsara-gold hover:underline">
                                View →
                            </a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>
```

#### 4B: Subscription Detail

**Override:** `view-subscription.php`

**Key Feature:** Cancellation survey plugin works automatically!

**Template:**
```php
<!-- woocommerce/myaccount/view-subscription.php -->
<?php
$subscription = wcs_get_subscription($subscription_id);
$status = $subscription->get_status();
$is_trial = is_subscription_trial($subscription);
?>

<div class="max-w-4xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">
        Subscription #<?php echo $subscription->get_order_number(); ?>
    </h1>

    <!-- Trial Warning Banner -->
    <?php if ($is_trial) : ?>
        <div class="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
            <p class="text-sm text-purple-800">
                Your trial ends on <?php echo date('F j, Y', strtotime($subscription->get_date('trial_end'))); ?>.
                After that, you'll be charged $<?php echo $subscription->get_total(); ?>
                per <?php echo $subscription->get_billing_period(); ?>.
            </p>
        </div>
    <?php endif; ?>

    <!-- On-Hold Banner -->
    <?php if ($status === 'on-hold') : ?>
        <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p class="text-sm text-red-800">
                Payment Failed. Please
                <a href="<?php echo wc_get_account_endpoint_url('payment-methods'); ?>"
                   class="underline font-semibold">update your payment method</a>.
            </p>
        </div>
    <?php endif; ?>

    <!-- Subscription Details Card -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-2xl font-semibold mb-4"><?php echo $subscription->get_name(); ?></h2>

        <div class="grid grid-cols-2 gap-6">
            <div>
                <p class="text-sm text-stone-500 mb-1">Start Date</p>
                <p class="text-lg font-semibold">
                    <?php echo date('F j, Y', strtotime($subscription->get_date('start'))); ?>
                </p>
            </div>
            <div>
                <p class="text-sm text-stone-500 mb-1">Next Payment</p>
                <p class="text-lg font-semibold">
                    <?php
                    $next = $subscription->get_date('next_payment');
                    echo $next ? date('F j, Y', strtotime($next)) : '—';
                    ?>
                </p>
            </div>
        </div>
    </div>

    <!-- Actions Section -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">Manage Subscription</h3>

        <?php
        // WooCommerce Subscriptions renders action buttons
        // Cancellation Surveys & Offers plugin hooks in automatically!
        ?>
        <div class="flex gap-4">
            <?php foreach ($subscription->get_actions() as $key => $action) : ?>
                <a href="<?php echo esc_url($action['url']); ?>"
                   class="<?php echo $key === 'cancel' ? 'bg-red-600 hover:bg-red-700' : 'bg-samsara-gold hover:bg-yellow-600'; ?>
                          text-white px-6 py-3 rounded-lg">
                    <?php echo esc_html($action['name']); ?>
                </a>
            <?php endforeach; ?>
        </div>

        <?php
        // CRITICAL: This hook renders the cancellation survey modal automatically!
        do_action('woocommerce_subscription_after_actions', $subscription);
        ?>
    </div>

    <!-- Related Orders -->
    <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold mb-4">Related Orders</h3>
        <table class="w-full">
            <tbody>
                <?php foreach ($subscription->get_related_orders() as $order) : ?>
                    <tr class="border-b">
                        <td class="py-3">#<?php echo $order->get_order_number(); ?></td>
                        <td class="py-3"><?php echo $order->get_date_created()->date('M j, Y'); ?></td>
                        <td class="py-3 font-semibold">$<?php echo $order->get_total(); ?></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>
```

**🎯 KEY POINT:** The `do_action('woocommerce_subscription_after_actions', $subscription)` line makes the cancellation survey modal appear automatically! No custom REST endpoints needed!

---

### Phase 5: Orders, Payments, Gift Cards (Days 8-10)

#### 5A: Orders (Days 8-9)

**Use WooCommerce default templates or add Tailwind classes**

Templates:
- `my-orders.php` - Orders list
- `view-order.php` - Order detail

**Can use WooCommerce defaults entirely, or override for Tailwind styling**

#### 5B: Payment Methods (Day 9)

**Use WooCommerce + Stripe Gateway Native Flow**

**No custom templates needed!** Use native pages:
- `/my-account/payment-methods/` - List/delete payment methods
- `/my-account/add-payment-method/` - Add new card

**What WooCommerce/Stripe handles automatically:**
- Setup Intent creation
- Stripe Elements rendering
- 3D Secure authentication
- Payment token storage
- Customer association

**Optional:** Override templates to add Tailwind styling

#### 5C: Gift Cards (Day 10)

**Use Plugin's Native Template**

**Plugin provides:**
- Gift card list at `/my-account/giftcards/`
- Balance display
- Redemption form (native form POST)
- Transaction history

**Override only if you want custom Tailwind styling**

---

### Phase 6: Account Details & Avatar (Days 11-12)

**Override:** `form-edit-account.php`

**Simplified avatar upload via form POST (no REST API)**

**Template:**
```php
<!-- woocommerce/myaccount/form-edit-account.php -->
<form method="post" enctype="multipart/form-data" class="max-w-2xl mx-auto p-6">
    <?php wp_nonce_field('save_account_details', 'save-account-details-nonce'); ?>

    <!-- Account Fields -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-2xl font-semibold mb-6">Account Details</h2>

        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-2">First Name</label>
                <input type="text" name="account_first_name"
                       value="<?php echo esc_attr($user->first_name); ?>"
                       class="w-full px-4 py-2 border rounded-lg" />
            </div>

            <div>
                <label class="block text-sm font-medium mb-2">Email</label>
                <input type="email" name="account_email"
                       value="<?php echo esc_attr($user->user_email); ?>"
                       class="w-full px-4 py-2 border rounded-lg" />
            </div>
        </div>
    </div>

    <!-- Avatar Section -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-2xl font-semibold mb-6">Avatar</h2>

        <?php
        $avatar_type = get_user_meta($user->ID, 'avatar_type', true) ?: 'gravatar';
        $avatar_url = get_user_meta($user->ID, 'avatar_url', true);
        ?>

        <!-- Current Avatar -->
        <div class="mb-6 text-center">
            <img src="<?php echo $avatar_url ?: get_avatar_url($user->ID); ?>"
                 class="w-32 h-32 rounded-full mx-auto" />
        </div>

        <!-- Avatar Options -->
        <div class="space-y-4">
            <label class="flex items-center p-4 border rounded-lg">
                <input type="radio" name="avatar_type" value="gravatar"
                       <?php checked($avatar_type, 'gravatar'); ?> />
                <span class="ml-3">Use Gravatar</span>
            </label>

            <label class="flex items-center p-4 border rounded-lg">
                <input type="radio" name="avatar_type" value="upload"
                       <?php checked($avatar_type, 'upload'); ?> />
                <div class="ml-3 flex-1">
                    <span class="block mb-2">Upload Photo</span>
                    <input type="file" name="avatar_upload" accept="image/*" />
                </div>
            </label>

            <label class="flex items-center p-4 border rounded-lg">
                <input type="radio" name="avatar_type" value="emoji"
                       <?php checked($avatar_type, 'emoji'); ?> />
                <div class="ml-3 flex-1">
                    <span class="block mb-2">Choose Icon</span>
                    <div class="grid grid-cols-6 gap-2">
                        <?php
                        $icons = ['🏔️', '🌲', '⛺', '🔥', '🧭', '🎒', '🗺️', '🔭', '🏮', '🧃', '🥾'];
                        foreach ($icons as $icon) : ?>
                            <label class="text-2xl text-center p-2 border rounded">
                                <input type="radio" name="avatar_emoji" value="<?php echo $icon; ?>"
                                       class="sr-only" />
                                <?php echo $icon; ?>
                            </label>
                        <?php endforeach; ?>
                    </div>
                </div>
            </label>
        </div>
    </div>

    <button type="submit" name="save_account_details"
            class="bg-samsara-gold text-white px-8 py-3 rounded-lg">
        Save Changes
    </button>
</form>
```

**Form Handler:**
```php
// functions.php
add_action('woocommerce_save_account_details', 'samsara_save_avatar_settings', 10, 1);

function samsara_save_avatar_settings($user_id) {
    if (!isset($_POST['save-account-details-nonce'])) return;

    $avatar_type = sanitize_text_field($_POST['avatar_type']);
    update_user_meta($user_id, 'avatar_type', $avatar_type);

    // Handle upload
    if ($avatar_type === 'upload' && !empty($_FILES['avatar_upload']['name'])) {
        $upload = wp_handle_upload($_FILES['avatar_upload'], ['test_form' => false]);
        if (!isset($upload['error'])) {
            update_user_meta($user_id, 'avatar_url', $upload['url']);
        }
    }

    // Handle emoji
    if ($avatar_type === 'emoji' && !empty($_POST['avatar_emoji'])) {
        update_user_meta($user_id, 'avatar_emoji', $_POST['avatar_emoji']);
    }
}
```

---

### Phase 7: Testing & Cleanup (Days 13-14)

**Testing Checklist:**
- [ ] All subscription states (active, trial, cancelled, on-hold)
- [ ] Cancellation survey modal appears
- [ ] Gift card redemption works
- [ ] Payment method addition (native WooCommerce page)
- [ ] Avatar upload and selection
- [ ] Mobile navigation (bottom bar)
- [ ] Desktop navigation (sidebar)
- [ ] Cross-browser testing
- [ ] Performance audit

**Cleanup:**
```bash
# Delete React app
rm -rf my-account-react/src/
rm -rf my-account-react/build/
rm my-account-react/package.json
rm my-account-react/webpack.config.js
```

**functions.php Cleanup:**

**Remove (~1,200-1,500 lines):**
- ❌ All REST endpoint registrations
- ❌ All GET endpoint handlers (subscriptions, gift cards, memberships, stats)
- ❌ POST endpoint handlers (cancel-with-survey, redeem gift card, payment methods)
- ❌ Data transformer functions

**Keep:**
- ✅ Enqueue scripts/styles function
- ✅ Helper functions (get_primary_subscription, status badges, etc.)
- ✅ Avatar save handler
- ✅ Payment method workaround (if still needed)

---

## Code Comparison: Before vs After

### Before (React SPA)

**Dashboard Data Fetching:**
```javascript
// React Component (50+ lines)
const { data: subscriptions } = useSubscriptions();
const { data: memberships } = useMemberships();

// Custom REST endpoints
GET /samsara/v1/user-subscriptions
GET /samsara/v1/memberships

// functions.php (150+ lines per endpoint)
function get_user_subscriptions($request) {
    // 150+ lines of transformation logic
}
```

### After (Native PHP)

**Dashboard Data Fetching:**
```php
<!-- PHP Template (10 lines) -->
<?php
$subscriptions = wcs_get_users_subscriptions();
$memberships = wc_memberships_get_user_memberships(get_current_user_id());
?>

<h2><?php echo $subscriptions[0]->get_name(); ?></h2>
```

**Lines of Code:**
- Before: ~500 lines (endpoints + React + hooks)
- After: ~50 lines (template + helper)
- **Reduction: 90%**

---

## Success Metrics

### Code Reduction
- functions.php: 3,616 lines → ~2,100 lines (42% reduction)
- JavaScript bundle: 447KB → 0-15KB (97% reduction)
- Total codebase: ~8,000 lines → ~3,500 lines (56% reduction)

### Performance
- Initial load: ~1.2s → ~400ms (67% faster)
- Bundle size: 447KB → 15KB (97% smaller)

### Maintenance
- Plugin integration: Custom code → Automatic
- Future features: Days/weeks → Hours
- Developer requirements: React specialist → Any WordPress dev

---

## Migration Timeline

| Phase | Days | Deliverable |
|-------|------|-------------|
| Foundation | 1-2 | Tailwind + Alpine setup |
| Navigation | 2-3 | Custom nav |
| Dashboard | 3-4 | Native dashboard |
| Subscriptions | 5-7 | List + detail with plugin |
| Orders/Payments/GC | 8-10 | Native flows |
| Account/Avatar | 11-12 | Form upload |
| Testing/Cleanup | 13-14 | Delete React code |

**Total: 2-3 weeks full-time**

---

## REST Endpoints to DELETE

**All of these can be removed:**

### GET Endpoints (Data Fetching)
- ❌ `GET /samsara/v1/user-subscriptions`
- ❌ `GET /samsara/v1/subscriptions/{id}/orders`
- ❌ `GET /samsara/v1/memberships`
- ❌ `GET /samsara/v1/stats`
- ❌ `GET /samsara/v1/gift-cards`
- ❌ `GET /samsara/v1/gift-cards/{id}`
- ❌ `GET /samsara/v1/gift-cards/balance/{code}`
- ❌ `GET /samsara/v1/customer-addresses`

### POST Endpoints (Actions)
- ❌ `POST /samsara/v1/subscriptions/{id}/cancel-with-survey` (plugin handles)
- ❌ `POST /samsara/v1/subscriptions/{id}/take-discount-offer` (plugin handles)
- ❌ `POST /samsara/v1/gift-cards/{id}/redeem` (plugin handles)
- ❌ `POST /samsara/v1/payment-methods` (WooCommerce handles)
- ❌ `POST /samsara/v1/payment-methods/confirm` (WooCommerce handles)
- ❌ `POST /samsara/v1/avatar/upload` (can use form POST)

### Avatar Endpoints
- ❌ `POST /samsara/v1/avatar/upload` (simplified to form)
- ❌ `GET /samsara/v1/avatar/preferences` (direct user meta access)
- ❌ `PUT /samsara/v1/avatar/preferences` (form POST)

**Total Deletion:** ~1,200-1,500 lines of custom code!

---

## Why This Works

### Plugins Integrate Automatically

**Cancellation Surveys & Offers:**
- Hooks into `woocommerce_subscription_after_actions`
- Replaces cancel button URL automatically
- Renders modal in template
- Handles form submission via WooCommerce AJAX
- **Zero custom code needed**

**WooCommerce Gift Cards:**
- Adds `/my-account/giftcards/` endpoint
- Provides redemption form
- Handles form POST natively
- **Zero custom code needed**

**Stripe Payment Gateway:**
- Provides `/my-account/add-payment-method/` page
- Handles Setup Intent creation
- Renders Stripe Elements
- Saves payment tokens
- **Zero custom code needed**

### Direct Data Access is Simpler

**React Approach:**
```javascript
// 1. Create REST endpoint (150 lines)
// 2. Register route
// 3. Handle authentication
// 4. Fetch data
// 5. Transform data
// 6. Return JSON
// 7. React hook to call API (50 lines)
// 8. Component to display (100 lines)
// Total: 300+ lines
```

**PHP Template Approach:**
```php
<?php
$subscription = wcs_get_subscription($id);
echo $subscription->get_name();
// Total: 2 lines
?>
```

---

## Getting Started (When Ready)

### Step 1: Create Branch
```bash
git checkout -b feature/native-my-account
```

### Step 2: Set Up Tailwind
```bash
cd wp-content/themes/understrap-child/
mkdir -p css js woocommerce/myaccount
```

### Step 3: Create First Template
```bash
# Start with navigation
touch woocommerce/myaccount/navigation.php
```

### Step 4: Test
- Navigate to `/my-account/`
- Verify new template loads
- Iterate on design

---

## Summary

This migration **dramatically simplifies** your architecture by:

1. **Deleting 90% of custom REST API code**
2. **Removing 400KB JavaScript bundle**
3. **Using native plugin functionality**
4. **Following WooCommerce best practices**

The key insight: **WooCommerce and plugins already do everything you need** - you just need to style the native templates with Tailwind.

**The goal is to DELETE code, not write more.**

This is the streamlined, maintainable approach you were looking for! 🎯
