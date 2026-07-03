const express = require("express");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const Joi = require("joi");
const {
	getNotifications,
	acknowledgeNotification,
	dismissNotification,
} = require("../controllers/notificationController");

const router = express.Router();

const objectIdSchema = Joi.object({
	id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
});

router.use(protect);

router.get("/", getNotifications);
router.put("/:id/acknowledge", validate({ params: objectIdSchema }), acknowledgeNotification);
router.put("/:id/dismiss", validate({ params: objectIdSchema }), dismissNotification);

module.exports = router;

