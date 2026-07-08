import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { 
  MessageSquare, Send, Globe, Sparkles, Volume2, Mic, MicOff, AlertCircle, RefreshCw, Landmark, HelpingHand, Leaf, Navigation
} from "lucide-react";

interface FanConciergeProps {
  stadiumName: string;
}

const PRESET_FAQS = [
  {
    icon: Navigation,
    label: "Gate Navigation",
    query: "I am near Section 214 in the West Stand. Which is the nearest exit gate, and where is the closest water refilling station?",
    theme: "text-blue-400 bg-blue-950/40 border-blue-900/40"
  },
  {
    icon: HelpingHand,
    label: "Accessibility Ramps",
    query: "My elderly father needs wheelchair assistance and a sensory room. Where can we request this, and are there designated accessible pathways from Gate A?",
    theme: "text-amber-400 bg-amber-950/40 border-amber-900/40"
  },
  {
    icon: Leaf,
    label: "Zero-Waste Bin Guide",
    query: "I have a compostable food tray and a plastic beverage cup. Which waste bins do they go in, and what is the stadium zero-waste target?",
    theme: "text-emerald-400 bg-emerald-950/40 border-emerald-900/40"
  },
  {
    icon: Landmark,
    label: "Metro Transit & Crowds",
    query: "The game ended and the main crowd exit is heavily bottlenecked. What is the alternative transit route to the Metro station, and are rideshares operating?",
    theme: "text-purple-400 bg-purple-950/40 border-purple-900/40"
  }
];

const LANGUAGES = [
  { code: "en", name: "English 🇬🇧" },
  { code: "es", name: "Español 🇪🇸" },
  { code: "fr", name: "Français 🇫🇷" },
  { code: "pt", name: "Português 🇵🇹" },
  { code: "ar", name: "العربية 🇸🇦" },
  { code: "de", name: "Deutsch 🇩🇪" },
  { code: "ko", name: "한국어 🇰🇷" },
  { code: "ja", name: "日本語 🇯🇵" }
];

const NOISY_VOICE_QUERIES = [
  "Excuse me, it is so loud here! Where is the nearest compost bin for my stadium hotdog plate near the West Stand?",
  "Hola! ¿Dónde están las rampas de accesibilidad y sillas de ruedas de asistencia en la entrada principal?",
  "Hey, the line at Gate C is completely blocked! Is there an open shuttle or secondary entrance we can walk to?"
];

