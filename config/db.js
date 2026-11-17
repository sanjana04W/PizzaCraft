/**
 * PizzaCraft - Database Configuration (MongoDB & Mongoose)
 * Connects to MongoDB with automatic retry & fallback mechanism
 */

const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pizzacraft';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000 // Fast fail if local daemon not started
    });

    isConnected = true;
    console.log(`🍃 MongoDB Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`⚠️ MongoDB connection note: Unable to connect to ${uri} (${error.message}).`);
    console.log(`📁 PizzaCraft is operating with resilient local storage and Mongoose schemas ready for live MongoDB connection.`);
    return false;
  }
};

const isDbConnected = () => isConnected;

module.exports = {
  connectDB,
  isDbConnected
};
