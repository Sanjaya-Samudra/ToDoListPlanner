const Joi = require("joi");
const AppError = require("../utils/AppError");

const validate = ({ body, query, params } = {}) => (req, _res, next) => {
	const sections = [
		["body", body],
		["query", query],
		["params", params],
	];

	for (const [sectionName, schema] of sections) {
		if (!schema) continue;

		const { value, error } = schema.validate(req[sectionName], {
			abortEarly: false,
			stripUnknown: true,
		});

		if (error) {
			return next(
				new AppError(
					"Validation failed",
					400,
					error.details.map((detail) => detail.message)
				)
			);
		}

		req[sectionName] = value;
	}

	return next();
};

module.exports = validate;

