import { defineCommand } from "citty";
import { agentChatApiCommand } from "./agent";
import { configurationApiCommand } from "./configuration";

export const apiCommand = defineCommand({
	meta: {
		name: "LiveChat API Client",
	},
	subCommands: {
		agent: agentChatApiCommand,
		configuration: configurationApiCommand,
	},
});
