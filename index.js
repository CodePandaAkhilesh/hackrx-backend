// Load environment variables from the .env file
require("dotenv").config();

// Import required modules
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// Import route handlers
const HackRxRouter = require("./Routes/HackRxRouter");

// Connect to MongoDB database
require("./Models/db");

// Initialize Express app
const app = express();

// Define the server port (default to 8080 if not specified in environment)
const PORT = process.env.PORT || 8080;

// Enable CORS (Cross-Origin Resource Sharing) for API access from other domains
app.use(cors());

// Parse incoming JSON requests
app.use(bodyParser.json());

// Mount HackRx routes under /hackrx
app.use("/hackrx", HackRxRouter);

// Test endpoint to check server status
app.get("/ping", (req, res) => {
  res.send("PONG"); // Respond with "PONG" to indicate server is up
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
