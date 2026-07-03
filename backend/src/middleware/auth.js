const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");

const protect = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({ message: "Not authorized, token missing" });
		}

		const token = authHeader.split(" ")[1];
		const decoded = jwt.verify(token, env.jwtSecret);
		const user = await User.findById(decoded.id);

		if (!user) {
			return res.status(401).json({ message: "Not authorized, user not found" });
		}

		req.user = user;
		next();
	} catch (error) {
		return res.status(401).json({ message: "Not authorized, token invalid" });
	}
};

module.exports = { protect };

