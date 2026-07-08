import React, { useState } from "react";
import { Incident, PriorityLevel, IncidentStatus } from "../types";
import { 
  AlertTriangle, Play, CheckCircle2, ShieldAlert, Plus, Users, Clock, AlertCircle, Sparkles, ClipboardList, Eye
} from "lucide-react";

interface IncidentCommanderProps {
  incidents: Incident[];
  onAddIncident: (incident: Omit<Incident, "id" | "timestamp">) => void;
  onUpdateStatus: (id: string, status: IncidentStatus) => void;
  onGenerateSOP: (id: string) => Promise<void>;
  loadingSOPId: string | null;
}

export default function IncidentCommander({
  incidents,
  onAddIncident,
  onUpdateStatus,
  onGenerateSOP,
  loadingSOPId
}: IncidentCommanderProps) {
  const [activeTab, setActiveTab] = useState<"logs" | "report">("logs");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(incidents[0] || null);
  
  // New Incident Form State
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("West Stand (Block 202)");
  const [priority, setPriority] = useState<PriorityLevel>("Medium");
  const [description, setDescription] = useState("");
  const [assignedTeam, setAssignedTeam] = useState("Facilities Crew Beta");

  const LOCATIONS = [
    "West Stand (Block 202)",
    "East Stand (Block 112)",
    "North Stand (General Access)",
    "South Stand (Row 104)",
    "Gate A (Main Entry Loop)",
    "Gate B (Concourse Hub)",
    "Gate C (Turnstiles)",
    "Gate D (Transit Terminal)",
    "Field Side Pitch"
  ];

  const TEAMS = [
    "Facilities Crew Beta",
    "Medical Response Alpha",
    "Crowd Flow Marshals 4",
    "Green Sustainability Marshals",
    "Steward Supervisor Crew"
  ];

  const getPriorityColor = (level: PriorityLevel) => {
    switch (level) {
      case "Critical": return "bg-red-500/15 text-red-400 border-red-500/30";
      case "High": return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "Medium": return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
      default: return "bg-sky-500/15 text-sky-400 border-sky-500/30";
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case "Resolved": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "In Progress": return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "Dispatched": return "bg-sky-500/10 text-sky-400 border-sky-500/30";
      default: return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onAddIncident({
      title,
      location,
      priority,
      description,
      status: "Pending",
      assignedTeam
    });

    // Reset Form
    setTitle("");
    setDescription("");
    setActiveTab("logs");
  };

  const handleTriggerSOP = async (inc: Incident) => {
    await onGenerateSOP(inc.id);
    // Refresh currently selected incident state
    const updated = incidents.find(i => i.id === inc.id);
    if (updated) {
      setSelectedIncident(updated);
    }
  };

  // Keep selected incident synchronized with parent state updates (e.g., SOP generation or status transitions)
  const currentIncident = incidents.find(i => i.id === selectedIncident?.id) || selectedIncident;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col h-[550px] overflow-hidden shadow-2xl">
      {/* Top Banner Navigation */}
      <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm text-slate-100 flex items-center gap-1.5">
              Incident SOP Commander
              <span className="text-[10px] bg-red-500/25 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-mono">STADIUM HOST</span>
            </h3>
            <p className="text-[11px] text-slate-400">GenAI-assisted standard operating procedures</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-3 py-1 text-xs rounded-md transition-all cursor-pointer ${
              activeTab === "logs" 
                ? "bg-amber-600 text-white font-medium" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Active Alerts ({incidents.filter(i => i.status !== "Resolved").length})
          </button>
          <button
            onClick={() => setActiveTab("report")}
            className={`px-3 py-1 text-xs rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === "report" 
                ? "bg-amber-600 text-white font-medium" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Report Issue
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {activeTab === "logs" ? (
          <>
            {/* Left side: Incident Logs list */}
            <div className="w-1/2 border-r border-slate-800/60 overflow-y-auto p-3 space-y-2 bg-slate-950/20">
              {incidents.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">No current incidents logged. Stadium clear.</div>
              ) : (
                incidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                      currentIncident?.id === inc.id
                        ? "bg-slate-800/80 border-amber-500/50 shadow-md"
                        : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <span className={`text-[9px] font-bold border rounded px-1.5 py-0.5 tracking-wider uppercase ${getPriorityColor(inc.priority)}`}>
                        {inc.priority}
                      </span>
                      <span className={`text-[9px] font-mono border rounded px-1.5 py-0.5 ${getStatusBadge(inc.status)}`}>
                        {inc.status}
                      </span>
                    </div>
                    <h4 className="font-display font-semibold text-xs text-slate-200 line-clamp-1 mb-1">{inc.title}</h4>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {inc.location} • {inc.timestamp}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Right side: Selected Incident Detail & GenAI SOP */}
            <div className="w-1/2 overflow-y-auto p-4 flex flex-col justify-between bg-slate-950/45">
              {currentIncident ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Active Command Detail</span>
                      <span className="text-[10px] text-amber-400 font-medium">Assigned: {currentIncident.assignedTeam}</span>
                    </div>
                    <h3 className="font-display font-bold text-sm text-slate-100 mt-1">{currentIncident.title}</h3>
                    <p className="text-xs text-slate-300 bg-slate-900/80 border border-slate-800/60 p-2.5 rounded-lg mt-2 leading-relaxed">
                      "{currentIncident.description}"
                    </p>
                  </div>

                  {/* Operational Controls */}
                  <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Incident Flow Controls</span>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <button
                        onClick={() => onUpdateStatus(currentIncident.id, "Dispatched")}
                        disabled={currentIncident.status === "Resolved"}
                        className="py-1.5 bg-sky-950/40 text-sky-400 hover:bg-sky-900/40 border border-sky-900/60 disabled:opacity-40 rounded-lg text-[10px] font-medium transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Users className="w-3 h-3" /> Dispatch
                      </button>
                      <button
                        onClick={() => onUpdateStatus(currentIncident.id, "In Progress")}
                        disabled={currentIncident.status === "Resolved"}
                        className="py-1.5 bg-amber-950/40 text-amber-400 hover:bg-amber-900/40 border border-amber-900/60 disabled:opacity-40 rounded-lg text-[10px] font-medium transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3" /> Progress
                      </button>
                      <button
                        onClick={() => onUpdateStatus(currentIncident.id, "Resolved")}
                        disabled={currentIncident.status === "Resolved"}
                        className="py-1.5 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/40 border border-emerald-900/60 disabled:opacity-40 rounded-lg text-[10px] font-medium transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Resolve
                      </button>
                    </div>
                  </div>

                  {/* GenAI SOP Box */}
                  <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
                    <div className="bg-slate-900 px-3 py-2.5 border-b border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <ClipboardList className="w-4 h-4 text-amber-500" />
                        AI Standard Operating Procedure
                      </span>
                      {!currentIncident.sop && (
                        <button
                          onClick={() => handleTriggerSOP(currentIncident)}
                          disabled={loadingSOPId !== null}
                          className="px-2.5 py-1 bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 text-[10px] font-bold rounded-md hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          {loadingSOPId === currentIncident.id ? "Analyzing..." : "Generate"}
                        </button>
                      )}
                    </div>

                    <div className="p-3 text-xs">
                      {loadingSOPId === currentIncident.id ? (
                        <div className="flex flex-col items-center justify-center py-6 text-slate-400 gap-2">
                          <Clock className="w-5 h-5 text-amber-500 animate-spin" />
                          <span className="text-[11px] font-mono text-center">Gemini generating tactical incident protocols...</span>
                        </div>
                      ) : currentIncident.sop ? (
                        <div className="space-y-3">
                          <div>
                            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Acoustic Impact Overview</span>
                            <p className="text-slate-300 mt-1 leading-relaxed text-[11px]">{currentIncident.sop.overview}</p>
                          </div>
                          
                          <div>
                            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Tactical Action Steps</span>
                            <ul className="list-decimal list-inside space-y-1.5 text-slate-300 mt-1 text-[11px]">
                              {currentIncident.sop.steps.map((step, idx) => (
                                <li key={idx} className="leading-normal">{step}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-[10px]">
                            <span className="text-amber-400 font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Safety: {currentIncident.sop.safetyNote}
                            </span>
                            <span className="text-slate-400 bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded font-mono">
                              ETA: {currentIncident.sop.estimatedResolutionTime}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-slate-500">
                          Click "Generate" to trigger server-side Gemini intelligence and formulate real-time SOP steps.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-slate-500 text-xs">Select an incident log from the left side.</div>
              )}
            </div>
          </>
        ) : (
          /* Report New Incident Form */
          <form onSubmit={handleSubmit} className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/30">
            <h3 className="font-display font-semibold text-xs text-slate-300 uppercase tracking-wider">Report Operational Stadium Incident</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Incident Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Turnstile 3 ticket scanner offline"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Location Zone</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc} className="bg-slate-950 text-slate-200">{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Operational Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="Low">Low (Minor Facilities / Clean up)</option>
                  <option value="Medium">Medium (General Maintenance / Queue Flow)</option>
                  <option value="High">High (Technical Failures / Safety Hazard)</option>
                  <option value="Critical">Critical (Immediate Medical / Security dispatch)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Assigned Steward Team</label>
                <select
                  value={assignedTeam}
                  onChange={(e) => setAssignedTeam(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  {TEAMS.map((t) => (
                    <option key={t} value={t} className="bg-slate-950 text-slate-200">{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Incident Notes & Specifics</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail what is happening. AI SOP will leverage these notes to draft step-by-step resolution pathways."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs tracking-wider uppercase transition-all shadow-lg cursor-pointer"
            >
              Submit Operations Incident Alert
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
