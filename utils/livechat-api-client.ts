import { ofetch } from "ofetch";
import { get } from "radash";

const base64EncodedToken = get(
  process.env,
  "LIVECHAT_BASE64_ENCODED_TOKEN",
  ""
);

const baseURL = "https://api.livechatinc.com/v3.5";

export const livechatApiClient = ofetch.create({
  baseURL,
  headers: [["Authorization", `Basic ${base64EncodedToken}`]],
  body: {},
});

export const agentApiClient = livechatApiClient.create({
  baseURL: `${baseURL}/agent`,
  method: "POST",
});
