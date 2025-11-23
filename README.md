# Data Context Market (DCM)

**A decentralized marketplace to create, store, and monetize datasets - where AI agents discover and purchase data via x402 payments.**

---

## Overview

DCM bridges data creators and AI agents through a decentralized marketplace. Create datasets from blockchain data or upload your own files, store them permanently on Filecoin, set your price, and let AI agents discover and pay for your data autonomously.

---

## Technology Stack

### 🤖 MCP (Model Context Protocol)
DCM is built as a suite of **MCP servers** that integrate directly with AI assistants like Claude:
- Natural language commands to index blockchain data
- AI agents discover, purchase, and download datasets autonomously
- Seamless tool orchestration without custom API integrations

### 📊 SQD (Subsquid) Pipes SDK
Real-time blockchain data indexing:
- **Event tracking** - Index any smart contract event (Swaps, Transfers, Deposits, etc.)
- **Whale filtering** - Filter by minimum/maximum amounts
- **Address filtering** - Whitelist or blacklist specific addresses
- **Data aggregation** - Group by wallet, sum amounts, count transactions
- **Multi-chain support** - Ethereum, Polygon, Arbitrum, Optimism, Base
- **Block range limits** - Control data volume with from/to block parameters

### 🗄️ Filecoin & Storacha
Decentralized, permanent storage:
- **Content-addressed** - Each file gets a unique PieceCID
- **Censorship-resistant** - No central authority can remove your data
- **Verifiable** - Cryptographic proof of storage

### 💰 x402 Protocol
HTTP-native micropayments for agent-to-agent commerce:
- **Autonomous payments** - AI agents pay without human intervention
- **USDC on Base** - Stable, low-fee transactions
- **Per-request pricing** - Custom prices for each dataset
- **Instant settlement** - No invoices, no delays

### 🔗 Data Registry (On-Chain)
Smart contract on Sepolia tracking all uploaded datasets:
- Immutable record of every upload
- Discoverable metadata (name, description, price, PieceCID)
- Payment routing to creator wallets

### ⚡ ClickHouse
High-performance analytics database:
- Columnar storage optimized for aggregations
- Fast ingestion of millions of events
- SQL interface

---

## Project Structure

```
BA-hack/
├── mcp-sqd/              # SQD Pipes MCP Server - blockchain data indexing
├── dcm-mcp-server/       # Filecoin MCP Server - storage & marketplace
├── databox-mcp-server/   # Additional MCP tooling
├── contracts/            # Smart contracts (Data Registry)
├── server/               # Backend services
├── web/                  # Frontend dashboard
└── sqd/                  # SQD pipe examples
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for ClickHouse)
- Claude Desktop with MCP support

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-repo/BA-hack.git
cd BA-hack
```

2. Install dependencies:
```bash
npm install
cd mcp-sqd && npm install
cd ../dcm-mcp-server && npm install
```

3. Configure Claude Desktop MCP:

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "sqd-pipes": {
      "command": "npx",
      "args": ["tsx", "/path/to/BA-hack/mcp-sqd/mcp-server.ts"],
      "env": {
        "ETHERSCAN_API_KEY": "your-api-key"
      }
    },
    "filecoin-dcm": {
      "command": "npx",
      "args": ["tsx", "/path/to/BA-hack/dcm-mcp-server/src/index.ts"],
      "env": {
        "STORACHA_KEY": "your-key",
        "STORACHA_PROOF": "your-proof"
      }
    }
  }
}
```

4. Start ClickHouse (optional, for local analytics):
```bash
docker run -d --name clickhouse -p 8123:8123 clickhouse/clickhouse-server
```

---

## Usage

### Example 1: Index Uniswap V4 Whale Swaps

**Step 1 - Create & Run Pipe:**
```
Generate and run a pipe for Uniswap V4 PoolManager at
0x000000000004444c5dc75cB358380D2e3dE08A90 on mainnet.
Track Swap events with minimum amount filter of 100000000000000000000
(100 ETH, 18 decimals). From block 21900000 to block 21910000,
table name "v4_swaps".
```

**Step 2 - Aggregate:**
```
Stop the pipe. Then aggregate the CSV file, group by to_address,
sum the amount column as total_volume, count transactions as swap_count,
sort by swap_count desc, limit 20.
```

**Step 3 - Upload to Filecoin:**
```
Upload to Filecoin with name "UniswapWhales", price $0.01,
description "Top Uniswap V4 traders by swap count"
```

### Example 2: Track Aave Deposits

```
Generate and run a pipe for Aave V3 at
0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2 on mainnet.
Track Supply and Withdraw events with minimum amount filter of
100000000000000000000000 (100k tokens). From block 16291127,
table name "aave_whales".
```

### Example 3: Discover & Purchase Data

```
Search for "uniswap" datasets
```

```
Download dataset with PieceCID bafkzcibd5qp...
```

---

## MCP Tools

### SQD Pipes Server (`mcp-sqd`)

| Tool | Description |
|------|-------------|
| `generate_pipe` | Generate a pipe for indexing blockchain events with filtering |
| `run_pipe` | Execute a generated pipe |
| `stop_pipe` | Stop a running pipe |
| `list_running_pipes` | List all active pipes |
| `get_contract_events` | Fetch events from a contract's ABI |
| `analyze_csv` | Perform analytics on indexed data |
| `aggregate_csv` | Flexible aggregation (group by, sum, count, avg, min, max) |

### Filecoin DCM Server (`dcm-mcp-server`)

| Tool | Description |
|------|-------------|
| `upload-to-filecoin` | Store file on Filecoin with pricing |
| `discover-data` | Search marketplace for datasets |
| `download-data` | Retrieve data by PieceCID |

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   AI Agent      │────▶│   MCP Server    │────▶│   SQD Portal    │
│   (Claude)      │     │   (DCM)         │     │   (Blockchain)  │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
            ┌───────────┐ ┌───────────┐ ┌───────────┐
            │ ClickHouse│ │ Filecoin  │ │   x402    │
            │ (Analytics)│ │ (Storage) │ │ (Payments)│
            └───────────┘ └───────────┘ └───────────┘
```

---

## Use Cases

| Use Case | Data Source | Aggregation | Value |
|----------|-------------|-------------|-------|
| **DeFi Whale Tracking** | Uniswap Swaps | Group by trader, sum volume | Identify market movers |
| **Lending Analytics** | Aave Supply/Withdraw | Group by wallet, net position | Credit scoring |
| **NFT Intelligence** | OpenSea Sales | Group by collection, avg price | Trend analysis |
| **MEV Research** | Flashbots Bundles | Group by searcher, count txs | MEV landscape |
| **Custom Research** | PDFs, CSVs | N/A | Proprietary insights |

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## License

MIT

---

## Links

- [SQD Pipes SDK Docs](https://docs.sqd.dev/sdk/pipes-sdk/quickstart)
- [Filecoin Documentation](https://docs.filecoin.io/)
- [x402 Protocol](https://x402.org/)
- [MCP Specification](https://modelcontextprotocol.io/)

---

**DCM turns data into a liquid asset - indexed by SQD, stored on Filecoin, paid via x402.**
