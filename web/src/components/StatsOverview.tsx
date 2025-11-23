"use client";

import { ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";

function StatCard({
  title,
  value,
  chartPath,
  chartColor = "text-blue-500",
  trend,
}: {
  title: string;
  value: string;
  chartPath: string;
  chartColor?: string;
  trend?: "up" | "down";
}) {
  return (
    <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-5 flex flex-col justify-between h-40 relative overflow-hidden group hover:border-white/10 transition-all">
      <div className="z-10">
        <h3 className="text-neutral-400 text-sm font-medium mb-1">{title}</h3>
        <div className="text-2xl font-bold text-white">{value}</div>
      </div>

      {/* Simple SVG Chart */}
      <div className="absolute bottom-0 left-0 right-0 h-20 opacity-50">
        <svg
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          className={`w-full h-full ${chartColor} fill-current opacity-20`}
        >
          <path d={chartPath} />
        </svg>
        <svg
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          className={`w-full h-full ${chartColor} stroke-current fill-none stroke-2 absolute top-0 left-0`}
        >
          <path
            d={chartPath.replace("V 40 H 0 Z", "")}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
}

export function StatsOverview() {
  return (
    <div className="space-y-6 mb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Overall Stats</h2>
          <p className="text-neutral-400 text-sm mt-1">
            Global statistics for the x402 ecosystem
          </p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-neutral-400 text-xs hover:bg-white/10 transition-colors">
          <Calendar className="w-3.5 h-3.5" />
          <span>Past 24 Hours</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Transactions"
          value="1.76M"
          chartPath="M 0 30 Q 10 25 20 28 T 40 20 T 60 25 T 80 15 T 100 10 V 40 H 0 Z"
          chartColor="text-blue-600"
        />
        <StatCard
          title="Volume"
          value="US$197.23K"
          chartPath="M 0 35 L 10 35 L 15 20 L 25 25 L 35 10 L 45 15 L 55 5 L 65 20 L 75 15 L 100 30 V 40 H 0 Z"
          chartColor="text-blue-500"
        />
        <StatCard
          title="Buyers"
          value="19.7K"
          chartPath="M 0 30 Q 25 30 50 20 T 100 5 V 40 H 0 Z"
          chartColor="text-blue-600"
        />
        <StatCard
          title="Sellers"
          value="1K"
          chartPath="M 0 35 L 20 35 L 25 20 L 30 30 L 40 25 L 50 35 L 60 10 L 70 25 L 80 20 L 90 30 L 100 15 V 40 H 0 Z"
          chartColor="text-blue-600"
        />
      </div>
    </div>
  );
}
