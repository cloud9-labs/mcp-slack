# @cloud9-labs/mcp-slack

MCP server for Slack API integration - 14 messaging and channel management tools.

## Installation

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@cloud9-labs/mcp-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-bot-token"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| slack_post_message | Send a message to a Slack channel |
| slack_update_message | Edit an existing message |
| slack_delete_message | Delete a message from a channel |
| slack_list_channels | List all channels in the workspace |
| slack_get_channel_info | Get detailed information about a channel |
| slack_get_channel_history | Retrieve message history from a channel |
| slack_get_replies | Get threaded replies for a message |
| slack_join_channel | Join a Slack channel |
| slack_list_users | List all users in the workspace |
| slack_get_user_info | Get user profile information |
| slack_add_reaction | Add emoji reaction to a message |
| slack_remove_reaction | Remove emoji reaction from a message |
| slack_search_messages | Search messages across channels |
| slack_upload_file | Upload files to Slack |

## Configuration

Set your Slack bot token as an environment variable:

```bash
export SLACK_BOT_TOKEN="xoxb-..."
```

To create a Slack bot:
1. Go to https://api.slack.com/apps
2. Create a new app
3. Enable Bot User OAuth Token
4. Grant required scopes (messages:write, channels:read, users:read, etc.)
5. Copy the Bot User OAuth Token

## License

MIT
