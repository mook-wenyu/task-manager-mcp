# register_connection

## Tool Description
- Registers or updates MCP server connection configurations stored at `<DATA_DIR>/config/servers.json`.
- Each connection is identified by a unique key and may record the command, working directory, transport, tags, and environment variables.

## Input Parameters
- `key` (string, required): Unique connection key, limited to letters, numbers, hyphen, and underscore.
- `command` (string, required): Command used to start the MCP server.
- `args` (string[], optional): Additional ordered command arguments.
- `cwd` (string, optional): Working directory used when executing the command.
- `transport` (string, optional): Transport channel description, e.g. `stdio`, `sse`.
- `description` (string, optional): Human-readable description of the connection.
- `tags` (string[], optional): Custom tags for categorisation.
- `envFile` (string, optional): Path to an environment variables file.
- `env` (Record<string,string>, optional): Inline environment variable key/value pairs.
- `required` (boolean, optional): Marks the connection as critical.

## Output Content
- Returns structured content containing a connection summary, total connection count, and latest updated timestamp on success.
- Emits an error message if validation fails or the configuration cannot be written.