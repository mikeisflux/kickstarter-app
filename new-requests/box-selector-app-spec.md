# Shopify Box Selector App - Technical Specification

## Project Overview

This is a custom Shopify app that automatically calculates the optimal shipping box size for orders based on product dimensions and weight. The app integrates with Shopify's shipping rate calculation to provide accurate shipping costs to customers during checkout. It also provides fulfillment planning tools for the store owner.

**Key Principle:** This is a single-tenant app for one store owner only. The app must integrate seamlessly with the separate crowdfunding app (see `crowdfunding-app-spec.md`) to handle both regular store orders and campaign pledge orders.

## Core Functionality Requirements

### 1. Box Management System

#### Box Data Model

Each box definition should store the following information:

- **Box ID:** Unique identifier (UUID or auto-increment)
- **Box Name:** Human-readable name (e.g., "Comic Mailer Small", "Deluxe Box", "Multi-Issue Box", "Flat Rate Envelope")
- **Dimensions:**
  - Length (decimal, inches or cm)
  - Width (decimal, inches or cm)
  - Height (decimal, inches or cm)
- **Max Weight Capacity:** Maximum weight the box can safely hold (decimal, lbs or kg)
- **Box Weight:** Empty box weight (decimal, lbs or kg) - used in total shipping weight calculation
- **Cost:** Internal cost of the box itself (decimal, USD) - for tracking/reporting purposes
- **Active Status:** Boolean - whether this box is currently in use
- **Priority:** Integer - for sorting when multiple boxes could work (lower number = higher priority)
- **Created Date:** Timestamp
- **Updated Date:** Timestamp
- **Notes:** Optional text field for internal notes (e.g., "Use for fragile items", "Supplier: XYZ")

**Additional Optional Fields:**
- **Box Type:** Enum (mailer, box, envelope, tube, custom) - for categorization
- **Material:** String (cardboard, padded envelope, rigid mailer, etc.)
- **Supplier/SKU:** String - for reordering purposes

#### Box Management Interface (Admin)

The store owner needs a full CRUD interface to manage their box inventory. This should be accessible through the Shopify admin as an embedded app page.

**Box Library Dashboard:**

**Layout:**
- Table view showing all boxes (active and inactive)
- Columns:
  - Box Name
  - Dimensions (L × W × H)
  - Max Weight
  - Box Weight
  - Cost
  - Status (Active/Inactive badge)
  - Actions (Edit, Delete, Toggle Active)
- Filters:
  - Show Active Only / Show All
  - Filter by box type
  - Search by name
- Sort options:
  - By name (A-Z, Z-A)
  - By priority
  - By volume (smallest to largest)
  - By max weight
- "Add New Box" button (prominent, top-right)

**Add Box Form:**

Modal or new page with form fields:
- Box Name (text input, required)
- Box Type (dropdown: mailer, box, envelope, tube, custom)
- Dimensions (3 number inputs with unit selector - inches/cm)
  - Length (required, positive number, max 2 decimal places)
  - Width (required, positive number, max 2 decimal places)
  - Height (required, positive number, max 2 decimal places)
- Max Weight Capacity (number input with unit selector - lbs/kg, required)
- Box Weight (number input with unit selector - lbs/kg, required)
- Box Cost (number input, USD, optional)
- Priority (number input, optional, default to 50)
- Material (text input, optional)
- Supplier/SKU (text input, optional)
- Notes (textarea, optional)
- Active Status (checkbox or toggle, default to active)
- Preview section showing:
  - Calculated volume (L × W × H)
  - Visual size comparison (optional - simple graphic showing relative size)

**Validation Rules:**
- All dimensions must be positive numbers
- Max weight must be positive
- Box weight must be less than max weight capacity
- Box name must be unique
- Cannot have zero dimensions

**Edit Box Form:**

Same as Add Box form, but:
- Pre-populated with existing box data
- Shows "Last updated" timestamp
- Option to "Duplicate Box" (creates new box with same specs)
- Warning if box is currently assigned to pending orders

**Delete Box:**

- Confirmation dialog: "Are you sure you want to delete [Box Name]?"
- Check if box is assigned to any unfulfilled orders:
  - If YES: Show warning "This box is assigned to X unfulfilled orders. Deleting will remove assignments. Continue?"
  - If NO: Allow deletion
- Soft delete option: Mark as inactive instead of deleting (recommended)
- Hard delete option: Permanently remove from database

