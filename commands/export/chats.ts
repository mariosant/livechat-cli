import { defineCommand, type CommandContext } from "citty";
import { consola } from "consola";
import { get } from "radash";
import PQueue from "p-queue";
import JsonURL from "@jsonurl/jsonurl";
import { resolve } from "path";
import { agentApiClient } from "../../utils/livechat-api-client";
import type { ChatData } from "../../types";

const queue = new PQueue({
  autoStart: true,
  concurrency: 1,
});

const jsonExporter = async (
  chat: ChatData,
  { directory }: { directory: string }
) => {
  const chatId = get<ChatData["id"]>(chat, "id");
  const threadId = get<ChatData["thread"]["id"]>(chat, "id");
  const filename = resolve(directory, `${chatId}-${threadId}.json`);

  const content = JSON.stringify(chat, null, 4);

  await Bun.write(filename, content);
};

const plainConvoExporter = async (
  chat: ChatData,
  { directory }: { directory: string }
) => {
  const chatId = get<ChatData["id"]>(chat, "id");
  const filename = resolve(directory, `${chatId}.txt`);

  const events = get<ChatData["thread"]["events"]>(chat, "thread.events", []);

  const threadContent = events
    .filter((event) => event.type === "message")
    .filter((event) => event.visibility === "all")
    .reduce((output, event) => {
      const authorType = event.author_id?.includes("@") ? "Agent" : "Visitor";
      const line = `${authorType}: ${event.text}\n`;

      return `${output}${line}`;
    }, "");

  const fileContent = (await Bun.file(filename).exists())
    ? await Bun.file(filename).text()
    : "";

  const data = fileContent + threadContent;
  await Bun.write(filename, data);
};

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
    view: {
      default: "json",
      valueHint: "json | plain-convo",
      description: "Pass the output format of your choice.",
      type: "string",
    },
  },
  run: async (context) => {
    consola.start("Starting chats export");

    const filters = JsonURL.parse(context.args.filters ?? "");

    const fetchChats = async (pageId?: string) => {
      consola.debug("Fetching chats...", {
        pageId,
      });

      const body = pageId ? { page_id: pageId } : { filters, limit: 100 };
      const response = await agentApiClient("/action/list_archives", {
        body,
      });

      const nextPageId = get<string | undefined>(response, "next_page_id");
      const chats = get<ChatData[]>(response, "chats", []);

      queue.addAll(
        chats.map((chat) => async () => {
          if (context.args.view === "json") {
            return jsonExporter(chat, { directory: context.args.directory });
          }

          if (context.args.view === "plain-convo") {
            return plainConvoExporter(chat, {
              directory: context.args.directory,
            });
          }
        })
      );

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
