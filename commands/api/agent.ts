import JsonURL from "@jsonurl/jsonurl";
import { defineCommand } from "citty";
import { agentApiClient } from "../../utils/livechat-api-client";

export const agentChatApiCommand = defineCommand({
	meta: {
		name: "LiveChat Agent Chat API client",
		description:
			"Interact with LiveChat Agent Chat API. Please find more at https://platform.text.com/docs/messaging/agent-chat-api",
	},
	args: {
		method: {
			required: true,
			type: "string",
		},
		payload: {
			required: false,
			type: "string",
			default: "()",
		},
	},
	async run({ args }) {
		const body = JsonURL.parse(args.payload);

		const response = await agentApiClient(`/action/${args.method}`, {
			body,
		});

		console.log(JSON.stringify(response, null, 4));
	},
});
