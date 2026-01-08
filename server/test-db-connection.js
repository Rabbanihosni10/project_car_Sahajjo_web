require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB Atlas...');
    console.log('📍 Connection String:', process.env.MONGO_URI.replace(/:[^:@]+@/, ':****@'));
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('\n✅ MongoDB Atlas Connected Successfully!');
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    console.log(`📊 Ready State: ${conn.connection.readyState}`);
    
    // List all collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('\n📁 Available Collections:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // Get counts
    console.log('\n📈 Collection Counts:');
    for (const col of collections) {
      const count = await conn.connection.db.collection(col.name).countDocuments();
      console.log(`   - ${col.name}: ${count} documents`);
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ MongoDB Connection Error:', error.message);
    if (error.reason) {
      console.error('Reason:', error.reason);
    }
    process.exit(1);
  }
};

testConnection();
