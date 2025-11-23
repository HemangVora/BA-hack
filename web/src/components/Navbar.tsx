"use client";

import Link from "next/link";
import Image from "next/image";
import { WalletButton } from "@/components/WalletButton";
import { USDCBalance } from "@/components/USDCBalance";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-100 border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center justify-center gap-0 text-xl font-bold"
        >
          <Image
            src="/logo.png"
            alt="DCM Logo"
            width={68}
            height={68}
            className="rounded-lg"
          />
          <span className="bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
            DCM
          </span>
        </Link>

        <div className="hidden md:flex items-start w-[75%] ml-5 gap-8 text-sm font-medium text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>

          <Link
            href="/dashboard"
            className="hover:text-white transition-colors"
          >
            Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <USDCBalance />
          <WalletButton />
        </div>
      </div>
    </nav>
  );
}
