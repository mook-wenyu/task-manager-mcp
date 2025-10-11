import { zodToJsonSchema, type JsonSchema7Type } from "zod-to-json-schema";
import {
  TOOL_STRUCTURED_SCHEMAS,
  type ToolStructuredContent,
  type ToolStructuredContentName,
} from "./outputSchemas.js";

export {
  TOOL_STRUCTURED_SCHEMAS,
  type ToolStructuredContent,
  type ToolStructuredContentName,
} from "./outputSchemas.js";

export const TOOL_STRUCTURED_JSON_SCHEMAS: Record<
  ToolStructuredContentName,
  JsonSchema7Type
> = Object.fromEntries(
  Object.entries(TOOL_STRUCTURED_SCHEMAS).map(([name, schema]) => [
    name,
    zodToJsonSchema(schema, `${name}-structured-content`),
  ])
) as Record<ToolStructuredContentName, JsonSchema7Type>;

export function validateStructuredContent<
  TName extends ToolStructuredContentName
>(name: TName, value: unknown): ToolStructuredContent<TName> {
  const schema = TOOL_STRUCTURED_SCHEMAS[name];
  return schema.parse(value) as ToolStructuredContent<TName>;
}
