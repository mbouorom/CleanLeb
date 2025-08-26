/* eslint-disable @typescript-eslint/no-require-imports */
const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
const cleanupDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Fix corrupted votes data
    console.log("Fixing corrupted votes data...");

    // Option 1: Remove all votes objects and let schema defaults apply
    const resetVotesResult = await mongoose.connection.db
      .collection("reports")
      .updateMany({}, { $unset: { votes: 1 } });

    console.log(`Reset votes for ${resetVotesResult.modifiedCount} documents`);

    // Option 2: Set proper votes structure for any remaining issues
    const fixVotesResult = await mongoose.connection.db
      .collection("reports")
      .updateMany(
        { votes: { $exists: false } },
        {
          $set: {
            votes: {
              upvotes: [],
              downvotes: [],
            },
          },
        }
      );

    console.log(
      `Added proper votes structure to ${fixVotesResult.modifiedCount} documents`
    );

    console.log("Database cleanup completed successfully!");
  } catch (error) {
    console.error("Error cleaning up database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run the cleanup
cleanupDatabase();
