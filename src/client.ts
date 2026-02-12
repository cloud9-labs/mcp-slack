/**
 * Slack API Client
 * 
 * Rate Limits:
 * - Tier 2: 20 requests per minute (1 req/s average)
 * - 429 response includes Retry-After header
 */

const BASE_URL = "https://slack.com/api";
const RATE_LIMIT_DELAY = 1000; // 1 req/s for Tier 2

export interface SlackMessage {
  type: string;
  user: string;
  text: string;
  ts: string;
  thread_ts?: string;
  reply_count?: number;
  replies?: SlackReply[];
}

export interface SlackReply {
  user: string;
  ts: string;
}

export interface SlackChannel {
  id: string;
  name: string;
  is_channel: boolean;
  is_group: boolean;
  is_im: boolean;
  is_mpim: boolean;
  is_private: boolean;
  created: number;
  is_archived: boolean;
  is_general: boolean;
  is_member: boolean;
  num_members?: number;
  topic?: {
    value: string;
    creator: string;
    last_set: number;
  };
  purpose?: {
    value: string;
    creator: string;
    last_set: number;
  };
}

export interface SlackUser {
  id: string;
  team_id: string;
  name: string;
  deleted: boolean;
  real_name: string;
  tz: string;
  tz_label: string;
  tz_offset: number;
  profile: {
    title?: string;
    phone?: string;
    skype?: string;
    real_name: string;
    real_name_normalized: string;
    display_name: string;
    display_name_normalized: string;
    email?: string;
    image_24?: string;
    image_32?: string;
    image_48?: string;
    image_72?: string;
    image_192?: string;
    image_512?: string;
  };
  is_admin: boolean;
  is_owner: boolean;
  is_bot: boolean;
}

export interface SlackFile {
  id: string;
  created: number;
  timestamp: number;
  name: string;
  title: string;
  mimetype: string;
  filetype: string;
  size: number;
  url_private: string;
  url_private_download: string;
  permalink: string;
  permalink_public?: string;
}

export interface SlackSearchResult {
  total: number;
  matches: SlackMessage[];
  pagination: {
    total_count: number;
    page: number;
    per_page: number;
    page_count: number;
    first: number;
    last: number;
  };
}

export interface SlackApiResponse {
  ok: boolean;
  error?: string;
  warning?: string;
  response_metadata?: {
    next_cursor?: string;
  };
}

export class SlackClient {
  private token: string;
  private lastRequestTime = 0;

  constructor(token?: string) {
    const envToken = process.env.SLACK_BOT_TOKEN;
    if (!token && !envToken) {
      throw new Error("SLACK_BOT_TOKEN environment variable is required");
    }
    this.token = token || envToken!;
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
  }

