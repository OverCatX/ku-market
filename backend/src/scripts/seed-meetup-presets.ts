import mongoose from "mongoose";
import dotenv from "dotenv";
import MeetupPreset from "../data/models/MeetupPreset";

dotenv.config();

const defaultPresets = [
  {
    label: "Main Gate (Ngamwongwan)",
    locationName: "Main Gate (Ngamwongwan)",
    address: "Front gate near Ngamwongwan Road entrance",
    lat: 13.846995,
    lng: 100.568308,
    isActive: true,
    order: 0,
  },
  {
    label: "KU Avenue Plaza",
    locationName: "KU Avenue Plaza",
    address: "Central shopping plaza inside campus",
    lat: 13.851944,
    lng: 100.573817,
    isActive: true,
    order: 1,
  },
  {
    label: "Central Library Lawn",
    locationName: "Central Library Lawn",
    address: "Green lawn in front of the Central Library",
    lat: 13.852583,
    lng: 100.571013,
    isActive: true,
    order: 2,
  },
  {
    label: "Sriwattanawilai Dorm",
    locationName: "Sriwattanawilai Dormitory Lobby",
    address: "Dorm lobby entrance",
    lat: 13.840732,
    lng: 100.572632,
    isActive: true,
    order: 3,
  },
  {
    label: "Engineering Gate (Phahonyothin)",
    locationName: "Faculty of Engineering Gate",
    address: "Phahonyothin Road entrance near Eng Building 3",
    lat: 13.85512,
    lng: 100.57189,
    isActive: true,
    order: 4,
  },
  {
    label: "Kasetsart Stadium",
    locationName: "Kasetsart Stadium Entrance",
    address: "Stadium parking area",
    lat: 13.84847,
    lng: 100.57794,
    isActive: true,
    order: 5,
  },
  {
    label: "KU Business School",
    locationName: "KU Business School Lobby",
    address: "In front of BBA building lobby",
    lat: 13.84564,
    lng: 100.56598,
    isActive: true,
    order: 6,
  },
];

async function seedMeetupPresets() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;
    if (!mongoUri) {
      console.error("MONGO_URI or MONGO_URL not found in environment variables");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Check if presets already exist
    const existingCount = await MeetupPreset.countDocuments();
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing presets. Skipping seed.`);
      console.log("To reseed, delete all presets first or use --force flag");
      await mongoose.connection.close();
      return;
    }

    // Insert default presets
    const presets = await MeetupPreset.insertMany(defaultPresets);
    console.log(`Successfully seeded ${presets.length} meetup presets`);

    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error seeding meetup presets:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedMeetupPresets();
}

export default seedMeetupPresets;

