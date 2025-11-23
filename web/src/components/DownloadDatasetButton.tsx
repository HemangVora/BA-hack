"use client";

import { useIsSignedIn } from "@coinbase/cdp-hooks";
import {
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { useX402Payment, type DownloadResult } from "@/hooks/useX402Payment";

interface DownloadDatasetButtonProps {
  pieceCid: string;
  datasetName: string;
  price: number;
  onDownloadSuccess?: (result: DownloadResult) => void;
}

export function DownloadDatasetButton({
  pieceCid,
  datasetName,
  price,
  onDownloadSuccess,
}: DownloadDatasetButtonProps) {
  const { isSignedIn } = useIsSignedIn();
  const {
    downloadWithPayment,
    isProcessing,
    error: paymentError,
  } = useX402Payment();
  const [downloadState, setDownloadState] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showConnectPrompt, setShowConnectPrompt] = useState(false);

  const handleDownload = async () => {
    if (!isSignedIn) {
      setShowConnectPrompt(true);
      return;
    }

    try {
      setDownloadState("processing");
      setErrorMessage(null);

      console.log("[Download] Starting download for:", pieceCid);
      const result = await downloadWithPayment(pieceCid);

      console.log("[Download] Download successful:", result);
      setDownloadState("success");

      // Handle the downloaded content
      if (result.format === "text" || result.format === "binary") {
        // For text or binary content, create a downloadable file
        const blob = new Blob([result.content], {
          type: result.mimeType || "application/octet-stream",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename || result.name || `${pieceCid}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (result.format === "file" && result.content) {
        // For base64 encoded files
        const byteCharacters = atob(result.content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: result.mimeType || "application/octet-stream",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename || result.name || `${pieceCid}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      // Call success callback
      if (onDownloadSuccess) {
        onDownloadSuccess(result);
      }

      // Reset state after 3 seconds
      setTimeout(() => {
        setDownloadState("idle");
      }, 3000);
    } catch (err: any) {
      console.error("[Download] Error:", err);
      setErrorMessage(err.message || "Download failed");
      setDownloadState("error");
    }
  };

  if (downloadState === "success") {
    return (
      <button
        disabled
        className="flex items-center justify-center p-2 rounded-lg bg-neutral-700 border border-neutral-600 text-white text-sm font-medium"
      >
        <CheckCircle2 className="w-4 h-4" />
      </button>
    );
  }

  if (downloadState === "error") {
    return (
      <div className="space-y-2">
        <button
          onClick={handleDownload}
          className="flex items-center justify-center p-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition-all text-sm font-medium"
        >
          <AlertCircle className="w-4 h-4" />
        </button>
        {errorMessage && <p className="text-xs text-red-400">{errorMessage}</p>}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={isProcessing || downloadState === "processing"}
        className="flex items-center justify-center p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 disabled:cursor-not-allowed transition-all text-sm font-medium text-white"
      >
        {isProcessing || downloadState === "processing" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
      </button>

      {showConnectPrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Connect Wallet</h3>
            </div>
            <p className="text-neutral-400 mb-6 text-sm leading-relaxed">
              Please connect your wallet to download{" "}
              <strong>{datasetName}</strong>. Accessing the dataset requires a
              signature.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConnectPrompt(false)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium text-neutral-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConnectPrompt(false);
                  // Focus on the connect button in navbar or show an arrow
                  const walletBtn = document.querySelector(
                    '[data-testid="ockConnectWalletButton"]'
                  ); // approximate selector for CDP button if available, otherwise generic instruction
                  if (walletBtn instanceof HTMLElement) {
                    walletBtn.click();
                  } else {
                    // If we can't find it programmatically, we rely on the user finding it.
                    // Maybe scroll to top?
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-medium"
              >
                I'll Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
