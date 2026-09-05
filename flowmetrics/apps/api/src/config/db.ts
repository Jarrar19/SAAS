import mongoose from "mongoose";
import { config } from "./env.js";

export async function connectDB(): Promise<typeof mongoose> {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI);
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error("[MongoDB] Connection error:", error);
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
