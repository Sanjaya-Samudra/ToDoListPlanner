const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
			maxlength: 200,
		},
		description: {
			type: String,
			trim: true,
			default: "",
		},
		category: {
			type: String,
			enum: ["study", "work", "personal", "health", "other"],
			default: "other",
			index: true,
		},
		priority: {
			type: String,
			enum: ["high", "medium", "low"],
			default: "medium",
			index: true,
		},
		status: {
			type: String,
			enum: ["pending", "in_progress", "completed"],
			default: "pending",
			index: true,
		},
		dueDate: {
			type: Date,
			default: null,
			index: true,
		},
		completedAt: {
			type: Date,
			default: null,
		},
	},
	{ timestamps: true }
);

taskSchema.pre("save", function syncCompletionTimestamp(next) {
	if (this.status === "completed" && !this.completedAt) {
		this.completedAt = new Date();
	}

	if (this.status !== "completed") {
		this.completedAt = null;
	}

	next();
});

module.exports = mongoose.model("Task", taskSchema);

