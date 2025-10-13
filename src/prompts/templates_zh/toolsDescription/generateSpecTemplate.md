# generate_spec_template

## 工具说明
- 为指定任务生成规格模板（spec.md、spec.json、graph.json），所有文件写入 `<DATA_DIR>/specs/<taskId>/`。
- 若文件已存在，可通过 `force=true` 覆盖重新生成。

## 输入参数
- `taskId` (string, 必填)：目标任务的 UUID。
- `force` (boolean, 可选，默认 false)：若为 true 将覆盖已有模板文件。

## 输出内容
- 成功时返回生成文件的相对路径列表。
- 如果任务不存在或文件已存在且未开启覆盖，将返回错误提示。
