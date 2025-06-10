const { MongoClient, ServerApiVersion } = require("mongodb");
require('dotenv').config();
const url = process.env.MONGODB_URL;

const client = new MongoClient(url, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const databaseName = "chatApplication";

const connection = async () => {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB server");
    return client.db(databaseName);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error("Failed to connect to the database");
  }
};

module.exports = connection;
