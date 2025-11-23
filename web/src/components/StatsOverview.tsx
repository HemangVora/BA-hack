"use client";

import {
  Calendar,
  Database,
  User,
  Bot,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Types
interface ActivityItem {
  id: string;
  title: string;
  type: "ai" | "human";
  timestamp: string;
  value: string;
  isPositive?: boolean;
}

interface TopContributor {
  id: string;
  name: string;
  address: string;
  volume: string;
  items: number;
  rank: number;
}

// Mock Data
const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    title: "Healthcare Analysis Dataset 2024",
    type: "ai",
    timestamp: "2m ago",
    value: "$45.00",
    isPositive: true,
  },
  {
    id: "2",
    title: "Global Temperature Trends",
    type: "human",
    timestamp: "15m ago",
    value: "Free",
    isPositive: true,
  },
  {
    id: "3",
    title: "Crypto Market Sentiment Q3",
    type: "ai",
    timestamp: "42m ago",
    value: "$120.00",
    isPositive: true,
  },
  {
    id: "4",
    title: "Urban Traffic Patterns NYC",
    type: "human",
    timestamp: "1h ago",
    value: "$15.50",
    isPositive: true,
  },
  {
    id: "5",
    title: "Solar Flare Predictions",
    type: "ai",
    timestamp: "2h ago",
    value: "$80.00",
    isPositive: true,
  },
];

const MOCK_CONTRIBUTORS: TopContributor[] = [
  {
    id: "1",
    name: "DataLab_AI",
    address: "0x71...39A2",
    volume: "$12,450",
    items: 145,
    rank: 1,
  },
  {
    id: "2",
    name: "Research_DAO",
    address: "0xB4...91C2",
    volume: "$8,230",
    items: 89,
    rank: 2,
  },
  {
    id: "3",
    name: "OpenMetrics",
    address: "0x12...88D1",
    volume: "$6,120",
    items: 64,
    rank: 3,
  },
  {
    id: "4",
    name: "Quantum_Sense",
    address: "0x99...11F4",
    volume: "$4,500",
    items: 32,
    rank: 4,
  },
  {
    id: "5",
    name: "Civic_Data",
    address: "0x33...77E9",
    volume: "$3,100",
    items: 28,
    rank: 5,
  },
];

const CHART_DATA = [
  { date: "30.10", value1: 4000, value2: 2400, value3: 2400 },
  { date: "31.10", value1: 3000, value2: 1398, value3: 2210 },
  { date: "01.11", value1: 2000, value2: 9800, value3: 2290 },
  { date: "02.11", value1: 2780, value2: 3908, value3: 2000 },
  { date: "03.11", value1: 1890, value2: 4800, value3: 2181 },
  { date: "04.11", value1: 2390, value2: 3800, value3: 2500 },
  { date: "05.11", value1: 3490, value2: 4300, value3: 2100 },
];

