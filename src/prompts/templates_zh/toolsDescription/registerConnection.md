# register_connection

## 工具说明
- 注册或更新 MCP 服务器连接配置，集中存放于 `<DATA_DIR>/config/servers.json`。
- 每个连接以唯一键名标识，可记录命令、工作目录、传输方式、标签与环境变量。

## 输入参数
- `key` (string, 必填)：连接的唯一键名，仅允许字母、数字、连字符与底线。
- `command` (string, 必填)：启动 MCP 服务器的完整命令。
- `args` (string[]，可选)：补充命令参数，按顺序附加在命令之后。
- `cwd` (string，可选)：执行命令时的工作目录。
- `transport` (string，可选)：传输协议或通道描述，例如 `stdio`、`sse`。
- `description` (string，可选)：连接用途说明。
- `tags` (string[]，可选)：自定义标签，协助分类检索。
- `envFile` (string，可选)：加载环境变量的文件路径。
- `env` (Record<string,string>，可选)：直接写入的环境变量键值对。
- `required` (boolean，可选)：标记此连接是否为关键依赖。

## 输出内容
- 成功时返回包含连接摘要、总连接数以及最新更新时间的结构化结果。
- 若参数校验失败或写入异常，将返回错误提示。