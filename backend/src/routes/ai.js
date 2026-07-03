const express = require("express");
const Joi = require("joi");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
	chat,
	generateTasks,
	prioritizeTasks,
	suggestions,
	reviewTasks,
} = require("../controllers/aiController");

const router = express.Router();

const chatSchema = Joi.object({
	message: Joi.string().min(1).required(),
});

const generateSchema = Joi.object({
	text: Joi.string().min(1).optional(),
	message: Joi.string().min(1).optional(),
}).or("text", "message");

const prioritizeSchema = Joi.object({
	tasks: Joi.array()
		.items(
			Joi.object({
				title: Joi.string().required(),
				description: Joi.string().allow("").optional(),
				category: Joi.string().valid("study", "work", "personal", "health", "other").optional(),
				priority: Joi.string().valid("high", "medium", "low").optional(),
			})
		)
		.min(1)
		.required(),
});

const reviewSchema = prioritizeSchema;

router.use(protect);

router.post("/chat", validate({ body: chatSchema }), chat);
router.post("/generate-tasks", validate({ body: generateSchema }), generateTasks);
router.post("/prioritize", validate({ body: prioritizeSchema }), prioritizeTasks);
router.get("/suggestions", suggestions);
router.post("/review", validate({ body: reviewSchema }), reviewTasks);

module.exports = router;

