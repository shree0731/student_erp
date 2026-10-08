const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');
    const db = mongoose.connection.db;

    const r1 = await db.collection('students').updateMany({ college_id: 'C101' }, { $set: { college_name: 'Apex Engineering College' } });
    const r2 = await db.collection('students').updateMany({ college_id: 'C102' }, { $set: { college_name: 'Kavery Residential Institute of Technology' } });
    const r3 = await db.collection('students').updateMany({ college_id: 'C103' }, { $set: { college_name: 'Modern Institute of Science & Technology' } });
    const r4 = await db.collection('students').updateMany({ college_id: 'C104' }, { $set: { college_name: 'Sahyadri Deemed University' } });

    console.log('Successfully updated MongoDB students:');
    console.log(`- C101 (Apex Engineering College): ${r1.modifiedCount}`);
    console.log(`- C102 (Kavery Residential Institute): ${r2.modifiedCount}`);
    console.log(`- C103 (Modern Institute of Science): ${r3.modifiedCount}`);
    console.log(`- C104 (Sahyadri Deemed University): ${r4.modifiedCount}`);

    await mongoose.disconnect();
    console.log('MongoDB update complete.');
  } catch (err) {
    console.error('Error updating college names in MongoDB:', err);
    process.exit(1);
  }
}

run();
