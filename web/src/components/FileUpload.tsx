"use client";

import { useState, useRef } from "react";
import { useEvmAddress, useIsSignedIn } from "@coinbase/cdp-hooks";
import {
  Upload,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SERVER_URL = "https://ba-hack-production.up.railway.app";

interface UploadResult {
  success: boolean;
  pieceCid: string;
  size: number;
  type: string;
  name: string;
  description: string;
  priceUSDC: string;
  payAddress: string;
  dataRegistryTxHash?: string;
  dataRegistryTxUrl?: string;
}

export function FileUpload({
  onUploadSuccess,
}: {
  onUploadSuccess?: (result: UploadResult) => void;
}) {
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("1");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-populate name if empty
      if (!name) {
        setName(selectedFile.name.split(".").slice(0, -1).join("."));
      }
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!isSignedIn || !evmAddress) {
      setError("Please connect your wallet first");
      return;
    }

    if (!file) {
      setError("Please select a file");
      return;
    }

    if (!name || !description || !price) {
      setError("Please fill in all fields");
      return;
    }

    const priceInUSDC = parseFloat(price);
    if (isNaN(priceInUSDC) || priceInUSDC < 0) {
      setError("Invalid price");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      // Read file as base64
      const fileBase64 = await fileToBase64(file);

      const requestBody = {
        file: fileBase64,
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        name: name,
        description: description,
        priceUSDC: Math.floor(priceInUSDC * 1_000_000), // Convert to USDC with 6 decimals
        payAddress: evmAddress,
      };

      console.log("Uploading file:", {
        filename: file.name,
        size: file.size,
        name,
        description,
        price: priceInUSDC,
        payAddress: evmAddress,
      });

      const response = await fetch(`${SERVER_URL}/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || "Upload failed");
      }

      setUploadResult(result);
      setFile(null);
      setName("");
      setDescription("");
      setPrice("1");

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Call callback if provided
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (!isSignedIn) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
            <Upload className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Connect Wallet to Upload
          </h3>
          <p className="text-neutral-400">
            Please connect your wallet to upload files to the marketplace.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="p-8 rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <Upload className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Upload Dataset</h3>
            <p className="text-sm text-neutral-400">
              Share your data on the marketplace
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Select File
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-neutral-700 hover:border-indigo-500/50 rounded-xl p-8 text-center cursor-pointer transition-colors group"
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-indigo-400" />
                    <div className="text-left">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-neutral-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-400" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-neutral-500 group-hover:text-indigo-400 mx-auto mb-3 transition-colors" />
                  <p className="text-neutral-400 group-hover:text-neutral-300">
                    Click to select a file
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Any file type supported
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Dataset Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Financial Q3 Report"
              className="w-full px-4 py-3 rounded-xl bg-neutral-800/50 border border-neutral-700 focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your dataset..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-neutral-800/50 border border-neutral-700 focus:border-indigo-500 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Price Input */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Price (USDC)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="1.00"
              step="0.01"
              min="0"
              className="w-full px-4 py-3 rounded-xl bg-neutral-800/50 border border-neutral-700 focus:border-indigo-500 focus:outline-none transition-colors"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Set to 0 for free access
            </p>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading || !file || !name || !description}
            className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-neutral-700 disabled:to-neutral-700 disabled:cursor-not-allowed font-medium transition-all duration-200 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading to Filecoin...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload Dataset
              </>
            )}
          </button>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {uploadResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-green-400">
                    Upload Successful!
                  </p>
                  <p className="text-sm text-neutral-300 mt-1">
                    {uploadResult.name} has been uploaded to Filecoin
                  </p>
                  {uploadResult.dataRegistryTxUrl && (
                    <a
                      href={uploadResult.dataRegistryTxUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-400 hover:text-indigo-300 mt-2 inline-block"
                    >
                      View on Etherscan →
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-red-400">Upload Failed</p>
                  <p className="text-sm text-neutral-300 mt-1">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
