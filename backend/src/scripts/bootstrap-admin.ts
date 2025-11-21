import mongoose from "mongoose";
import dotenv from "dotenv";
import * as readline from "readline";
import User from "../data/models/User";
import bcrypt from "bcrypt";

// Load environment variables
dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function bootstrapAdmin() {
  try {
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL || process.env.MONGO_URI;
    if (!mongoUrl) {
      console.error("❌ Error: MONGO_URL or MONGO_URI not found in .env");
      process.exit(1);
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongoUrl);
    console.log("✅ Connected to MongoDB\n");

    // Check if any admin exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("⚠️  Admin already exists!");
      console.log(`   Email: ${existingAdmin.kuEmail}`);
      console.log("   Use the promote endpoint or delete existing admin first.\n");
      rl.close();
      await mongoose.disconnect();
      process.exit(0);
    }

    // Get admin details
    console.log("📝 Create Admin Account");
    console.log("   (Email must be @ku.ac.th)\n");

    const name = await question("Name: ");
    if (!name.trim()) {
      console.error("❌ Name is required");
      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    const email = await question("Email (@ku.ac.th): ");
    if (!email.trim()) {
      console.error("❌ Email is required");
      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    // Validate admin email
    if (!/.+@ku\.ac\.th$/.test(email)) {
      console.error("❌ Admin email must be @ku.ac.th");
      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    // Check if email already exists
    const existingUser = await User.findOne({ kuEmail: email });
    if (existingUser) {
      console.error(`❌ Email ${email} is already registered`);
      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    const password = await question("Password: ");
    if (!password.trim()) {
      console.error("❌ Password is required");
      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    const faculty = await question("Faculty: ");
    if (!faculty.trim()) {
      console.error("❌ Faculty is required");
      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    const contact = await question("Contact: ");
    if (!contact.trim()) {
      console.error("❌ Contact is required");
      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const admin = new User({
      name: name.trim(),
      kuEmail: email.trim(),
      password: hashedPassword,
      faculty: faculty.trim(),
      contact: contact.trim(),
      role: "admin",
      isVerified: true, // Auto-verify admin
    });

    await admin.save();

    console.log("\n✅ Admin account created successfully!");
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.kuEmail}`);
    console.log(`   Role: ${admin.role}\n`);

    rl.close();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error creating admin:", error);
    rl.close();
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run bootstrap
bootstrapAdmin();

