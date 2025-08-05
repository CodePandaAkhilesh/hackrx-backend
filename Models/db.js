const mongoose = require("mongoose");

// Get MongoDB connection URL from environment variables
const mongo_url = process.env.MONGODB_URL;

// Connect to MongoDB using Mongoose
mongoose
  .connect(mongo_url, {
    useNewUrlParser: true, // Parse MongoDB connection string using new URL parser
    useUnifiedTopology: true, // Use new server discovery and monitoring engine
  })
  .then(() => {
    // Connection successful
    console.log("MongoDB Connected...");
  })
  .catch((err) => {
    // Handle connection error
    console.log("MongoDB Connection Error: ", err);
  });
