const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define schema for storing user registration/login info
const UserSchema = new Schema({
  name: {
    type: String,       // User's full name
    required: true,     // Name is mandatory
  },
  email: {
    type: String,       // User's email address
    required: true,     // Email is mandatory
    unique: true,       // Ensures no duplicate emails
  },
  password: {
    type: String,       // Hashed password
    required: true,     // Password is mandatory
  },
});

// Create a model from the schema and link it to the 'users' collection
const UserModel = mongoose.model("users", UserSchema);

// Export the model for use in controllers or routes
module.exports = UserModel;
