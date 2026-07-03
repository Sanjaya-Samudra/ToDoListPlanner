const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const env = require("./src/config/env");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/auth");
const taskRoutes = require("./src/routes/tasks");
const notificationRoutes = require("./src/routes/notifications");
const aiRoutes = require("./src/routes/ai");
const AppError = require("./src/utils/AppError");
const errorHandler = require("./src/middleware/errorHandler");

const app = express();
const port = env.port;

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
	res.json({
		message: "ToDo List Planner API is running",
		status: "ok",
	});
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);

app.use((req, res, next) => {
	next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
});

app.use(errorHandler);

const startServer = async () => {
	try {
		await connectDB();
	} catch (error) {
		console.error("\x1b[31m%s\x1b[0m", `[ERROR] MongoDB Connection Failed: ${error.message}`);
		console.error("\x1b[33m%s\x1b[0m", "[WARNING] The server will start, but database-dependent features will fail.");
	}

	app.listen(port, () => {
		console.log(`Server running on port ${port}`);
	});
};

startServer();

