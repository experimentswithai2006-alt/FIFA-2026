import React from "react";
import { StadiumSector, Incident } from "../types";
import { 
  Users, Leaf, HelpingHand, Bus, ArrowUpRight, TrendingDown, RefreshCw, Sparkles 
} from "lucide-react";

interface MetricsGridProps {
  sectors: StadiumSector[];
  incidents: Incident[];
  simulationSpeed: "Paused" | "Normal" | "High Flow";
  onToggleSpeed: () => void;
}

export default function MetricsGrid({ 
  sectors, 
  incidents, 
  simulationSpeed, 
  onToggleSpeed 
}: MetricsGridProps) {
  // 1. Calculate overall crowd density average
  const totalCapacity = sectors.reduce((acc, curr) => acc + curr.capacity, 0);
  const totalCrowd = sectors.reduce((acc, curr) => acc + curr.currentCrowd, 0);
  const averageDensity = totalCapacity > 0 ? (totalCrowd / totalCapacity) * 100 : 0;

  // 2. Count sustainability items
  const totalCompostBins = sectors.reduce((acc, curr) => acc + curr.compostBinCount, 0);
  const totalRefills = sectors.reduce((acc, curr) => acc + curr.waterRefillCount, 0);
  const recycleRate = 84.2; // Baseline target recycle rate

  // 3. Accessibility assists active
  const totalAccRequests = sectors.reduce((acc, curr) => acc + curr.accCount, 0);
  const resolvedAccCalls = incidents.filter(i => i.assignedTeam.includes("Medical") && i.status === "Resolved").length;

  // 4. Transit wait time estimation
  const isCrowded = averageDensity > 80;
  const metroWaitTime = isCrowded 
    ? (simulationSpeed === "High Flow" ? "32 mins" : "24 mins") 
    : "12 mins";

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* CARD 1: CROWD DENSITY */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-all"></div>
        <div className="flex items-center justify-between mb-3">
          <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
            <Users className="w-5 h-5 text-red-400" />
          </div>
          <span className="text-[10px] bg-red-500/15 text-red-400 font-mono px-2 py-0.5 rounded-full font-bold">
            {averageDensity > 85 ? "Critical Load" : "Healthy Flow"}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Arena Crowd Density</span>
          <h2 className="font-display font-bold text-2xl text-slate-100 mt-1">
            {averageDensity.toFixed(1)}%
          </h2>
          <div className="mt-3">
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
              <div 
                className={`h-full transition-all duration-1000 ${
                  averageDensity > 85 ? "bg-red-500" : averageDensity > 70 ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${averageDensity}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>{totalCrowd.toLocaleString()} active seats</span>
            </p>
          </div>
        </div>
      </div>

      {/* CARD 2: SUSTAINABILITY INDEX */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
        <div className="flex items-center justify-between mb-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <Leaf className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-mono px-2 py-0.5 rounded-full font-bold">
            Zero-Waste Goal
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Organic Diversion</span>
          <h2 className="font-display font-bold text-2xl text-slate-100 mt-1">
            {recycleRate}%
          </h2>
          <div className="mt-3">
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
              <div 
                className="h-full bg-emerald-500 transition-all duration-1000"
                style={{ width: `${recycleRate}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                {totalCompostBins} composting hubs active
              </span>
              <span className="text-emerald-400 font-bold">+{totalRefills} refilled</span>
            </p>
          </div>
        </div>
      </div>

      {/* CARD 3: ACCESSIBILITY SCORE */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-all"></div>
        <div className="flex items-center justify-between mb-3">
          <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl">
            <HelpingHand className="w-5 h-5 text-sky-400" />
          </div>
          <span className="text-[10px] bg-sky-500/15 text-sky-400 font-mono px-2 py-0.5 rounded-full font-bold">
            Assists Active
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Inclusion Pathways</span>
          <h2 className="font-display font-bold text-2xl text-slate-100 mt-1">
            {totalAccRequests} Active
          </h2>
          <div className="mt-3">
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
              <div 
                className="h-full bg-sky-500 transition-all duration-1000"
                style={{ width: `${(resolvedAccCalls / (totalAccRequests || 1)) * 100 + 40}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-sky-400" />
              <span>Seniors/ADA assist escorts online</span>
            </p>
          </div>
        </div>
      </div>

      {/* CARD 4: METRO TRANSIT WAITING TIME */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all"></div>
        <div className="flex items-center justify-between mb-3">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <Bus className="w-5 h-5 text-purple-400" />
          </div>
          {/* Simulation controller toggle button inside standard card */}
          <button
            onClick={onToggleSpeed}
            className="text-[10px] bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-300 font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 cursor-pointer transition-all"
          >
            <RefreshCw className="w-3 h-3 animate-spin" />
            Mode: {simulationSpeed}
          </button>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Metro Shuttle Loop</span>
          <h2 className="font-display font-bold text-2xl text-slate-100 mt-1">
            ~{metroWaitTime}
          </h2>
          <div className="mt-3">
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
              <div 
                className="h-full bg-purple-500 transition-all duration-1000"
                style={{ width: isCrowded ? "80%" : "40%" }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" />
              <span>High-flow trains running every 3m</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
