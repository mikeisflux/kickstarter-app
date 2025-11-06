# Wholesale All In One - Comprehensive App Guide & Custom Implementation Plan

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [App Overview](#app-overview)
3. [Core Features Breakdown](#core-features-breakdown)
4. [Technical Architecture](#technical-architecture)
5. [Shopify API Integration (October 2024)](#shopify-api-integration-october-2024)
6. [Database Schema Requirements](#database-schema-requirements)
7. [Custom Implementation for Kickstarter](#custom-implementation-for-kickstarter)
8. [Development Roadmap](#development-roadmap)
9. [Security & Compliance](#security-and-compliance)

---

## Executive Summary

**Wholesale All In One** by DigitalCoo is a comprehensive B2B pricing and customer management solution for Shopify stores. This document provides a complete breakdown of all features and outlines the architecture needed to build a custom private app tailored for Kickstarter backer fulfillment with wholesale pricing capabilities.

**Target Use Case**: Managing Kickstarter backers as wholesale customers with tiered pricing, minimum order requirements, and specialized shipping rules.

---

## App Overview

### What It Does
The app enables store owners to:
- Create separate pricing tiers for wholesale customers
- Manage customer access via tags
- Set minimum order requirements
- Customize shipping rates for wholesale orders
- Create manual wholesale orders from the dashboard
- Hide prices from non-logged-in users
- Provide volume discounts

### Customer Types Supported
1. **Regular retail customers** - Standard Shopify pricing
2. **Tagged wholesale customers** - Discounted pricing based on customer tags
3. **All logged-in customers** - Universal discounts for authenticated users
4. **Guest customers** - Can optionally hide prices/products

---

## Core Features Breakdown

### 1. Wholesale Pricing Rules

#### 1.1 Common Wholesale Pricing
Creates pricing rules that apply across multiple collections or the entire store.

**Components**:
- **Rule Name**: Internal identifier (not visible to customers)
- **Status**: Published (active) or Unpublished (inactive)
- **Customer Targeting**:
  - Logged-in customers with matching tag (Recommended)
  - All logged-in customers
  - All customers (requires Business plan upgrade)
- **Product Scope**:
  - All products
  - Specific products
  - Product collections
  - Exclude specific products/collections
- **Discount Types**:
  - Percentage off (e.g., 40% off retail)
  - Fixed amount off (e.g., $10 off per item)
  - Fixed price (e.g., set price to $50)
- **Scheduling**: Optional start/end dates
- **Customer Eligibility Checker**: Verify customer eligibility by email

**Example Configuration**:
```
Rule: "Percentage"
Collections: 33 collections
Customer Tag: "wholesale"
Discount: 40% off retail price
Status: Published
```

#### 1.2 Specific Collections Pricing
Apply different pricing to specific product collections.

**Configuration**:
- Select one collection (e.g., "Dead Sexy #1 Books")
- Apply 50% discount
- Target customers with "demo" tag
- Status: Published

#### 1.3 Standard Pricing Rule
Baseline wholesale pricing for broader product ranges.

**Configuration**:
- 5 collections selected
- 30% discount
- Customer tag: "wholesale"
- Status: Unpublished (draft mode)

---

### 2. Individual Wholesale Pricing

Allows variant-level discount management for specific products.

**Features**:
- **Product Selection**: Search by title, handle, or SKU
- **Variant-Level Control**: Individual pricing per SKU
- **Actions Column**: 
  - Copy product/variant settings
  - Delete individual variants from rule
- **Display Options**: View product title, images, and variant details

**Example**:
```
Product: "Trip Story #1 CVR F Sutton"
Variants:
  - Regular (SKU: 5039853)
  - Naughty (SKU: 5039854)
  - Extra Naughty (SKU: 5039855)
Each variant can have individual discount applied
```

---

### 3. Volume Pricing (Quantity-Based Discounts)

#### 3.1 Common Volume Pricing
Store-wide quantity-based pricing for wholesale customers.

**Configuration**:
- **Customer Tag**: "demo"
- **Product Scope**: Entire store
- **Exclude Options**: 
  - Exclude specific collections
  - Exclude specific products
- **Discount Method**: Percentage, Fixed Amount, or Fixed Price
- **Status**: Unpublished

#### 3.2 Individual Volume Pricing
Product-specific tiered quantity discounts.

**Features**:
- **Tag-Based Customers**: Target specific wholesale groups
- **Product Selection**: Choose specific products
- **Tiered Pricing Structure**:
  ```
  Qty 5:  55% off
  Qty 10: 60% off
  Qty 15: 65% off
  ```
- **Discount Types**:
  - **Per variant separately**: Quantity applies per individual SKU
  - **Across variants per product**: Mix variants within one product
  - **Across multiple products**: Mix variants across selected products

**Volume Pricing Table**: 
- Display on product detail page
- Shows quantity breaks and pricing
- Customizable design

#### 3.3 Discount Type Options
1. **Decrease by percentage (%)**: X% off retail price
2. **Decrease by fixed amount**: $X off retail price
3. **Apply fixed price**: Set specific wholesale price

**Important Note**: Percentage discounts calculate from current retail price, not compare-at price. If retail price changes in Shopify, wholesale price adjusts automatically.

---

### 4. Shipping Management

#### 4.1 Wholesale Shipping Rules
Custom shipping rates for wholesale customers.

**Configuration**:
- **Shipping Title**: "Retailer Free Shipping" (22/80 character limit)
- **Shipping Message**: Optional cart message (0/160 character limit)
- **Customer Selection**:
  - All customers (requires upgrade)
  - All logged-in customers
  - Logged-in customers with matching tag (Recommended)
- **Geographic Scope**:
  - Apply for all countries
  - Apply for specific countries
- **Custom Shipping Charges**:
  - **Flat rate on entire order**
  - **Percentage of cart total**
  - **Conditional rates** (based on conditions)

#### 4.2 Price Range Configuration
- **Based On**:
  - Cart Total Amount (Subtotal)
  - Cart Total Items (Quantity)
  - Cart Total Weight (Pounds)
- **Shipping Charges**: $0.00 (Free)
- **Minimum Amount**: $0.00
- **Maximum Amount**: No limit

#### 4.3 Shipping Examples
```
Example 1: Free shipping for wholesale customers
- Customer tag: "wholesale"
- Shipping charge: $0.00
- Minimum: $0.00
- Status: Active

Example 2: Flat $10 shipping
- Customer tag: "wholesale"
- Shipping charge: $10.00
- Minimum cart: $50.00
- Status: Active
```

---

### 5. Order Management

#### 5.1 Create Wholesale Order
Manual order creation feature for placing orders on behalf of wholesale customers.

**Process**:
1. Access from Order Management dashboard
2. Select customer
3. Add products at wholesale prices
4. Apply customer's discount automatically
5. Generate order in Shopify

**Use Cases**:
- Phone orders
- Email orders
- Trade show orders
- Repeat orders for regular wholesale customers

#### 5.2 Order Limit Rules
Enforce minimum order requirements for wholesale customers.

**Configuration**:
- **Rule Name**: "Order limit" (internal use only)
- **Status**: Active or Inactive
- **Customer Selection**: Tag-based or all logged-in
- **Order Limit Scope**:
  - **All orders**: Standard limit for all orders
  - **Separate first/subsequent**: Different limits for new vs returning
  - **First orders only**: Limit only applies to first purchase

**Conditions**:
- **Minimum Purchase Order Requirement**: Custom message displayed at cart/checkout
- **Must match to place order**:
  - All conditions (AND logic)
  - Any condition (OR logic)
- **Conditional Logic**:
  ```
  Cart total amount [is minimum] [$100]
  ```
- **Actions When Not Met**:
  - Stop customer from placing order
  - Allow order at retail price (apply wholesale only when requirements met)

**Example**:
```
Rule: "Order limit"
Message: "You must order at least 10 books."
Customer Tag: "wholesale"
Condition: Cart total amount is minimum $100
Status: Active
```

---

### 6. Additional Add-ons

#### 6.1 Net Terms
Allow wholesale customers to place orders and pay later.

**Features**:
- Credit terms management
- Payment due date tracking
- Account balance tracking

#### 6.2 Quick Order Form
One-page bulk ordering form for frequent purchasers.

**Features**:
- SKU-based quick add
- Quantity entry for multiple products
- Fast checkout process

#### 6.3 Advanced Mode
Manage quantity limits at product and variant levels.

**Use Cases**:
- Stock limitations per customer
- Allocation management
- Sample order limits

#### 6.4 Manage Policy (Show/Hide Products)
Control product visibility for specific customers.

**Features**:
- Hide products from non-wholesale customers
- Show exclusive products to tagged customers
- Create customer-specific catalogs

#### 6.5 Import/Export
Bulk management via CSV files.

**Features**:
- Upload wholesale pricing in bulk
- Export current pricing rules
- Batch customer tag management

#### 6.6 Login to View Prices
Hide pricing from non-authenticated users.

**Features**:
- Require login to see prices
- Encourage customer registration
- Protect wholesale pricing information

---

### 7. Settings & Configuration

#### 7.1 General Settings

**Crossed-Out Prices Display**:
- Show crossed-out retail prices on storefront
- Display 'Compare at price' as crossed-out price
- Visual example available

**Coupon Code Field Management**:
- **Enable for all wholesale customers**: Coupon field available to everyone
- **Enable for specific tagged wholesale customers**: Selective access
- **Disabled for all wholesale customers** (Recommended): 
  - Shopify coupon field appears for non-wholesale customers
  - Hidden for any order with app discount/shipping

**Prevent Shopify Automatic Discounts**:
- Checkbox to disable Shopify's automatic discount conflicts

#### 7.2 Checkout Discount Methods

Two API methods for applying discounts:

**Method 1: Draft Order API** (Recommended)
- Uses Draft Order API to apply discounts/shipping
- Compatible with Manage Shipping feature
- Compatible with Charge Additional Fee feature
- **Discount Label**: "DISCOUNT" (appears on checkout/order pages)

**Method 2: Coupon Code API**
- Uses Coupon Code API for discounts
- NOT compatible with Manage Shipping
- NOT compatible with Charge Additional Fee
- Auto-switches to Draft Order API if shipping applicable

**Important**: Review differences before changing methods as each has limitations.

#### 7.3 Login Page Customization

Three options for wholesale signup integration:

**Option 1: Do not add Wholesale Signup form link**
- Keep default Shopify login page only

**Option 2: Disable default Shopify Signup and add wholesale link**
- Remove standard "Create account"
- Add wholesale signup link only

**Option 3: Add wholesale Signup link after default Shopify link** (Selected)
- Keep both options visible
- **Wholesale Signup Form Link**: `https://divinitycomics.com/pages/wholesale`
- **Link Label**: "Create wholesale account"

#### 7.4 Additional Features

**Charge Additional Fee for Wholesale Orders**:
- Optional checkbox to enable
- Add processing fees
- Credit card fees
- Handling charges

**Sale Clock**:
- Display countdown timer on product pages
- **Configuration**:
  - Background color: #000000 (black)
  - Foreground color: #ffffff (white)
  - Text alignment: Left
  - Font size: Slider control
  - Border radius: Slider control
- **Preview**: "Sale ends in 2days, 1hour, 59minutes, 43seconds"
- Reset to default option

---

### 8. Theme Integration

#### 8.1 Supported Free Themes
The app works with these free Shopify themes via Theme App Embeds:
- Dawn
- Publisher
- Refresh
- Heritage
- Vessel
- Dwell
- Taste
- Craft
- Spotlight
- Pitch
- Studio
- Crave
- Tinker
- Colorblock
- Trade
- Sense
- Fabric
- Atelier
- Ride
- Savor
- Origin
- Ritual
- Horizon
- Rise

#### 8.2 Integration Steps
1. Log into Shopify admin
2. Navigate to Online Store → Themes
3. Click "Customize" button on active theme
4. Click "App embeds" icon in customization section
5. Find "Wholesale All In One" and enable checkbox
6. Click "Save" to apply changes

**Note**: If using custom or paid theme not in list, contact DigitalCoo for custom integration support.

#### 8.3 App Activation Checklist
- ✅ Plan activation
- ✅ App Integration
- ✅ Create a pricing rule
- ✅ Launch to Customers

#### 8.4 App Modes
- **Live Mode (Deploy)**: Features visible to live customers in real-time
- **Test Mode (Preview)**: Safely test features without showing on live store

---

## Technical Architecture

### System Components

#### 1. Frontend Components
- **Customer Portal**: Login, registration, wholesale signup forms
- **Product Display**: Price display logic, crossed-out pricing, volume pricing tables
- **Cart System**: Discount calculation, minimum order validation
- **Checkout Integration**: Custom shipping rates, order limits, discount application

#### 2. Backend Components
- **Pricing Engine**: Rule evaluation, discount calculation, volume tier logic
- **Customer Manager**: Tag management, eligibility verification, customer groups
- **Order Processing**: Manual order creation, wholesale order handling
- **Shipping Calculator**: Custom rate calculation, zone management
- **Rule Engine**: Conditional logic evaluation, date-based activation

#### 3. Data Models

**Pricing Rule Structure**:
```javascript
{
  id: "uuid",
  name: "Rule Name",
  type: "wholesale|volume|individual",
  status: "published|unpublished",
  discount_type: "percentage|fixed_amount|fixed_price",
  discount_value: 40,
  customer_tags: ["wholesale"],
  product_scope: "all|collections|specific",
  product_ids: [],
  collection_ids: [],
  excluded_product_ids: [],
  excluded_collection_ids: [],
  schedule: {
    start_date: "2024-10-01T00:00:00Z",
    end_date: null
  },
  created_at: "timestamp",
  updated_at: "timestamp"
}
```

**Volume Pricing Tier Structure**:
```javascript
{
  rule_id: "uuid",
  tiers: [
    { quantity: 5, discount_percentage: 55 },
    { quantity: 10, discount_percentage: 60 },
    { quantity: 15, discount_percentage: 65 }
  ],
  tier_type: "per_variant|per_product|across_products",
  applicable_products: []
}
```

**Order Limit Rule Structure**:
```javascript
{
  id: "uuid",
  name: "Order Limit",
  status: "active|inactive",
  customer_tags: ["wholesale"],
  scope: "all|first_only|separate_first",
  conditions: [
    {
      field: "cart_total_amount",
      operator: "is_minimum",
      value: 100
    }
  ],
  condition_logic: "all|any",
  failure_action: "block|allow_retail",
  message: "You must order at least 10 books.",
  created_at: "timestamp"
}
```

**Shipping Rule Structure**:
```javascript
{
  id: "uuid",
  title: "Retailer Free Shipping",
  message: "",
  customer_tags: ["wholesale"],
  geographic_scope: "all|specific",
  countries: [],
  rate_type: "flat|percentage|conditional",
  rate_value: 0,
  conditions: {
    based_on: "amount|quantity|weight",
    minimum: 0,
    maximum: null
  },
  status: "active|inactive"
}
```

**Customer Structure**:
```javascript
{
  shopify_customer_id: "12345",
  email: "customer@example.com",
  tags: ["wholesale", "verified"],
  wholesale_approved: true,
  approval_date: "timestamp",
  applied_pricing_rules: ["rule-id-1", "rule-id-2"],
  order_count: 5,
  total_spent: 5000,
  notes: "Approved wholesale customer"
}
```

---

## Shopify API Integration (October 2024)

### Required Shopify API Scopes

```javascript
{
  scopes: [
    "read_products",
    "write_products",
    "read_customers",
    "write_customers",
    "read_orders",
    "write_orders",
    "read_draft_orders",
    "write_draft_orders",
    "read_price_rules",
    "write_price_rules",
    "read_discounts",
    "write_discounts",
    "read_shipping",
    "write_shipping",
    "read_content",
    "write_content",
    "read_themes",
    "write_themes"
  ]
}
```

### Key API Endpoints & Usage

#### 1. Draft Order API (Primary Method)

**Purpose**: Apply wholesale pricing and custom shipping to orders.

**Endpoint**: `POST /admin/api/2024-10/draft_orders.json`

**Usage Example**:
```
When customer with "wholesale" tag checks out:
1. Calculate applicable discounts from pricing rules
2. Create draft order with:
   - Applied line item discounts
   - Custom shipping rate
   - Customer information
3. Send draft order invoice URL to customer
4. Customer completes payment
5. Order converts to regular order
```

**Benefits**:
- Full control over pricing
- Compatible with custom shipping
- Can add fees
- Maintains order history

#### 2. Price Rules API (Alternative Method)

**Purpose**: Create discount codes dynamically.

**Endpoint**: `POST /admin/api/2024-10/price_rules.json`

**Usage Example**:
```
When customer logs in:
1. Check customer tags
2. Generate unique discount code
3. Apply code automatically at checkout
4. Code valid only for that customer
```

**Limitations**:
- Not compatible with custom shipping in this app
- May conflict with other discount codes
- Limited control over stacking

#### 3. Customer API

**Endpoint**: `GET/POST /admin/api/2024-10/customers.json`

**Usage**:
- Fetch customer tags
- Update customer tags when wholesale approved
- Check customer eligibility
- Store wholesale customer metadata

**Tag Management Example**:
```
When wholesale application approved:
1. GET customer by email
2. Add "wholesale" tag to customer.tags array
3. PUT updated customer data
4. Customer now eligible for wholesale pricing
```

#### 4. Product Variants API

**Endpoint**: `GET /admin/api/2024-10/products.json`

**Usage**:
- Fetch product prices
- Calculate wholesale prices
- Display volume pricing tables
- Track inventory for order limits

**Price Calculation Flow**:
```
1. GET product variant price (retail)
2. Check applicable pricing rules for customer
3. Calculate discount (percentage/fixed/fixed_price)
4. Return wholesale price
5. Display both retail (crossed out) and wholesale
```

#### 5. Checkout API / Storefront API

**Purpose**: Custom checkout experience for wholesale customers.

**Key Functions**:
- Apply draft order discounts
- Display custom shipping options
- Validate order minimums
- Show wholesale-specific messaging

**Implementation Pattern**:
```
Storefront API (customer-facing):
- Check if customer logged in
- Verify customer tags
- Display appropriate prices
- Show/hide checkout button based on minimums

Admin API (backend):
- Create draft order when ready to checkout
- Apply all wholesale rules
- Handle payment processing
```

#### 6. Shipping Zones API

**Endpoint**: `GET /admin/api/2024-10/shipping_zones.json`

**Usage**:
- Fetch existing shipping zones
- Override rates for wholesale customers
- Apply flat rate or free shipping
- Geographic targeting

**Custom Shipping Implementation**:
```
1. Detect customer tag at cart
2. Fetch shipping rules for that tag
3. Override standard shipping calculation
4. Display custom wholesale shipping rates
5. Apply rate at checkout via Draft Order API
```

#### 7. Metafields API

**Endpoint**: `POST /admin/api/2024-10/metafields.json`

**Usage**: Store additional wholesale data not in standard Shopify schema.

**Example Metafields**:
```javascript
// Product-level wholesale data
{
  namespace: "wholesale",
  key: "minimum_quantity",
  value: "10",
  type: "number_integer"
}

// Customer-level approval data
{
  namespace: "wholesale",
  key: "approved_by",
  value: "admin_user_id",
  type: "single_line_text_field"
}

// Volume pricing tiers
{
  namespace: "wholesale",
  key: "volume_tiers",
  value: JSON.stringify([
    {qty: 5, discount: 55},
    {qty: 10, discount: 60}
  ]),
  type: "json"
}
```

#### 8. Webhooks for Real-Time Updates

**Required Webhooks**:

```javascript
{
  webhooks: [
    {
      topic: "customers/create",
      purpose: "Detect new customer registrations for wholesale approval queue"
    },
    {
      topic: "customers/update",
      purpose: "Track tag changes for pricing rule eligibility"
    },
    {
      topic: "orders/create",
      purpose: "Validate order limits and apply wholesale pricing"
    },
    {
      topic: "carts/update",
      purpose: "Real-time price updates as cart changes"
    },
    {
      topic: "products/update",
      purpose: "Recalculate wholesale prices when retail prices change"
    }
  ]
}
```

### API Rate Limiting & Best Practices

**Shopify API Rate Limits (October 2024)**:
- REST Admin API: 2 requests per second
- GraphQL Admin API: 50 points per second (varies by query complexity)
- Storefront API: Calculated based on store's plan

**Best Practices**:
1. **Implement request queuing** for bulk operations
2. **Cache frequently accessed data** (product prices, customer tags)
3. **Use GraphQL for complex queries** to reduce number of calls
4. **Batch operations** when possible (bulk customer tag updates)
5. **Implement exponential backoff** for rate limit errors
6. **Use webhooks instead of polling** for real-time data
7. **Store calculated wholesale prices** in metafields to reduce recalculation

**Example: Efficient Price Fetching**:
```
Instead of:
- Fetch product (1 API call)
- Fetch customer (1 API call)  
- Fetch pricing rules (1 API call)
- Calculate price (0 API calls)
Total: 3 API calls per product

Do:
- Fetch products with metafields in single GraphQL query (1 API call)
- Cache customer data in session (0 API calls)
- Cache pricing rules in memory (0 API calls)
- Calculate price (0 API calls)
Total: 1 API call for multiple products
```

---

## Database Schema Requirements

### Tables Overview

Your private app will need these core database tables:

#### 1. `pricing_rules`
```sql
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY,
  shop_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  rule_type ENUM('wholesale', 'volume', 'individual') NOT NULL,
  status ENUM('published', 'unpublished') DEFAULT 'unpublished',
  discount_type ENUM('percentage', 'fixed_amount', 'fixed_price') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  customer_selection ENUM('tagged', 'all_logged_in', 'all_customers') DEFAULT 'tagged',
  customer_tags JSON,
  product_scope ENUM('all', 'collections', 'specific') DEFAULT 'all',
  product_ids JSON,
  collection_ids JSON,
  excluded_product_ids JSON,
  excluded_collection_ids JSON,
  start_date TIMESTAMP NULL,
  end_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_shop_status (shop_id, status),
  INDEX idx_rule_type (rule_type)
);
```

#### 2. `volume_pricing_tiers`
```sql
CREATE TABLE volume_pricing_tiers (
  id UUID PRIMARY KEY,
  pricing_rule_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  discount_type ENUM('percentage', 'fixed_amount', 'fixed_price') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  tier_application ENUM('per_variant', 'per_product', 'across_products') DEFAULT 'per_variant',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pricing_rule_id) REFERENCES pricing_rules(id) ON DELETE CASCADE,
  INDEX idx_rule_quantity (pricing_rule_id, quantity)
);
```

#### 3. `order_limit_rules`
```sql
CREATE TABLE order_limit_rules (
  id UUID PRIMARY KEY,
  shop_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  status ENUM('active', 'inactive') DEFAULT 'inactive',
  customer_tags JSON,
  scope ENUM('all_orders', 'first_only', 'separate_first') DEFAULT 'all_orders',
  condition_logic ENUM('all', 'any') DEFAULT 'all',
  failure_action ENUM('block', 'allow_retail') DEFAULT 'block',
  customer_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_shop_status (shop_id, status)
);
```

#### 4. `order_limit_conditions`
```sql
CREATE TABLE order_limit_conditions (
  id UUID PRIMARY KEY,
  order_limit_rule_id UUID NOT NULL,
  condition_field ENUM('cart_total_amount', 'cart_total_items', 'cart_total_weight') NOT NULL,
  condition_operator ENUM('is_minimum', 'is_maximum', 'equals', 'between') NOT NULL,
  condition_value DECIMAL(10,2) NOT NULL,
  condition_value_max DECIMAL(10,2) NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_limit_rule_id) REFERENCES order_limit_rules(id) ON DELETE CASCADE,
  INDEX idx_rule_conditions (order_limit_rule_id)
);
```

#### 5. `shipping_rules`
```sql
CREATE TABLE shipping_rules (
  id UUID PRIMARY KEY,
  shop_id VARCHAR(255) NOT NULL,
  title VARCHAR(80) NOT NULL,
  message VARCHAR(160),
  status ENUM('active', 'inactive') DEFAULT 'active',
  customer_selection ENUM('tagged', 'all_logged_in', 'all_customers') DEFAULT 'tagged',
  customer_tags JSON,
  geographic_scope ENUM('all_countries', 'specific_countries') DEFAULT 'all_countries',
  country_codes JSON,
  rate_type ENUM('flat', 'percentage', 'conditional') DEFAULT 'flat',
  rate_calculation_basis ENUM('amount', 'quantity', 'weight') DEFAULT 'amount',
  shipping_charge DECIMAL(10,2) DEFAULT 0,
  minimum_threshold DECIMAL(10,2) DEFAULT 0,
  maximum_threshold DECIMAL(10,2) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_shop_status (shop_id, status)
);
```

#### 6. `wholesale_customers`
```sql
CREATE TABLE wholesale_customers (
  id UUID PRIMARY KEY,
  shop_id VARCHAR(255) NOT NULL,
  shopify_customer_id BIGINT NOT NULL,
  email VARCHAR(255) NOT NULL,
  wholesale_approved BOOLEAN DEFAULT FALSE,
  approval_date TIMESTAMP NULL,
  approved_by VARCHAR(255),
  customer_tags JSON,
  order_count INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_customer (shop_id, shopify_customer_id),
  INDEX idx_shop_email (shop_id, email),
  INDEX idx_approval_status (shop_id, wholesale_approved)
);
```

#### 7. `price_cache`
```sql
CREATE TABLE price_cache (
  id UUID PRIMARY KEY,
  shop_id VARCHAR(255) NOT NULL,
  product_variant_id BIGINT NOT NULL,
  customer_tag VARCHAR(100) NOT NULL,
  retail_price DECIMAL(10,2) NOT NULL,
  wholesale_price DECIMAL(10,2) NOT NULL,
  discount_percentage DECIMAL(5,2),
  pricing_rule_id UUID,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_price (shop_id, product_variant_id, customer_tag),
  INDEX idx_expiration (expires_at),
  FOREIGN KEY (pricing_rule_id) REFERENCES pricing_rules(id) ON DELETE SET NULL
);
```

#### 8. `app_settings`
```sql
CREATE TABLE app_settings (
  id UUID PRIMARY KEY,
  shop_id VARCHAR(255) NOT NULL UNIQUE,
  show_crossed_prices BOOLEAN DEFAULT TRUE,
  compare_at_as_crossed BOOLEAN DEFAULT FALSE,
  coupon_field_mode ENUM('all', 'tagged', 'disabled') DEFAULT 'disabled',
  prevent_shopify_auto_discounts BOOLEAN DEFAULT FALSE,
  checkout_method ENUM('draft_order', 'coupon_code') DEFAULT 'draft_order',
  discount_label VARCHAR(50) DEFAULT 'DISCOUNT',
  login_page_mode ENUM('none', 'replace', 'append') DEFAULT 'append',
  wholesale_signup_url VARCHAR(255),
  wholesale_signup_label VARCHAR(100) DEFAULT 'Create wholesale account',
  additional_fee_enabled BOOLEAN DEFAULT FALSE,
  sale_clock_enabled BOOLEAN DEFAULT TRUE,
  sale_clock_bg_color VARCHAR(7) DEFAULT '#000000',
  sale_clock_fg_color VARCHAR(7) DEFAULT '#ffffff',
  sale_clock_text_align ENUM('left', 'center', 'right') DEFAULT 'left',
  app_mode ENUM('live', 'test') DEFAULT 'test',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 9. `webhook_logs`
```sql
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY,
  shop_id VARCHAR(255) NOT NULL,
  webhook_topic VARCHAR(100) NOT NULL,
  shopify_webhook_id VARCHAR(100),
  payload JSON,
  processed BOOLEAN DEFAULT FALSE,
  processing_error TEXT,
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL,
  INDEX idx_shop_topic (shop_id, webhook_topic),
  INDEX idx_processed (processed, received_at)
);
```

#### 10. `eligibility_checks`
```sql
CREATE TABLE eligibility_checks (
  id UUID PRIMARY KEY,
  shop_id VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  pricing_rule_id UUID,
  eligible BOOLEAN NOT NULL,
  reason TEXT,
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_shop_email (shop_id, email),
  FOREIGN KEY (pricing_rule_id) REFERENCES pricing_rules(id) ON DELETE CASCADE
);
```

### Relationships Diagram

```
pricing_rules
├── volume_pricing_tiers (1:many)
├── price_cache (1:many)
└── eligibility_checks (1:many)

order_limit_rules
└── order_limit_conditions (1:many)

shipping_rules
└── [standalone table, related via customer_tags]

wholesale_customers
└── [related to pricing_rules via customer_tags]

app_settings
└── [one per shop, global config]

webhook_logs
└── [audit trail, standalone]
```

---

## Custom Implementation for Kickstarter

### Kickstarter-Specific Requirements

#### Use Case Analysis
You're managing Kickstarter backers who need:
1. **Wholesale pricing** as reward fulfillment
2. **Tiered pricing** based on backer level
3. **Order minimum enforcement** (e.g., 10 books minimum)
4. **Free or subsidized shipping** for backers
5. **Tag-based segmentation** (Kickstarter backers vs wholesale vs retail)
6. **Manual order creation** for phone/email orders
7. **Backer-specific product access** (exclusive variants)

#### Recommended Architecture

**Customer Tagging Strategy**:
```
Tags:
- "kickstarter-backer" (all backers)
- "kickstarter-tier-1" (basic backer)
- "kickstarter-tier-2" (standard backer)
- "kickstarter-tier-3" (premium backer)
- "wholesale" (traditional B2B customers)
- "verified" (approved for purchases)
```

**Pricing Rule Structure for Kickstarter**:

```javascript
// Rule 1: Kickstarter Tier 1 - 30% off
{
  name: "Kickstarter Tier 1 Pricing",
  customer_tags: ["kickstarter-tier-1"],
  discount_type: "percentage",
  discount_value: 30,
  product_scope: "all",
  status: "published"
}

// Rule 2: Kickstarter Tier 2 - 40% off
{
  name: "Kickstarter Tier 2 Pricing",
  customer_tags: ["kickstarter-tier-2"],
  discount_type: "percentage",
  discount_value: 40,
  product_scope: "all",
  status: "published"
}

// Rule 3: Kickstarter Tier 3 - 50% off + Free Shipping
{
  name: "Kickstarter Tier 3 Pricing",
  customer_tags: ["kickstarter-tier-3"],
  discount_type: "percentage",
  discount_value: 50,
  product_scope: "all",
  status: "published"
}
```

**Order Limits for Kickstarter**:
```javascript
{
  name: "Kickstarter Minimum Order",
  customer_tags: ["kickstarter-backer"],
  scope: "all_orders",
  conditions: [
    {
      field: "cart_total_items",
      operator: "is_minimum",
      value: 10 // 10 books minimum
    }
  ],
  condition_logic: "all",
  failure_action: "block",
  message: "Kickstarter backers must order at least 10 books. This is part of your backer reward agreement."
}
```

**Shipping Rules for Kickstarter**:
```javascript
// Free shipping for all Kickstarter backers
{
  title: "Kickstarter Backer Free Shipping",
  customer_tags: ["kickstarter-backer"],
  rate_type: "flat",
  shipping_charge: 0,
  minimum_threshold: 0,
  geographic_scope: "all_countries",
  status: "active"
}

// Discounted shipping for Tier 1 only if needed
{
  title: "Kickstarter Tier 1 Discounted Shipping",
  customer_tags: ["kickstarter-tier-1"],
  rate_type: "flat",
  shipping_charge: 5.00,
  geographic_scope: "specific_countries",
  country_codes: ["US", "CA"],
  status: "active"
}
```

### Custom Features for Kickstarter Implementation

#### 1. Backer Import System
**Purpose**: Bulk import Kickstarter backer data from CSV export.

**Required Fields**:
- Backer Email
- Backer Name
- Pledge Amount
- Backer Tier/Level
- Shipping Address
- Reward Details
- Pledge Date
- Survey Status (completed/pending)

**Process Flow**:
```
1. Export backer data from Kickstarter
2. Transform to app format (CSV)
3. Upload via admin interface
4. System creates/updates Shopify customers
5. Apply appropriate tags based on tier
6. Send welcome email with login instructions
7. Log import results (success/failures)
```

**Implementation Notes**:
- Use Shopify Customer API to create customers
- Use Customer metafields to store Kickstarter-specific data
- Apply tags automatically based on pledge level
- Handle duplicate emails gracefully
- Validate all email addresses before import
- Queue emails to avoid rate limits

#### 2. Backer Portal
**Custom page for Kickstarter backers to view their status and order.**

**Features**:
- View backer tier and discount level
- See available products for their tier
- Check order history
- View shipping status
- Access exclusive backer-only content
- Contact support for backer-specific issues

**URL Structure**:
```
/pages/kickstarter-backer-portal
```

**Data to Display**:
```javascript
{
  backer_info: {
    tier: "Tier 2",
    discount: "40%",
    free_shipping: true,
    pledge_amount: "$150",
    order_minimum: "10 books"
  },
  order_status: {
    orders_placed: 1,
    total_spent: "$350",
    items_ordered: 25,
    last_order_date: "2024-09-15"
  },
  exclusive_access: {
    products: ["Exclusive Variant A", "Early Access Issue #1"],
    available_until: "2025-01-01"
  }
}
```

#### 3. Backer Verification System
**Purpose**: Verify Kickstarter backer status before granting access.

**Verification Methods**:
1. **Email verification**: Match email to backer list
2. **Pledge number**: Require backer number from Kickstarter
3. **Manual approval**: Admin reviews and approves

**Process**:
```
1. Customer creates account on store
2. Customer fills "Kickstarter Backer Verification" form
3. Provides: Email, Kickstarter pledge number, name
4. System checks against imported backer database
5. If match found:
   - Auto-approve
   - Apply appropriate tier tag
   - Send approval email
6. If no match:
   - Add to manual review queue
   - Admin reviews and approves/denies
   - Send notification to customer
```

#### 4. Fulfillment Tracking
**Purpose**: Track which backers have placed their reward orders.

**Features**:
- Dashboard showing backer fulfillment status
- Filter by tier, order status, shipping status
- Export unfulfilled backers for follow-up
- Send automated reminders to backers who haven't ordered

**Status Types**:
- ✅ **Fulfilled**: Backer placed order
- ⏳ **Pending**: Backer verified but no order yet
- ❌ **Unfulfilled**: No order after X days
- 🚫 **Not Verified**: Backer hasn't verified account

**Reporting**:
```javascript
{
  total_backers: 500,
  verified: 450,
  ordered: 380,
  fulfillment_rate: "76%",
  by_tier: {
    tier_1: { total: 200, fulfilled: 160, rate: "80%" },
    tier_2: { total: 200, fulfilled: 150, rate: "75%" },
    tier_3: { total: 100, fulfilled: 70, rate: "70%" }
  },
  average_order_value: "$425",
  total_revenue: "$161,500"
}
```

#### 5. Expiring Backer Benefits
**Purpose**: Set expiration dates for Kickstarter backer pricing.

**Configuration**:
```javascript
{
  pricing_rule: {
    name: "Kickstarter Tier 2",
    start_date: "2024-08-01",
    end_date: "2025-01-31", // 6 months after fulfillment starts
    post_expiry_action: "convert_to_standard_wholesale" // or "remove_discount"
  }
}
```

**Automated Actions on Expiry**:
1. Send email 30 days before expiration
2. Send reminder 7 days before expiration
3. On expiration date:
   - Remove "kickstarter-tier-X" tag
   - Add "standard-wholesale" tag (optional)
   - Send "benefits expired" email with offer to continue as wholesale customer

#### 6. Exclusive Product Access
**Purpose**: Restrict certain products to specific backer tiers.

**Implementation**:
Use the "Manage Policy" addon feature to:
- Hide exclusive variants from non-backers
- Show tier-specific products only to appropriate customers
- Display "Backer Exclusive" badges on products

**Product Access Matrix**:
```
Product Type          | Tier 1 | Tier 2 | Tier 3 | Public
--------------------- |--------|--------|--------|--------
Standard Issues       |   ✅   |   ✅   |   ✅   |   ✅
Exclusive Variants    |   ❌   |   ✅   |   ✅   |   ❌
Limited Edition       |   ❌   |   ❌   |   ✅   |   ❌
Early Access          |   ❌   |   ✅   |   ✅   |   ❌
```

**Shopify Implementation**:
- Use product tags: "backer-tier-1", "backer-tier-2", "backer-tier-3"
- Use metafields for visibility rules
- Implement Storefront API checks before displaying products

---

## Development Roadmap

### Phase 1: Foundation (Weeks 1-2)
**Goal**: Set up core infrastructure and basic pricing engine.

**Tasks**:
1. Set up Shopify app development environment
2. Configure OAuth and required API scopes
3. Create database schema and migrations
4. Build customer authentication system
5. Implement customer tagging logic
6. Create basic admin interface for app settings

**Deliverables**:
- App successfully connects to Shopify store
- Admin can configure basic settings
- Customer tags can be applied/removed
- Database is initialized and ready

**Testing**:
- OAuth flow works correctly
- API connections are stable
- Database queries are optimized
- Tags persist correctly in Shopify

---

### Phase 2: Pricing Engine (Weeks 3-4)
**Goal**: Build the core wholesale pricing calculation system.

**Tasks**:
1. Implement pricing rules CRUD operations
2. Build discount calculation engine
3. Create price cache system for performance
4. Develop rule evaluation logic (customer tags + product scope)
5. Build price display override system
6. Implement crossed-out retail price display

**Deliverables**:
- Admin can create/edit/delete pricing rules
- Prices calculate correctly for tagged customers
- Price cache reduces API calls
- Storefront displays wholesale prices correctly

**Testing**:
- Test all discount types (percentage, fixed, fixed price)
- Verify tag-based eligibility
- Test product scope filtering (all/collections/specific)
- Performance test price calculation with 1000+ products
- Test price updates when retail prices change

**Example Test Cases**:
```
Test 1: Percentage Discount
- Product retail price: $100
- Discount: 40%
- Expected wholesale price: $60
- Result: PASS/FAIL

Test 2: Tag-Based Eligibility
- Customer tags: ["wholesale"]
- Rule requires: ["wholesale"]
- Expected: Customer sees wholesale price
- Result: PASS/FAIL

Test 3: Collection Scope
- Rule applies to: "Comics Collection"
- Product in: "Comics Collection"
- Expected: Discount applies
- Result: PASS/FAIL
```

---

### Phase 3: Volume Pricing (Weeks 5-6)
**Goal**: Implement quantity-based tiered pricing.

**Tasks**:
1. Create volume pricing tier system
2. Implement tier calculation logic
3. Build volume pricing table display
4. Develop per-variant vs per-product vs across-products logic
5. Create cart update system to recalculate on quantity change
6. Implement volume pricing preview on product pages

**Deliverables**:
- Volume pricing tiers can be created in admin
- Cart automatically applies appropriate tier discount
- Product pages show volume pricing table
- Works with all three tier application types

**Testing**:
- Test tier boundaries (qty 4 vs qty 5)
- Test mixed cart with multiple products
- Test variant-level tier tracking
- Verify cart updates when quantities change

**Example Volume Pricing Flow**:
```
Scenario: Customer adds 12 units of Product A
Tier 1: 5-9 units = 55% off
Tier 2: 10-14 units = 60% off
Tier 3: 15+ units = 65% off

Expected:
- First 4 units: No discount
- Units 5-9: 55% off
- Units 10-12: 60% off
- Final price: Weighted average or flat tier rate
Result: PASS/FAIL
```

---

### Phase 4: Order Limits & Validation (Week 7)
**Goal**: Enforce minimum order requirements.

**Tasks**:
1. Create order limit rules system
2. Build conditional logic evaluator
3. Implement cart validation
4. Create checkout blocker for unmet conditions
5. Build customer-facing error messages
6. Develop admin override capability

**Deliverables**:
- Order limits enforce at cart/checkout
- Clear error messages display to customers
- Admin can bypass limits for special cases
- Multiple conditions can be combined (AND/OR)

**Testing**:
- Test minimum cart value
- Test minimum item quantity
- Test weight-based limits
- Test combined conditions (AND logic)
- Test alternative conditions (OR logic)
- Test first-order-only limits

---

### Phase 5: Shipping Management (Week 8)
**Goal**: Custom shipping rates for wholesale customers.

**Tasks**:
1. Create shipping rules system
2. Implement rate calculation engine
3. Build geographic targeting (country-specific)
4. Integrate with Draft Order API for rate application
5. Create shipping rule preview system
6. Develop flat/percentage/conditional rate types

**Deliverables**:
- Custom shipping rates apply correctly
- Geographic targeting works
- Conditional rates calculate properly
- Integrates with checkout via Draft Order API

**Testing**:
- Test free shipping
- Test flat rate shipping
- Test percentage-based shipping
- Test country restrictions
- Test cart-value-based shipping tiers

---

### Phase 6: Draft Order Integration (Week 9)
**Goal**: Implement Draft Order API for checkout.

**Tasks**:
1. Build draft order creation system
2. Implement line item discount application
3. Add custom shipping rate to draft orders
4. Create draft order invoice system
5. Build payment completion flow
6. Develop order conversion tracking

**Deliverables**:
- Wholesale orders create as draft orders
- All discounts and shipping apply correctly
- Customers can complete payment
- Orders convert to regular orders post-payment

**Testing**:
- Test draft order creation with discounts
- Test custom shipping in draft orders
- Test payment completion
- Test order conversion
- Test failed payment scenarios

---

### Phase 7: Kickstarter-Specific Features (Weeks 10-11)
**Goal**: Build custom features for Kickstarter backer management.

**Tasks**:
1. Build backer import system (CSV)
2. Create backer verification flow
3. Develop backer portal page
4. Implement fulfillment tracking dashboard
5. Build expiring benefits system
6. Create automated reminder emails

**Deliverables**:
- Kickstarter backers can be bulk imported
- Backer portal shows status and discounts
- Fulfillment dashboard tracks order status
- Benefits expire automatically on set dates
- Automated reminders send to unfulfilled backers

**Testing**:
- Test CSV import with 500+ backers
- Test verification flow (auto and manual)
- Test backer portal for each tier
- Test fulfillment tracking accuracy
- Test expiration date enforcement

---

### Phase 8: Admin Interface & Management (Week 12)
**Goal**: Build comprehensive admin dashboard.

**Tasks**:
1. Create pricing rules management interface
2. Build customer management dashboard
3. Develop order limit configuration UI
4. Create shipping rules interface
5. Build reporting and analytics dashboard
6. Implement settings management

**Deliverables**:
- Full admin interface for all features
- Reporting dashboard with key metrics
- Bulk actions for common tasks
- Settings page for global configuration

**Testing**:
- Test all CRUD operations
- Test bulk actions (bulk tag, bulk delete)
- Test reporting accuracy
- Test permission controls

---

### Phase 9: Theme Integration & Frontend (Weeks 13-14)
**Goal**: Build customer-facing frontend components.

**Tasks**:
1. Create Shopify theme app extensions
2. Build price display components
3. Develop volume pricing table widget
4. Create wholesale signup form
5. Build login page customization
6. Implement sale clock widget
7. Develop crossed-out price display

**Deliverables**:
- Theme app embed installs easily
- All pricing displays correctly on storefront
- Wholesale signup form works
- Sale clock displays on product pages

**Testing**:
- Test on multiple themes (Dawn, Refresh, etc.)
- Test mobile responsiveness
- Test accessibility compliance
- Test cross-browser compatibility

---

### Phase 10: Testing & Optimization (Week 15)
**Goal**: Comprehensive testing and performance optimization.

**Tasks**:
1. Load testing with realistic traffic
2. API rate limit optimization
3. Database query optimization
4. Cache implementation and tuning
5. Security audit and fixes
6. Bug fixing from QA testing
7. Documentation creation

**Deliverables**:
- App handles expected traffic loads
- All API calls optimized and cached
- Database queries under 100ms
- Security vulnerabilities addressed
- Full documentation complete

**Testing**:
- Load test: 1000 concurrent users
- Stress test: API rate limit scenarios
- Security test: SQL injection, XSS, CSRF
- Integration test: Full user journeys
- Regression test: All previous features

---

### Phase 11: Deployment & Monitoring (Week 16)
**Goal**: Deploy to production and establish monitoring.

**Tasks**:
1. Set up production environment
2. Configure monitoring and alerting
3. Deploy app to production
4. Migrate test data (if needed)
5. Set up error tracking (Sentry/Rollbar)
6. Configure analytics
7. Create deployment documentation

**Deliverables**:
- App live in production
- Monitoring dashboard active
- Error tracking configured
- Analytics tracking user behavior
- Deployment runbook created

**Post-Deployment**:
- Monitor for 7 days continuously
- Address any production issues immediately
- Collect user feedback
- Plan Phase 12 enhancements

---

## Security & Compliance

### Authentication & Authorization

**OAuth 2.0 Implementation**:
```
Flow:
1. Merchant clicks "Install App"
2. Redirected to Shopify OAuth consent screen
3. Merchant grants permissions
4. App receives authorization code
5. Exchange code for access token
6. Store token securely (encrypted at rest)
7. Use token for all subsequent API calls
```

**Token Security**:
- Store access tokens in encrypted database fields
- Never log access tokens
- Rotate tokens on security events
- Implement token expiration checking
- Use environment variables for app credentials

**Permission Scopes**:
```
Minimum Required Scopes:
- read_products, write_products
- read_customers, write_customers
- read_orders, write_orders
- read_draft_orders, write_draft_orders
- read_price_rules, write_price_rules

Optional Scopes:
- read_themes (for theme integration)
- read_content, write_content (for pages)
```

---

### Data Privacy & GDPR Compliance

**Customer Data Handling**:
1. **Data Collection**: Only collect necessary data
2. **Data Storage**: Encrypt PII at rest
3. **Data Retention**: Delete customer data after X days of uninstall
4. **Data Portability**: Provide export functionality
5. **Right to Deletion**: Implement customer data deletion on request

**Required Webhooks for GDPR**:
```javascript
{
  webhooks: [
    {
      topic: "customers/redact",
      purpose: "Delete customer data when requested"
    },
    {
      topic: "shop/redact",
      purpose: "Delete shop data when app uninstalled"
    },
    {
      topic: "customers/data_request",
      purpose: "Provide customer data export"
    }
  ]
}
```

**Data Encryption**:
- Use AES-256 encryption for PII
- Encrypt database backups
- Use TLS 1.2+ for all API communications
- Implement proper key management (AWS KMS, Google KMS)

---

### API Security Best Practices

**Request Authentication**:
- Verify HMAC signatures on all webhooks
- Validate session tokens on admin requests
- Implement CSRF tokens for form submissions
- Rate limit API endpoints

**Input Validation**:
- Sanitize all user inputs
- Validate email addresses
- Prevent SQL injection with parameterized queries
- Escape output to prevent XSS

**Error Handling**:
- Never expose sensitive data in error messages
- Log errors securely without PII
- Implement proper exception handling
- Return generic error messages to users

---

### PCI Compliance

**Payment Handling**:
- **Never store credit card data**
- Use Shopify's payment processing
- Draft Order API handles all payments
- No direct card data ever touches your servers

**Compliance Requirements**:
- Use HTTPS for all connections
- Implement secure logging
- Regular security audits
- Maintain PCI DSS compliance documentation

---

### Testing & Quality Assurance

**Testing Strategy**:
1. **Unit Tests**: Test individual functions (80% coverage minimum)
2. **Integration Tests**: Test API interactions
3. **End-to-End Tests**: Test complete user flows
4. **Security Tests**: Penetration testing, vulnerability scans
5. **Performance Tests**: Load testing, stress testing

**Continuous Integration**:
```yaml
# Example CI pipeline
stages:
  - lint
  - test
  - security_scan
  - build
  - deploy

lint:
  - Run ESLint/Prettier
  - Check code style

test:
  - Run unit tests
  - Run integration tests
  - Generate coverage report

security_scan:
  - Run npm audit
  - Run Snyk vulnerability scan
  - Check dependencies

build:
  - Build Docker image
  - Run smoke tests

deploy:
  - Deploy to staging
  - Run E2E tests
  - Deploy to production (manual approval)
```

---

## Appendix: Quick Reference

### API Endpoints Quick Reference

**Products & Variants**:
```
GET  /admin/api/2024-10/products.json
GET  /admin/api/2024-10/products/{id}.json
GET  /admin/api/2024-10/variants/{id}.json
POST /admin/api/2024-10/products/{id}/metafields.json
```

**Customers**:
```
GET  /admin/api/2024-10/customers.json
POST /admin/api/2024-10/customers.json
PUT  /admin/api/2024-10/customers/{id}.json
GET  /admin/api/2024-10/customers/search.json?query=tag:wholesale
```

**Draft Orders**:
```
POST /admin/api/2024-10/draft_orders.json
GET  /admin/api/2024-10/draft_orders/{id}.json
PUT  /admin/api/2024-10/draft_orders/{id}/complete.json
```

**Price Rules & Discounts**:
```
POST /admin/api/2024-10/price_rules.json
GET  /admin/api/2024-10/price_rules.json
POST /admin/api/2024-10/price_rules/{id}/discount_codes.json
```

**Shipping**:
```
GET /admin/api/2024-10/shipping_zones.json
```

**Webhooks**:
```
POST /admin/api/2024-10/webhooks.json
GET  /admin/api/2024-10/webhooks.json
```

---

### Common Code Patterns

**Calculate Wholesale Price**:
```javascript
function calculateWholesalePrice(retailPrice, discountType, discountValue) {
  switch(discountType) {
    case 'percentage':
      return retailPrice * (1 - (discountValue / 100));
    case 'fixed_amount':
      return Math.max(0, retailPrice - discountValue);
    case 'fixed_price':
      return discountValue;
    default:
      return retailPrice;
  }
}

// Example:
calculateWholesalePrice(100, 'percentage', 40); // Returns 60
```

**Check Customer Eligibility**:
```javascript
function isCustomerEligible(customerTags, requiredTags) {
  return requiredTags.some(tag => customerTags.includes(tag));
}

// Example:
isCustomerEligible(['wholesale', 'verified'], ['wholesale']); // Returns true
```

**Evaluate Volume Tier**:
```javascript
function getApplicableTier(quantity, tiers) {
  // Sort tiers by quantity descending
  const sortedTiers = tiers.sort((a, b) => b.quantity - a.quantity);
  
  // Find first tier where quantity meets threshold
  return sortedTiers.find(tier => quantity >= tier.quantity);
}

// Example:
const tiers = [
  {quantity: 5, discount_percentage: 55},
  {quantity: 10, discount_percentage: 60},
  {quantity: 15, discount_percentage: 65}
];
getApplicableTier(12, tiers); // Returns {quantity: 10, discount_percentage: 60}
```

**Validate Order Minimum**:
```javascript
function validateOrderMinimum(cart, conditions, conditionLogic) {
  const results = conditions.map(condition => {
    const value = cart[condition.field];
    switch(condition.operator) {
      case 'is_minimum':
        return value >= condition.value;
      case 'is_maximum':
        return value <= condition.value;
      default:
        return false;
    }
  });
  
  if (conditionLogic === 'all') {
    return results.every(r => r === true);
  } else {
    return results.some(r => r === true);
  }
}
```

---

### Troubleshooting Guide

**Issue: Pricing not applying**
- Check customer has correct tag
- Verify pricing rule is published
- Check product is in rule scope
- Clear price cache
- Verify customer is logged in

**Issue: Shipping not working**
- Verify shipping rule is active
- Check customer tag matches
- Ensure Draft Order API method selected
- Verify geographic scope includes customer location

**Issue: Order limit not enforcing**
- Check order limit rule status
- Verify condition logic is correct
- Ensure customer has required tag
- Check cart meets minimum threshold

**Issue: High API rate limiting**
- Implement request queuing
- Increase cache duration
- Use GraphQL for bulk queries
- Reduce webhook frequency

**Issue: Slow price calculations**
- Enable price caching
- Use database indexing
- Implement lazy loading
- Optimize database queries

---

## Conclusion

This comprehensive guide provides the complete architecture and implementation plan for building a custom wholesale management app for Shopify, specifically tailored for Kickstarter backer fulfillment.

**Key Takeaways**:
1. Use Draft Order API for maximum control over pricing and shipping
2. Implement robust caching to avoid API rate limits
3. Tag-based customer segmentation is the foundation of the system
4. Database schema must support complex pricing rules and conditions
5. Kickstarter-specific features require custom backer tracking and expiration logic

**Next Steps**:
1. Share this document with Claude Code for implementation
2. Set up development environment
3. Begin Phase 1 development
4. Schedule weekly progress reviews
5. Plan for production deployment in 16 weeks

**Resources Needed**:
- Shopify Partner account
- Development store for testing
- Database (PostgreSQL recommended)
- Cloud hosting (AWS/GCP/Azure)
- Monitoring tools (Datadog, New Relic, or similar)

Good luck with the development! 🚀
