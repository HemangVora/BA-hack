"use client";

import { Github, Twitter, Disc } from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="py-12 border-t border-white/10 bg-black">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
              <Image
                src="/logo.png"
                alt="DCM Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-purple-400">
                DCM
              </h3>
            </div>
            <p className="text-gray-500 text-sm">
              Decentralized dataset marketplace for the AI era.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Disc className="w-5 h-5" />
            </a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/5 text-center text-gray-600 text-sm">
          © 2025 DCM. All rights reserved. Built on x402.
        </div>
      </div>
    </footer>
  );
}
