import mongoose from 'mongoose';
import dotenv from 'dotenv';
import runDiscountTests from './tests/discountSystem.test.js';

// Load environment variables
dotenv.config();

// Connect to test database
const connectTestDB = async () => {
  try {
    // Use a test database
    const testMongoURI = process.env.MONGO_URI?.replace('/coffee-shop', '/coffee-shop-test') || 'mongodb://localhost:27017/coffee-shop-test';
    
    await mongoose.connect(testMongoURI);
    console.log('📦 Connected to test database');
    
    // Clear test database
    await mongoose.connection.db.dropDatabase();
    console.log('🧹 Test database cleared');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Disconnect from database
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('📦 Disconnected from test database');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error.message);
  }
};

// Main test runner
const main = async () => {
  console.log('🧪 Coffee Shop Discount System Tests');
  console.log('=====================================\n');
  
  try {
    // Connect to test database
    await connectTestDB();
    
    // Run discount system tests
    await runDiscountTests();
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  } finally {
    // Cleanup
    await disconnectDB();
    process.exit(0);
  }
};

// Run tests
main();
