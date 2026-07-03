const errorHandler = (err, req, res, next) => {
	if (res.headersSent) {
		return next(err);
	}

	const statusCode = err.statusCode || err.status || 500;
	const message = err.message || "Internal server error";
	const errors = err.errors || err.details || undefined;

	if (statusCode >= 500) {
		console.error(err);
	}

	return res.status(statusCode).json({
		message,
		errors,
	});
};

module.exports = errorHandler;

