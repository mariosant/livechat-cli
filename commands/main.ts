import { defineCommand } from "citty";
import { apiCommand } from "./api";
import { exportCommand } from "./export";

export const mainCommand = defineCommand({
	meta: {
		name: "LiveChat CLI tool",
		description: "A tool to work with LiveChat platform",
	},
	subCommands: {
		export: exportCommand,
		api: apiCommand,
	},
});
