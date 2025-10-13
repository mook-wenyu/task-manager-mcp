## Tool: generate_workflow

- **Purpose**: Generate a lightweight workflow template for the specified task and store `workflow.json` / `workflow.md` under `<DATA_DIR>/specs/<taskId>/`.
- **Input Fields**:
  - `taskId` (required): UUID of the target task.
  - `pattern` (optional): `serial`, `parallel`, or `evaluator`. Defaults to `serial`.
  - `force` (optional): Overwrite existing files when set to `true`. Defaults to `false`.
- **Output**: Returns a summary and structuredContent containing the directory, generated files, and workflow steps.
- **Notes**:
  - Files are written with atomic operations; ensure the directory is writable.
  - Use `force=true` when you need to regenerate the workflow files.
