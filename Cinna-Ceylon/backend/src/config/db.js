// We need mongoose to connect to our MongoDB database.
import mongoose from "mongoose";

// This function is responsible for connecting to the database.
const connectDB = async () => {
  try {
    // We're telling mongoose to connect to the database.
    const conn = await mongoose.connect(process.env.MONGO_URI);
    // If the connection is successful, we'll see a message in the console.
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    // If something goes wrong during the connection, we'll see an error message.
    console.error("❌ MongoDB connection error:", err.message);
    // And the application will stop.
    process.exit(1);
  }
};

// We're making this function available to be used in other files.
export default connectDB;
