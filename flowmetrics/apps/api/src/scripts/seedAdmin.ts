import bcrypt from "bcryptjs";
import { connectDB, disconnectDB } from "../config/db.js";
import { AdminUser } from "../models/AdminUser.js";
import { config } from "../config/env.js";

/**
 * Seed script for initial AdminUser.
 * Strictly adheres to security requirements:
 * 1. Password is never logged or stored in plaintext.
 * 2. Hashed using bcrypt with 10 salt rounds.
 * 3. Idempotent: updates or creates without duplicating.
 */
async function seedAdmin(): Promise<void> {
  console.log("--- Starting Admin User Seed Script ---");
  await connectDB();

  try {
    await AdminUser.init(); // Ensure unique index on email is built
    const adminEmail = config.ADMIN_EMAIL.toLowerCase().trim();
    const adminPassword = config.ADMIN_PASSWORD;

    if (!adminPassword || adminPassword.length < 8) {
      throw new Error("ADMIN_PASSWORD must be at least 8 characters long in environment config.");
    }

    // Hash password with bcrypt - cost factor 10 (standard secure work factor)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    // Upsert admin user
    const existingAdmin = await AdminUser.findOne({ email: adminEmail });
    if (existingAdmin) {
      existingAdmin.passwordHash = passwordHash;
      existingAdmin.role = "admin";
      await existingAdmin.save();
      console.log(`[Seed] Existing AdminUser updated: ${adminEmail} (Role: ${existingAdmin.role})`);
    } else {
      const newAdmin = await AdminUser.create({
        email: adminEmail,
        passwordHash,
        role: "admin",
      });
      console.log(`[Seed] AdminUser created successfully: ${newAdmin.email} (Role: ${newAdmin.role})`);
    }

    console.log("[Seed] Admin user seeded with bcrypt hash securely.");
  } catch (error) {
    console.error("[Seed] Error seeding admin user:", error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
    console.log("--- Finished Admin User Seed Script ---");
  }
}

seedAdmin();
