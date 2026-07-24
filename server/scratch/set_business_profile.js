require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/user');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });

    const result = await User.findOneAndUpdate(
      { email: 'freshbiz1784889656240@example.com' },
      { $set: { businessName: 'Fresh Demo Clinic', mobile: '+914889656240', phone: '+914889656240' } },
      { new: true, runValidators: true }
    );

    console.log(JSON.stringify(result, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
})();
