import React, { useState, useEffect } from "react";
import { StadiumSector, Incident, SimulatedLog, IncidentStatus } from "./types";
import StadiumMap from "./components/StadiumMap";
import FanConcierge from "./components/FanConcierge";
import IncidentCommander from "./components/IncidentCommander";
import MetricsGrid from "./components/MetricsGrid";
import { 
  Compass, Shield, AlertCircle, RefreshCw, Trophy, Clock, Wifi, HelpCircle, Activity 
} from "lucide-react";

// Pre-populated initial sectors with World Cup capacity details
const INITIAL_SECTORS: StadiumSector[] = [
  { id: "north-stand", name: "North Stand (Alireza Gate)", capacity: 22000, currentCrowd: 14200, status: "Normal", accCount: 4, compostBinCount: 8, waterRefillCount: 4, type: "North" },
  { id: "south-stand", name: "South Stand (Diego Stand)", capacity: 22000, currentCrowd: 18900, status: "Dense", accCount: 9, compostBinCount: 6, waterRefillCount: 5, type: "South" },
  { id: "east-stand", name: "East Stand (Pele Stand)", capacity: 18000, currentCrowd: 11400, status: "Normal", accCount: 2, compostBinCount: 4, waterRefillCount: 3, type: "East" },
  { id: "west-stand", name: "West Stand (Maradona Row)", capacity: 18000, currentCrowd: 16800, status: "Dense", accCount: 11, compostBinCount: 10, waterRefillCount: 6, type: "West" },
  { id: "gate-a", name: "Gate A Access Terminal", capacity: 5000, currentCrowd: 3100, status: "Normal", accCount: 3, compostBinCount: 2, waterRefillCount: 2, type: "Gate" },
  { id: "gate-b", name: "Gate B Access Terminal", capacity: 5000, currentCrowd: 4800, status: "Critical", accCount: 1, compostBinCount: 3, waterRefillCount: 2, type: "Gate" },
  { id: "gate-c", name: "Gate C Access Terminal", capacity: 5000, currentCrowd: 4200, status: "Dense", accCount: 2, compostBinCount: 1, waterRefillCount: 1, type: "Gate" },
  { id: "gate-d", name: "Gate D Access Terminal", capacity: 5000, currentCrowd: 2200, status: "Normal", accCount: 5, compostBinCount: 2, waterRefillCount: 1, type: "Gate" }
];

// Pre-populated incidents representing realistic stadium flow conditions
const INITIAL_INCIDENTS: Incident[] = [
  {
    id: "inc-1",
    title: "Water Dispenser Pipe Burst at Gate B",
    description: "Main greywater filtration pipe is leaking near Gate B Concourse, causing high slip hazard and blocking primary wheelchair pathway access.",
    location: "Gate B (Concourse Hub)",
    priority: "Medium",
    status: "Pending",
    timestamp: "11:32 AM",
    assignedTeam: "Facilities Crew Beta",
    sop: {
      overview: "Facilities pipe burst requires immediate isolation of local main water valves, deployment of water vacuums, and rerouting wheelchair traffic to secondary pathway 2B.",
      steps: [
        "Locate and close sub-concourse water isolation valve B4.",
        "Dispatch janitorial team with wet vacuums and slip-hazard caution signs.",
        "Instruct Gate B volunteers to guide fans using wheelchairs to Access Pathway 2B.",
        "Verify water line repair status and reopen valves once leak is resolved."
      ],
      safetyNote: "High risk of electrical shock. Ensure no power panels are near standing water before dispatching facilities crew.",
      estimatedResolutionTime: "15-20 mins"
    }
  },
  {
    id: "inc-2",
    title: "Heavily Blocked Exit Flow at Gate C Turnstiles",
    description: "A large group is bottlenecked at Gate C due to dynamic ticketing scanner errors. Fans are growing restless, posing a safety crowd rush concern.",
    location: "Gate C (Turnstiles)",
    priority: "High",
    status: "In Progress",
    timestamp: "11:42 AM",
    assignedTeam: "Crowd Flow Marshals 4"
  },
  {
    id: "inc-3",
    title: "Medical Heat Exhaustion in South Stand Row 104",
    description: "A senior fan has suffered heat-stroke and is dizzy and dehydrated. Crowd density is high, blocking standard evacuation paths.",
    location: "South Stand (Row 104)",
    priority: "Critical",
    status: "Dispatched",
    timestamp: "11:46 AM",
    assignedTeam: "Medical Response Alpha",
    sop: {
      overview: "Immediate medical triage is required for heat-stroke patient. Crowd marshals must clear a fast pathway for the medical buggy stretcher.",
      steps: [
        "Deploy Medical Crew Alpha with ice packs, electrolytes, and mobile stretcher.",
        "Instruct Area Steward Row 104 to create a 2-meter physical buffer zone around the patient.",
        "Open Seating gate gate 12B to slide stretcher through directly from pitch-side.",
        "Triage patient, administer cooling packs, and transport to South Stand First Aid Station."
      ],
      safetyNote: "Prioritize patient hydration immediately and shield them from direct sun rays using secondary overhead umbrellas.",
      estimatedResolutionTime: "10 mins"
    }
  }
];

