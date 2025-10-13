# generate_spec_template

## Description
- Generates specification templates (`spec.md`, `spec.json`, `graph.json`) for the given task under `<DATA_DIR>/specs/<taskId>/`.
- Use `force=true` to overwrite existing template files.

## Parameters
- `taskId` (string, required): Target task UUID.
- `force` (boolean, optional, default false): Overwrite existing files when set to true.

## Output
- On success returns a summary of generated files.
- Returns an error message when the task cannot be found or files already exist and `force` is not enabled.
