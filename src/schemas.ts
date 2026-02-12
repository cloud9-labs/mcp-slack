import { z } from "zod";

export const PostMessageSchema = z.object({
  channel: z.string().describe("Channel ID or name (e.g., C1234567890 or #general)"),
  text: z.string().describe("Message text content"),
  blocks: z.array(z.unknown()).optional().describe("Optional Block Kit blocks for rich formatting"),
});

export const UpdateMessageSchema = z.object({
  channel: z.string().describe("Channel ID containing the message"),
  ts: z.string().describe("Timestamp of the message to update"),
  text: z.string().describe("New message text content"),
  blocks: z.array(z.unknown()).optional().describe("Optional Block Kit blocks for rich formatting"),
});

export const DeleteMessageSchema = z.object({
  channel: z.string().describe("Channel ID containing the message"),
  ts: z.string().describe("Timestamp of the message to delete"),
});

export const ListChannelsSchema = z.object({
  types: z.string().optional().describe("Comma-separated list of channel types (public_channel, private_channel, mpim, im)"),
  limit: z.number().optional().describe("Maximum number of channels to return (default: 100, max: 1000)"),
  cursor: z.string().optional().describe("Pagination cursor from previous response"),
});

export const GetChannelInfoSchema = z.object({
  channel: z.string().describe("Channel ID to get information about"),
});

export const GetChannelHistorySchema = z.object({
  channel: z.string().describe("Channel ID to get history from"),
  limit: z.number().optional().describe("Number of messages to return (default: 100, max: 1000)"),
  oldest: z.string().optional().describe("Start of time range (Unix timestamp)"),
  latest: z.string().optional().describe("End of time range (Unix timestamp)"),
  cursor: z.string().optional().describe("Pagination cursor from previous response"),
});

export const GetRepliesSchema = z.object({
  channel: z.string().describe("Channel ID containing the thread"),
  ts: z.string().describe("Timestamp of the parent message"),
  limit: z.number().optional().describe("Number of replies to return (default: 100, max: 1000)"),
  cursor: z.string().optional().describe("Pagination cursor from previous response"),
});

export const JoinChannelSchema = z.object({
  channel: z.string().describe("Channel ID to join"),
});

export const ListUsersSchema = z.object({
  limit: z.number().optional().describe("Maximum number of users to return (default: 100, max: 1000)"),
  cursor: z.string().optional().describe("Pagination cursor from previous response"),
});

export const GetUserInfoSchema = z.object({
  user: z.string().describe("User ID to get information about"),
});

export const AddReactionSchema = z.object({
  channel: z.string().describe("Channel ID containing the message"),
  timestamp: z.string().describe("Timestamp of the message to add reaction to"),
  name: z.string().describe("Reaction emoji name (without colons, e.g., thumbsup)"),
});

export const RemoveReactionSchema = z.object({
  channel: z.string().describe("Channel ID containing the message"),
  timestamp: z.string().describe("Timestamp of the message to remove reaction from"),
  name: z.string().describe("Reaction emoji name (without colons, e.g., thumbsup)"),
});

export const SearchMessagesSchema = z.object({
  query: z.string().describe("Search query (supports Slack search syntax)"),
  sort: z.string().optional().describe("Sort results by 'score' or 'timestamp'"),
  sortDir: z.string().optional().describe("Sort direction: 'asc' or 'desc'"),
  count: z.number().optional().describe("Number of results to return (default: 20, max: 100)"),
});

export const UploadFileSchema = z.object({
  channels: z.string().describe("Comma-separated list of channel IDs to share the file in"),
  content: z.string().describe("File content as string"),
  filename: z.string().describe("Filename with extension"),
  title: z.string().optional().describe("Optional title for the file"),
});
