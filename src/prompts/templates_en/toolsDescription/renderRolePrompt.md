## Tool: render_role_prompt

- **Purpose**: Generate default role prompts for the given task and store them in `<DATA_DIR>/specs/<taskId>/roles.json`.
- **Input Fields**:
  - `taskId` (required): UUID of the target task.
  - `pattern` (optional): Workflow pattern to align roles with, defaults to `serial`.
  - `force` (optional): Overwrite the existing `roles.json` when `true`. Defaults to `false`.
- **Output**: Returns a summary with structuredContent including the role array and file location.
- **Notes**:
  - Roles are aligned with workflow patterns; run `generate_workflow` first when possible.
  - Set `force=true` only when you intend to replace a customized role definition.