export default function FanConcierge({ stadiumName }: FanConciergeProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: `Hello! Welcome to SoFi Stadium. I am your AI Fan & Volunteer Concierge. Ask me anything about seat navigation, accessibility assistance, zero-waste composting, or transit flows. Try typing in your preferred language or select a preset query!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceQueryIndex, setVoiceQueryIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (text: string, isSimulatedAudio = false) => {
    if (!text.trim()) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSimulatedAudio
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const systemInstruction = `You are "ArenaIntel Multi-lingual Fan Concierge", the smart GenAI voice & text assistant for the FIFA World Cup 2026 stadium events (specifically at ${stadiumName}).
Your goal is to assist fans, volunteers, and operational staff with navigation, accessibility support, transit flow, and zero-waste sustainability practices.
Keep your answers brief, friendly, structured, and action-oriented.
Provide concrete stadium advice (e.g., recommend composting compostable trays, state that water bottles must be empty upon entry but can be refilled at water stations in every stand, and guide people to designated accessible ramps near Gate A and C).
You MUST respond fluently in the language of the user's message (e.g., if Spanish, respond in Spanish. If English, respond in English).
Keep explanations concise and formatted nicely with bullet points where appropriate. Max 3 concise bullet points.`;

      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: text,
          systemInstruction
        })
      });

      if (!response.ok) {
        throw new Error("Could not contact the server-side Gemini service.");
      }

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        sender: "assistant",
        text: data.text || "I was unable to formulate a response. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: selectedLang
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setError("AI connection issue. Please check the Secrets panel for GEMINI_API_KEY.");
      
      // Fallback response for demonstration
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-assistant-fallback`,
        sender: "assistant",
        text: `[Demo Mode Standby] Gemini API is currently offline. Here is typical operations advice for "${text}":\n\n• **Accessibility**: Head to Gate A or C for primary wheelchair pathways. Volunteers are active with blue vests.\n• **Sustainability**: Toss items with compost labels in green bins. Heavy plastic cups go to sorting racks.\n• **Transit**: Metro shuttle lines are available outside Gate D. Please expect 15 minutes waiting time.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslateAll = async (targetLangCode: string) => {
    const targetLangName = LANGUAGES.find(l => l.code === targetLangCode)?.name || targetLangCode;
    setSelectedLang(targetLangCode);
    setLoading(true);
    setError(null);

    // Translate the last assistant message
    const lastAssistantIndex = [...messages].reverse().findIndex(m => m.sender === "assistant");
    if (lastAssistantIndex === -1) {
      setLoading(false);
      return;
    }

    const actualIndex = messages.length - 1 - lastAssistantIndex;
    const messageToTranslate = messages[actualIndex].text;

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Translate the following World Cup stadium advice perfectly into ${targetLangName}. Keep formatting (bullet points, bold text) intact. Only output the translated text:\n\n"${messageToTranslate}"`,
          systemInstruction: "You are a professional multilingual translator. Translate exactly with professional sports context."
        })
      });

      if (!response.ok) throw new Error();
      const data = await response.json();

      setMessages(prev => {
        const copy = [...prev];
        copy[actualIndex] = {
          ...copy[actualIndex],
          text: data.text || copy[actualIndex].text,
          language: targetLangCode
        };
        return copy;
      });
    } catch (err) {
      setError("Translation failed. Simulating local translation.");
      // Simulated translation fallback
      setMessages(prev => {
        const copy = [...prev];
        copy[actualIndex] = {
          ...copy[actualIndex],
          text: `[Translated to ${targetLangCode}] ${copy[actualIndex].text}`,
          language: targetLangCode
        };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  };

  const simulateSpeechInput = () => {
    setIsRecording(true);
    const mockAudioPrompt = NOISY_VOICE_QUERIES[voiceQueryIndex];
    
    // Cycle queries
    setVoiceQueryIndex((prev) => (prev + 1) % NOISY_VOICE_QUERIES.length);

    setTimeout(() => {
      setIsRecording(false);
      handleSendMessage(mockAudioPrompt, true);
    }, 2800);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col h-[550px] overflow-hidden shadow-2xl relative">
      {/* Header Panel */}
      <div className="bg-gradient-to-r from-emerald-950/60 to-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm text-slate-100 flex items-center gap-1.5">
              Multilingual Fan Concierge
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </h3>
            <p className="text-[11px] text-slate-400">GenAI support for World Cup fans & staff</p>
          </div>
        </div>

        {/* Quick Translation Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <select 
            value={selectedLang} 
            onChange={(e) => handleTranslateAll(e.target.value)}
            className="bg-transparent text-[11px] text-slate-300 focus:outline-none cursor-pointer font-medium"
          >
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code} className="bg-slate-950 text-slate-200">
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preset Question Triggers */}
      <div className="p-3 bg-slate-950/80 border-b border-slate-800/40 grid grid-cols-2 gap-2">
        {PRESET_FAQS.map((faq, i) => {
          const Icon = faq.icon;
          return (
            <button
              key={i}
              onClick={() => handleSendMessage(faq.query)}
              className={`p-2 rounded-lg border text-left text-xs transition-all hover:brightness-125 flex flex-col gap-1 cursor-pointer ${faq.theme}`}
            >
              <span className="font-bold flex items-center gap-1.5 text-[10px] tracking-wider uppercase">
                <Icon className="w-3.5 h-3.5" />
                {faq.label}
              </span>
              <span className="line-clamp-1 text-slate-300 text-[10px]">{faq.query}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/20">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs relative ${
                msg.sender === "user" 
                  ? "bg-emerald-600 text-slate-100 rounded-tr-none" 
                  : "bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none"
              }`}
            >
              {/* Optional simulated audio flag */}
              {msg.isSimulatedAudio && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-200 mb-1 tracking-wider uppercase">
                  <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                  Simulated Voice Input
                </div>
              )}

              {/* Message text */}
              <div className="whitespace-pre-line leading-relaxed font-sans">{msg.text}</div>
              
              {/* Timestamp */}
              <div className={`text-[9px] mt-1.5 text-right ${msg.sender === "user" ? "text-emerald-200" : "text-slate-400"}`}>
                {msg.timestamp}
                {msg.language && msg.language !== "en" && ` • Translated to ${msg.language.toUpperCase()}`}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              <span className="text-[11px] text-slate-400 font-mono">Gemini is thinking...</span>
            </div>
          </div>
        )}

        {/* Audio Waveform Simulation overlay */}
        {isRecording && (
          <div className="bg-emerald-950/90 border border-emerald-500/30 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 animate-pulse">
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-red-500 animate-bounce" />
              STADIUM ACOUSTIC SIMULATOR ACTIVE
            </div>
            <div className="flex items-end justify-center gap-1 h-8 px-4 w-full">
              {[0.4, 0.8, 0.5, 0.9, 0.3, 0.7, 0.4, 0.9, 0.6, 0.8, 0.5, 0.3, 0.7].map((height, idx) => (
                <span 
                  key={idx} 
                  className="w-1.5 bg-emerald-400 rounded-full animate-bounce"
                  style={{ 
                    height: `${height * 100}%`,
                    animationDelay: `${idx * 0.1}s`,
                    animationDuration: '0.8s'
                  }}
                ></span>
              ))}
            </div>
            <span className="text-[10px] text-slate-300 font-mono italic">
              "Capturing noisy acoustic background stream..."
            </span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-red-950/60 border-t border-red-900 px-3 py-2 text-[10px] text-red-300 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input controls */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2 items-center"
      >
        {/* Stadium Mic simulator */}
        <button
          type="button"
          onClick={simulateSpeechInput}
          title="Simulate World Cup noisy walkie-talkie audio query"
          className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-emerald-400 transition-all cursor-pointer flex-shrink-0"
        >
          <Mic className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask about gates, transit, zero-waste, wheelchair Ramps..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-xl transition-all cursor-pointer flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
