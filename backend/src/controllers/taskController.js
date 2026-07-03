const mongoose = require("mongoose");
const Task = require("../models/Task");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildTaskQuery = (req) => {
	const query = { userId: req.user._id };
	const { status, category, priority } = req.query;

	if (status) query.status = status;
	if (category) query.category = category;
	if (priority) query.priority = priority;

	return query;
};

const sortTasks = (req) => {
	const sortField = req.query.sort || "createdAt";
	const order = req.query.order === "asc" ? 1 : -1;
	return { [sortField]: order };
};

const getTasks = async (req, res) => {
	try {
		const tasks = await Task.find(buildTaskQuery(req)).sort(sortTasks(req));
		return res.json(tasks);
	} catch (error) {
		return res.status(500).json({ message: error.message || "Failed to fetch tasks" });
	}
};

const getTodayTasks = async (req, res) => {
	try {
		const start = new Date();
		start.setHours(0, 0, 0, 0);
		const end = new Date();
		end.setHours(23, 59, 59, 999);

		const tasks = await Task.find({
			userId: req.user._id,
			dueDate: { $gte: start, $lte: end },
		}).sort({ dueDate: 1, createdAt: -1 });

		return res.json(tasks);
	} catch (error) {
		return res.status(500).json({ message: error.message || "Failed to fetch today tasks" });
	}
};

const getWeekTasks = async (req, res) => {
	try {
		const start = new Date();
		start.setHours(0, 0, 0, 0);
		const end = new Date(start);
		end.setDate(end.getDate() + 7);
		end.setHours(23, 59, 59, 999);

		const tasks = await Task.find({
			userId: req.user._id,
			dueDate: { $gte: start, $lte: end },
		}).sort({ dueDate: 1, createdAt: -1 });

		return res.json(tasks);
	} catch (error) {
		return res.status(500).json({ message: error.message || "Failed to fetch week tasks" });
	}
};

const getProgress = async (req, res) => {
	try {
		const tasks = await Task.find({ userId: req.user._id });
		const total = tasks.length;
		const completed = tasks.filter((task) => task.status === "completed").length;
		const pending = total - completed;
		const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

		const completedDates = new Set(
			tasks
				.filter((task) => task.status === "completed")
				.map((task) => new Date(task.completedAt || task.updatedAt).toDateString())
		);

		let streak = 0;
		const cursor = new Date();
		cursor.setHours(0, 0, 0, 0);

		while (completedDates.has(cursor.toDateString())) {
			streak += 1;
			cursor.setDate(cursor.getDate() - 1);
		}

		const weeklyData = Array.from({ length: 7 }, (_, index) => {
			const day = new Date();
			day.setHours(0, 0, 0, 0);
			day.setDate(day.getDate() - (6 - index));
			const label = day.toDateString();
			return tasks.filter((task) => {
				if (task.status !== "completed") return false;
				const completedDate = new Date(task.completedAt || task.updatedAt);
				completedDate.setHours(0, 0, 0, 0);
				return completedDate.toDateString() === label;
			}).length;
		});

		const categoryBreakdown = tasks.reduce((acc, task) => {
			acc[task.category] = (acc[task.category] || 0) + 1;
			return acc;
		}, {});

		return res.json({
			total,
			completed,
			pending,
			percentage,
			productivityScore: percentage,
			streak,
			weeklyData,
			categoryBreakdown,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message || "Failed to fetch progress" });
	}
};

const createTask = async (req, res) => {
	try {
		const { title, description, category, priority, status, dueDate } = req.body;

		if (!title || !title.trim()) {
			return res.status(400).json({ message: "Task title is required" });
		}

		const task = await Task.create({
			userId: req.user._id,
			title: title.trim(),
			description: description || "",
			category: category || "other",
			priority: priority || "medium",
			status: status || "pending",
			dueDate: dueDate || null,
		});

		return res.status(201).json(task);
	} catch (error) {
		return res.status(500).json({ message: error.message || "Failed to create task" });
	}
};

const updateTask = async (req, res) => {
	try {
		const { id } = req.params;

		if (!isValidObjectId(id)) {
			return res.status(400).json({ message: "Invalid task id" });
		}

		const task = await Task.findOne({ _id: id, userId: req.user._id });

		if (!task) {
			return res.status(404).json({ message: "Task not found" });
		}

		const { title, description, category, priority, status, dueDate } = req.body;

		if (title !== undefined) task.title = title.trim();
		if (description !== undefined) task.description = description;
		if (category !== undefined) task.category = category;
		if (priority !== undefined) task.priority = priority;
		if (status !== undefined) task.status = status;
		if (dueDate !== undefined) task.dueDate = dueDate || null;

		const updated = await task.save();
		return res.json(updated);
	} catch (error) {
		return res.status(500).json({ message: error.message || "Failed to update task" });
	}
};

const deleteTask = async (req, res) => {
	try {
		const { id } = req.params;

		if (!isValidObjectId(id)) {
			return res.status(400).json({ message: "Invalid task id" });
		}

		const task = await Task.findOneAndDelete({ _id: id, userId: req.user._id });

		if (!task) {
			return res.status(404).json({ message: "Task not found" });
		}

		return res.json({ message: "Task deleted successfully" });
	} catch (error) {
		return res.status(500).json({ message: error.message || "Failed to delete task" });
	}
};

const toggleTaskStatus = async (req, res) => {
	try {
		const { id } = req.params;

		if (!isValidObjectId(id)) {
			return res.status(400).json({ message: "Invalid task id" });
		}

		const task = await Task.findOne({ _id: id, userId: req.user._id });

		if (!task) {
			return res.status(404).json({ message: "Task not found" });
		}

		task.status = task.status === "completed" ? "pending" : "completed";
		const updated = await task.save();

		return res.json(updated);
	} catch (error) {
		return res.status(500).json({ message: error.message || "Failed to update task status" });
	}
};

module.exports = {
	getTasks,
	getTodayTasks,
	getWeekTasks,
	getProgress,
	createTask,
	updateTask,
	deleteTask,
	toggleTaskStatus,
};

