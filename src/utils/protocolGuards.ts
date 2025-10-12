import { SUPPORTED_PROTOCOL_VERSIONS, LATEST_PROTOCOL_VERSION } from "@modelcontextprotocol/sdk/types.js";

export type HeaderValues = Record<string, string | string[] | undefined> | undefined;

function normalizeHeaderKey(key: string): string {
  return key.toLowerCase();
}

function normalizeHeaderValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value.find((entry) => entry && entry.trim().length > 0)?.trim();
  }
  return value?.trim();
}

/**
 * Extracts the MCP protocol version from a header map. Returns `null` when
 * the header is absent, indicating transports (like stdio) that do not carry
 * HTTP metadata.
 */
export function extractProtocolVersion(headers: HeaderValues): string | null {
  if (!headers) {
    return null;
  }

  const targetKey = Object.keys(headers).find(
    (key) => normalizeHeaderKey(key) === "mcp-protocol-version"
  );

  if (!targetKey) {
    return "";
  }

  const value = normalizeHeaderValue(headers[targetKey]);
  if (!value) {
    return "";
  }

  return value;
}

/**
 * Validates the negotiated protocol version when the transport provides header information.
 * - Returns silently when headers are not present (stdio transport).
 * - Throws when the header is missing or outside of the supported versions list.
 */
export function validateProtocolVersion(headers: HeaderValues): void {
  const version = extractProtocolVersion(headers);

  if (version === null) {
    // No headers available (stdio), skip validation.
    return;
  }

  if (version === "") {
    throw new Error(
      "Missing MCP-Protocol-Version header. Clients must send the negotiated version value."
    );
  }

  if (!SUPPORTED_PROTOCOL_VERSIONS.includes(version)) {
    throw new Error(
      `Unsupported MCP-Protocol-Version '${version}'. Supported versions: ${SUPPORTED_PROTOCOL_VERSIONS.join(", ")}.`
    );
  }

  if (version !== LATEST_PROTOCOL_VERSION) {
    console.warn(
      `[protocol] Received MCP-Protocol-Version '${version}'. Recommended version is '${LATEST_PROTOCOL_VERSION}'.`
    );
  }
}
