import React from "react";
import { StadiumSector, Incident } from "../types";
import { MapPin, AlertTriangle, Accessibility, Trash2, Droplet, Layers } from "lucide-react";

interface StadiumMapProps {
  sectors: StadiumSector[];
  activeIncidents: Incident[];
  selectedSectorId: string | null;
  onSelectSector: (id: string | null) => void;
  onTriggerIncidentAtLocation: (locationName: string) => void;
}

export default function StadiumMap({
  sectors,
  activeIncidents,
  selectedSectorId,
  onSelectSector,
  onTriggerIncidentAtLocation,
}: StadiumMapProps) {
  // Map sector statuses to colors
  const getSectorColorClass = (sector: StadiumSector) => {
    const isSelected = selectedSectorId === sector.id;
    
    if (sector.status === "Critical") {
      return isSelected 
        ? "fill-red-500 stroke-red-100 stroke-[3px]" 
        : "fill-red-900/80 hover:fill-red-800 stroke-red-600 stroke-[1.5px]";
    }
    if (sector.status === "Dense") {
      return isSelected 
        ? "fill-amber-500 stroke-amber-100 stroke-[3px]" 
        : "fill-amber-900/80 hover:fill-amber-800 stroke-amber-600 stroke-[1.5px]";
    }
    return isSelected 
      ? "fill-emerald-500 stroke-emerald-100 stroke-[3px]" 
      : "fill-slate-800/90 hover:fill-slate-700/90 stroke-slate-600 stroke-[1.5px]";
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden h-full flex flex-col justify-between">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-lg text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Interactive Crowd & Arena Map
          </h3>
          <p className="text-xs text-slate-400">Click a stand, gate, or hotspot to inspect sector status or log issues.</p>
        </div>
        <div className="flex gap-3 text-xs flex-wrap justify-end">
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-slate-300">Normal (&lt;70%)</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span className="text-slate-300">Dense (70-90%)</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
            <span className="text-slate-300">Critical (&gt;90%)</span>
          </div>
        </div>
      </div>

      {/* Responsive SVG Container */}
      <div className="flex-1 flex items-center justify-center min-h-[300px] lg:min-h-[420px] relative">
        <svg 
          viewBox="0 0 800 600" 
          className="w-full h-full max-h-[480px] drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
        >
          {/* DEFINITIONS for Gradients */}
          <defs>
            <radialGradient id="fieldGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#065f46" stopOpacity="0.0" />
            </radialGradient>
            <linearGradient id="pitchGrass" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <radialGradient id="incidentAlert" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer Stadium Glow & Boundary */}
          <rect x="50" y="50" width="700" height="500" rx="250" className="fill-slate-950/40 stroke-slate-800/40 stroke-[2px]" />
          <rect x="90" y="90" width="620" height="420" rx="210" className="fill-slate-900/30 stroke-slate-800/80 stroke-dashed stroke-[1.5px]" />

          {/* FIELD GLOW */}
          <rect x="250" y="190" width="300" height="220" rx="10" className="fill-[url(#fieldGlow)]" />

          {/* SOCCER FIELD (PITCH) */}
          <g transform="translate(260, 200)" className="pointer-events-none">
            {/* Turf */}
            <rect x="0" y="0" width="280" height="200" rx="8" fill="url(#pitchGrass)" className="stroke-emerald-300/30 stroke-[2px]" />
            {/* Markings */}
            <rect x="10" y="10" width="260" height="180" fill="none" className="stroke-emerald-100/40 stroke-[1.5px]" />
            <line x1="140" y1="10" x2="140" y2="190" className="stroke-emerald-100/40 stroke-[1.5px]" />
            <circle cx="140" cy="100" r="35" fill="none" className="stroke-emerald-100/40 stroke-[1.5px]" />
            <circle cx="140" cy="100" r="3" fill="#ffffff" opacity="0.8" />
            {/* Goal boxes */}
            <rect x="10" y="60" width="25" height="80" fill="none" className="stroke-emerald-100/40 stroke-[1.5px]" />
            <rect x="245" y="60" width="25" height="80" fill="none" className="stroke-emerald-100/40 stroke-[1.5px]" />
          </g>

          {/* SECTOR 1: WEST STAND (Upper + Lower Rows) */}
          {/* We find sectors of type 'West' and map to visual paths */}
          <path
            d="M 120,230 L 220,230 L 220,370 L 120,370 Z"
            className={`${getSectorColorClass(sectors.find(s => s.id === "west-stand") || sectors[0])} transition-all duration-300 cursor-pointer`}
            onClick={() => onSelectSector("west-stand")}
          />
          <text x="170" y="305" className="fill-slate-300 font-display font-medium text-xs text-center pointer-events-none select-none" textAnchor="middle">
            WEST STAND
          </text>

          {/* SECTOR 2: EAST STAND */}
          <path
            d="M 580,230 L 680,230 L 680,370 L 580,370 Z"
            className={`${getSectorColorClass(sectors.find(s => s.id === "east-stand") || sectors[0])} transition-all duration-300 cursor-pointer`}
            onClick={() => onSelectSector("east-stand")}
          />
          <text x="630" y="305" className="fill-slate-300 font-display font-medium text-xs text-center pointer-events-none select-none" textAnchor="middle">
            EAST STAND
          </text>

          {/* SECTOR 3: NORTH STAND (Top Curved) */}
          <path
            d="M 150,180 C 250,90 550,90 650,180 L 570,220 C 490,150 310,150 230,220 Z"
            className={`${getSectorColorClass(sectors.find(s => s.id === "north-stand") || sectors[0])} transition-all duration-300 cursor-pointer`}
            onClick={() => onSelectSector("north-stand")}
          />
          <text x="400" y="145" className="fill-slate-300 font-display font-medium text-xs pointer-events-none select-none" textAnchor="middle">
            NORTH STAND
          </text>

          {/* SECTOR 4: SOUTH STAND (Bottom Curved) */}
          <path
            d="M 150,420 C 250,510 550,510 650,420 L 570,380 C 490,450 310,450 230,380 Z"
            className={`${getSectorColorClass(sectors.find(s => s.id === "south-stand") || sectors[0])} transition-all duration-300 cursor-pointer`}
            onClick={() => onSelectSector("south-stand")}
          />
          <text x="400" y="465" className="fill-slate-300 font-display font-medium text-xs pointer-events-none select-none" textAnchor="middle">
            SOUTH STAND
          </text>

          {/* OUTER ACCESS CONCOURSE GATES (Interactive) */}
          {/* GATE A (Top Left) */}
          <g 
            className="cursor-pointer group"
            onClick={() => onSelectSector("gate-a")}
          >
            <circle cx="160" cy="130" r="32" className={`${getSectorColorClass(sectors.find(s => s.id === "gate-a") || sectors[0])} transition-all duration-300`} />
            <text x="160" y="134" className="fill-slate-100 font-display font-bold text-xs select-none pointer-events-none" textAnchor="middle">GATE A</text>
          </g>

          {/* GATE B (Top Right) */}
          <g 
            className="cursor-pointer group"
            onClick={() => onSelectSector("gate-b")}
          >
            <circle cx="640" cy="130" r="32" className={`${getSectorColorClass(sectors.find(s => s.id === "gate-b") || sectors[0])} transition-all duration-300`} />
            <text x="640" y="134" className="fill-slate-100 font-display font-bold text-xs select-none pointer-events-none" textAnchor="middle">GATE B</text>
          </g>

          {/* GATE C (Bottom Right) */}
          <g 
            className="cursor-pointer group"
            onClick={() => onSelectSector("gate-c")}
          >
            <circle cx="640" cy="470" r="32" className={`${getSectorColorClass(sectors.find(s => s.id === "gate-c") || sectors[0])} transition-all duration-300`} />
            <text x="640" y="474" className="fill-slate-100 font-display font-bold text-xs select-none pointer-events-none" textAnchor="middle">GATE C</text>
          </g>

          {/* GATE D (Bottom Left) */}
          <g 
            className="cursor-pointer group"
            onClick={() => onSelectSector("gate-d")}
          >
            <circle cx="160" cy="470" r="32" className={`${getSectorColorClass(sectors.find(s => s.id === "gate-d") || sectors[0])} transition-all duration-300`} />
            <text x="160" y="474" className="fill-slate-100 font-display font-bold text-xs select-none pointer-events-none" textAnchor="middle">GATE D</text>
          </g>

          {/* STAFF & UTILITY ICONS / HOTSPOTS */}
          
          {/* Water Refill Points (Droplet Blue Icons) */}
          <g transform="translate(140, 270)" className="pointer-events-none" opacity="0.85">
            <circle cx="0" cy="0" r="10" className="fill-sky-500/30 stroke-sky-400 stroke-[1px]" />
            <path d="M0 -5 C3 -2 4 2 0 6 C-4 2 -3 -2 0 -5 Z" fill="#38bdf8" transform="scale(0.8) translate(-1, -1)" />
          </g>
          <g transform="translate(650, 275)" className="pointer-events-none" opacity="0.85">
            <circle cx="0" cy="0" r="10" className="fill-sky-500/30 stroke-sky-400 stroke-[1px]" />
            <path d="M0 -5 C3 -2 4 2 0 6 C-4 2 -3 -2 0 -5 Z" fill="#38bdf8" transform="scale(0.8) translate(-1, -1)" />
          </g>
          <g transform="translate(390, 110)" className="pointer-events-none" opacity="0.85">
            <circle cx="0" cy="0" r="10" className="fill-sky-500/30 stroke-sky-400 stroke-[1px]" />
            <path d="M0 -5 C3 -2 4 2 0 6 C-4 2 -3 -2 0 -5 Z" fill="#38bdf8" transform="scale(0.8) translate(-1, -1)" />
          </g>

          {/* Sustainability Compost Bins (Green Waste Icons) */}
          <g transform="translate(260, 160)" className="pointer-events-none" opacity="0.85">
            <circle cx="0" cy="0" r="10" className="fill-emerald-500/30 stroke-emerald-400 stroke-[1px]" />
            <rect x="-3" y="-4" width="6" height="8" rx="1" fill="#34d399" />
            <line x1="-4" y1="-4" x2="4" y2="-4" className="stroke-emerald-300 stroke-[1px]" />
          </g>
          <g transform="translate(530, 160)" className="pointer-events-none" opacity="0.85">
            <circle cx="0" cy="0" r="10" className="fill-emerald-500/30 stroke-emerald-400 stroke-[1px]" />
            <rect x="-3" y="-4" width="6" height="8" rx="1" fill="#34d399" />
            <line x1="-4" y1="-4" x2="4" y2="-4" className="stroke-emerald-300 stroke-[1px]" />
          </g>
          <g transform="translate(390, 430)" className="pointer-events-none" opacity="0.85">
            <circle cx="0" cy="0" r="10" className="fill-emerald-500/30 stroke-emerald-400 stroke-[1px]" />
            <rect x="-3" y="-4" width="6" height="8" rx="1" fill="#34d399" />
            <line x1="-4" y1="-4" x2="4" y2="-4" className="stroke-emerald-300 stroke-[1px]" />
          </g>

          {/* ACTIVE ALERTS / INCIDENT INDICATORS (Blinking Red Highlights) */}
          {activeIncidents.filter(inc => inc.status !== "Resolved").map((incident) => {
            // Map location string to SVG coordinates
            let coords = { cx: 400, cy: 300 };
            const loc = incident.location.toLowerCase();
            
            if (loc.includes("west stand")) {
              coords = { cx: 170, cy: 330 };
            } else if (loc.includes("east stand")) {
              coords = { cx: 630, cy: 330 };
            } else if (loc.includes("north stand")) {
              coords = { cx: 400, cy: 110 };
            } else if (loc.includes("south stand")) {
              coords = { cx: 400, cy: 490 };
            } else if (loc.includes("gate a")) {
              coords = { cx: 140, cy: 110 };
            } else if (loc.includes("gate b")) {
              coords = { cx: 660, cy: 110 };
            } else if (loc.includes("gate c")) {
              coords = { cx: 660, cy: 490 };
            } else if (loc.includes("gate d")) {
              coords = { cx: 140, cy: 490 };
            } else if (loc.includes("field")) {
              coords = { cx: 340, cy: 260 };
            }

            return (
              <g 
                key={incident.id} 
                className="cursor-pointer group/alert"
                onClick={(e) => {
                  e.stopPropagation();
                  onTriggerIncidentAtLocation(incident.location);
                }}
              >
                {/* Outermost breathing pulse glow */}
                <circle 
                  cx={coords.cx} 
                  cy={coords.cy} 
                  r="24" 
                  fill="url(#incidentAlert)" 
                  className="animate-pulse"
                />
                {/* Core alert ring */}
                <circle 
                  cx={coords.cx} 
                  cy={coords.cy} 
                  r="12" 
                  className="fill-red-600/90 stroke-white stroke-[1.5px] hotspot-pulse" 
                />
                {/* Alert Icon visually */}
                <path 
                  d={`M ${coords.cx} ${coords.cy - 5} L ${coords.cx - 4} ${coords.cy + 3} L ${coords.cx + 4} ${coords.cy + 3} Z`} 
                  fill="#ffffff" 
                  className="pointer-events-none"
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltips or Selector indicators */}
        {selectedSectorId && (
          <div className="absolute bottom-4 left-4 bg-slate-950/90 border border-emerald-500/40 rounded-lg p-2.5 backdrop-blur-sm text-xs shadow-lg animate-fade-in">
            <div className="font-bold text-slate-100 flex items-center gap-1.5 uppercase tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Selected: {sectors.find(s => s.id === selectedSectorId)?.name}
            </div>
            <div className="text-slate-400 mt-1">
              Crowd: {sectors.find(s => s.id === selectedSectorId)?.currentCrowd.toLocaleString()} / {sectors.find(s => s.id === selectedSectorId)?.capacity.toLocaleString()} fans
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelectSector(null);
              }}
              className="text-[10px] text-amber-400 hover:text-amber-300 underline font-medium mt-1.5 block cursor-pointer"
            >
              Clear Selection Filter
            </button>
          </div>
        )}
      </div>

      {/* Sustainability & Accessibility Map Key */}
      <div className="border-t border-slate-800/60 pt-4 mt-2 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400">
        <span className="font-medium text-slate-300 flex items-center gap-1">Legends:</span>
        <span className="flex items-center gap-1">
          <span className="w-5 h-5 rounded-full bg-sky-950 border border-sky-400 flex items-center justify-center">
            <Droplet className="w-3 h-3 text-sky-400" />
          </span>
          Water Refilling Station
        </span>
        <span className="flex items-center gap-1">
          <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-400 flex items-center justify-center">
            <Trash2 className="w-3 h-3 text-emerald-400" />
          </span>
          Zero-Waste Compost Bin
        </span>
        <span className="flex items-center gap-1">
          <span className="w-5 h-5 rounded-full bg-red-950 border border-red-500 flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-3 h-3 text-red-400" />
          </span>
          Active Ops Alert / Dispatch Zone
        </span>
      </div>
    </div>
  );
}
