// Utility script to fix duplicate vehicleIds in the database
// Run this script if you have existing duplicate vehicleIds

import mongoose from 'mongoose';
import Vehicle from './src/models/vehicle.js';
import dotenv from 'dotenv';

dotenv.config();

const fixDuplicateVehicleIds = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all vehicles
    const vehicles = await Vehicle.find().sort({ createdAt: 1 });
    console.log(`Found ${vehicles.length} vehicles`);

    // Track used vehicleIds
    const usedIds = new Set();
    const updates = [];

    for (const vehicle of vehicles) {
      if (!vehicle.vehicleId || usedIds.has(vehicle.vehicleId)) {
        // Generate new unique vehicleId
        let nextNum = 1;
        let newVehicleId;
        
        do {
          newVehicleId = `VEH - ${nextNum.toString().padStart(2, '0')}`;
          nextNum++;
        } while (usedIds.has(newVehicleId));
        
        usedIds.add(newVehicleId);
        updates.push({
          _id: vehicle._id,
          oldId: vehicle.vehicleId,
          newId: newVehicleId
        });
        
        // Update the vehicle
        await Vehicle.findByIdAndUpdate(vehicle._id, { vehicleId: newVehicleId });
        console.log(`Updated vehicle ${vehicle._id}: ${vehicle.vehicleId} -> ${newVehicleId}`);
      } else {
        usedIds.add(vehicle.vehicleId);
      }
    }

    console.log(`\nFixed ${updates.length} duplicate vehicleIds:`);
    updates.forEach(update => {
      console.log(`- ${update.oldId} -> ${update.newId}`);
    });

    console.log('\nDuplicate vehicleIds fixed successfully!');
    
  } catch (error) {
    console.error('Error fixing duplicate vehicleIds:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixDuplicateVehicleIds();
}

export default fixDuplicateVehicleIds;