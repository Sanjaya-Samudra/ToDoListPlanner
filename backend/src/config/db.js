const mongoose = require("mongoose");
const env = require("./env");

const connectDB = async () => {
	mongoose.connection.on("connected", () => {
		console.log("\x1b[32m%s\x1b[0m", "[DB] MongoDB connected");
	});

	mongoose.connection.on("disconnected", () => {
		console.log("\x1b[33m%s\x1b[0m", "[DB] MongoDB disconnected — will retry");
	});

	mongoose.connection.on("reconnected", () => {
		console.log("\x1b[32m%s\x1b[0m", "[DB] MongoDB reconnected");
	});

	mongoose.connection.on("error", (err) => {
		console.error("\x1b[31m%s\x1b[0m", `[DB] MongoDB error: ${err.message}`);
	});

	try {
		await mongoose.connect(env.mongoUri, {
			serverSelectionTimeoutMS: 10000,
			socketTimeoutMS: 45000,
		});
	} catch (error) {
		throw new Error(`MongoDB connection failed: ${error.message}`);
	}
};

module.exports = connectDB;

