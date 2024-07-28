import { defineCommand } from "citty";
import { exportChatsCommand } from "./chats";
import { exportCustomersCommand } from "./customers";

export const exportCommand = defineCommand({
  meta: {
    name: "Export LiveChat data",
    description: "Export data from your LiveChat account like chats.",
  },
  subCommands: {
    chats: exportChatsCommand,
    customers: exportCustomersCommand,
  },
});
