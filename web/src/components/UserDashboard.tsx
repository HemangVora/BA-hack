"use client";

import { useState, useEffect } from "react";
import { useEvmAddress, useIsSignedIn } from "@coinbase/cdp-hooks";
import {
  FileText,
  Download,
  DollarSign,
  Calendar,
  Loader2,
  Package,
} from "lucide-react";
import { motion } from "framer-motion";

interface DatasetEvent {
  block_number: number;
  timestamp: number;
  piece_cid: string;
  name: string;
  description: string;
  filetype: string;
  price_usdc: string;
  pay_address: string;
  tx_hash: string;
}

export function UserDashboard() {
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();
  const [userDatasets, setUserDatasets] = useState<DatasetEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn || !evmAddress) {
      setLoading(false);
      return;
    }

    const fetchUserDatasets = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/events");
        const data = await response.json();

        if (data.success) {
          // Filter datasets by current user's address
          const filtered = data.events.filter(
            (event: DatasetEvent) =>
              event.pay_address.toLowerCase() === evmAddress.toLowerCase()
          );
          setUserDatasets(filtered);
        } else {
          setError(data.error || "Failed to fetch datasets");
        }
      } catch (err) {
        console.error("Error fetching user datasets:", err);
        setError("Failed to load your datasets");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDatasets();

    // Refresh every 30 seconds
    const interval = setInterval(fetchUserDatasets, 30000);
    return () => clearInterval(interval);
  }, [isSignedIn, evmAddress]);

  const formatPrice = (priceUsdc: string) => {
    const price = parseFloat(priceUsdc) / 1_000_000;
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const shortenCid = (cid: string) => {
    return `${cid.slice(0, 8)}...${cid.slice(-6)}`;
  };

  if (!isSignedIn) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
            <Package className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Connect Wallet to View Dashboard
          </h3>
          <p className="text-neutral-400">
            Please connect your wallet to view your uploaded datasets.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-xl">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-neutral-400">Loading your datasets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-xl">
        <div className="text-center text-red-400">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">My Datasets</h2>
        <p className="text-neutral-400">
          {userDatasets.length} dataset{userDatasets.length !== 1 ? "s" : ""}{" "}
          uploaded
        </p>
      </div>

      {userDatasets.length === 0 ? (
        <div className="p-12 rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-800 mb-4">
            <Package className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Datasets Yet</h3>
          <p className="text-neutral-400">
            Upload your first dataset to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {userDatasets.map((dataset, index) => (
            <motion.div
              key={`${dataset.piece_cid}-${dataset.block_number}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-xl hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                      <FileText className="w-4 h-4 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold truncate">
                      {dataset.name}
                    </h3>
                  </div>

                  <p className="text-neutral-400 text-sm mb-4 line-clamp-2">
                    {dataset.description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-neutral-300">
                        ${formatPrice(dataset.price_usdc)} USDC
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="text-neutral-300">
                        {dataset.filetype}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span className="text-neutral-300">
                        {formatTimestamp(dataset.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-orange-400" />
                      <span className="text-neutral-300 font-mono text-xs">
                        {shortenCid(dataset.piece_cid)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <a
                    href={`https://sepolia.etherscan.io/tx/${dataset.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    View TX
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(dataset.piece_cid);
                      // Could add a toast notification here
                    }}
                    className="px-4 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    Copy CID
                  </button>
                </div>
              </div>

              {/* Additional details */}
              <div className="mt-4 pt-4 border-t border-neutral-800">
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>Block #{dataset.block_number.toLocaleString()}</span>
                  <span className="font-mono">{dataset.piece_cid}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
