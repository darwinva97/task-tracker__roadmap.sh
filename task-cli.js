#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const JSON_PATH = path.join(__dirname, "db.json");

const STATUS_TYPES = {
	TODO: "todo",
	IN_PROGRESS: "in-progress",
	DONE: "done",
};

const args = process.argv.slice(2);

switch (args[0]) {
	case "add":
		addTask(args[1]);
		break;
	case "update":
		updateTask(args[1], args[2]);
		break;
	case "delete":
		deleteTask(args[1]);
		break;
	case "mark-in-progress":
		updateTask(args[1], null, STATUS_TYPES.IN_PROGRESS);
		break;
	case "mark-done":
		updateTask(args[1], null, STATUS_TYPES.DONE);
		break;
	case "list":
        listTasks(args[1]);
		break;
	default:
		console.error("Invalid command");
}

function addTask(description) {
	if (!description) {
		console.error("Description is required");
		return;
	}
	const tasks = getTasks();
	const id = tasks.length + 1;
	tasks.push({
		id,
		description,
		done: STATUS_TYPES.TODO,
		createdAt: new Date(),
		updatedAt: new Date(),
	});
	saveTasks(tasks);
	console.log("Task added successfully. ID: ", id);
}

function updateTask(id, description, status) {
	const isUpdate = id && description && !status;
	const isMark = id && !description && status;
	if (!isUpdate && !isMark) {
		console.error("Invalid arguments");
		return;
	}
	const tasks = getTasks();
	const task = tasks.find((task) => task.id === Number.parseInt(id));
	if (!task) {
		console.error("Task not found");
		return;
	}
	if (description) {
		task.description = description;
	}
	if (status) {
		task.done = status;
	}
	task.updatedAt = new Date();
	saveTasks(tasks);
	console.log("Task updated successfully. ID: ", id);
}

function deleteTask(id) {
	if (!id) {
		console.error("ID is required");
		return;
	}
	const tasks = getTasks();
	const task = tasks.find((task) => task.id === Number.parseInt(id));
	if (!task) {
		console.error("Task not found");
		return;
	}
	tasks.splice(tasks.indexOf(task), 1);
	saveTasks(tasks);
	console.log("Task deleted successfully. ID: ", id);
}

function listTasks(status) {
	const tasks = getTasks(status);
	const taskToList = tasks.map(({ id, description, done }) => {
		return status ? `${id}: ${description}` : `${id}: ${description} - ${done}`;
	});
    console.log (taskToList.length === 0 ? "No tasks found" : taskToList.join("\n"));
}

function saveTasks(tasks) {
	fs.writeFileSync(JSON_PATH, JSON.stringify(tasks, null, 2));
}

function getTasks(status) {
	if (!fs.existsSync(JSON_PATH)) {
		saveTasks([]);
	}
	const data = fs.readFileSync(JSON_PATH, "utf-8");
	const tasks = JSON.parse(data);

	if (status) {
		return tasks.filter((task) => task.done === status);
	}

	return tasks;
}
