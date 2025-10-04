import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const vehicleSchema = new mongoose.Schema({
  vehicleId: { type: String, unique: true },
  vehicleType: String,
  capacity: String,
  status: String,
  insuranceNo: String,
  insuranceExpDate: Date,
  serviceDate: Date,
}, { timestamps: true });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

async function checkVehicles() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test');
    console.log('Connected to MongoDB');

    // Get all vehicles and show their vehicleIds
    const vehicles = await Vehicle.find({}).sort({ vehicleId: 1 });
    console.log('\nExisting vehicles:');
    vehicles.forEach((vehicle, index) => {
      console.log(`${index + 1}. ID: ${vehicle._id}, vehicleId: "${vehicle.vehicleId}", Type: ${vehicle.vehicleType}`);
    });

    // Check for duplicates
    const duplicateGroups = await Vehicle.aggregate([
      { $group: { _id: "$vehicleId", count: { $sum: 1 }, docs: { $push: "$$ROOT" } } },
      { $match: { count: { $gt: 1 } } }
    ]);

    if (duplicateGroups.length > 0) {
      console.log('\nDuplicate vehicleIds found:');
      duplicateGroups.forEach(group => {
        console.log(`vehicleId "${group._id}" appears ${group.count} times:`);
        group.docs.forEach(doc => {
          console.log(`  - MongoDB ID: ${doc._id}`);
        });
      });
    } else {
      console.log('\nNo duplicate vehicleIds found.');
    }

    // Show the highest vehicleId number
    const vehicleIdPattern = /^VEH - (\d+)$/;
    let maxNumber = 0;
    vehicles.forEach(vehicle => {
      if (vehicle.vehicleId) {
        const match = vehicle.vehicleId.match(vehicleIdPattern);
        if (match) {
          const number = parseInt(match[1], 10);
          if (number > maxNumber) {
            maxNumber = number;
          }
        }
      }
    });
    console.log(`\nHighest vehicleId number: ${maxNumber}`);
    console.log(`Next vehicleId should be: VEH - ${String(maxNumber + 1).padStart(2, '0')}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkVehicles();