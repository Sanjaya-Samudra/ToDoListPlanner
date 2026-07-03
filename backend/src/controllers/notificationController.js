const Notification = require("../models/Notification");
const Task = require("../models/Task");

const serializeNotification = (notification) => ({
	_id: notification._id,
	title: notification.title,
	body: notification.message,
	message: notification.message,
	acknowledged: notification.isRead,
	isRead: notification.isRead,
	type: notification.type,
	taskId: notification.taskId,
	createdAt: notification.createdAt,
	updatedAt: notification.updatedAt,
	readAt: notification.readAt,
});

const syncTaskReminders = async (user) => {
	const reminderFrequency = Math.max(1, Number(user.reminderFrequency || 5));
	const now = new Date();
	const reminderWindowStart = new Date(now.getTime() - reminderFrequency * 60000);
	const reminderWindowEnd = new Date(now.getTime() + reminderFrequency * 60000);
	const pendingTasks = await Task.find({
		userId: user._id,
		status: { $ne: "completed" },
		dueDate: { $ne: null },
	});

	for (const task of pendingTasks) {
		const dueDate = new Date(task.dueDate);
		if (Number.isNaN(dueDate.getTime())) {
			continue;
		}

		const shouldRemind = dueDate <= reminderWindowEnd;
		if (!shouldRemind) {
			continue;
		}

		const existingReminder = await Notification.findOne({
			userId: user._id,
			taskId: task._id,
			type: "reminder",
			createdAt: { $gte: reminderWindowStart },
		});

		if (existingReminder) {
			continue;
		}

		await Notification.create({
			userId: user._id,
			taskId: task._id,
			type: "reminder",
			title: `Task reminder: ${task.title}`,
			message: dueDate < now
				? `${task.title} is overdue. Please review it now.`
				: `${task.title} is due soon. Time to check it off.`,
			isRead: false,
		});
	}
};

const getNotifications = async (req, res) => {
	try {
		await syncTaskReminders(req.user);
		const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
		return res.json(notifications.map(serializeNotification));
	} catch (error) {
		return res.status(500).json({ message: error.message || "Failed to fetch notifications" });
	}
};

const acknowledgeNotification = async (req, res) => {
	try {
		const notification = await Notification.findOne({ _id: req.params.id, userId: req.user._id });

		if (!notification) {
			return res.status(404).json({ message: "Notification not found" });
		}

		notification.isRead = true;
		const updated = await notification.save();
		return res.json(serializeNotification(updated));
	} catch (error) {
		return res.status(500).json({ message: error.message || "Failed to acknowledge notification" });
	}
};

const dismissNotification = async (req, res) => {
	return acknowledgeNotification(req, res);
};

module.exports = {
	getNotifications,
	acknowledgeNotification,
	dismissNotification,
};

