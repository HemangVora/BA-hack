"use client";

import { Calendar } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

// Mock data generator for charts
const generateChartData = (count: number, min: number, max: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    value: Math.floor(Math.random() * (max - min + 1)) + min,
    index: i,
  }));
};

const transactionsData = generateChartData(20, 1000, 5000);
const volumeData = generateChartData(20, 100, 1000);
const buyersData = generateChartData(20, 50, 200);
const sellersData = generateChartData(20, 10, 50);

function StatCard({
  title,
  value,
  data,
  color = "#3b82f6", // blue-500
}: {
  title: string;
  value: string;
  data: any[];
  color?: string;
}) {
  return (
    <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-5 flex flex-col justify-between h-40 relative overflow-hidden group hover:border-white/10 transition-all">
      <div className="z-10">
        <h3 className="text-neutral-400 text-sm font-medium mb-1">{title}</h3>
        <div className="text-2xl font-bold text-white">{value}</div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-20">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`color-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{
                background: "#000",
                border: "1px solid #333",
                borderRadius: "4px",
              }}
              itemStyle={{ color: "#fff" }}
              cursor={{ stroke: "rgba(255,255,255,0.1)" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fillOpacity={1}
              fill={`url(#color-${title})`}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
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
          data={transactionsData}
          color="#3b82f6"
        />
        <StatCard
          title="Volume"
          value="US$197.23K"
          data={volumeData}
          color="#6366f1"
        />
        <StatCard
          title="Buyers"
          value="19.7K"
          data={buyersData}
          color="#3b82f6"
        />
        <StatCard
          title="Sellers"
          value="1K"
          data={sellersData}
          color="#6366f1"
        />
      </div>
    </div>
  );
}
