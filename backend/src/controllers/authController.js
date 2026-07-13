const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const env = require("../config/env");
const { sendResetCode } = require("../services/emailService");

const createToken = (userId) => {
	return jwt.sign({ id: userId }, env.jwtSecret, {
		expiresIn: env.jwtExpiresIn,
	});
};

const formatUser = (user) => ({
	_id: user._id,
	name: user.name,
	email: user.email,
	reminderFrequency: user.reminderFrequency,
	expoPushToken: user.expoPushToken || null,
	createdAt: user.createdAt,
	updatedAt: user.updatedAt,
});

const registerUser = async (req, res) => {
	try {
		const { name, email, password, reminderFrequency, expoPushToken } = req.body;

		if (!name || !email || !password) {
			return res.status(400).json({ message: "Name, email, and password are required" });
		}

		const existingUser = await User.findOne({ email: email.toLowerCase() });

		if (existingUser) {
			return res.status(409).json({ message: "User already exists" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await User.create({
			name,
			email: email.toLowerCase(),
			password: hashedPassword,
			reminderFrequency,
			expoPushToken: expoPushToken || null,
		});

		return res.status(201).json({
			user: formatUser(user),
			token: createToken(user._id),
		});
	} catch (error) {
		return res.status(500).json({ message: error.message || "Failed to register user" });
	}
};

const loginUser = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ message: "Email and password are required" });
		}

		const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

		if (!user) {
			return res.status(401).json({ message: "Invalid email or password" });
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			return res.status(401).json({ message: "Invalid email or password" });
		}

		return res.json({
			user: formatUser(user),
			token: createToken(user._id),
		});
	} catch (error) {
		return res.status(500).json({ message: error.message || "Failed to login user" });
	}
};

const getProfile = async (req, res) => {
	return res.json({ user: formatUser(req.user) });
};

const updateProfile = async (req, res) => {
	try {
		const { name, reminderFrequency, expoPushToken } = req.body;

		if (name !== undefined) {
			req.user.name = name;
		}

		if (reminderFrequency !== undefined) {
			req.user.reminderFrequency = reminderFrequency;
		}

		if (expoPushToken !== undefined) {
			req.user.expoPushToken = expoPushToken || null;
		}

		const updatedUser = await req.user.save();

		return res.json({ user: formatUser(updatedUser) });
	} catch (error) {
		return res.status(500).json({ message: error.message || "Failed to update profile" });
	}
};

const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;

		if (!email) {
			return res.status(400).json({ message: "Email is required" });
		}

		const user = await User.findOne({ email: email.toLowerCase() });

		if (!user) {
			return res.status(404).json({ message: "No account found with this email address." });
		}

		const code = crypto.randomInt(100000, 999999).toString();
		const hashedCode = await bcrypt.hash(code, 6);

		user.resetPasswordCode = hashedCode;
		user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
		await user.save();

		const sent = await sendResetCode(user.email, code);

		if (!sent) {
			console.log(`\x1b[33m[DEV] Fallback — reset code for ${user.email}: ${code}\x1b[0m`);
		}

		return res.json({ message: "If that email is registered, a reset code has been sent." });
	} catch (error) {
		return res.status(500).json({ message: error.message || "Failed to process request" });
	}
};

const resetPassword = async (req, res) => {
	try {
		const { email, code, newPassword } = req.body;

		if (!email || !code || !newPassword) {
			return res.status(400).json({ message: "Email, code, and new password are required" });
		}

		if (newPassword.length < 6) {
			return res.status(400).json({ message: "Password must be at least 6 characters" });
		}

		const user = await User.findOne({ email: email.toLowerCase(), resetPasswordExpires: { $gt: new Date() } });

		if (!user || !user.resetPasswordCode) {
			return res.status(400).json({ message: "Invalid or expired reset code" });
		}

		const isValid = await bcrypt.compare(code, user.resetPasswordCode);

		if (!isValid) {
			return res.status(400).json({ message: "Invalid or expired reset code" });
		}

		user.password = await bcrypt.hash(newPassword, 10);
		user.resetPasswordCode = null;
		user.resetPasswordExpires = null;
		await user.save();

		return res.json({ message: "Password reset successful. You can now sign in with your new password." });
	} catch (error) {
		return res.status(500).json({ message: error.message || "Failed to reset password" });
	}
};

const changePassword = async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;

		if (!currentPassword || !newPassword) {
			return res.status(400).json({ message: "Current password and new password are required" });
		}

		if (newPassword.length < 6) {
			return res.status(400).json({ message: "New password must be at least 6 characters" });
		}

		const user = await User.findById(req.user._id).select("+password");

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const isMatch = await bcrypt.compare(currentPassword, user.password);

		if (!isMatch) {
			return res.status(400).json({ message: "Current password is incorrect" });
		}

		user.password = await bcrypt.hash(newPassword, 10);
		await user.save();

		return res.json({ message: "Password changed successfully" });
	} catch (error) {
		return res.status(500).json({ message: error.message || "Failed to change password" });
	}
};

const changeEmail = async (req, res) => {
	try {
		const { password, newEmail } = req.body;

		if (!password || !newEmail) {
			return res.status(400).json({ message: "Password and new email are required" });
		}

		if (!/^\S+@\S+\.\S+$/.test(newEmail)) {
			return res.status(400).json({ message: "Invalid email address" });
		}

		const user = await User.findById(req.user._id).select("+password");

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			return res.status(400).json({ message: "Password is incorrect" });
		}

		const existing = await User.findOne({ email: newEmail.toLowerCase(), _id: { $ne: user._id } });

		if (existing) {
			return res.status(409).json({ message: "Email is already in use" });
		}

		user.email = newEmail.toLowerCase();
		await user.save();

		return res.json({ user: formatUser(user), message: "Email changed successfully" });
	} catch (error) {
		return res.status(500).json({ message: error.message || "Failed to change email" });
	}
};

module.exports = {
	registerUser,
	loginUser,
	getProfile,
	updateProfile,
	forgotPassword,
	resetPassword,
	changePassword,
	changeEmail,
};

