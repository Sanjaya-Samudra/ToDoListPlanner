const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		taskId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Task",
			default: null,
			index: true,
		},
		type: {
			type: String,
			enum: ["reminder", "system", "ai"],
			default: "reminder",
		},
		title: {
			type: String,
			required: true,
			trim: true,
			maxlength: 150,
		},
		message: {
			type: String,
			required: true,
			trim: true,
		},
		isRead: {
			type: Boolean,
			default: false,
			index: true,
		},
		readAt: {
			type: Date,
			default: null,
		},
	},
	{ timestamps: true }
);

notificationSchema.pre("save", function syncReadTimestamp(next) {
	if (this.isRead && !this.readAt) {
		this.readAt = new Date();
	}

	if (!this.isRead) {
		this.readAt = null;
	}

	next();
});

module.exports = mongoose.model("Notification", notificationSchema);

