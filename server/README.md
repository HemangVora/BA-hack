## Server

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create a `.env` file** (copy from `.env-local` if it exists, or create one with):
   ```env
   FACILITATOR_URL=https://x402.org/facilitator
   NETWORK=base-sepolia
   ADDRESS=0xYourEthereumAddress
   
   # Filecoin download endpoint (optional - not required for downloads)
   RPC_URL=https://api.calibration.node.glif.io/rpc/v1
   
   # required if using the Base mainnet facilitator
   CDP_API_KEY_ID="Coinbase Developer Platform Key"
   CDP_API_KEY_SECRET="Coinbase Developer Platform Key Secret"
   ```
   
   **Important:** 
   - Replace `0xYourEthereumAddress` with your actual Ethereum address where you want to receive payments.
   - The `/download` endpoint doesn't require a private key - downloads are public.

3. **Run the server:**
   ```bash
   npm run dev
   ```
   
   The server will start on `http://localhost:4021`

### Endpoints

- `GET /hello` - Free endpoint, returns `{"hello": "world"}`
- `GET /weather` - Requires payment of $0.001 (USDC on base-sepolia)
- `GET /premium/content` - Requires payment (custom token amount)
- `GET /download?pieceCid=<PieceCID>` - Downloads and returns content from Filecoin storage
  - Example: `GET /download?pieceCid=baga6ea4seaq...`
  - Returns JSON with the downloaded content (text or base64-encoded binary)

### Testing

You can test the endpoints using curl or any HTTP client. The server will return a 402 status with payment requirements if the `X-PAYMENT` header is missing.