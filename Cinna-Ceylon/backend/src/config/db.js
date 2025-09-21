// Import the mongoose library for MongoDB interaction
import mongoose from "mongoose";

// Define an asynchronous function to connect to the database
const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using the URI from environment variables
    const conn = await mongoose.connect(process.env.MONGO_URI);
    // Log a success message with the connection host
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    // Log an error message if the connection fails
    console.error("❌ MongoDB connection error:", err.message);
    // Exit the process with a failure code
    process.exit(1);
  }
};

// Export the connectDB function to be used in other parts of the application
export default connectDB;
