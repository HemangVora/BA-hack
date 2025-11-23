"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Calendar, ShieldCheck, Server } from "lucide-react";
import { DownloadDatasetButton } from "./DownloadDatasetButton";
import { type DownloadResult } from "@/hooks/useX402Payment";

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

interface Dataset {
  title: string;
  description: string;
  price: number;
  format: string;
  size: string;
  author: string;
  tags: string[];
  txHash: string;
  pieceCid: string;
  payAddress: string;
  timestamp: number;
  activity: number[]; // Mock activity data
}

// Mock function to generate random sparkline data
const generateSparkline = () => {
  return Array.from({ length: 10 }, () => Math.floor(Math.random() * 100));
};

export function ExplorerTable() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/events");
        const data = await response.json();

        if (data.success) {
          const transformedDatasets = data.events.map(
            (event: DatasetEvent) => ({
              title: event.name || "Untitled Dataset",
              description: event.description,
              price: parseInt(event.price_usdc) / 1_000_000,
              format: event.filetype || "Unknown",
              size: "On-chain",
              author: event.pay_address,
              tags: ["Dataset", "Verified"],
              txHash: event.tx_hash,
              pieceCid: event.piece_cid,
              payAddress: event.pay_address,
              timestamp: event.timestamp,
              activity: generateSparkline(),
            })
          );
          setDatasets(transformedDatasets);
        } else {
          setError(data.error || "Failed to fetch datasets");
        }
      } catch (err) {
        setError("Failed to connect to explorer");
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const handlePurchaseSuccess = (result: DownloadResult) => {
    console.log("Dataset purchased successfully!", result);
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="w-full p-8 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-400 border border-red-500/20 bg-red-500/10 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div>
          <h2 className="text-xl font-bold text-white">Top Datasets</h2>
          <p className="text-neutral-400 text-sm mt-1">
            Top datasets listed in the Marketplace
          </p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-neutral-400 text-xs hover:bg-white/10 transition-colors">
          <Calendar className="w-3.5 h-3.5" />
          <span>Past 24 Hours</span>
        </button>
      </div>

      {/* Table */}
      <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/2">
                <th className="px-6 py-4 font-medium text-neutral-400 text-xs">
                  Dataset
                </th>
                <th className="px-6 py-4 font-medium text-neutral-400 text-xs">
                  Activity
                </th>
                <th className="px-6 py-4 font-medium text-neutral-400 text-xs">
                  Size
                </th>
                <th className="px-6 py-4 font-medium text-neutral-400 text-xs">
                  $ Price
                </th>
                <th className="px-6 py-4 font-medium text-neutral-400 text-xs">
                  Format
                </th>
                <th className="px-6 py-4 font-medium text-neutral-400 text-xs">
                  Latest
                </th>
                <th className="px-6 py-4 font-medium text-neutral-400 text-xs text-center">
                  Chain
                </th>
                <th className="px-6 py-4 font-medium text-neutral-400 text-xs text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {datasets.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-neutral-500"
                  >
                    No datasets found
                  </td>
                </tr>
              ) : (
                datasets.map((dataset, index) => (
                  <tr
                    key={index}
                    className="group hover:bg-white/2 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-orange-500/10 flex items-center justify-center text-orange-500">
                          <Server className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-neutral-200 group-hover:text-white transition-colors flex items-center gap-2">
                            {dataset.title}
                            <ShieldCheck className="w-3 h-3 text-neutral-500" />
                          </div>
                          <div className="text-xs text-neutral-500 font-mono">
                            {dataset.payAddress.slice(0, 6)}...
                            {dataset.payAddress.slice(-4)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 w-32">
                      <div className="h-8 flex items-end gap-0.5 opacity-50">
                        {dataset.activity.map((val, i) => (
                          <div
                            key={i}
                            style={{ height: `${val}%` }}
                            className="w-1.5 bg-blue-500 rounded-t-sm"
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-neutral-400 text-xs">
                      {dataset.size}
                    </td>
                    <td className="px-6 py-4 font-mono text-neutral-200">
                      US${dataset.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-white/5 text-[10px] font-mono text-neutral-400 uppercase">
                        {dataset.format}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-400 text-xs">
                      {formatTimeAgo(dataset.timestamp)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {dataset.txHash && (
                          <a
                            href={`https://sepolia.etherscan.io/tx/${dataset.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
                            title="View Transaction"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <div className="w-28">
                          <DownloadDatasetButton
                            pieceCid={dataset.pieceCid}
                            datasetName={dataset.title}
                            price={dataset.price}
                            onDownloadSuccess={handlePurchaseSuccess}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
