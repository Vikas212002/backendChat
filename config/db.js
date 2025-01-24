const { MongoClient, ServerApiVersion } = require("mongodb");

const url = "mongodb://localhost:27017/chatApp/chatApplication"

const client = new MongoClient(url, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const databaseName = "chatApplication";
const myDB = client.db("chatApplication");
const myColl = myDB.collection("messages");

const connection = async () => {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB server");
    const db = client.db(databaseName);
    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

module.exports = connection;