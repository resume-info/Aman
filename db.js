require('dotenv').config();
const { MongoClient } = require('mongodb');

// MongoDB Atlas connection string from environment variables
const uri = process.env.MONGODB_URI || "mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority";

const client = new MongoClient(uri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB Atlas");
    return client.db();
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
    throw error;
  }
}

// Close the connection
async function closeConnection() {
  await client.close();
  console.log("MongoDB connection closed");
}

module.exports = {
  connectToDatabase,
  closeConnection,
  client
}; 