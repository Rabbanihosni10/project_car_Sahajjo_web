# Quick Test Guide - Marketplace & Shopping

## 🚀 Quick Start

### 1. Verify Everything is Running

```bash
# Check if server is running on port 5000
curl http://localhost:5000/api/products | head -50

# Check if products have stock
curl http://localhost:5000/api/products | grep -o '"stock":[0-9]*'
```

### 2. Access the Application

- Frontend: http://localhost:5173
- Login with:
  - Email: `rabbanihosni10@gmail.com`
  - Password: `123456`

## 📋 Test Scenarios

### Test 1: Browse Marketplace

1. Login to the app
2. Click "Marketplace" from navigation or dashboard
3. **Expected**: See grid of 10 products with images, prices, and stock
4. **Verify**:
   - All products display correctly
   - Stock numbers are visible
   - "Add to Cart" buttons are enabled for items with stock

### Test 2: Filter Products

1. On Marketplace page, use the filters:
   - Select "parts" category
   - Search for "filter"
2. **Expected**: Only matching products shown
3. **Verify**: Filters work correctly and update the display

### Test 3: Add Product to Cart (from Marketplace)

1. Click "Add to Cart" on any product
2. **Expected**: Toast notification "Added to cart!"
3. **Verify**:
   - Cart count badge appears/updates in navbar
   - Cart number matches items added

### Test 4: View Product Details

1. Click "Details" button on a product card
2. **Expected**: Navigate to product details page
3. **Verify**:
   - Product image displays
   - Price, description, brand shown
   - Stock information visible
   - Ratings displayed (if available)

### Test 5: Add to Cart from Product Details

1. On product details page, set quantity to 2-3
2. Click "Add to Cart"
3. **Expected**: Toast shows "Added X item(s) to cart!"
4. **Verify**: Quantity correctly added to cart

### Test 6: View Shopping Cart

1. Click cart icon in navbar
2. **Expected**: Navigate to `/cart` page
3. **Verify**:
   - All added items displayed
   - Product images and names correct
   - Quantities match what was added
   - Total price calculated correctly

### Test 7: Modify Cart Items

1. On cart page, find an item
2. Click + or - buttons to adjust quantity
3. **Expected**: Cart total updates immediately
4. **Verify**:
   - Quantity changes
   - Total recalculates
   - Can't go below 1 or above stock

### Test 8: Remove Cart Item

1. Click trash icon next to an item
2. **Expected**: Toast "Item removed from cart"
3. **Verify**:
   - Item disappears from cart
   - Total updates
   - Cart count badge updates

### Test 9: Apply Discount Code

1. On cart page, find "Discount Code" section
2. Enter code: `SAVE10`
3. Click "Apply"
4. **Expected**: Success message and discount applied
5. **Verify**:
   - Shows "Code Applied: SAVE10"
   - Discount amount calculated (10%)
   - Total reduced correctly

### Test 10: Complete Checkout

1. On cart page with items, scroll to checkout section
2. Select payment method (e.g., "Card")
3. Fill shipping address:
   - Street: "123 Main St"
   - City: "Dhaka"
   - State: "Bangladesh"
   - ZIP: "1000"
   - Phone: "01234567890"
4. Click "Proceed to Payment"
5. **Expected**: Success message, order created
6. **Verify**:
   - Cart cleared
   - Redirected to order page
   - Order details displayed

### Test 11: Cart Persistence

1. Add items to cart
2. Close browser tab completely
3. Reopen app and login again
4. **Expected**: Cart items still present
5. **Verify**: localStorage is working

### Test 12: Out of Stock Scenario

1. Check a product with 0 stock (if available)
2. Try to add it to cart
3. **Expected**: Button shows "Out of Stock" and is disabled
4. **Verify**: Can't add unavailable items

## 💳 Payment Methods Test

Try selecting each payment method on checkout:

- [ ] Credit/Debit Card
- [ ] bKash
- [ ] Nagad
- [ ] Cash on Delivery

## 🛍️ Product Categories Test

Filter marketplace by each category:

- [ ] Parts (3 products: Oil Filter, Air Filter, Brake Pads)
- [ ] Tools (2 products: Jumper Cables, Car Jack)
- [ ] Accessories (2 products: Floor Mats, Seat Covers)
- [ ] Fluids (1 product: Car Polish)
- [ ] Electronics (2 products: Car Battery, LED Lights)

## 💰 Discount Codes Test

All working discount codes:

- [ ] `SAVE10` → 10% off
- [ ] `SAVE20` → 20% off
- [ ] `WELCOME` → 15% off

Invalid code test:

- [ ] Try `INVALID123` → Should show error

## 📊 API Testing (Optional)

### Get All Products

```bash
curl http://localhost:5000/api/products
```

### Get Single Product

```bash
curl http://localhost:5000/api/products/[PRODUCT_ID]
```

### Create Order (requires auth token)

```bash
curl -X POST http://localhost:5000/api/products/orders \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"product": "[PRODUCT_ID]", "quantity": 2, "price": 500}],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Dhaka",
      "state": "BD",
      "zipCode": "1000",
      "phone": "01234567890"
    },
    "paymentMethod": "card",
    "subtotal": 1000,
    "discount": 0,
    "shipping": 100,
    "total": 1100
  }'
```

## ✅ Passing Criteria

All of the following should work:

- [x] View marketplace with all products
- [x] Filter products by category
- [x] Search for products
- [x] Add items to cart
- [x] View cart contents
- [x] Adjust quantities
- [x] Remove items
- [x] Apply discount codes
- [x] Complete checkout
- [x] Cart persists between sessions
- [x] Product details page works
- [x] Stock validation working
- [x] All payment methods selectable

## 🐛 If Something Breaks

### Products not showing

```bash
# Reseed products
cd server
node seedProducts.js
```

### Cart not working

- Clear browser localStorage: DevTools → Application → Storage → Clear
- Reload page

### Checkout failing

- Check browser console for errors
- Ensure all fields filled
- Check server logs: `npm run dev`

### Stock not decreasing

- Check MongoDB directly
- Verify order was created
- Check for errors in server logs

## 📱 Screen Size Testing

Test on different viewport sizes:

- [ ] Desktop (1920px)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

All layouts should be responsive and working!

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ Can browse 10 products on marketplace
2. ✅ Can add any product to cart
3. ✅ Cart updates and persists
4. ✅ Can checkout with all required fields
5. ✅ Order completes successfully
6. ✅ Discount codes work
7. ✅ All payment methods available
8. ✅ Stock decreases after purchase

**Enjoy your working marketplace! 🛍️**
