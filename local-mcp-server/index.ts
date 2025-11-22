/**
 * MCP Server for uploading and downloading content from Filecoin via the BA-hack server
 * Handles x402 payments automatically when server returns 402 status
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios from "axios";
import { config } from "dotenv";
import { Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { withPaymentInterceptor } from "x402-axios";
import { z } from "zod";

config();

const privateKey = process.env.PRIVATE_KEY as Hex;
const baseURL = process.env.RESOURCE_SERVER_URL || "https://ba-hack-production.up.railway.app";

if (!privateKey) {
  throw new Error("PRIVATE_KEY is required for payment handling");
}

const account = privateKeyToAccount(privateKey);

// Axios client with payment interceptor to handle 402 responses
const client = withPaymentInterceptor(axios.create({ baseURL }), account);

// Create an MCP server
const server = new McpServer({
  name: "filecoin-mcp",
  version: "1.0.0",
});

// Hardcoded PieceCID for now
const PIECE_CID = "bafkzcibciacdwydlhwglaeicrliqxxywcbrrol63q3ybv55yw7edjylmqq5pumq";

// Add tool to download content from Filecoin
server.tool(
  "download-from-filecoin",
  "Download content from Filecoin storage. Returns the content along with metadata.",
  {},
  async () => {
    try {
      const res = await client.get("/download", {
        params: { pieceCid: PIECE_CID },
      });
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(res.data, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new Error(
        `Failed to download from Filecoin: ${error.message || "Unknown error"}`
      );
    }
  },
);

// Add tool to upload content to Filecoin
server.tool(
  "upload-to-filecoin",
  "Upload a message to Filecoin storage. Returns the PieceCID that can be used to download the content later.",
  {
    message: z.string().describe("The message content to upload to Filecoin"),
  },
  async (args: { message: string }) => {
    try {
      const { message } = args;
      
      if (!message) {
        throw new Error("message parameter is required");
      }

      const res = await client.post("/upload", {
        message,
      });
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(res.data, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new Error(
        `Failed to upload to Filecoin: ${error.message || "Unknown error"}`
      );
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
