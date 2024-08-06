import { loadConfig } from "c12";
import { ofetch } from "ofetch";
import { get } from "radash";

interface Configuration {
  livechatBase64EncodedToken: string;
}

const { config } = await loadConfig<Configuration>({
  configFile: "livechat-cli",
});

const baseURL = "https://api.livechatinc.com/v3.5";

export const livechatApiClient = ofetch.create({
  baseURL,
  headers: [["Authorization", `Basic ${config.livechatBase64EncodedToken}`]],
  body: {},
});

export const agentApiClient = livechatApiClient.create({
  baseURL: `${baseURL}/agent`,
  method: "POST",
});
