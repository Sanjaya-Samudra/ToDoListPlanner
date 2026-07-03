const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			minlength: 2,
			maxlength: 100,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
			match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
		},
		password: {
			type: String,
			required: true,
			minlength: 6,
			select: false,
		},
		reminderFrequency: {
			type: Number,
			default: 5,
			min: 1,
		},
		expoPushToken: {
			type: String,
			default: null,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

