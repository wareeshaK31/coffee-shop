import mongoose from 'mongoose';
import DiscountService from '../services/discountService.js';
import Discount from '../models/Discount.js';
import MenuItem from '../models/MenuItem.js';
import User from '../models/User.js';
import Order from '../models/orderModel.js';

// Test data setup
const setupTestData = async () => {
  // Create test menu items
  const coffeeItem = await MenuItem.create({
    name: "Latte",
    description: "Espresso with milk",
    price: 4.99,
    category: "Coffee"
  });

  const pastryItem = await MenuItem.create({
    name: "Croissant",
    description: "Buttery pastry",
    price: 3.50,
    category: "Pastry"
  });

  // Create test user
  const testUser = await User.create({
    name: "Test User",
    email: "test@example.com",
    password: "hashedpassword123",
    is_staff: false
  });

  // Create test discounts
  const percentageDiscount = await Discount.create({
    name: "10% Off",
    description: "10% off your order",
    type: "percentage",
    value: 10,
    min_order_value: 5.00,
    valid_from: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    max_uses: 100,
    max_uses_per_customer: 2,
    is_active: true
  });

  const fixedDiscount = await Discount.create({
    name: "$2 Off",
    description: "$2 off your order",
    type: "fixed",
    value: 2.00,
    min_order_value: 10.00,
    valid_from: new Date(Date.now() - 24 * 60 * 60 * 1000),
    valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    is_active: true
  });

  const itemSpecificDiscount = await Discount.create({
    name: "Coffee 20% Off",
    description: "20% off all coffee items",
    type: "item_specific",
    value: 20,
    valid_from: new Date(Date.now() - 24 * 60 * 60 * 1000),
    valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    specific_items: [coffeeItem._id],
    is_active: true
  });

  const expiredDiscount = await Discount.create({
    name: "Expired Discount",
    description: "This discount has expired",
    type: "percentage",
    value: 15,
    valid_from: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    valid_to: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    is_active: true
  });

  return {
    coffeeItem,
    pastryItem,
    testUser,
    percentageDiscount,
    fixedDiscount,
    itemSpecificDiscount,
    expiredDiscount
  };
};

// Test functions
const testDiscountValidation = async (testData) => {
  console.log("\n🧪 Testing Discount Validation...");
  
  const { testUser, percentageDiscount, expiredDiscount } = testData;
  const cartItems = [
    { menuItem: testData.coffeeItem, quantity: 2 },
    { menuItem: testData.pastryItem, quantity: 1 }
  ];
  const totalBeforeDiscount = 13.48; // (4.99 * 2) + 3.50

  // Test 1: Valid discount
  const validResult = await DiscountService.validateDiscount(
    percentageDiscount,
    cartItems,
    testUser._id,
    totalBeforeDiscount
  );
  console.log("✅ Valid discount test:", validResult.isValid ? "PASS" : "FAIL");
  console.log("   Reason:", validResult.reason);

  // Test 2: Expired discount
  const expiredResult = await DiscountService.validateDiscount(
    expiredDiscount,
    cartItems,
    testUser._id,
    totalBeforeDiscount
  );
  console.log("✅ Expired discount test:", !expiredResult.isValid ? "PASS" : "FAIL");
  console.log("   Reason:", expiredResult.reason);

  // Test 3: Minimum order value not met
  const smallCartItems = [{ menuItem: testData.pastryItem, quantity: 1 }];
  const smallTotal = 3.50;
  
  const minOrderResult = await DiscountService.validateDiscount(
    percentageDiscount, // Has min_order_value of 5.00
    smallCartItems,
    testUser._id,
    smallTotal
  );
  console.log("✅ Min order value test:", !minOrderResult.isValid ? "PASS" : "FAIL");
  console.log("   Reason:", minOrderResult.reason);
};

