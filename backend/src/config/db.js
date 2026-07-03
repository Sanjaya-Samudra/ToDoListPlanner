const mongoose = require("mongoose");
const env = require("./env");

const connectDB = async () => {
	try {
		await mongoose.connect(env.mongoUri, {
			serverSelectionTimeoutMS: 5000,
		});
		console.log("MongoDB connected");
	} catch (error) {
		throw new Error(`MongoDB connection failed: ${error.message}`);
	}
};

module.exports = connectDB;

