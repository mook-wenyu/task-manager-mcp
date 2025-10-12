import { describe, it, expect } from "vitest";
import {
  extractProtocolVersion,
  validateProtocolVersion,
} from "../../utils/protocolGuards.js";
import {
  SUPPORTED_PROTOCOL_VERSIONS,
  LATEST_PROTOCOL_VERSION,
} from "@modelcontextprotocol/sdk/types.js";

describe("protocolGuards", () => {
  it("extracts protocol version regardless of header casing", () => {
    const headers = {
      "MCP-Protocol-Version": SUPPORTED_PROTOCOL_VERSIONS[0],
    };

    expect(extractProtocolVersion(headers)).toBe(SUPPORTED_PROTOCOL_VERSIONS[0]);
  });

  it("returns empty string when header present but empty", () => {
    const headers = {
      "mcp-protocol-version": " ",
    };

    expect(extractProtocolVersion(headers)).toBe("");
  });

  it("returns null when headers absent (stdio)", () => {
    expect(extractProtocolVersion(undefined)).toBeNull();
  });

  it("allows stdio transports without headers", () => {
    expect(() => validateProtocolVersion(undefined)).not.toThrow();
  });

  it("throws when header missing on HTTP transport", () => {
    expect(() => validateProtocolVersion({})).toThrow(
      /Missing MCP-Protocol-Version header/
    );
  });

  it("throws when version unsupported", () => {
    expect(() =>
      validateProtocolVersion({ "mcp-protocol-version": "1999-01-01" })
    ).toThrow(/Unsupported MCP-Protocol-Version/);
  });

  it("accepts supported versions", () => {
    expect(() =>
      validateProtocolVersion({
        "mcp-protocol-version": LATEST_PROTOCOL_VERSION,
      })
    ).not.toThrow();
  });
});