  private async request<T extends SlackApiResponse>(
    endpoint: string,
    data: Record<string, unknown> = {}
  ): Promise<T> {
    await this.rateLimit();

    const url = `${BASE_URL}/${endpoint}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.token}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(data),
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.request<T>(endpoint, data);
    }

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json() as T;
    if (!result.ok) {
      throw new Error(`Slack API error: ${result.error || "Unknown error"}`);
    }

    return result;
  }

  async postMessage(
    channel: string,
    text: string,
    blocks?: unknown[]
  ): Promise<{ channel: string; ts: string; message: SlackMessage }> {
    const data: Record<string, unknown> = { channel, text };
    if (blocks) {
      data.blocks = blocks;
    }

    const response = await this.request<SlackApiResponse & {
      channel: string;
      ts: string;
      message: SlackMessage;
    }>("chat.postMessage", data);

    return {
      channel: response.channel,
      ts: response.ts,
      message: response.message,
    };
  }

  async updateMessage(
    channel: string,
    ts: string,
    text: string,
    blocks?: unknown[]
  ): Promise<{ channel: string; ts: string; text: string }> {
    const data: Record<string, unknown> = { channel, ts, text };
    if (blocks) {
      data.blocks = blocks;
    }

    const response = await this.request<SlackApiResponse & {
      channel: string;
      ts: string;
      text: string;
    }>("chat.update", data);

    return {
      channel: response.channel,
      ts: response.ts,
      text: response.text,
    };
  }

  async deleteMessage(channel: string, ts: string): Promise<{ channel: string; ts: string }> {
    const response = await this.request<SlackApiResponse & {
      channel: string;
      ts: string;
    }>("chat.delete", { channel, ts });

    return {
      channel: response.channel,
      ts: response.ts,
    };
  }

  async listChannels(
    types?: string,
    limit?: number,
    cursor?: string
  ): Promise<{ channels: SlackChannel[]; next_cursor?: string }> {
    const data: Record<string, unknown> = {};
    if (types) data.types = types;
    if (limit) data.limit = limit;
    if (cursor) data.cursor = cursor;

    const response = await this.request<SlackApiResponse & {
      channels: SlackChannel[];
    }>("conversations.list", data);

    return {
      channels: response.channels,
      next_cursor: response.response_metadata?.next_cursor,
    };
  }

  async getChannelInfo(channel: string): Promise<SlackChannel> {
    const response = await this.request<SlackApiResponse & {
      channel: SlackChannel;
    }>("conversations.info", { channel });

    return response.channel;
  }

  async getChannelHistory(
    channel: string,
    limit?: number,
    oldest?: string,
    latest?: string,
    cursor?: string
  ): Promise<{ messages: SlackMessage[]; has_more: boolean; next_cursor?: string }> {
    const data: Record<string, unknown> = { channel };
    if (limit) data.limit = limit;
    if (oldest) data.oldest = oldest;
    if (latest) data.latest = latest;
    if (cursor) data.cursor = cursor;

    const response = await this.request<SlackApiResponse & {
      messages: SlackMessage[];
      has_more: boolean;
    }>("conversations.history", data);

    return {
      messages: response.messages,
      has_more: response.has_more,
      next_cursor: response.response_metadata?.next_cursor,
    };
  }

  async getReplies(
    channel: string,
    ts: string,
    limit?: number,
    cursor?: string
  ): Promise<{ messages: SlackMessage[]; has_more: boolean; next_cursor?: string }> {
    const data: Record<string, unknown> = { channel, ts };
    if (limit) data.limit = limit;
    if (cursor) data.cursor = cursor;

    const response = await this.request<SlackApiResponse & {
      messages: SlackMessage[];
      has_more: boolean;
    }>("conversations.replies", data);

    return {
      messages: response.messages,
      has_more: response.has_more,
      next_cursor: response.response_metadata?.next_cursor,
    };
  }

  async joinChannel(channel: string): Promise<SlackChannel> {
    const response = await this.request<SlackApiResponse & {
      channel: SlackChannel;
    }>("conversations.join", { channel });

    return response.channel;
  }

  async listUsers(limit?: number, cursor?: string): Promise<{ members: SlackUser[]; next_cursor?: string }> {
    const data: Record<string, unknown> = {};
    if (limit) data.limit = limit;
    if (cursor) data.cursor = cursor;

    const response = await this.request<SlackApiResponse & {
      members: SlackUser[];
    }>("users.list", data);

    return {
      members: response.members,
      next_cursor: response.response_metadata?.next_cursor,
    };
  }

  async getUserInfo(user: string): Promise<SlackUser> {
    const response = await this.request<SlackApiResponse & {
      user: SlackUser;
    }>("users.info", { user });

    return response.user;
  }

  async addReaction(channel: string, timestamp: string, name: string): Promise<void> {
    await this.request("reactions.add", {
      channel,
      timestamp,
      name,
    });
  }

  async removeReaction(channel: string, timestamp: string, name: string): Promise<void> {
    await this.request("reactions.remove", {
      channel,
      timestamp,
      name,
    });
  }

  async searchMessages(
    query: string,
    sort?: string,
    sortDir?: string,
    count?: number
  ): Promise<SlackSearchResult> {
    const data: Record<string, unknown> = { query };
    if (sort) data.sort = sort;
    if (sortDir) data.sort_dir = sortDir;
    if (count) data.count = count;

    const response = await this.request<SlackApiResponse & {
      messages: SlackSearchResult;
    }>("search.messages", data);

    return response.messages;
  }

  async uploadFile(
    channels: string,
    content: string,
    filename: string,
    title?: string
  ): Promise<SlackFile> {
    const data: Record<string, unknown> = {
      channels,
      content,
      filename,
    };
    if (title) data.title = title;

    const response = await this.request<SlackApiResponse & {
      file: SlackFile;
    }>("files.upload", data);

    return response.file;
  }
}
