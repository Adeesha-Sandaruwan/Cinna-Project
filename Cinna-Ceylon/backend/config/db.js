import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    const dbName = process.env.MONGO_DB_NAME; // optional

    if (!mongoUri) {
      throw new Error("MONGO_URI is not set");
    }

    await mongoose.connect(mongoUri, dbName ? { dbName } : undefined);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectDB;
