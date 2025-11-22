"use client";

import { CDPReactProvider } from "@coinbase/cdp-react";
import { ReactNode } from "react";

interface CDPProviderProps {
  children: ReactNode;
}

export function CDPProvider({ children }: CDPProviderProps) {
  const projectId = process.env.NEXT_PUBLIC_CDP_PROJECT_ID;

  if (!projectId) {
    console.warn(
      "⚠️ CDP Project ID not found. Please set NEXT_PUBLIC_CDP_PROJECT_ID in your .env.local file."
    );
  }

  return (
    <CDPReactProvider
      config={{
        projectId: projectId || "",
        ethereum: {
          // Creates an EOA (Externally Owned Account) on login
          createOnLogin: "eoa", // or "smart" for smart accounts
        },
        appName: "DataNexus",

        // Optional: Configure additional networks
        // chains: ["base-sepolia", "base-mainnet"],
      }}
    >
      {children}
    </CDPReactProvider>
  );
}
