// Test script to verify garage approval workflow
const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

const testGarageApprovalFlow = async () => {
  try {
    console.log('🧪 Testing Garage Approval Workflow\n');

    // Step 1: Check if there are pending garages
    console.log('📋 Step 1: Fetch pending garages...');
    try {
      const pendingRes = await axios.get(`${API_URL}/garages/admin/pending`);
      console.log(`✅ Found ${pendingRes.data.garages?.length || 0} pending garages\n`);
      
      if (pendingRes.data.garages?.length > 0) {
        const garage = pendingRes.data.garages[0];
        console.log(`First pending garage: "${garage.name}"`);
        console.log(`Status: ${garage.status}`);
        console.log(`Location: ${garage.location?.latitude}, ${garage.location?.longitude}\n`);
        
        // Step 2: Approve the garage (REQUIRES ADMIN TOKEN)
        console.log('⚠️  Note: Approving garage requires valid admin token.');
        console.log('Please approve manually via Admin Panel.\n');
      }
    } catch (err) {
      console.log('⚠️  Cannot access pending garages (requires auth)\n');
    }

    // Step 3: Check if there are approved garages
    console.log('🔍 Step 3: Fetch all approved garages...');
    const approvedRes = await axios.get(`${API_URL}/garages`);
    const approvedGarages = approvedRes.data.garages || [];
    console.log(`✅ Found ${approvedGarages.length} approved garages\n`);
    
    if (approvedGarages.length > 0) {
      console.log('📍 Approved garages:');
      approvedGarages.forEach((garage, idx) => {
        console.log(`  ${idx + 1}. ${garage.name}`);
        console.log(`     Location: ${garage.location?.latitude}, ${garage.location?.longitude}`);
        console.log(`     Status: ${garage.status}`);
        console.log(`     Verified: ${garage.isVerified ? '✓' : '✗'}\n`);
      });
    } else {
      console.log('❌ No approved garages found yet.\n');
      console.log('Next steps:');
      console.log('1. User submits garage via /submit-garage');
      console.log('2. Admin approves from Admin Panel');
      console.log('3. Garage appears on the map\n');
    }

    console.log('✨ Test complete!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testGarageApprovalFlow();
