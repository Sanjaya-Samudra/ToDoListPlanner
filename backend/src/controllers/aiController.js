const axios = require("axios");
const Task = require("../models/Task");
const env = require("../config/env");

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const parseJson = (text, fallback = {}) => {
	if (!text || typeof text !== "string") return fallback;

	try {
		return JSON.parse(text);
	} catch {
		const start = text.indexOf("{");
		const end = text.lastIndexOf("}");
		if (start !== -1 && end !== -1 && end > start) {
			try {
				return JSON.parse(text.slice(start, end + 1));
			} catch {
				return fallback;
			}
		}
		return fallback;
	}
};

const groqChat = async (messages, fallback) => {
	if (!env.groqApiKey) {
		return fallback;
	}

	try {
		const response = await axios.post(
			GROQ_URL,
			{
				model: env.groqModel,
				messages,
				temperature: 0.4,
				response_format: { type: "json_object" },
			},
			{
				headers: {
					Authorization: `Bearer ${env.groqApiKey}`,
					"Content-Type": "application/json",
				},
				timeout: 20000,
			}
		);

		const content = response.data?.choices?.[0]?.message?.content || "";
		const parsed = parseJson(content, null);

		return parsed || { reply: content || fallback.reply || "" };
	} catch {
		return fallback;
	}
};

const simpleTaskSuggestions = (text) => {
	const seed = text
		.split(/[.\n,;]/)
		.map((item) => item.trim())
		.filter(Boolean)
		.slice(0, 4);

	const defaultDueDate = new Date();
	defaultDueDate.setHours(defaultDueDate.getHours() + 2); // Suggest in 2 hours

	if (seed.length === 0) {
		return [
			{ 
				title: "Plan your next priority", 
				description: "Pick the most urgent task and start with a 15 minute focus block.", 
				category: "work", 
				priority: "high",
				dueDate: defaultDueDate.toISOString()
			},
			{ 
				title: "Break work into steps", 
				description: "Split large work into smaller actions so it feels easier to start.", 
				category: "personal", 
				priority: "medium",
				dueDate: new Date(defaultDueDate.getTime() + 24 * 60 * 60 * 1000).toISOString() // tomorrow
			},
		];
	}

	return seed.map((item, index) => {
		const taskDueDate = new Date();
		taskDueDate.setDate(taskDueDate.getDate() + index);
		taskDueDate.setHours(12, 0, 0, 0); // Noon

		let suggestedPriority = "medium";
		const lowerItem = item.toLowerCase();
		if (lowerItem.includes("urgent") || lowerItem.includes("asap") || lowerItem.includes("exam") || lowerItem.includes("deadline") || lowerItem.includes("important")) {
			suggestedPriority = "high";
		} else if (lowerItem.includes("low") || lowerItem.includes("later") || lowerItem.includes("whenever")) {
			suggestedPriority = "low";
		} else if (index === 0) {
			suggestedPriority = "high";
		}

		return {
			title: item.replace(/^i need to\s*/i, "").replace(/^help me\s*/i, "").slice(0, 80),
			description: `Generated from: ${item}`,
			category: index % 2 === 0 ? "work" : "study",
			priority: suggestedPriority,
			dueDate: taskDueDate.toISOString(),
		};
	});
};

const getTaskSnapshot = async (userId) => {
	const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
	const pending = tasks.filter((task) => task.status !== "completed").length;
	const completed = tasks.length - pending;

	return { tasks, pending, completed, total: tasks.length };
};

const chat = async (req, res) => {
	try {
		const message = req.body.message || "";

		if (!message.trim()) {
			return res.status(400).json({ message: "Message is required" });
		}

		const userTasks = await Task.find({ userId: req.user._id })
			.sort({ createdAt: -1 })
			.lean();

		const fallback = {
			reply: "I can help you organize that. Try asking me to generate tasks, prioritize work, or plan your day.",
			tasks: simpleTaskSuggestions(message),
			updates: [],
		};

		const tasksForPrompt = userTasks.map((t) => ({
			_id: t._id.toString(),
			title: t.title,
			description: t.description,
			category: t.category,
			priority: t.priority,
			status: t.status,
			dueDate: t.dueDate ? t.dueDate.toISOString().split("T")[0] : null,
		}));

		const systemPrompt = `You are a helpful task planning assistant. Return ONLY valid JSON with the following keys:

1. "reply" (string) - Your conversational response to the user
2. "tasks" (array) - New task suggestions. Each task must include title (string), description (string), category (one of: study, work, personal, health, other), priority (one of: high, medium, low), and dueDate (ISO 8601 string or null). Analyze the user's message to suggest the most appropriate priority level and date/time. If the user does not specify a date or time, suggest a realistic one based on context. Empty array if no new tasks needed.
3. "updates" (array) - Suggested changes to existing tasks. Each update object must include:
   - "taskId" (string) - The _id of the task to update (must match one from the user's task list below)
   - "changes" (object) - Fields to update. Can include: title, description, category, priority, status (pending/in_progress/completed), dueDate (ISO date string or null)
   - "summary" (string) - Brief human-readable description of what is changing

The user's current tasks are listed below. You may suggest updates to any of them when the user asks.

STRICT RULES FOR UPDATES:
- Only include an update if the user has CLEARLY identified the specific task AND specified exact field changes
- If the user is vague (e.g., "change this task", "update the priority", "fix that one") leave updates as an empty array and ask for clarification in the reply
- "Clear identification" means the task can be matched by title or description from the list above
- "Exact field changes" means the user stated what field and what new value
- NEVER guess or assume which task the user means
- NEVER make up field values
- When in doubt, return an empty updates array and ask the user for more details in the reply

User's tasks:
${JSON.stringify(tasksForPrompt, null, 2)}`;

		const result = await groqChat(
			[
				{ role: "system", content: systemPrompt },
				{
					role: "user",
					content: `User message: ${message}`,
				},
			],
			fallback
		);

		return res.json({
			reply: result.reply || fallback.reply,
			tasks: Array.isArray(result.tasks) ? result.tasks : fallback.tasks,
			updates: Array.isArray(result.updates) ? result.updates : [],
		});
	} catch (error) {
		return res.status(500).json({ message: error.message || "Failed to process AI chat" });
	}
};

