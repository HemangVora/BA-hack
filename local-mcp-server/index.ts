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

// Add tool to download content from Filecoin
server.tool(
  "download-from-filecoin",
  "Download content from Filecoin storage using a PieceCID. Returns the content along with metadata including description, price, and payment address if available.",
  {
    pieceCid: z.string().describe("The PieceCID of the file to download from Filecoin (e.g., 'bafkzcibciacdwydlhwglaeicrliqxxywcbrrol63q3ybv55yw7edjylmqq5pumq')"),
  },
  async (args: { pieceCid: string }) => {
    try {
      const { pieceCid } = args;
      
      if (!pieceCid) {
        throw new Error("pieceCid is required");
      }
      
      const res = await client.get("/download", {
        params: { pieceCid },
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
  "Upload a message, file, or URL to Filecoin storage. Returns the PieceCID that can be used to download the content later. For files, provide base64-encoded data. For URLs, provide a publicly accessible URL and the server will download, encrypt, and upload the file automatically. The filetype will be automatically deduced from the mimeType or filename. IMPORTANT: You MUST ask the user for the required fields (name, description, priceUSD, payAddress) - do NOT infer or guess these values. Always prompt the user explicitly for each required field before calling this tool. The priceUSD will be automatically converted to the correct format internally.",
  {
    message: z.string().optional().describe("Text message to upload to Filecoin"),
    file: z.string().optional().describe("Base64-encoded file data to upload"),
    filename: z.string().optional().describe("Filename (required when uploading a file via base64)"),
    mimeType: z.string().optional().describe("MIME type of the file (e.g., 'application/pdf', 'image/png'). If not provided, will be deduced from filename extension."),
    url: z.string().url().optional().describe("URL of a publicly accessible file to download and upload to Filecoin. The server will automatically detect filename and MIME type from the URL or response headers."),
    name: z.string().describe("REQUIRED: Name of the file/data. You MUST ask the user for this value - do not infer it. Ask: 'What name should this file/data have?'"),
    description: z.string().describe("REQUIRED: Description of what the file/data is. You MUST ask the user for this value - do not infer it. Ask: 'What is a description of this file/data?'"),
    priceUSD: z.union([z.string(), z.number()]).describe("REQUIRED: Price in USD as a decimal number (e.g., 0.01 for $0.01, 1.5 for $1.50, or '0.01' as string). You can also accept formats like '$0.01'. You MUST ask the user for this value - do not infer or guess. Ask: 'What price in USD should this be? (e.g., 0.01 for $0.01)'"),
    payAddress: z.string().describe("REQUIRED: Address to receive payments (0x... for EVM or Solana address). You MUST ask the user for this value - do not infer it. Ask: 'What address should receive payments for this? (0x... for EVM or Solana address)'"),
  },
  async (args: { 
    message?: string; 
    file?: string; 
    filename?: string; 
    mimeType?: string; 
    url?: string;
    name: string;
    description: string;
    priceUSD: string | number;
    payAddress: string;
  }) => {
    try {
      const { message, file, filename, mimeType, url, name, description, priceUSD, payAddress } = args;
      
      // Validate required fields
      if (!name) {
        throw new Error("name is required");
      }
      if (!description) {
        throw new Error("description is required");
      }
      if (priceUSD === undefined || priceUSD === null) {
        throw new Error("priceUSD is required (price in USD, e.g., 0.01 for $0.01)");
      }
      if (!payAddress) {
        throw new Error("payAddress is required (address to receive payments, 0x... for EVM or Solana address)");
      }
      
      // Convert priceUSD to priceUSDC (6 decimals)
      // Accept formats like: 0.01, "0.01", "$0.01", 1.5, etc.
      let priceUSDC: string;
      try {
        let priceValue: number;
        if (typeof priceUSD === "string") {
          // Remove $ sign if present and trim whitespace
          const cleaned = priceUSD.replace(/^\$/, "").trim();
          priceValue = parseFloat(cleaned);
          if (isNaN(priceValue)) {
            throw new Error(`Invalid price format: ${priceUSD}. Expected a number like 0.01 or "$0.01"`);
          }
        } else {
          priceValue = priceUSD;
        }
        
        // Convert to 6 decimals: multiply by 1,000,000
        const priceInMicroUSDC = Math.round(priceValue * 1_000_000);
        priceUSDC = priceInMicroUSDC.toString();
      } catch (error: any) {
        throw new Error(`Invalid price format: ${priceUSD}. ${error.message || "Expected a number like 0.01 or '$0.01'"}`);
      }
      
      if (!message && !file && !url) {
        throw new Error("Either message, file, or url parameter is required");
      }

      if (file && !filename) {
        throw new Error("filename is required when uploading a file via base64");
      }

      const payload: any = {};
      if (message) {
        payload.message = message;
      }
      if (file) {
        payload.file = file;
        payload.filename = filename;
        if (mimeType) {
          payload.mimeType = mimeType;
        }
      }
      if (url) {
        payload.url = url;
        // Optional: allow override of filename/mimeType even when using URL
        if (filename) {
          payload.filename = filename;
        }
        if (mimeType) {
          payload.mimeType = mimeType;
        }
      }
      
      // Add required metadata fields
      payload.name = name;
      payload.description = description;
      payload.priceUSDC = priceUSDC; // Already converted to 6 decimals
      payload.payAddress = payAddress;
      // Note: filetype is automatically deduced by the server from mimeType or filename

      const res = await client.post("/upload", payload);
      
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

// Add tool to discover and download content from Filecoin
server.tool(
  "discover-and-download",
  "Search for a dataset by query and automatically download it. First searches the registry for a matching dataset, then downloads the content. Returns both the discovery metadata and the downloaded content.",
  {
    query: z.string().describe("REQUIRED: Search query to find a dataset. This will search in dataset names and descriptions. You MUST ask the user what they are looking for. Ask: 'What dataset are you looking for?'"),
  },
  async (args: { query: string }) => {
    try {
      const { query } = args;
      
      if (!query) {
        throw new Error("query is required");
      }
      
      // Step 1: Discover the dataset
      let discoverRes;
      try {
        discoverRes = await client.get("/discover_query", {
          params: { q: query },
        });
      } catch (error: any) {
        // Handle 404 from discover_query endpoint
        if (error.response?.status === 404) {
          const errorData = error.response?.data;
          const message = errorData?.message || `No dataset found matching the query "${query}"`;
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  query: query,
                  message: message,
                  error: "No matching dataset found",
                }, null, 2),
              },
            ],
          };
        }
        throw error;
      }
      
      if (!discoverRes.data.success || !discoverRes.data.result) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: false,
                query: query,
                message: `No dataset found matching the query "${query}"`,
                error: "No matching dataset found",
              }, null, 2),
            },
          ],
        };
      }
      
      const discoveredDataset = discoverRes.data.result;
      
      // Step 2: Download the dataset using the pieceCid
      const downloadRes = await client.get("/download", {
        params: { pieceCid: discoveredDataset.pieceCid },
      });
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              discovery: {
                query: query,
                dataset: {
                  pieceCid: discoveredDataset.pieceCid,
                  name: discoveredDataset.name,
                  description: discoveredDataset.description,
                  price: discoveredDataset.price,
                  filetype: discoveredDataset.filetype,
                },
              },
              download: downloadRes.data,
            }, null, 2),
          },
        ],
      };
    } catch (error: any) {
      // Handle other errors (not 404, which is already handled above)
      throw new Error(
        `Failed to discover and download: ${error.message || "Unknown error"}`
      );
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
