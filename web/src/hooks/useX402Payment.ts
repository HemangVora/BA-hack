"use client";

import { useState, useCallback } from "react";
import { useEvmAddress, useSendEvmTransaction } from "@coinbase/cdp-hooks";
import { encodeFunctionData } from "viem";

export interface PaymentRequiredResponse {
  paymentRequest: {
    to: string;
    value: string;
    chainId: number;
    data?: string;
  };
  message?: string;
}

export interface DownloadResult {
  pieceCid: string;
  size: number;
  format: "text" | "binary" | "file";
  content: string;
  filename?: string;
  mimeType?: string;
  type?: string;
  name?: string;
}

interface PaymentInterceptorConfig {
  baseURL?: string;
  headers?: Record<string, string>;
}

/**
 * Hook for handling x402 payments with CDP embedded wallets
 * Similar to withPaymentInterceptor in the MCP server but using CDP SDK
 */
export function useX402Payment() {
  const { evmAddress } = useEvmAddress();
  const { sendEvmTransaction } = useSendEvmTransaction();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Process x402 payment using CDP embedded wallet
   * Similar to how x402-axios handles payments with viem wallet client
   */
  const processPayment = useCallback(
    async (paymentInfo: any) => {
      if (!evmAddress) {
        throw new Error("CDP wallet not connected");
      }

      // x402-express returns an 'accepts' array with payment options
      if (
        !paymentInfo.accepts ||
        !Array.isArray(paymentInfo.accepts) ||
        paymentInfo.accepts.length === 0
      ) {
        throw new Error("No payment options available from server");
      }

      // Get the first payment option (should be EVM native payment)
      const paymentOption = paymentInfo.accepts[0];
      console.log("[X402] Payment option:", paymentOption);

      if (!paymentOption.payTo || !paymentOption.maxAmountRequired) {
        throw new Error("Invalid payment option from server");
      }

      // Extract payment details from the accepts array
      const to = paymentOption.payTo;
      const value = paymentOption.maxAmountRequired;
      const asset = paymentOption.asset; // USDC token address
      const network = paymentOption.network; // e.g., "base-sepolia"

      // Map network name to chainId for transaction
      const networkToChainId: Record<string, number> = {
        "base-sepolia": 84532,
        base: 8453,
        ethereum: 1,
        sepolia: 11155111,
      };
      const chainId = networkToChainId[network] || 84532;

      console.log("[X402] Payment details:", {
        to,
        value,
        asset,
        network,
        chainId,
        from: evmAddress,
      });

      // Send the payment transaction using CDP SDK
      let txHash: string;

      if (asset) {
        // ERC20 token payment (USDC)
        console.log("[X402] Sending USDC token payment...");

        // ERC20 transfer function ABI
        const erc20Abi = [
          {
            name: "transfer",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [
              { name: "to", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            outputs: [{ name: "", type: "bool" }],
          },
        ] as const;

        // Encode the transfer function call
        const data = encodeFunctionData({
          abi: erc20Abi,
          functionName: "transfer",
          args: [to as `0x${string}`, BigInt(value)],
        });

        // Send the transaction using CDP SDK
        const result = await sendEvmTransaction({
          transaction: {
            to: asset,
            data: data,
            value: BigInt(0), // No ETH value for ERC20 transfer
            chainId: chainId,
            type: "eip1559",
          },
          evmAccount: evmAddress as `0x${string}`,
          network: network as any, // Use dynamic network from payment option
        });

        txHash = result.transactionHash;
      } else {
        // Native token payment (ETH)
        console.log("[X402] Sending native token payment...");

        const result = await sendEvmTransaction({
          transaction: {
            to: to,
            value: BigInt(value),
            chainId: chainId,
            type: "eip1559",
          },
          evmAccount: evmAddress as `0x${string}`,
          network: "base-sepolia",
        });

        txHash = result.transactionHash;
      }

      console.log("[X402] Payment transaction sent:", txHash);

      // Create payment proof header in x402 protocol format
      const paymentProofData = {
        x402Version: 1,
        scheme: "exact",
        payload: {
          transactionHash: txHash,
          network: "base-sepolia",
        },
      };

      return paymentProofData;
    },
    [evmAddress, sendEvmTransaction]
  );

  /**
   * Create a fetch wrapper with payment interception
   * Similar to withPaymentInterceptor in x402-axios but for fetch API
   */
  const createPaymentInterceptor = useCallback(
    (config: PaymentInterceptorConfig = {}) => {
      const baseURL =
        config.baseURL || "https://ba-hack-production.up.railway.app";
      const defaultHeaders = config.headers || {};

      /**
       * Intercepted fetch that automatically handles 402 responses
       * This mimics the behavior of x402-axios withPaymentInterceptor
       */
      const interceptedFetch = async (
        path: string,
        options: RequestInit = {}
      ): Promise<Response> => {
        const url = path.startsWith("http") ? path : `${baseURL}${path}`;

        console.log("[X402 Interceptor] Making request to:", url);

        // Merge headers
        const headers = {
          ...defaultHeaders,
          ...((options.headers as Record<string, string>) || {}),
        };

        // Make initial request
        const response = await fetch(url, { ...options, headers });

        // Check if payment is required
        if (response.status === 402) {
          console.log("[X402 Interceptor] 402 detected, processing payment...");

          // Extract payment info
          const paymentInfo = await response.json();
          console.log("[X402 Interceptor] Payment info:", paymentInfo);

          // Process payment using CDP wallet
          const paymentProofData = await processPayment(paymentInfo);

          // Create payment proof header
          const paymentProofJson = JSON.stringify(paymentProofData);
          const paymentProof = btoa(paymentProofJson); // Base64 encode

          console.log(
            "[X402 Interceptor] Payment proof created:",
            paymentProofData
          );
          console.log(
            "[X402 Interceptor] Retrying request with payment proof..."
          );

          // Retry request with payment proof
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              ...headers,
              "X-PAYMENT": paymentProof,
            },
          });

          return retryResponse;
        }

        return response;
      };

      return interceptedFetch;
    },
    [processPayment]
  );

  /**
   * Download with x402 payment handling using interceptor pattern
   * This uses the payment interceptor similar to withPaymentInterceptor in MCP server
   */
  const downloadWithPayment = async (
    pieceCid: string,
    serverUrl: string = "https://ba-hack-production.up.railway.app"
  ): Promise<DownloadResult> => {
    setIsProcessing(true);
    setError(null);

    try {
      console.log("[X402] Starting download for:", pieceCid);

      // Create intercepted fetch client (similar to withPaymentInterceptor)
      const interceptedFetch = createPaymentInterceptor({ baseURL: serverUrl });

      // Make request - interceptor will automatically handle 402
      const response = await interceptedFetch(`/download/${pieceCid}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Download failed: ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("[X402] Download successful!");
      setIsProcessing(false);
      return result;
    } catch (err: any) {
      console.error("[X402] Error:", err);
      const errorMessage = err.message || "Download failed";
      setError(errorMessage);
      setIsProcessing(false);
      throw new Error(errorMessage);
    }
  };

  /**
   * Generic request method with payment interception
   * Similar to axios.get/post but with automatic 402 handling
   */
  const requestWithPayment = useCallback(
    async (
      path: string,
      options: RequestInit = {},
      serverUrl: string = "https://ba-hack-production.up.railway.app"
    ): Promise<Response> => {
      setIsProcessing(true);
      setError(null);

      try {
        // Create intercepted fetch client
        const interceptedFetch = createPaymentInterceptor({
          baseURL: serverUrl,
        });

        // Make request with automatic 402 handling
        const response = await interceptedFetch(path, {
          headers: {
            "Content-Type": "application/json",
            ...((options.headers as Record<string, string>) || {}),
          },
          ...options,
        });

        setIsProcessing(false);
        return response;
      } catch (err: any) {
        console.error("[X402] Error:", err);
        const errorMessage = err.message || "Request failed";
        setError(errorMessage);
        setIsProcessing(false);
        throw new Error(errorMessage);
      }
    },
    [createPaymentInterceptor]
  );

  return {
    downloadWithPayment,
    requestWithPayment,
    createPaymentInterceptor,
    isProcessing,
    error,
  };
}
