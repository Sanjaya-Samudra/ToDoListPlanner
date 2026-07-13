require("dotenv").config();

const requiredVars = [
	"PORT",
	"MONGODB_URI",
	"JWT_SECRET",
	"JWT_EXPIRES_IN",
	"GROQ_API_KEY",
	"GROQ_MODEL",
];

const missingVars = requiredVars.filter((name) => !process.env[name]);

if (missingVars.length > 0) {
	throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
}

module.exports = {
	port: process.env.PORT,
	mongoUri: process.env.MONGODB_URI,
	jwtSecret: process.env.JWT_SECRET,
	jwtExpiresIn: process.env.JWT_EXPIRES_IN,
	groqApiKey: process.env.GROQ_API_KEY,
	groqModel: process.env.GROQ_MODEL,
	email: {
		host: process.env.EMAIL_HOST,
		port: parseInt(process.env.EMAIL_PORT || "587", 10),
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
		from: process.env.EMAIL_FROM || "noreply@taskflow.app",
	},
};

