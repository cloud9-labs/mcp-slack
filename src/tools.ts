import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SlackClient } from "./client.js";
import { PostMessageSchema, UpdateMessageSchema, DeleteMessageSchema, ListChannelsSchema, GetChannelInfoSchema, GetChannelHistorySchema, GetRepliesSchema, JoinChannelSchema, ListUsersSchema, GetUserInfoSchema, AddReactionSchema, RemoveReactionSchema, SearchMessagesSchema, UploadFileSchema } from "./schemas.js";

export function registerTools(server: McpServer): void {
  let _client: SlackClient | null = null;
  const getClient = () => { if (!_client) _client = new SlackClient(); return _client; };

  server.tool("slack_post_message", "Post a message to a Slack channel.", PostMessageSchema.shape, async ({ channel, text, blocks }) => {
    try {
      const result = await getClient().postMessage(channel, text, blocks as unknown[] | undefined);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("slack_update_message", "Update an existing Slack message.", UpdateMessageSchema.shape, async ({ channel, ts, text, blocks }) => {
    try {
      const result = await getClient().updateMessage(channel, ts, text, blocks as unknown[] | undefined);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("slack_delete_message", "Delete a Slack message.", DeleteMessageSchema.shape, async ({ channel, ts }) => {
    try {
      const result = await getClient().deleteMessage(channel, ts);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("slack_list_channels", "List channels the bot has access to.", ListChannelsSchema.shape, async ({ types, limit, cursor }) => {
    try {
      const result = await getClient().listChannels(types, limit, cursor);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("slack_get_channel_info", "Get detailed channel information.", GetChannelInfoSchema.shape, async ({ channel }) => {
    try {
      const result = await getClient().getChannelInfo(channel);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("slack_get_channel_history", "Get message history from a channel.", GetChannelHistorySchema.shape, async ({ channel, limit, oldest, latest, cursor }) => {
    try {
      const result = await getClient().getChannelHistory(channel, limit, oldest, latest, cursor);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("slack_get_replies", "Get thread replies.", GetRepliesSchema.shape, async ({ channel, ts, limit, cursor }) => {
    try {
      const result = await getClient().getReplies(channel, ts, limit, cursor);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("slack_join_channel", "Join a public channel.", JoinChannelSchema.shape, async ({ channel }) => {
    try {
      const result = await getClient().joinChannel(channel);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("slack_list_users", "List all workspace users.", ListUsersSchema.shape, async ({ limit, cursor }) => {
    try {
      const result = await getClient().listUsers(limit, cursor);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("slack_get_user_info", "Get user details.", GetUserInfoSchema.shape, async ({ user }) => {
    try {
      const result = await getClient().getUserInfo(user);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("slack_add_reaction", "Add emoji reaction to a message.", AddReactionSchema.shape, async ({ channel, timestamp, name }) => {
    try {
      await getClient().addReaction(channel, timestamp, name);
      return { content: [{ type: "text" as const, text: JSON.stringify({ success: true }, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("slack_remove_reaction", "Remove emoji reaction from a message.", RemoveReactionSchema.shape, async ({ channel, timestamp, name }) => {
    try {
      await getClient().removeReaction(channel, timestamp, name);
      return { content: [{ type: "text" as const, text: JSON.stringify({ success: true }, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("slack_search_messages", "Search messages across workspace.", SearchMessagesSchema.shape, async ({ query, sort, sortDir, count }) => {
    try {
      const result = await getClient().searchMessages(query, sort, sortDir, count);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("slack_upload_file", "Upload a text file to channels.", UploadFileSchema.shape, async ({ channels, content, filename, title }) => {
    try {
      const result = await getClient().uploadFile(channels, content, filename, title);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });
}

function errorResult(error: unknown) {
  const message = error instanceof Error ? error.message : "An unknown error occurred";
  return { content: [{ type: "text" as const, text: `Error: ${message}` }], isError: true };
}
