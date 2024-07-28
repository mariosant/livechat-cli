import { defineCommand } from "citty";
import { consola } from "consola";
import { get } from "radash";
import PQueue from "p-queue";
import JsonURL from "@jsonurl/jsonurl";
import { resolve } from "path";
import { agentApiClient } from "../../utils/livechat-api-client";

const queue = new PQueue({
  autoStart: true,
});

export const exportChatsCommand = defineCommand({
  meta: {
    name: "Export chats",
    description: "Export chats from LiveChat platform as json files.",
  },
  args: {
    directory: {
      default: "chats/",
      valueHint: "chats/",
      description: "Directory to store chat data.",
      type: "string",
    },
    filters: {
      default: "()",
      valueHint: "(tags:(values:(lorem,ipsum)))",
      description:
        "Pass request filters as jsonurl format. See more at https://platform.text.com/docs/messaging/agent-chat-api#list-archives",
      type: "string",
    },
  },
  run: async (context) => {
    consola.start("Starting chats export");

    const filters = JsonURL.parse(context.args.filters);

    const writeChatToDisk = async (chat: unknown) => {
      const chatId = get(chat, "id");
      const threadId = get(chat, "thread.id");

      const filename = resolve(
        String(context.args.directory),
        `${chatId}-${threadId}.json`
      );
      const fileContent = JSON.stringify(chat, null, 4);

      consola.debug(`Writing chat to disk`, { chatId, threadId, filename });
      await Bun.write(filename, fileContent);
    };

    const fetchChats = async (pageId?: string) => {
      consola.debug("Fetching chats...", {
        pageId,
      });

      const body = pageId ? { page_id: pageId } : { filters, limit: 100 };
      const response = await agentApiClient("/action/list_archives", {
        body,
      });

      const nextPageId = get<string | undefined>(response, "next_page_id");
      const chats = get<Record<string, unknown>[]>(response, "chats", []);

      queue.addAll(chats.map((chat) => () => writeChatToDisk(chat)));

      if (nextPageId) {
        queue.add(() => fetchChats(nextPageId));
      }
    };

    const response = await agentApiClient("/action/list_archives", {
      body: { limit: 100, filters },
    });

    const foundChats = get(response, "found_chats", 0);

    consola.info(`${foundChats} chats have been found.`);

    queue.on("error", (error) => {
      consola.error(error);
    });

    queue.add(() => fetchChats());
    await queue.onIdle();

    consola.success("Chats export finished");
  },
});
