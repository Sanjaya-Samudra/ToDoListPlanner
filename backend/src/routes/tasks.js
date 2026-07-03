const express = require("express");
const Joi = require("joi");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
	getTasks,
	getTodayTasks,
	getWeekTasks,
	getProgress,
	createTask,
	updateTask,
	deleteTask,
	toggleTaskStatus,
} = require("../controllers/taskController");

const router = express.Router();

const querySchema = Joi.object({
	status: Joi.string().valid("pending", "in_progress", "completed").optional(),
	category: Joi.string().valid("study", "work", "personal", "health", "other").optional(),
	priority: Joi.string().valid("high", "medium", "low").optional(),
	sort: Joi.string().valid("createdAt", "dueDate", "priority", "title").optional(),
	order: Joi.string().valid("asc", "desc").optional(),
});

const taskBodySchema = Joi.object({
	title: Joi.string().min(1).max(200).required(),
	description: Joi.string().allow("").optional(),
	category: Joi.string().valid("study", "work", "personal", "health", "other").optional(),
	priority: Joi.string().valid("high", "medium", "low").optional(),
	status: Joi.string().valid("pending", "in_progress", "completed").optional(),
	dueDate: Joi.alternatives().try(Joi.date().iso(), Joi.valid(null)).optional(),
});

const updateTaskSchema = Joi.object({
	title: Joi.string().min(1).max(200).optional(),
	description: Joi.string().allow("").optional(),
	category: Joi.string().valid("study", "work", "personal", "health", "other").optional(),
	priority: Joi.string().valid("high", "medium", "low").optional(),
	status: Joi.string().valid("pending", "in_progress", "completed").optional(),
	dueDate: Joi.alternatives().try(Joi.date().iso(), Joi.valid(null)).optional(),
}).min(1);

router.use(protect);

router.get("/", validate({ query: querySchema }), getTasks);
router.get("/today", getTodayTasks);
router.get("/week", getWeekTasks);
router.get("/progress", getProgress);
router.post("/", validate({ body: taskBodySchema }), createTask);
router.put("/:id", validate({ body: updateTaskSchema }), updateTask);
router.delete("/:id", deleteTask);
router.patch("/:id/status", toggleTaskStatus);

module.exports = router;

