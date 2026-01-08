#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');

const ATLAS_URI = process.env.MONGO_URI;

console.log('═══════════════════════════════════════════════════════');
console.log('   🔧 MongoDB Atlas Connection Test');
console.log('═══════════════════════════════════════════════════════\n');

console.log('📋 Connection Details:');
console.log(`   URI: ${ATLAS_URI.replace(/:[^:]*@/, ':****@')}`);

async function testConnection() {
  try {
    console.log('\n⏳ Connecting to MongoDB Atlas...\n');
    
    const connection = await mongoose.connect(ATLAS_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    
    console.log('✅ CONNECTION SUCCESSFUL!\n');
    
    const db = mongoose.connection.db;
    const admin = db.admin();
    
    // Get server status
    const status = await admin.serverStatus();
    console.log('📊 Server Info:');
    console.log(`   Host: ${status.host}`);
    console.log(`   Version: ${status.version}`);
    
    // List databases
    const databases = await admin.listDatabases();
    console.log(`\n📦 Databases (${databases.databases.length}):`);
    databases.databases.forEach(db => {
      console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // List collections in current database
    const collections = await db.listCollections().toArray();
    console.log(`\n📁 Collections (${collections.length}):`);
    
    for (const col of collections) {
      const collection = db.collection(col.name);
      const count = await collection.countDocuments();
      
      console.log(`   ✓ ${col.name} (${count} documents)`);
    }
    
    await mongoose.connection.close();
    
    console.log('\n✅ Test completed! Atlas connection is working correctly.\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ CONNECTION FAILED!\n');
    console.error('Error:', error.message);
    console.error('\n');
    process.exit(1);
  }
}

testConnection();
