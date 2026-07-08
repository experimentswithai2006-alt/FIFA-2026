export type PriorityLevel = "Low" | "Medium" | "High" | "Critical";

export type IncidentStatus = "Pending" | "Dispatched" | "In Progress" | "Resolved";

export interface Incident {
  id: string;
  title: string;
  description: string;
  location: string;
  priority: PriorityLevel;
  status: IncidentStatus;
  timestamp: string;
  assignedTeam: string;
  sop?: {
    overview: string;
    steps: string[];
    safetyNote: string;
    estimatedResolutionTime: string;
  };
}

export interface StadiumSector {
  id: string;
  name: string;
  capacity: number;
  currentCrowd: number;
  status: "Normal" | "Dense" | "Critical";
  accCount: number; // Accessibility assistance requests
  compostBinCount: number;
  waterRefillCount: number;
  type: "North" | "South" | "East" | "West" | "Field" | "Gate";
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  language?: string;
  isSimulatedAudio?: boolean;
}

export interface SimulatedLog {
  id: string;
  timestamp: string;
  type: "sensor" | "volunteer" | "ai" | "system";
  message: string;
  severity: "info" | "warning" | "alert";
}
