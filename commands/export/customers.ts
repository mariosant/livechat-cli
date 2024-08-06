import { resolve } from "node:path";
import JsonURL from "@jsonurl/jsonurl";
import { defineCommand } from "citty";
import { consola } from "consola";
import PQueue from "p-queue";
import { get } from "radash";
import { agentApiClient } from "../../utils/livechat-api-client";

const queue = new PQueue({
	autoStart: true,
});

export const exportCustomersCommand = defineCommand({
	meta: {
		name: "Export customers",
		description: "Export customers from LiveChat platform as json files.",
	},
	args: {
		directory: {
			default: "customers/",
			valueHint: "customers/",
			description: "Directory to store customers data.",
			type: "string",
		},
		filters: {
			default: "()",
			valueHint: "(country:(values:(Germany)))",
			description:
				"Pass request filters as jsonurl format. See more at https://platform.text.com/docs/messaging/agent-chat-api#list-customers",
			type: "string",
		},
	},
	run: async (context) => {
		consola.start("Starting customers export");

		const filters = JsonURL.parse(context.args.filters);

		const writeCustomerToDisk = async (customer: unknown) => {
			const customerId = get(customer, "id");

			const filename = resolve(
				String(context.args.directory),
				`${customerId}.json`,
			);
			const fileContent = JSON.stringify(customer, null, 4);

			consola.debug("Writing customer to disk", {
				customerId,
				filename,
			});
			await Bun.write(filename, fileContent);
		};

		const fetchCustomers = async (pageId?: string) => {
			consola.debug("Fetching customers...", {
				pageId,
			});

			const body = pageId ? { page_id: pageId } : { filters, limit: 100 };
			const response = await agentApiClient("/action/list_customers", {
				body,
			});

			const nextPageId = get<string | undefined>(response, "next_page_id");
			const customers = get<Record<string, unknown>[]>(
				response,
				"customers",
				[],
			);

			queue.addAll(
				customers.map((customer) => () => writeCustomerToDisk(customer)),
			);

			if (nextPageId) {
				queue.add(() => fetchCustomers(nextPageId));
			}
		};

		const response = await agentApiClient("/action/list_customers", {
			body: { limit: 100, filters },
		});

		const foundCustomers = get(response, "total_customers", 0);

		consola.info(`${foundCustomers} customers have been found.`);

		queue.on("error", (error) => {
			consola.error(error);
		});

		queue.add(() => fetchCustomers());
		await queue.onIdle();

		consola.success("Customers export finished");
	},
});