const generateTasks = async (req, res) => {
	try {
		const text = req.body.text || req.body.message || "";

		if (!text.trim()) {
			return res.status(400).json({ message: "Text is required" });
		}

		const fallback = { reply: "Here are a few suggested tasks.", tasks: simpleTaskSuggestions(text) };

		const result = await groqChat(
			[
				{
					role: "system",
					content:
						"Generate task suggestions from the user's text. Return ONLY JSON with key tasks as an array. Each task must include title (string), description (string), category (one of: study, work, personal, health, other), priority (one of: high, medium, low), and dueDate (ISO 8601 string or null). Analyze the text to suggest the most appropriate priority level and date/time (dueDate). If the user does not specify a date or time, suggest a realistic one based on context.",
				},
				{ role: "user", content: text },
			],
			fallback
		);

		return res.json({
			reply: result.reply || fallback.reply,
			tasks: Array.isArray(result.tasks) ? result.tasks : fallback.tasks,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message || "Failed to generate tasks" });
	}
};

const prioritizeTasks = async (req, res) => {
	try {
		const inputTasks = Array.isArray(req.body.tasks) ? req.body.tasks : [];

		if (inputTasks.length === 0) {
			return res.status(400).json({ message: "tasks array is required" });
		}

		const fallbackTasks = inputTasks.map((task, index) => ({
			...task,
			priority: task.priority || (index === 0 ? "high" : "medium"),
		}));

		const result = await groqChat(
			[
				{
					role: "system",
					content:
						"Prioritize the provided tasks. Return ONLY JSON with key tasks as an array of the same tasks, updated with priority values high, medium, or low.",
				},
				{ role: "user", content: JSON.stringify({ tasks: inputTasks }) },
			],
			{ reply: "Tasks prioritized.", tasks: fallbackTasks }
		);

		return res.json({
			reply: result.reply || "Tasks prioritized.",
			tasks: Array.isArray(result.tasks) ? result.tasks : fallbackTasks,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message || "Failed to prioritize tasks" });
	}
};

const suggestions = async (req, res) => {
	try {
		const snapshot = await getTaskSnapshot(req.user._id);
		const fallbackSuggestions = [
			snapshot.pending > 0 ? `You have ${snapshot.pending} pending tasks. Focus on the oldest due item first.` : "Great job clearing your list. Add one small task for tomorrow.",
			snapshot.completed > 0 ? `You have completed ${snapshot.completed} tasks. Keep the momentum with a short planning session.` : "Start with one easy task to build momentum.",
			"Use a 25 minute focus block and take a short break after each sprint.",
		];

		const result = await groqChat(
			[
				{
					role: "system",
					content:
						"Return ONLY JSON with keys reply (string) and suggestions (array of strings) containing productivity tips based on the user's task list.",
				},
				{
					role: "user",
					content: JSON.stringify(snapshot),
				},
			],
			{ reply: "Here are some productivity tips.", suggestions: fallbackSuggestions }
		);

		return res.json({
			reply: result.reply || "Here are some productivity tips.",
			suggestions: Array.isArray(result.suggestions) ? result.suggestions : fallbackSuggestions,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message || "Failed to fetch suggestions" });
	}
};

const reviewTasks = async (req, res) => {
	try {
		const inputTasks = Array.isArray(req.body.tasks) ? req.body.tasks : [];
		const snapshot = inputTasks.length > 0 ? { tasks: inputTasks } : await getTaskSnapshot(req.user._id);

		const fallback = {
			review: "Your task list looks workable. Start with the highest priority item and keep the rest small and specific.",
			improvements: ["Focus on one important task first", "Add due dates to important tasks", "Break large tasks into smaller steps"],
		};

		const result = await groqChat(
			[
				{
					role: "system",
					content:
						"Review the user's tasks and return ONLY JSON with keys review (string), improvements (array of strings), and tasks (optional array).",
				},
				{ role: "user", content: JSON.stringify(snapshot) },
			],
			fallback
		);

		return res.json({
			review: result.review || fallback.review,
			improvements: Array.isArray(result.improvements) ? result.improvements : fallback.improvements,
			tasks: Array.isArray(result.tasks) ? result.tasks : snapshot.tasks || [],
		});
	} catch (error) {
		return res.status(500).json({ message: error.message || "Failed to review tasks" });
	}
};

module.exports = {
	chat,
	generateTasks,
	prioritizeTasks,
	suggestions,
	reviewTasks,
};

