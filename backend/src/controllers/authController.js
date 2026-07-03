const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");

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

module.exports = {
	registerUser,
	loginUser,
	getProfile,
	updateProfile,
};

