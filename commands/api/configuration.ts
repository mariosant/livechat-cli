import JsonURL from "@jsonurl/jsonurl";
import { defineCommand } from "citty";
import { configurationApiClient } from "../../utils/livechat-api-client";

export const configurationApiCommand = defineCommand({
	meta: {
		name: "LiveChat Configuration API client",
		description:
			"Interact with LiveChat Configuration API. Please find more at https://platform.text.com/docs/management/configuration-api",
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

		const response = await configurationApiClient(`/action/${args.method}`, {
			body,
		});

		console.log(JSON.stringify(response, null, 4));
	},
});
