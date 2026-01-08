const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/carsahajjo';

async function resetAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const result = await User.deleteOne({ email: 'rabbanihosni10@gmail.com' });
    console.log(`Deleted ${result.deletedCount} admin user(s)`);

    await mongoose.connection.close();
    console.log('Done! Now restart the server to seed with new password.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetAdmin();