// Initial simulated logs
const INITIAL_LOGS: SimulatedLog[] = [
  { id: "log-1", timestamp: "11:30:12 AM", type: "system", message: "ArenaIntel 2026 Core Operations Monitor Online.", severity: "info" },
  { id: "log-2", timestamp: "11:32:05 AM", type: "sensor", message: "Gate B sensor reports flow throughput bottleneck. Target capacity reached.", severity: "warning" },
  { id: "log-3", timestamp: "11:33:40 AM", type: "volunteer", message: "Volunteer Carlos R: Reported a pipe leak near the concessions loop on Gate B.", severity: "warning" },
  { id: "log-4", timestamp: "11:42:15 AM", type: "sensor", message: "South Stand density index spikes to 86%. Crowds accumulating for halftime.", severity: "info" }
];

export default function App() {
  const [stadiumName, setStadiumName] = useState("SoFi Stadium (Los Angeles)");
  const [sectors, setSectors] = useState<StadiumSector[]>(INITIAL_SECTORS);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [logs, setLogs] = useState<SimulatedLog[]>(INITIAL_LOGS);
  
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [simulationSpeed, setSimulationSpeed] = useState<"Paused" | "Normal" | "High Flow">("Normal");
  const [loadingSOPId, setLoadingSOPId] = useState<string | null>(null);

  // Simulation loop: triggers realistic operational logs and sensor reports periodically
  useEffect(() => {
    if (simulationSpeed === "Paused") return;

    const intervalTime = simulationSpeed === "High Flow" ? 8000 : 16000;

    const MOCK_EVENTS = [
      {
        type: "sensor" as const,
        message: "North Stand zero-waste sensor reports: Compost organic bin reached 80% capacity.",
        severity: "info" as const,
        effect: () => {
          setSectors(prev => prev.map(s => s.id === "north-stand" ? { ...s, compostBinCount: s.compostBinCount + 1 } : s));
        }
      },
      {
        type: "sensor" as const,
        message: "Gate D shuttle log: Accessibility shuttle 4 has completed senior pickup from Terminal.",
        severity: "info" as const,
        effect: () => {
          setSectors(prev => prev.map(s => s.id === "gate-d" ? { ...s, accCount: Math.max(0, s.accCount - 1) } : s));
        }
      },
      {
        type: "volunteer" as const,
        message: "Volunteer Sarah K: Water refilling points in Pele Stand (East) are high flow with 100+ bottles saved.",
        severity: "info" as const,
        effect: () => {
          setSectors(prev => prev.map(s => s.id === "east-stand" ? { ...s, waterRefillCount: s.waterRefillCount + 3 } : s));
        }
      },
      {
        type: "sensor" as const,
        message: "Crowd Flow Sensor: Gate C access flow bottlenecks. Directing secondary flow to Gate D.",
        severity: "warning" as const,
        effect: () => {
          setSectors(prev => prev.map(s => {
            if (s.id === "gate-c") return { ...s, status: "Critical" as const, currentCrowd: Math.min(s.capacity, s.currentCrowd + 400) };
            if (s.id === "gate-d") return { ...s, currentCrowd: Math.min(s.capacity, s.currentCrowd + 300) };
            return s;
          }));
        }
      },
      {
        type: "ai" as const,
        message: "ArenaIntel Advisor: High crowd density detected in Diego Stand (South). Multilingual exit signage flashed.",
        severity: "info" as const,
        effect: () => {}
      }
    ];

    const timer = setInterval(() => {
      // Pick random simulated event
      const randomIndex = Math.floor(Math.random() * MOCK_EVENTS.length);
      const event = MOCK_EVENTS[randomIndex];

      const newLog: SimulatedLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: event.type,
        message: event.message,
        severity: event.severity
      };

      setLogs(prev => [newLog, ...prev.slice(0, 39)]);
      event.effect();
    }, intervalTime);

    return () => clearInterval(timer);
  }, [simulationSpeed]);

  const handleAddIncident = (newIncData: Omit<Incident, "id" | "timestamp">) => {
    const newInc: Incident = {
      ...newIncData,
      id: `inc-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setIncidents(prev => [newInc, ...prev]);

    // Push system operational log
    const newLog: SimulatedLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: "volunteer",
      message: `ALERT Logged: [${newInc.priority}] "${newInc.title}" at ${newInc.location}.`,
      severity: newInc.priority === "Critical" || newInc.priority === "High" ? "alert" : "warning"
    };
    setLogs(prev => [newLog, ...prev]);

    // Dynamically update the associated sector status
    const targetSectorId = getSectorIdFromLocation(newInc.location);
    if (targetSectorId) {
      setSectors(prev => prev.map(s => {
        if (s.id === targetSectorId) {
          const newStatus = newInc.priority === "Critical" ? "Critical" : "Dense";
          const newCrowd = Math.min(s.capacity, Math.round(s.currentCrowd * 1.15));
          return { ...s, status: newStatus as any, currentCrowd: newCrowd, accCount: s.accCount + 2 };
        }
        return s;
      }));
    }
  };

  const handleUpdateIncidentStatus = (id: string, status: IncidentStatus) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        // Trigger log
        const newLog: SimulatedLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: "system",
          message: `Incident Status Updated: "${inc.title}" is now "${status}".`,
          severity: status === "Resolved" ? "info" : "warning"
        };
        setLogs(prevLogs => [newLog, ...prevLogs]);

        // If Resolved, cool down sector status
        if (status === "Resolved") {
          const targetSectorId = getSectorIdFromLocation(inc.location);
          if (targetSectorId) {
            setTimeout(() => {
              setSectors(prevSecs => prevSecs.map(s => {
                if (s.id === targetSectorId) {
                  return { ...s, status: "Normal", currentCrowd: Math.max(1000, Math.round(s.currentCrowd * 0.85)) };
                }
                return s;
              }));
            }, 1000);
          }
        }

        return { ...inc, status };
      }
      return inc;
    }));
  };

  const handleGenerateSOP = async (id: string) => {
    const incidentToAnalyze = incidents.find(inc => inc.id === id);
    if (!incidentToAnalyze) return;

    setLoadingSOPId(id);

    try {
      const systemInstruction = `You are "ArenaIntel Tactical Ops Commander", the operational intelligence AI for stadium emergency, crowd management, and sustainability at the 2026 FIFA World Cup.
Your goal is to analyze stadium incident details and output a structured Standard Operating Procedure (SOP) for stadium staff and volunteers.
You MUST output your response in strict JSON format inside this exact structure:
{
  "overview": "Brief summary of the operational/safety impact of this incident at this location.",
  "steps": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "safetyNote": "A critical safety hazard warning or tactical check.",
  "estimatedResolutionTime": "e.g. 10-15 minutes or 5-10 minutes"
}
Ensure the action steps are highly specific to the World Cup context (e.g. mention notifying security, deploying green composting guides, or utilizing wheelchair pathways).
Do NOT include any markdown code blocks, backticks, or wrappers around the JSON. Only return the raw JSON string.`;

      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: `Generate a tactical SOP for the following incident at SoFi Stadium:
Title: ${incidentToAnalyze.title}
Location: ${incidentToAnalyze.location}
Description: ${incidentToAnalyze.description}
Steward Team Assigned: ${incidentToAnalyze.assignedTeam}`,
          systemInstruction,
          responseMimeType: "application/json"
        })
      });

      if (!response.ok) {
        throw new Error("Failed to contact the server-side SOP analyst.");
      }

      const data = await response.json();
      const parsedSop = JSON.parse(data.text);

      setIncidents(prev => prev.map(inc => {
        if (inc.id === id) {
          return { ...inc, sop: parsedSop };
        }
        return inc;
      }));

      // Add intelligence log
      const newLog: SimulatedLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: "ai",
        message: `GenAI SOP formulated for "${incidentToAnalyze.title}". Assigned to ${incidentToAnalyze.assignedTeam}.`,
        severity: "info"
      };
      setLogs(prev => [newLog, ...prev]);

    } catch (err) {
      console.error("Failed to generate or parse SOP", err);
      // Fallback SOP to handle fallback seamlessly
      const fallbackSop = {
        overview: "Operational safety protocol initiated in response to the reported situation.",
        steps: [
          "Deploy designated safety stewards to establish a local exclusion boundary.",
          "Inform the area supervisor and coordinate with nearby stadium volunteers.",
          "Redirect senior and disabled visitors to the closest unobstructed accessible route.",
          "Notify emergency response teams if situation changes or escalates."
        ],
        safetyNote: "Assess active crowd density before initiating repair or evacuation protocols.",
        estimatedResolutionTime: "10-15 minutes"
      };

      setIncidents(prev => prev.map(inc => {
        if (inc.id === id) {
          return { ...inc, sop: fallbackSop };
        }
        return inc;
      }));
    } finally {
      setLoadingSOPId(null);
    }
  };

  const getSectorIdFromLocation = (location: string): string | null => {
    const loc = location.toLowerCase();
    if (loc.includes("west stand")) return "west-stand";
    if (loc.includes("east stand")) return "east-stand";
    if (loc.includes("north stand")) return "north-stand";
    if (loc.includes("south stand")) return "south-stand";
    if (loc.includes("gate a")) return "gate-a";
    if (loc.includes("gate b")) return "gate-b";
    if (loc.includes("gate c")) return "gate-c";
    if (loc.includes("gate d")) return "gate-d";
    return null;
  };

  const handleSelectSector = (id: string | null) => {
    setSelectedSectorId(id);
  };

  const handleTriggerIncidentAtLocation = (locationName: string) => {
    // Jump filter to that sector if it matches
    const sectorId = getSectorIdFromLocation(locationName);
    if (sectorId) {
      setSelectedSectorId(sectorId);
    }
  };

  const handleToggleSimulationSpeed = () => {
    setSimulationSpeed(prev => {
      if (prev === "Paused") return "Normal";
      if (prev === "Normal") return "High Flow";
      return "Paused";
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* GLOBAL HEADER */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand/Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-950/30">
            <Trophy className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-lg tracking-tight text-slate-100 uppercase">
                ArenaIntel <span className="text-emerald-400">2026</span>
              </h1>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-bold tracking-wide uppercase animate-pulse">
                GenAI Operations
              </span>
            </div>
            <p className="text-[11px] text-slate-400">FIFA World Cup 2026™ Stadium Operations Control Center</p>
          </div>
        </div>

        {/* Global Selectors & Status */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Active Stadium Switcher */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={stadiumName}
              onChange={(e) => setStadiumName(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer font-medium"
            >
              <option value="SoFi Stadium (Los Angeles)" className="bg-slate-950">SoFi Stadium (Los Angeles)</option>
              <option value="MetLife Stadium (New York/NJ)" className="bg-slate-950">MetLife Stadium (New York/NJ)</option>
              <option value="Azteca Stadium (Mexico City)" className="bg-slate-950">Estadio Azteca (Mexico City)</option>
              <option value="BC Place (Vancouver)" className="bg-slate-950">BC Place (Vancouver)</option>
            </select>
          </div>

          {/* Time indicator */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-[11px] text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>UTC-7 LIVE</span>
          </div>

          {/* Network Link status */}
          <div className="flex items-center gap-1.5 bg-emerald-950/30 border border-emerald-900/60 px-3 py-1.5 rounded-xl text-emerald-400 font-medium">
            <Wifi className="w-3.5 h-3.5 animate-pulse" />
            <span>Systems Online</span>
          </div>
        </div>
      </header>

      {/* BODY CONTENT GRID */}
      <main className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1700px] mx-auto w-full">
        {/* TOP LEVEL DYNAMIC METRICS BAR */}
        <MetricsGrid 
          sectors={sectors} 
          incidents={incidents} 
          simulationSpeed={simulationSpeed} 
          onToggleSpeed={handleToggleSimulationSpeed} 
        />

        {/* MAIN PANEL CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT CONTAINER: MULTILINGUAL FAN ASSISTANT (40% width) */}
          <div className="col-span-1 lg:col-span-5 space-y-6">
            <FanConcierge stadiumName={stadiumName} />

            {/* QUICK AI OPERATIONS ADVISOR */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden shadow-xl">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
              <h3 className="font-display font-semibold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Real-Time GenAI Strategic Advice
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                "Based on current stadium sensor loads, Gate B capacity is approaching Critical limits. 
                We recommend stadium staff deploy composting marshals to West Stand concourses to guide high food flows, 
                and instruct Gate B ticketing stewards to coordinate with Metro transit shuttles to pulse entry flows."
              </p>
            </div>
          </div>

          {/* RIGHT CONTAINER: MAP & INCIDENT COMMANDER (60% width) */}
          <div className="col-span-1 lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stadium Map */}
              <div className="md:col-span-1">
                <StadiumMap
                  sectors={sectors}
                  activeIncidents={incidents}
                  selectedSectorId={selectedSectorId}
                  onSelectSector={handleSelectSector}
                  onTriggerIncidentAtLocation={handleTriggerIncidentAtLocation}
                />
              </div>

              {/* Seating Sector Info List */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 h-full flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-semibold text-sm text-slate-200 flex items-center gap-1.5 mb-2">
                    <Activity className="w-4 h-4 text-slate-400" />
                    Arena Sector Sensor Data
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">Select sectors on the interactive map to filter.</p>
                  
                  <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                    {sectors
                      .filter(s => selectedSectorId === null || s.id === selectedSectorId)
                      .map((sector) => (
                        <div 
                          key={sector.id} 
                          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                            sector.status === "Critical" 
                              ? "bg-red-950/20 border-red-900/40 text-red-200" 
                              : sector.status === "Dense" 
                                ? "bg-amber-950/15 border-amber-900/40 text-amber-200" 
                                : "bg-slate-950/40 border-slate-800/80 text-slate-300"
                          }`}
                        >
                          <div>
                            <span className="font-semibold block">{sector.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Capacity: {sector.currentCrowd.toLocaleString()} / {sector.capacity.toLocaleString()} seats
                            </span>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase ${
                              sector.status === "Critical" ? "text-red-400" : sector.status === "Dense" ? "text-amber-400" : "text-emerald-400"
                            }`}>
                              {sector.status}
                            </span>
                            <div className="text-[10px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-400">
                              {((sector.currentCrowd / sector.capacity) * 100).toFixed(0)}%
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>

                {selectedSectorId && (
                  <button
                    onClick={() => setSelectedSectorId(null)}
                    className="w-full mt-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-all font-medium cursor-pointer"
                  >
                    Reset Filter View (Show All {sectors.length} Sectors)
                  </button>
                )}
              </div>
            </div>

            {/* Tactical Incident Commander & SOP logs */}
            <IncidentCommander
              incidents={incidents}
              onAddIncident={handleAddIncident}
              onUpdateStatus={handleUpdateIncidentStatus}
              onGenerateSOP={handleGenerateSOP}
              loadingSOPId={loadingSOPId}
            />
          </div>
        </div>

        {/* BOTTOM SECTION: REAL-TIME OPERATIONAL LOGSTREAM */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800/60">
            <span className="font-display font-semibold text-xs tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping inline-block"></span>
              Live Arena Sensor & Volunteer Dispatch Logstream
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Showing last {logs.length} operations events</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-h-[140px] overflow-y-auto font-mono text-[11px] leading-relaxed">
            {logs.length === 0 ? (
              <div className="col-span-4 text-center text-slate-600 py-4">Waiting for sensor alerts...</div>
            ) : (
              logs.map((log) => (
                <div 
                  key={log.id} 
                  className={`p-2.5 rounded border ${
                    log.severity === "alert" 
                      ? "bg-red-950/35 border-red-900/40 text-red-300" 
                      : log.severity === "warning" 
                        ? "bg-amber-950/20 border-amber-900/40 text-amber-300" 
                        : "bg-slate-950/50 border-slate-850 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-800/40 pb-1 mb-1 text-[9px] uppercase font-bold tracking-wider">
                    <span className="text-slate-400">{log.timestamp}</span>
                    <span className={
                      log.type === "sensor" ? "text-sky-400" : log.type === "volunteer" ? "text-amber-400" : log.type === "ai" ? "text-emerald-400" : "text-slate-400"
                    }>
                      [{log.type}]
                    </span>
                  </div>
                  <p className="line-clamp-2">{log.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 mt-10 p-6 text-center text-xs text-slate-500">
        <p>© FIFA World Cup 2026™ ArenaIntel Operations Suite. Powered by Server-Side Gemini Generative AI.</p>
        <p className="mt-1 font-mono text-[10px]">Version 1.4.0 (aistudio-build) • Los Angeles SoFi Center</p>
      </footer>
    </div>
  );
}
