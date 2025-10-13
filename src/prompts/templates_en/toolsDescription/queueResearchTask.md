## Tool: queue_research_task

- **Purpose**: Generate `<DATA_DIR>/specs/<taskId>/open-questions.json` and `research.md` from open questions, and enqueue follow-up research tasks.
- **Input Fields**:
  - `taskId` (required): UUID of the target task.
  - `questions` (optional): List of open questions; when omitted, the tool attempts to reuse an existing `open-questions.json`.
  - `overwrite` (optional): Overwrite existing research files when `true`. Defaults to `false`.
- **Output**: Returns the file paths, structured question list, and IDs of newly created research tasks.
- **Notes**:
  - Run `plan_task` first to gather open questions.
  - Existing research tasks with the same name are skipped to avoid duplicates.
