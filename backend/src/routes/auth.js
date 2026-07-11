const express = require("express");
const Joi = require("joi");
const {
	registerUser,
	loginUser,
	getProfile,
	updateProfile,
	changePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

const registerSchema = Joi.object({
	name: Joi.string().min(2).max(100).required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
	reminderFrequency: Joi.number().integer().min(1).optional(),
	expoPushToken: Joi.string().allow(null, "").optional(),
});

const loginSchema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().required(),
});

const profileSchema = Joi.object({
	name: Joi.string().min(2).max(100).optional(),
	reminderFrequency: Joi.number().integer().min(1).optional(),
	expoPushToken: Joi.string().allow(null, "").optional(),
}).min(1);

router.post("/register", validate({ body: registerSchema }), registerUser);
router.post("/login", validate({ body: loginSchema }), loginUser);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, validate({ body: profileSchema }), updateProfile);

const changePasswordSchema = Joi.object({
	currentPassword: Joi.string().required(),
	newPassword: Joi.string().min(6).required(),
});
router.put("/change-password", protect, validate({ body: changePasswordSchema }), changePassword);

module.exports = router;