export function StatsOverview() {
  const [activeTab, setActiveTab] = useState<"all" | "ai" | "human">("all");

  return (
    <div className="space-y-6 mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Big Stats */}
        <div className="space-y-6">
          {/* Total Datasets Card */}
          <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 h-[200px] flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-start justify-between z-10">
              <div>
                <p className="text-neutral-400 text-sm font-medium">
                  Total Datasets
                </p>
                <h2 className="text-4xl font-bold text-white mt-2 tracking-tight">
                  12,845
                </h2>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-neutral-400">
                <Database className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm z-10">
              <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">
                <Bot className="w-3.5 h-3.5" />
                <span className="font-medium">8,420 AI</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md">
                <User className="w-3.5 h-3.5" />
                <span className="font-medium">4,425 Human</span>
              </div>
            </div>
            {/* Decorative bg gradient */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-linear-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors duration-500" />
          </div>

          {/* Total Value Card */}
          <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 h-[200px] flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-start justify-between z-10">
              <div>
                <p className="text-neutral-400 text-sm font-medium">
                  Total Value Locked
                </p>
                <h2 className="text-4xl font-bold text-white mt-2 tracking-tight">
                  $2.4M
                </h2>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-neutral-400">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-400 z-10">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">+12.5% this week</span>
            </div>
            {/* Decorative bg gradient */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-linear-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors duration-500" />
          </div>
        </div>

        {/* Middle Column - Recent Activity */}
        <div className="bg-neutral-900/50 border border-white/5 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-white">Live Activity</h3>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Real-time
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              {(["all", "ai", "human"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? "bg-white/10 text-white"
                      : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
                  }`}
                >
                  {tab === "all" ? "All Uploads" : `${tab} Generated`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {MOCK_ACTIVITIES.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                        item.type === "ai"
                          ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                          : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                      }`}
                    >
                      {item.type === "ai" ? (
                        <Bot className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-neutral-200 group-hover:text-white truncate max-w-[160px]">
                        {item.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <Clock className="w-3 h-3" />
                        {item.timestamp}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono font-medium text-emerald-400">
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Top Contributors */}
        <div className="bg-neutral-900/50 border border-white/5 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-white">Top Contributors</h3>
              <div className="flex gap-2">
                <button className="text-xs font-medium text-white bg-white/10 px-2 py-1 rounded">
                  1D
                </button>
                <button className="text-xs font-medium text-neutral-500 hover:text-neutral-300 px-2 py-1 rounded">
                  1W
                </button>
                <button className="text-xs font-medium text-neutral-500 hover:text-neutral-300 px-2 py-1 rounded">
                  1M
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-500 px-2">
              <span>Contributor</span>
              <span>Vol / Items</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {MOCK_CONTRIBUTORS.map((contributor) => (
                <div
                  key={contributor.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center text-xs font-bold text-neutral-600 bg-white/5 rounded-full">
                      {contributor.rank}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-neutral-700 to-neutral-800 border border-white/5 flex items-center justify-center text-xs font-bold text-white">
                      {contributor.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-neutral-200 group-hover:text-white">
                        {contributor.name}
                      </div>
                      <div className="text-xs text-neutral-500 font-mono">
                        {contributor.address}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono font-medium text-emerald-400">
                      {contributor.volume}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {contributor.items} uploads
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Multi-Line Chart */}
      <div className="bg-[#111119] border border-white/5 rounded-3xl p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 relative overflow-hidden">
        {/* Left Side - Stats Legend */}
        <div className="space-y-8 z-10">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Statistics</h2>
            <h2 className="text-2xl font-bold text-white">Revenue</h2>
          </div>

          <div className="space-y-4">
            {/* Stat Item 1 */}
            <div className="bg-[#1A1A24] border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                <span className="text-2xl font-bold text-white">
                  $25,841.20
                </span>
              </div>
              <span className="text-xs font-mono text-neutral-500">
                AI Sales
              </span>
            </div>

            {/* Stat Item 2 */}
            <div className="bg-[#1A1A24] border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-lime-400/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.5)]" />
                <span className="text-2xl font-bold text-white">
                  $19,473.00
                </span>
              </div>
              <span className="text-xs font-mono text-neutral-500">
                Human Sales
              </span>
            </div>

            {/* Stat Item 3 */}
            <div className="bg-[#1A1A24] border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                <span className="text-2xl font-bold text-white">
                  $16,520.50
                </span>
              </div>
              <span className="text-xs font-mono text-neutral-500">
                Subscriptions
              </span>
            </div>

            {/* Total */}
            <div className="bg-[#1A1A24] border border-white/5 rounded-2xl p-4 flex items-center justify-between mt-8">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
                <span className="text-2xl font-bold text-white">
                  $61,834.70
                </span>
              </div>
              <span className="text-xs font-mono text-neutral-400">
                Total Revenue
              </span>
            </div>
          </div>
        </div>

        {/* Right Side - Chart */}
        <div className="lg:col-span-2 h-[400px] relative">
          {/* Floating Badge */}
          <div className="absolute top-1/4 right-1/3 z-20 bg-lime-400 text-black px-3 py-1.5 rounded-full font-bold text-sm shadow-lg shadow-lime-400/20 transform rotate-3">
            $24,185.50
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CHART_DATA}>
              <defs>
                <linearGradient id="colorValue1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorValue2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a3e635" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a3e635" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorValue3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#525252", fontSize: 12 }}
                dy={10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1A24",
                  borderColor: "#333",
                  borderRadius: "12px",
                }}
                itemStyle={{ color: "#fff" }}
              />
              <Area
                type="monotone"
                dataKey="value1"
                stroke="#8b5cf6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorValue1)"
              />
              <Area
                type="monotone"
                dataKey="value2"
                stroke="#a3e635"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorValue2)"
              />
              <Area
                type="monotone"
                dataKey="value3"
                stroke="#6366f1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorValue3)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