**Active/Inactive Toggle:**

- Quick toggle from table view
- Inactive boxes:
  - Not used in new box calculations
  - Still visible in history/reports
  - Can be reactivated anytime
  - Existing order assignments remain intact

**Bulk Actions:**

- Select multiple boxes (checkboxes)
- Bulk operations:
  - Activate selected
  - Deactivate selected
  - Delete selected (with confirmation)
  - Export selected as CSV

**Import/Export Functionality:**

- Export box library as CSV
- Import boxes from CSV (for initial setup or bulk updates)
- CSV format:
  ```
  name,length,width,height,max_weight,box_weight,cost,active,priority,type,material,notes
  Comic Mailer Small,12,9,2,2,0.2,0.5,true,10,mailer,padded envelope,For single issues
  ```

### 2. Packing Algorithm

#### Algorithm Requirements

The algorithm must determine which box (from active boxes only) is optimal for a given set of items.

**Inputs:**
- Array of items in the order, each with:
  - Product title (for reference)
  - Length, width, height (dimensions)
  - Weight
  - Quantity

**Outputs:**
- Selected box ID
- Reason for selection (for debugging/transparency)
- Total packed weight (items + box weight)
- Estimated packing efficiency (% of box volume used)
- Items list (what's being packed)

**Algorithm Logic:**

**Step 1: Calculate Total Item Dimensions and Weight**

For all items in the order:
- Sum total weight: `total_item_weight = sum(item.weight × item.quantity)`
- Calculate total volume: `total_item_volume = sum(item.volume × item.quantity)` where `item.volume = length × width × height`
- Determine maximum item dimension in each axis (for fitting check)

**Step 2: Add Packing Buffer**

Items don't pack perfectly efficiently, so add buffer space:
- **Volume buffer:** Multiply total volume by packing efficiency factor (e.g., 1.2 for 20% buffer)
  - Configurable setting: "Packing Buffer Percentage" (default: 20%)
  - Accounts for padding, air space, inefficient packing
- **Weight buffer:** Add weight of packing materials (configurable, e.g., 0.1 lbs)
  - Configurable setting: "Packing Material Weight" (default: 0.1 lbs)

**Step 3: Filter Eligible Boxes**

From all active boxes, filter to those that meet criteria:
- Box volume >= required volume (with buffer)
- Box max weight >= total weight (items + packing materials + box weight)
- Box dimensions can fit largest item dimensions (simple fit check)
  - Note: This is a simplified check. True 3D bin packing is complex.
  - For MVP: Ensure the longest item dimension fits within the longest box dimension, etc.

**Step 4: Select Optimal Box**

If multiple boxes are eligible, select based on priority rules (configurable):

**Selection Strategy Options:**
1. **Smallest Volume** (default): Choose box with smallest volume
2. **Lowest Cost**: Choose box with lowest total shipping cost (box cost + estimated shipping)
3. **Highest Priority**: Choose box with highest priority value
4. **Best Fit**: Choose box with least wasted space (volume efficiency)

**Configurable Setting:** "Box Selection Strategy" (dropdown in app settings)

**Step 5: Handle No Suitable Box**

If no active box meets the criteria:
- **Fallback Options:**
  1. Return "No suitable box found" error
  2. Select largest available box (even if items don't fit well)
  3. Suggest multiple boxes (for split shipments) - **Phase 2 feature**
  
For MVP: Return error and log the issue. Store owner should add a larger box or split the order manually.

#### Advanced Packing Considerations (Phase 2)

**For Future Enhancement:**

- True 3D bin packing algorithm (items can be rotated, stacked optimally)
- Multi-box solutions (split large orders across multiple boxes)
- Fragile item handling (extra padding requirements)
- Stackability rules (some items can't be stacked)
- Custom packing rules per product (e.g., "Always ship posters in tubes")

For MVP, the simplified volume-based approach with basic dimension checks is sufficient.

### 3. Integration with Shopify Checkout

#### Real-time Shipping Rate Calculation

The app must provide accurate box dimensions and weight to Shopify's shipping rate calculation at checkout.

**Implementation Approach:**

Shopify offers several ways to customize shipping rates:

1. **Carrier Calculated Rates with Adjustments** (Recommended for MVP)
2. **Shipping Scripts (Shopify Plus only)**
3. **Third-Party Shipping Rate Apps**

**Recommended: Carrier Service API**

Register the app as a carrier service with Shopify. When a customer checks out:

**Flow:**
1. Customer adds items to cart and proceeds to checkout
2. Shopify requests shipping rates from registered carrier services
3. Shopify sends request to app's carrier service endpoint: `POST /shipping-rates`
4. Request includes:
   - Items in cart (with dimensions and weights from product data)
   - Destination address
   - Origin address
5. App calculates optimal box using packing algorithm
6. App queries actual carrier rates (USPS, UPS, FedEx APIs) using:
   - Calculated box dimensions
   - Total weight (items + packing + box)
   - Origin and destination addresses
7. App returns shipping rates to Shopify
8. Shopify displays rates to customer

**Carrier Service Endpoint Requirements:**

**Request Format (from Shopify):**
```json
{
  "rate": {
    "origin": {
      "country": "US",
      "postal_code": "90210",
      "province": "CA",
      "city": "Beverly Hills",
      "address1": "123 Main St"
    },
    "destination": {
      "country": "US",
      "postal_code": "10001",
      "province": "NY",
      "city": "New York",
      "address1": "456 Park Ave"
    },
    "items": [
      {
        "name": "G-Busters Issue #2",
        "sku": "GB-002",
        "quantity": 1,
        "grams": 113,
        "price": 1500,
        "vendor": "Divinity Comics",
        "properties": {},
        "product_id": 123456,
        "variant_id": 789012
      }
    ],
    "currency": "USD",
    "locale": "en"
  }
}
```

**Response Format (from App to Shopify):**
```json
{
  "rates": [
    {
      "service_name": "USPS First Class",
      "service_code": "usps_first_class",
      "total_price": "495",
      "description": "Delivered in 2-5 business days",
      "currency": "USD"
    },
    {
      "service_name": "USPS Priority Mail",
      "service_code": "usps_priority",
      "total_price": "895",
      "description": "Delivered in 1-3 business days",
      "currency": "USD"
    }
  ]
}
```

**Implementation Steps:**

1. Register carrier service with Shopify API:
   - `POST /admin/api/2024-01/carrier_services.json`
   - Provide callback URL (e.g., `https://your-app.com/shipping-rates`)
   - Set `format: "json"` and `callback_url`

2. Implement `/shipping-rates` endpoint in app backend:
   - Receive Shopify request
   - Extract item dimensions from products (requires product metadata)
   - Run packing algorithm to select box
   - Call carrier APIs (USPS, UPS, FedEx) with box specs
   - Format and return rates

3. Store box assignment:
   - When order is created, store which box was calculated
   - Save as order metadata/attribute for future reference

**Product Dimension Setup:**

For the packing algorithm to work, products in Shopify must have dimensions and weight.

**Shopify Product Fields:**
- Weight (built-in field)
- Dimensions: NOT built-in by default

**Solution:**
- Use product metafields for dimensions:
  - `custom.length` (decimal)
  - `custom.width` (decimal)
  - `custom.height` (decimal)
- App should provide UI to set these for all products
- Or bulk import dimensions from CSV

**Product Dimension Management Interface:**

In app admin, provide a "Product Dimensions" page:
- List all products in store
- Show current dimensions and weight
- Inline editing or bulk update
- Import from CSV
- Flag products missing dimension data
- Validation: Ensure all dimensions are set before calculating shipping

### 4. Order Box Assignment Tracking

#### Assignment Data Model

When an order is placed, store the box assignment for record-keeping and fulfillment.

**Box Assignment Record:**
- Assignment ID (unique identifier)
- Order ID (Shopify order ID)
- Box ID (which box was selected)
- Items Packed (JSON array of order line items)
- Calculated Total Weight (items + packing + box)
- Calculated Total Volume
- Packing Efficiency (percentage)
- Assignment Method (automatic, manual override)
- Created Date
- Notes (optional, for manual adjustments)

**Storage Options:**

1. **App Database** (Recommended)
   - Store in app's own database
   - Link via Shopify order ID
   - Queryable for reporting

2. **Shopify Order Metafields**
   - Store as order metafield
   - Accessible in Shopify admin
   - Limited querying capabilities

3. **Hybrid Approach**
   - Store in app database for analysis
   - Also save key info as order metafield for visibility

**Recommended: Hybrid approach** for best of both worlds.

#### Order Metadata Integration

When a box is assigned, add information to the Shopify order:

**Order Tags:**
- `box-assigned` - indicates box selection has been made
- `box-{box-name}` - e.g., `box-comic-mailer-small`
- Optional: `auto-boxed` or `manual-boxed` depending on assignment method

**Order Metafields:**
- `custom.box_name` - Human-readable box name
- `custom.box_dimensions` - "12 × 9 × 2 inches"
- `custom.box_weight` - Total shipping weight
- `custom.packing_efficiency` - "85%" (how full the box is)

**Order Note/Attributes:**
- Add a line to order notes: "Box: Comic Mailer Small (12×9×2, 1.5 lbs total)"

This makes box assignments visible in Shopify admin without needing to open the app.

#### Manual Box Override

Store owner should be able to manually change the box assignment for an order.

**In Order Details View (App):**
- Show calculated box assignment
- "Change Box" button
- Dropdown to select different box from library
- Save new assignment
- Update order metadata
- Log reason for change (optional)

**Use Cases:**
- Algorithm selected wrong box
- Special packing requirements for specific order
- Customer requested specific packaging
- Testing different boxes

### 5. Fulfillment Planning Dashboard

#### Single Order View

When viewing an individual order in the app:

**Display:**
- Order number and customer name
- Items in order (with dimensions and weight)
- Calculated box assignment
- Box visual preview (simple graphic or photo if uploaded)
- Total shipping weight
- Packing efficiency score
- Timeline: When box was assigned

**Actions:**
- Change box assignment
- Recalculate box (if product dimensions changed)
- Print packing slip with box info
- Notes section for fulfillment team

#### Bulk Order View / Campaign Fulfillment

This is especially important for crowdfunding campaign fulfillment.

**Campaign Order Summary:**

For orders tagged with a specific campaign (e.g., `campaign-gbusters-issue-2`):

**Dashboard showing:**
- Total orders to fulfill: 247
- Box breakdown:
  - Comic Mailer Small: 156 orders
  - Multi-Issue Box: 67 orders
  - Deluxe Box: 24 orders
- Total estimated shipping weight: 482 lbs
- Packing supplies needed:
  - Bubble wrap: ~50 feet
  - Packing peanuts: 3 bags
  - Tape: 2 rolls

**Filterable Order List:**
- Filter by box type
- Filter by fulfillment status (unfulfilled, fulfilled, shipped)
- Sort by order date, customer name, box type
- Export as CSV with box assignments

**Bulk Actions:**
- Mark all as fulfilled
- Print batch packing slips
- Export for shipping label generation

#### Reports and Analytics

**Box Usage Report:**
- Date range selector
- Chart showing box usage over time
- Table: Box name, times used, percentage of orders
- Total costs (box costs + shipping)

**Shipping Cost Analysis:**
- Average shipping cost per order
- Breakdown by box type
- Comparison: Expected vs. actual shipping costs (if using test weights)

**Packing Efficiency Report:**
- Average packing efficiency across all orders
- Orders with low efficiency (wasted space) - opportunities to optimize box selection
- Suggestions for new box sizes based on common order combinations

**Product Dimension Issues:**
- Products missing dimensions
- Products with unusual dimensions (outliers)
- Products that rarely fit in available boxes

### 6. Settings and Configuration

#### App Settings Page

Global app configuration options:

**Packing Algorithm Settings:**
- Packing Buffer Percentage (default: 20%)
  - How much extra space to account for inefficient packing
  - Slider: 0% to 50%
- Packing Material Weight (default: 0.1 lbs)
  - Weight of bubble wrap, packing peanuts, etc.
  - Number input with unit selector
- Box Selection Strategy (default: Smallest Volume)
  - Radio buttons: Smallest Volume, Lowest Cost, Highest Priority, Best Fit

**Units Configuration:**
- Dimension Unit (default: Inches)
  - Radio buttons: Inches, Centimeters
  - Applies to all boxes and products
- Weight Unit (default: Pounds)
  - Radio buttons: Pounds, Kilograms, Ounces, Grams

**Carrier Integration:**
- Enable/disable specific carriers
- API credentials for USPS, UPS, FedEx
- Origin address (ship from location)

**Order Settings:**
- Auto-assign boxes on order creation (checkbox, default: enabled)
- Send box assignment notifications (to fulfillment team email)
- Include box info in packing slips (checkbox)

**Advanced Settings:**
- Debug mode (logs detailed calculations)
- Fallback behavior when no box fits
- Manual override tracking

#### First-Time Setup Wizard

For initial app installation, provide a guided setup:

**Step 1: Welcome**
- Brief explanation of what the app does
- Link to documentation

**Step 2: Add Your Boxes**
- Prompt to add first box
- Option to import from CSV template
- "Add Sample Boxes" button (pre-fills common box sizes)

**Step 3: Set Product Dimensions**
- Scan products in store
- Show products missing dimensions
- Bulk import tool
- "I'll do this later" option

**Step 4: Configure Settings**
- Set packing buffer percentage
- Choose box selection strategy
- Set units (inches/cm, lbs/kg)

**Step 5: Test It Out**
- Create a test order with sample products
- Show calculated box assignment
- Explain how shipping rates will work

**Step 6: Ready to Go**
- Confirmation that setup is complete
- Links to dashboard and box library

### 7. Integration with Crowdfunding App

**Critical:** This app must work seamlessly with the crowdfunding app for campaign order fulfillment.

#### Shared Order Context

Both apps need to work with the same Shopify orders without conflicts.

**Box Selector App Responsibilities:**
- Calculate and assign boxes to ALL orders (regular + campaign)
- Recognize campaign orders via tags (e.g., `campaign-pledge`, `campaign-gbusters-2`)
- Provide box assignments for campaign fulfillment planning

**Crowdfunding App Responsibilities:**
- Tag orders with campaign identifiers
- Manage campaign lifecycle (funded, failed, refunds)
- Handle backer management and surveys

**No Conflicts:**
- Box selector adds its own tags and metafields
- Crowdfunding app adds its own tags and metafields
- Both can coexist on same order

#### Campaign-Specific Box Planning

When a crowdfunding campaign is funded and ready for fulfillment:

**In Box Selector App:**

1. **Campaign Order View:**
   - Filter orders by campaign tag
   - See box assignments for all campaign orders
   - Aggregate stats: How many of each box needed

2. **Campaign Fulfillment Checklist:**
   - Total orders: 247
   - Box inventory needed:
     - [ ] 156× Comic Mailer Small
     - [ ] 67× Multi-Issue Box
     - [ ] 24× Deluxe Box
   - Estimated packing materials
   - Estimated total shipping cost

3. **Export for Production:**
   - CSV export with all box assignments
   - Format useful for print shop, fulfillment center, etc.
   - Columns: Order #, Customer, Reward Tier, Add-ons, Box Type, Dimensions, Weight

**User Workflow:**

1. Campaign ends successfully (in crowdfunding app)
2. Store owner switches to box selector app
3. Views campaign orders in fulfillment dashboard
4. Sees box breakdown and packing requirements
5. Orders necessary boxes and packing supplies
6. Exports order list for fulfillment center
7. Processes fulfillment (marks as shipped in Shopify)

#### Data Synchronization

**Webhooks to Monitor:**

Both apps should listen to:
- `orders/create` - New order created
- `orders/updated` - Order modified
- `orders/cancelled` - Order cancelled
- `orders/fulfilled` - Order fulfilled

**Box Selector App Actions:**
- `orders/create` → Calculate and assign box
- `orders/updated` → Recalculate box if items changed
- `orders/cancelled` → Archive box assignment
- `orders/fulfilled` → Mark assignment as complete

### 8. Technical Architecture Considerations

#### App Structure

**Backend:**
- Node.js/Express (or similar framework)
- Database: PostgreSQL or MySQL for storing boxes, assignments, settings
- API for frontend and Shopify communication
- Background jobs for batch processing (optional)

**Frontend (Admin Interface):**
- Embedded Shopify app using Shopify Polaris components
- React or Vue.js
- App Bridge for Shopify admin integration
- Responsive design (works on desktop, tablet, mobile)

**Carrier API Integration:**
- USPS Web Tools API or EasyPost API
- UPS API
- FedEx API
- Or use aggregator service like EasyPost, ShipStation, ShipEngine

#### Key API Endpoints

**Box Management:**
- `GET /api/boxes` - List all boxes
- `POST /api/boxes` - Create new box
- `GET /api/boxes/:id` - Get box details
- `PUT /api/boxes/:id` - Update box
- `DELETE /api/boxes/:id` - Delete box
- `PATCH /api/boxes/:id/toggle` - Toggle active status

**Box Assignment:**
- `POST /api/calculate-box` - Calculate optimal box for given items
- `GET /api/assignments/:order_id` - Get box assignment for order
- `PUT /api/assignments/:order_id` - Update/override box assignment
- `GET /api/assignments/campaign/:tag` - Get all assignments for campaign

**Product Dimensions:**
- `GET /api/products` - List products with dimensions
- `PUT /api/products/:id/dimensions` - Update product dimensions
- `POST /api/products/bulk-import` - Bulk import dimensions from CSV

**Settings:**
- `GET /api/settings` - Get all settings
- `PUT /api/settings` - Update settings

**Reports:**
- `GET /api/reports/box-usage` - Box usage report
- `GET /api/reports/shipping-costs` - Shipping cost analysis
- `GET /api/reports/campaign/:tag` - Campaign fulfillment summary

**Shipping Rates (Carrier Service):**
- `POST /shipping-rates` - Endpoint called by Shopify for rate calculation

#### Data Flow Examples

**Example 1: Customer Checks Out with Multiple Items**

1. Customer adds 3 comic issues + 1 art print to cart
2. Customer proceeds to checkout, enters shipping address
3. Shopify requests shipping rates from app: `POST /shipping-rates`
4. App receives request with items and addresses
5. App looks up product dimensions from Shopify product metafields:
   - Comic Issue: 10.5" × 6.75" × 0.1", 4 oz each
   - Art Print: 12" × 18" × 0.05", 2 oz
6. App calculates total volume and weight
7. App runs packing algorithm:
   - Total volume: ~150 cubic inches
   - Total weight: 14 oz + 0.1 lb packing = ~1 lb
   - Checks active boxes, finds "Multi-Issue Box" fits best
8. App queries USPS API with box specs (12×9×3 inches, 1 lb)
9. USPS returns rates: First Class $4.95, Priority $8.95
10. App returns rates to Shopify
11. Customer sees rates, selects one, completes order
12. Order is created in Shopify
13. Shopify webhook → `orders/create` → App
14. App saves box assignment in database and order metafield
15. Order is now tagged with `box-multi-issue-box`

**Example 2: Store Owner Adds New Box**

1. Store owner opens box selector app in Shopify admin
2. Navigates to Box Library
3. Clicks "Add New Box"
4. Fills out form:
   - Name: "Poster Tube"
   - Dimensions: 24" × 3" × 3"
   - Max Weight: 3 lbs
   - Box Weight: 0.3 lbs
   - Type: Tube
   - Active: Yes
5. Submits form → `POST /api/boxes`
6. App validates input, creates box record in database
7. Box appears in library list
8. From now on, algorithm considers this box for qualifying orders

**Example 3: Campaign Fulfillment Planning**

1. Crowdfunding campaign "G-Busters Issue #2" ends successfully (247 backers)
2. All orders are tagged with `campaign-gbusters-issue-2` and `campaign-funded`
3. Store owner opens box selector app
4. Navigates to "Campaign Fulfillment" view
5. Selects campaign tag from dropdown
6. App queries: `GET /api/assignments/campaign/campaign-gbusters-issue-2`
7. App returns aggregated data:
   - 156 orders need Comic Mailer Small
   - 67 orders need Multi-Issue Box
   - 24 orders need Deluxe Box
8. Store owner sees breakdown, knows what boxes to order
9. Exports order list as CSV for fulfillment center
10. Fulfillment center uses list to pack and ship all orders

### 9. Edge Cases and Error Handling

#### Scenarios to Handle

**1. Product Missing Dimensions:**
- If product has no dimension metafields, cannot calculate box
- **Solution:**
  - Log error
  - Use fallback default box (configurable in settings)
  - Or return shipping rate based on weight only (less accurate)
  - Notify store owner via dashboard: "X products missing dimensions"

**2. Items Too Large for Any Box:**
- Calculation finds no suitable box
- **Solution:**
  - Use largest available box (even if items technically don't fit)
  - Or return error at checkout: "Items too large to ship, contact us"
  - Log incident for store owner review
  - Suggest adding a larger box

**3. Items Too Heavy for Any Box:**
- Combined weight exceeds all box max weights
- **Solution:**
  - Use box with highest weight capacity
  - Or split shipment (Phase 2 feature)
  - Notify store owner

**4. No Active Boxes:**
- Store owner deactivates all boxes or hasn't added any
- **Solution:**
  - Cannot calculate shipping
  - Show error in admin: "No active boxes. Add at least one box to enable shipping calculation."
  - At checkout: fallback to Shopify's default shipping rates (if configured)

**5. Carrier API Failure:**
- USPS/UPS/FedEx API is down or returns error
- **Solution:**
  - Implement retry logic (3 attempts)
  - If all fail, return generic flat rates (configurable in settings)
  - Log error for debugging
  - Don't block checkout

**6. Concurrent Order Creation:**
- Multiple orders created simultaneously
- **Solution:**
  - Ensure packing algorithm is stateless
  - Use database transactions for assignments
  - No race conditions on box inventory (boxes are not consumed, just assigned)

**7. Order Edited After Box Assignment:**
- Customer or store owner adds/removes items after order is created
- **Solution:**
  - Webhook: `orders/updated`
  - Recalculate box assignment
  - Update order metafields
  - If items changed significantly, notify store owner

**8. Box Deleted While Assigned to Orders:**
- Store owner tries to delete box that's assigned to unfulfilled orders
- **Solution:**
  - Warning dialog: "This box is assigned to X orders. Delete anyway?"
  - If confirmed, delete box but keep assignments intact (store box details in assignment record)
  - Or prevent deletion, suggest deactivating instead

#### Data Validation

**Box Inputs:**
- All dimensions > 0
- Max weight > box weight
- Unique box names
- Valid units

**Product Dimensions:**
- Dimensions > 0
- Weight > 0
- No negative values

**Settings:**
- Packing buffer: 0% - 100%
- Packing material weight: 0 - 5 lbs (reasonable range)

### 10. Performance Considerations

**Box Calculation Speed:**
- Algorithm must run quickly (< 1 second)
- Optimize database queries (index box_id, active status)
- Cache active boxes in memory if list is small

**Carrier API Rate Limits:**
- USPS, UPS, FedEx have rate limits
- Implement caching for common routes/weights
- Use aggregator service (EasyPost) to abstract rate limits

**Webhook Processing:**
- Process `orders/create` webhook quickly
- If calculation is slow, use background job
- Respond to webhook immediately, calculate box async

**Large Order Volumes:**
- During campaign end, many orders may be created at once
- Use job queue (Bull, Sidekiq, etc.) for async processing
- Rate limit carrier API calls

### 11. Security Considerations

**Authentication:**
- Shopify OAuth for admin access
- Secure session management

**Authorization:**
- Only authenticated store owner can access admin features
- API endpoints require valid Shopify session

**Data Protection:**
- Customer data (addresses, order info) handled per Shopify policies
- No storage of sensitive payment information
- HTTPS for all communications

**API Keys:**
- Carrier API keys stored securely (environment variables, secrets manager)
- Not exposed in frontend code

**Rate Limiting:**
- Prevent abuse of public endpoints
- Especially shipping rate calculation endpoint

### 12. Testing Strategy

**Unit Tests:**
- Packing algorithm logic
- Box selection with various item combinations
- Edge cases (no boxes, oversized items, etc.)

**Integration Tests:**
- Shopify API calls (create products, read orders, etc.)
- Carrier API calls (mocked for testing)
- Webhook processing

**End-to-End Tests:**
1. Add boxes to library
2. Set product dimensions
3. Create test order
4. Verify box assigned correctly
5. Check order metafields updated
6. View in fulfillment dashboard

**Performance Tests:**
- Box calculation speed with 100+ boxes
- Handling 1000+ orders in campaign view
- Carrier API response times

**Edge Case Tests:**
- Missing product dimensions
- No suitable box
- Carrier API failure
- All boxes inactive

### 13. Documentation Needs

**Developer Documentation:**
- API reference
- Database schema
- Webhook setup
- Deployment guide
- Environment variables

**User Documentation:**
- How to add and manage boxes
- How to set product dimensions
- How to interpret packing efficiency
- How to override box assignments
- How to use campaign fulfillment tools
- Troubleshooting guide

**Integration Documentation:**
- How box selector app works with crowdfunding app
- Shared order tagging conventions
- Best practices for campaign fulfillment

### 14. Phase 1 vs. Phase 2 Features

#### Phase 1 (MVP - Core Functionality)

**Must Have:**
- Box CRUD interface (add, edit, delete, toggle active)
- Basic packing algorithm (volume-based with simple dimension checks)
- Carrier service integration for shipping rates
- Box assignment tracking (database + order metafields)
- Single order view with box assignment
- Basic settings (packing buffer, units, selection strategy)
- Product dimension management
- Manual box override

**Nice to Have:**
- Bulk order view by campaign tag
- Box usage reports
- CSV export of assignments

#### Phase 2 (Enhancements)

**Future Features:**
- Advanced 3D bin packing algorithm
- Multi-box solutions (split shipments)
- Fragile item handling rules
- Custom packing rules per product
- Box photos/visual library
- Predictive box recommendations based on historical data
- Integration with fulfillment services (ShipStation, ShipBob)
- Mobile app for warehouse packing
- Barcode scanning for box assignment

### 15. Success Metrics

**How to Measure Success:**

- Box assignment accuracy (% of orders with correct box)
- Shipping cost reduction vs. previous method
- Packing efficiency average (should be 70-90%)
- Time saved in fulfillment planning (especially for campaigns)
- Store owner satisfaction (feedback, support tickets)
- Checkout conversion rate (accurate shipping rates improve trust)

### 16. Maintenance and Monitoring

**Ongoing Monitoring:**
- Failed box calculations
- Carrier API errors
- Products missing dimensions
- Orders with unusual box assignments

**Alerts:**
- Email store owner when X products are missing dimensions
- Alert when carrier API is down
- Notify when order has no suitable box

**Regular Maintenance:**
- Update carrier API integrations as APIs change
- Review and optimize packing algorithm based on actual data
- Add new box types as store needs evolve

---

## Summary Checklist for Implementation

**Backend Requirements:**
- [ ] Database schema for boxes, assignments, settings
- [ ] API endpoints for box CRUD operations
- [ ] Packing algorithm implementation
- [ ] Shopify Admin API integration (products, orders, metafields)
- [ ] Carrier service endpoint for shipping rate calculation
- [ ] Carrier API integration (USPS, UPS, FedEx or aggregator)
- [ ] Webhook handlers for order events
- [ ] Box assignment tracking and storage

**Frontend Requirements:**
- [ ] Admin dashboard (embedded Shopify app)
- [ ] Box library interface (list, add, edit, delete)
- [ ] Box form with validation
- [ ] Product dimensions management interface
- [ ] Settings page
- [ ] Single order view with box assignment
- [ ] Bulk order view / campaign fulfillment dashboard
- [ ] Reports and analytics pages
- [ ] First-time setup wizard

**Shopify Integration:**
- [ ] OAuth setup
- [ ] Product metafield management (dimensions)
- [ ] Order metafield management (box assignment)
- [ ] Order tagging system
- [ ] Carrier service registration
- [ ] Webhook subscriptions

**Carrier Integration:**
- [ ] USPS API integration or aggregator
- [ ] Rate calculation logic
- [ ] Error handling and fallbacks
- [ ] Caching for performance

**Testing:**
- [ ] Packing algorithm unit tests
- [ ] Box selection with various item combinations
- [ ] Shipping rate calculation flow
- [ ] Webhook processing
- [ ] Edge case handling
- [ ] Performance testing with large order volumes

**Integration with Crowdfunding App:**
- [ ] Recognize campaign order tags
- [ ] Campaign fulfillment dashboard
- [ ] Export functionality for campaign orders
- [ ] Ensure no tag/metafield conflicts

**Deployment:**
- [ ] App hosting setup
- [ ] Database deployment
- [ ] Environment variables (carrier API keys, etc.)
- [ ] Monitoring and logging
- [ ] Error alerting

**Documentation:**
- [ ] API documentation
- [ ] User guide (how to add boxes, set dimensions, etc.)
- [ ] Integration guide (works with crowdfunding app)
- [ ] Troubleshooting guide

---

## Notes for Claude Code

This specification provides complete functional requirements for the box selector app. When implementing:

1. **Start with box management CRUD** - This is the foundation
2. **Implement packing algorithm** - Get the core logic solid with tests
3. **Build carrier service integration** - This is critical for checkout
4. **Add order tracking** - Box assignments need to be stored
5. **Create admin interface** - Store owner needs to manage boxes and view assignments
6. **Test with real scenarios** - Especially campaign fulfillment use case

**Key Integration Point:**
- This app must work seamlessly with the crowdfunding app
- Use consistent order tagging conventions
- Test with orders that have both campaign tags and box assignments

**Performance Priority:**
- Packing algorithm must be fast (< 1 second)
- Carrier API calls should be cached when possible
- Handle high order volumes gracefully

Ask clarifying questions if any requirements are unclear. Focus on building a maintainable, well-tested system that handles edge cases gracefully.