const testDiscountCalculation = async (testData) => {
  console.log("\n🧮 Testing Discount Calculations...");
  
  const cartItems = [
    { menuItem: testData.coffeeItem, quantity: 2 },
    { menuItem: testData.pastryItem, quantity: 1 }
  ];
  const totalBeforeDiscount = 13.48;

  // Test 1: Percentage discount (10%)
  const percentageAmount = DiscountService.calculateDiscountAmount(
    testData.percentageDiscount,
    cartItems,
    totalBeforeDiscount
  );
  const expectedPercentage = 1.35; // 13.48 * 0.10 = 1.348, rounded
  console.log("✅ Percentage calculation:", 
    Math.abs(percentageAmount - expectedPercentage) < 0.01 ? "PASS" : "FAIL");
  console.log(`   Expected: $${expectedPercentage}, Got: $${percentageAmount}`);

  // Test 2: Fixed discount ($2)
  const fixedAmount = DiscountService.calculateDiscountAmount(
    testData.fixedDiscount,
    cartItems,
    totalBeforeDiscount
  );
  console.log("✅ Fixed calculation:", fixedAmount === 2.00 ? "PASS" : "FAIL");
  console.log(`   Expected: $2.00, Got: $${fixedAmount}`);

  // Test 3: Item-specific discount (20% off coffee)
  const itemSpecificAmount = DiscountService.calculateDiscountAmount(
    testData.itemSpecificDiscount,
    cartItems,
    totalBeforeDiscount
  );
  const expectedItemSpecific = 1.996; // (4.99 * 2) * 0.20 = 1.996
  console.log("✅ Item-specific calculation:", 
    Math.abs(itemSpecificAmount - expectedItemSpecific) < 0.01 ? "PASS" : "FAIL");
  console.log(`   Expected: $${expectedItemSpecific}, Got: $${itemSpecificAmount}`);
};

const testDiscountApplication = async (testData) => {
  console.log("\n🎯 Testing Discount Application...");
  
  const { testUser, percentageDiscount } = testData;
  const cartItems = [
    { menuItem: testData.coffeeItem, quantity: 2 },
    { menuItem: testData.pastryItem, quantity: 1 }
  ];

  const result = await DiscountService.applyDiscountToCart(
    percentageDiscount,
    cartItems,
    testUser._id
  );

  console.log("✅ Discount application:", result.isValid ? "PASS" : "FAIL");
  console.log("   Total before discount:", result.totalBeforeDiscount);
  console.log("   Discount amount:", result.discountAmount);
  console.log("   Total after discount:", result.totalAfterDiscount);
  console.log("   Reason:", result.reason);

  // Verify calculation
  const expectedTotal = result.totalBeforeDiscount - result.discountAmount;
  console.log("✅ Total calculation:", 
    Math.abs(result.totalAfterDiscount - expectedTotal) < 0.01 ? "PASS" : "FAIL");
};

const testAvailableDiscounts = async (testData) => {
  console.log("\n📋 Testing Available Discounts...");
  
  const { testUser } = testData;
  const availableDiscounts = await DiscountService.getAvailableDiscounts(testUser._id);
  
  console.log("✅ Available discounts count:", availableDiscounts.length);
  console.log("   Discounts found:");
  availableDiscounts.forEach(discount => {
    console.log(`   - ${discount.name} (${discount.type})`);
  });

  // Should exclude expired discount
  const hasExpired = availableDiscounts.some(d => d.name === "Expired Discount");
  console.log("✅ Expired discount excluded:", !hasExpired ? "PASS" : "FAIL");
};

// Main test runner
const runDiscountTests = async () => {
  try {
    console.log("🚀 Starting Discount System Tests...");
    
    // Setup test data
    console.log("📝 Setting up test data...");
    const testData = await setupTestData();
    
    // Run tests
    await testDiscountValidation(testData);
    await testDiscountCalculation(testData);
    await testDiscountApplication(testData);
    await testAvailableDiscounts(testData);
    
    console.log("\n✅ All discount system tests completed!");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error(error.stack);
  }
};

export default runDiscountTests;
