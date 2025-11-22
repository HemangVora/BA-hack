import { config } from "dotenv";
import express from "express";
import { paymentMiddleware, Resource, type SolanaAddress } from "x402-express";
import { Synapse, RPC_URLS } from "@filoz/synapse-sdk";
config();

const facilitatorUrl = process.env.FACILITATOR_URL as Resource;
const payTo = process.env.ADDRESS as `0x${string}` | SolanaAddress;

if (!facilitatorUrl || !payTo) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const app = express();

app.use(
  paymentMiddleware(
    payTo,
    {
      "GET /weather": {
        // USDC amount in dollars
        price: "$0.001",
        // network: "base" // uncomment for Base mainnet
        // network: "solana" // uncomment for Solana mainnet
        network: "base-sepolia",
      },
      "/premium/*": {
        // Define atomic amounts in any EIP-3009 token
        price: {
          amount: "100000",
          asset: {
            address: "0xabc",
            decimals: 18,
            // omit eip712 for Solana
            eip712: {
              name: "WETH",
              version: "1",
            },
          },
        },
        // network: "base" // uncomment for Base mainnet
        // network: "solana" // uncomment for Solana mainnet
        network: "base-sepolia",
      },
    },
    {
      url: facilitatorUrl,
    },
  ),
);

app.get("/weather", (req, res) => {
  res.send({
    report: {
      weather: "rainy",
      temperature: 420,
    },
  });
});

app.get("/premium/content", (req, res) => {
  res.send({
    content: "This is premium content",
  });
});

app.get("/hello", (req, res) => {
  res.json({
    hello: "world",
  });
});

app.get("/download", async (req, res) => {
  try {
    const pieceCid = req.query.pieceCid as string;

    if (!pieceCid) {
      return res.status(400).json({
        error: "Missing pieceCid parameter",
        usage: "GET /download?pieceCid=<PieceCID>",
        example: "GET /download?pieceCid=baga6ea4seaq...",
      });
    }

    // Initialize the Synapse SDK (private key optional for downloads)
    // Note: SDK requires a valid private key for initialization, but downloads are public
    // Using a valid dummy key (1) if no private key is provided
    const privateKey = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";
    const synapse = await Synapse.create({
      privateKey: privateKey,
      rpcURL: process.env.RPC_URL || RPC_URLS.calibration.http,
    });

    // Download the data
    const bytes = await synapse.storage.download(pieceCid);

    // Try to decode as text
    try {
      const decodedText = new TextDecoder().decode(bytes);
      return res.json({
        pieceCid: pieceCid,
        size: bytes.length,
        format: "text",
        content: decodedText,
      });
    } catch (error) {
      // If it's not text, return as base64
      const base64Content = Buffer.from(bytes).toString("base64");
      return res.json({
        pieceCid: pieceCid,
        size: bytes.length,
        format: "binary",
        content: base64Content,
        message: "Content is binary, returned as base64. Decode to get original bytes.",
      });
    }
  } catch (error: any) {
    console.error("Download error:", error);
    return res.status(500).json({
      error: "Download failed",
      message: error.message || "Unknown error occurred",
    });
  }
});

const port = process.env.PORT || 4021;

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
