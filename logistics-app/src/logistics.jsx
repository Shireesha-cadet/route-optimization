import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";

// ─── DATA ────────────────────────────────────────────────────────────────────

const CITIES = {
  NYC: { name: "New York", lat: 40.71, lng: -74.01, x: 718, y: 178 },
  BOS: { name: "Boston", lat: 42.36, lng: -71.06, x: 758, y: 138 },
  PHI: { name: "Philadelphia", lat: 39.95, lng: -75.17, x: 698, y: 218 },
  DC:  { name: "Washington DC", lat: 38.91, lng: -77.04, x: 688, y: 258 },
  ATL: { name: "Atlanta", lat: 33.75, lng: -84.39, x: 618, y: 378 },
  CHI: { name: "Chicago", lat: 41.88, lng: -87.63, x: 538, y: 188 },
  DET: { name: "Detroit", lat: 42.33, lng: -83.05, x: 578, y: 168 },
  CLV: { name: "Cleveland", lat: 41.50, lng: -81.69, x: 628, y: 178 },
  MIA: { name: "Miami", lat: 25.76, lng: -80.19, x: 678, y: 458 },
  DAL: { name: "Dallas", lat: 32.78, lng: -96.80, x: 468, y: 378 },
  HOU: { name: "Houston", lat: 29.76, lng: -95.37, x: 448, y: 418 },
  LA:  { name: "Los Angeles", lat: 34.05, lng: -118.24, x: 158, y: 318 },
  SF:  { name: "San Francisco", lat: 37.77, lng: -122.42, x: 98,  y: 258 },
  SEA: { name: "Seattle", lat: 47.61, lng: -122.33, x: 98,  y: 138 },
  DEN: { name: "Denver", lat: 39.74, lng: -104.99, x: 318, y: 268 },
  PHX: { name: "Phoenix", lat: 33.45, lng: -112.07, x: 218, y: 348 },
};

const INIT_SHIPMENTS = [
  { id: "SH-001", origin: "NYC", destination: "BOS", window: "08:00–12:00", priority: "High",   weight: 450,  status: "Pending"    },
  { id: "SH-002", origin: "CHI", destination: "DET", window: "09:00–14:00", priority: "Medium", weight: 800,  status: "In Transit" },
  { id: "SH-003", origin: "LA",  destination: "SF",  window: "07:00–11:00", priority: "High",   weight: 320,  status: "Pending"    },
  { id: "SH-004", origin: "DAL", destination: "HOU", window: "10:00–15:00", priority: "Low",    weight: 1200, status: "Pending"    },
  { id: "SH-005", origin: "MIA", destination: "ATL", window: "08:00–16:00", priority: "Medium", weight: 650,  status: "Delivered"  },
  { id: "SH-006", origin: "SEA", destination: "DEN", window: "06:00–12:00", priority: "High",   weight: 290,  status: "In Transit" },
  { id: "SH-007", origin: "PHI", destination: "DC",  window: "11:00–17:00", priority: "Low",    weight: 540,  status: "Pending"    },
  { id: "SH-008", origin: "SF",  destination: "LA",  window: "09:00–13:00", priority: "Medium", weight: 720,  status: "Pending"    },
  { id: "SH-009", origin: "BOS", destination: "NYC", window: "07:00–10:00", priority: "High",   weight: 380,  status: "In Transit" },
  { id: "SH-010", origin: "DEN", destination: "PHX", window: "08:00–14:00", priority: "Medium", weight: 910,  status: "Pending"    },
  { id: "SH-011", origin: "DC",  destination: "ATL", window: "09:00–15:00", priority: "Low",    weight: 670,  status: "Pending"    },
  { id: "SH-012", origin: "HOU", destination: "DAL", window: "10:00–16:00", priority: "High",   weight: 430,  status: "Delivered"  },
];

const INIT_VEHICLES = [
  { id: "VH-001", type: "Heavy Truck",  capacity: 5000, fuel: 8.2,  location: "NYC", status: "Available",  util: 74 },
  { id: "VH-002", type: "Medium Van",   capacity: 2000, fuel: 12.5, location: "CHI", status: "In Transit", util: 88 },
  { id: "VH-003", type: "Heavy Truck",  capacity: 5000, fuel: 7.9,  location: "LA",  status: "Available",  util: 61 },
  { id: "VH-004", type: "Light Van",    capacity: 1000, fuel: 18.0, location: "DAL", status: "Maintenance",util: 0  },
  { id: "VH-005", type: "Medium Van",   capacity: 2000, fuel: 13.1, location: "MIA", status: "Available",  util: 55 },
  { id: "VH-006", type: "Heavy Truck",  capacity: 5000, fuel: 8.5,  location: "SEA", status: "In Transit", util: 92 },
  { id: "VH-007", type: "Light Van",    capacity: 1000, fuel: 17.5, location: "BOS", status: "Available",  util: 43 },
  { id: "VH-008", type: "Medium Van",   capacity: 2000, fuel: 12.8, location: "DEN", status: "Available",  util: 67 },
];

const TREND_DATA = [
  { month: "Jan", current: 4200, optimized: 3100 },
  { month: "Feb", current: 3900, optimized: 2850 },
  { month: "Mar", current: 4500, optimized: 3200 },
  { month: "Apr", current: 4100, optimized: 2950 },
  { month: "May", current: 4800, optimized: 3400 },
  { month: "Jun", current: 5100, optimized: 3600 },
];

const COST_DATA = [
  { month: "Jan", current: 12400, optimized: 8900 },
  { month: "Feb", current: 11200, optimized: 8100 },
  { month: "Mar", current: 13500, optimized: 9400 },
  { month: "Apr", current: 12100, optimized: 8700 },
  { month: "May", current: 14200, optimized: 9900 },
  { month: "Jun", current: 15100, optimized: 10500 },
];

// ─── VRP ENGINE ───────────────────────────────────────────────────────────────

function haverDist(c1, c2) {
  const R = 3959, toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(c2.lat - c1.lat), dLng = toRad(c2.lng - c1.lng);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(c1.lat))*Math.cos(toRad(c2.lat))*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function optimizeRoutes(shipments, vehicles, trafficFactor = 1.0) {
  const active = vehicles.filter(v => v.status !== "Maintenance");
  const pending = shipments.filter(s => s.status !== "Delivered");
  const order = { High: 0, Medium: 1, Low: 2 };
  const sorted = [...pending].sort((a,b) => order[a.priority] - order[b.priority]);
  return active.map(vehicle => {
    const assigned = [], usedIds = new Set();
    let load = 0;
    sorted.forEach(s => {
      if (!usedIds.has(s.id) && load + s.weight <= vehicle.capacity) {
        assigned.push(s); usedIds.add(s.id); load += s.weight;
      }
    });
    const totalDist = assigned.reduce((sum, s) => sum + haverDist(CITIES[s.origin], CITIES[s.destination]) * trafficFactor, 0);
    return {
      vehicle, stops: assigned,
      totalDist: Math.round(totalDist),
      totalTime: parseFloat((totalDist / 55).toFixed(1)),
      fuelCost: Math.round((totalDist / vehicle.fuel) * 3.85),
      load, loadPct: Math.round((load / vehicle.capacity) * 100),
    };
  }).filter(r => r.stops.length > 0);
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const priorityColor = p => p === "High" ? { bg: "#fef2f2", text: "#dc2626", dot: "#ef4444" }
  : p === "Medium" ? { bg: "#fffbeb", text: "#d97706", dot: "#f59e0b" }
  : { bg: "#f0fdf4", text: "#15803d", dot: "#22c55e" };

const statusColor = s => s === "Delivered" ? { bg: "#f0fdf4", text: "#15803d" }
  : s === "In Transit" ? { bg: "#eff6ff", text: "#1d4ed8" }
  : { bg: "#f9fafb", text: "#6b7280" };

const vStatusColor = s => s === "Available" ? { bg: "#f0fdf4", text: "#15803d" }
  : s === "In Transit" ? { bg: "#eff6ff", text: "#1d4ed8" }
  : { bg: "#fef2f2", text: "#dc2626" };

const Badge = ({ label, colors }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: colors.bg, color: colors.text }}>
    <span style={{ width: 5, height: 5, borderRadius: "50%", background: colors.dot || colors.text, flexShrink: 0 }} />
    {label}
  </span>
);

// ─── ICONS ────────────────────────────────────────────────────────────────────

const Ico = {
  Dashboard: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  Package:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  Truck:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  Route:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17"><circle cx="12" cy="12" r="10"/><path d="M12 8l4 4-4 4M8 12h8"/></svg>,
  Map:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17"><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z"/><path d="M9 3v15M15 6v15"/></svg>,
  Zap:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  BarChart:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Brain:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
  Logout:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Plus:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  ChevronR:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>,
};

// ─── MAP ──────────────────────────────────────────────────────────────────────

function RouteMap({ assignments, showCurrent, showOptimized, scenario }) {
  const W = 860, H = 500;
  const currentRoutes = INIT_SHIPMENTS.filter(s => s.status !== "Delivered");
  const palette = ["#16a34a","#2563eb","#7c3aed","#ea580c","#0891b2"];

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb", background: "#f8fafc" }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        {/* Subtle grid */}
        {[...Array(10)].map((_,i) => <line key={`h${i}`} x1={0} y1={i*50} x2={W} y2={i*50} stroke="#e2e8f0" strokeWidth="1"/>)}
        {[...Array(18)].map((_,i) => <line key={`v${i}`} x1={i*50} y1={0} x2={i*50} y2={H} stroke="#e2e8f0" strokeWidth="1"/>)}

        {/* US boundary hint */}
        <path d="M 80 90 L 800 90 L 820 190 L 800 470 L 600 490 L 200 470 L 100 410 L 80 290 Z"
          fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="6,5" opacity="0.6"/>

        {/* Current routes — red dashed */}
        {showCurrent && currentRoutes.map((r,i) => {
          const f = CITIES[r.origin], t = CITIES[r.destination];
          if (!f || !t) return null;
          return <line key={`cr${i}`} x1={f.x} y1={f.y} x2={t.x} y2={t.y} stroke="#ef4444" strokeWidth="1.8" strokeDasharray="6,4" opacity="0.55"/>;
        })}

        {/* Optimized routes */}
        {showOptimized && assignments.map((a,ai) =>
          a.stops.map((s,si) => {
            const f = CITIES[s.origin], t = CITIES[s.destination];
            if (!f || !t) return null;
            const color = palette[ai % palette.length];
            const mx = (f.x+t.x)/2, my = (f.y+t.y)/2 - 18;
            return (
              <g key={`opt${ai}-${si}`}>
                <path d={`M ${f.x} ${f.y} Q ${mx} ${my} ${t.x} ${t.y}`}
                  fill="none" stroke={color} strokeWidth="2.5" opacity="0.9"/>
                <circle cx={(f.x+t.x)/2} cy={(f.y+t.y)/2 - 10} r="3" fill={color}/>
              </g>
            );
          })
        )}

        {/* City nodes */}
        {Object.entries(CITIES).map(([key, c]) => {
          const active = INIT_SHIPMENTS.some(s => s.origin===key || s.destination===key);
          return (
            <g key={key}>
              {active && <circle cx={c.x} cy={c.y} r={14} fill="rgba(37,99,235,0.07)"/>}
              <circle cx={c.x} cy={c.y} r={active ? 5.5 : 3.5}
                fill={active ? "#2563eb" : "#94a3b8"}
                stroke="white" strokeWidth="2"/>
              <text x={c.x+9} y={c.y+4} fill={active ? "#1e40af" : "#94a3b8"}
                fontSize="9.5" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight={active ? "700" : "500"}>{key}</text>
            </g>
          );
        })}

        {/* Scenario overlays */}
        {scenario === "traffic" && (
          <g>
            <rect x={640} y={148} width={150} height={58} rx="7"
              fill="rgba(239,68,68,0.08)" stroke="#ef4444" strokeWidth="1.2"/>
            <text x={715} y={170} textAnchor="middle" fill="#dc2626" fontSize="10" fontWeight="700">⚠ TRAFFIC JAM</text>
            <text x={715} y={185} textAnchor="middle" fill="#dc2626" fontSize="9">NYC–BOS: +40% delay</text>
            <text x={715} y={198} textAnchor="middle" fill="#ef4444" fontSize="8.5">Routes recalculated</text>
          </g>
        )}
        {scenario === "vehicle" && (
          <g>
            <circle cx={538} cy={188} r={20} fill="rgba(234,88,12,0.1)" stroke="#ea580c" strokeWidth="1.5"/>
            <text x={538} y={185} textAnchor="middle" fill="#ea580c" fontSize="9" fontWeight="700">VH-002</text>
            <text x={538} y={198} textAnchor="middle" fill="#ea580c" fontSize="8">OFFLINE</text>
          </g>
        )}
      </svg>

      {/* Map legend */}
      <div style={{ display: "flex", gap: 20, padding: "10px 16px", background: "white", borderTop: "1px solid #e5e7eb" }}>
        {showCurrent && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="22" height="2"><line x1="0" y1="1" x2="22" y2="1" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,3"/></svg>
            <span style={{ fontSize: 12, color: "#6b7280", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Current Route</span>
          </div>
        )}
        {showOptimized && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="22" height="2"><line x1="0" y1="1" x2="22" y2="1" stroke="#16a34a" strokeWidth="2.5"/></svg>
            <span style={{ fontSize: 12, color: "#6b7280", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Optimized Route</span>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#2563eb", border: "2px solid white", boxShadow: "0 0 0 1px #2563eb" }}/>
          <span style={{ fontSize: 12, color: "#6b7280", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Active Depot</span>
        </div>
      </div>
    </div>
  );
}

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <p style={{ color: "#6b7280", fontSize: 12, marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>{p.name}: {typeof p.value === "number" && p.value > 999 ? `$${p.value.toLocaleString()}` : p.value}</p>
      ))}
    </div>
  );
};

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("login");
  const [section, setSection] = useState("dashboard");
  const [shipments, setShipments] = useState(INIT_SHIPMENTS);
  const [vehicles] = useState(INIT_VEHICLES);
  const [optimResult, setOptimResult] = useState(null);
  const [optimizing, setOptimizing] = useState(false);
  const [showCurrent, setShowCurrent] = useState(true);
  const [showOptimized, setShowOptimized] = useState(true);
  const [scenario, setScenario] = useState("normal");
  const [loginForm, setLoginForm] = useState({ user: "", pass: "", err: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newShip, setNewShip] = useState({ origin: "NYC", destination: "BOS", window: "09:00–14:00", priority: "Medium", weight: 500 });
  const [aiLog, setAiLog] = useState([
    { time: "06:12", msg: "Historical pattern loaded — 847 routes analyzed", type: "info" },
    { time: "07:45", msg: "Model updated — average improvement: 28.3%", type: "success" },
    { time: "09:00", msg: "Anomaly: fuel cost spike in Southeast corridor", type: "warn" },
    { time: "10:30", msg: "Re-optimized 6 routes using live traffic data", type: "success" },
    { time: "11:15", msg: "Demand forecast: Chicago hub +22% tomorrow", type: "info" },
    { time: "12:00", msg: "Fleet utilization improved to 79.4% (was 63.1%)", type: "success" },
  ]);

  const handleLogin = () => {
    if (loginForm.user === "admin" && loginForm.pass === "admin") setPage("app");
    else setLoginForm(f => ({ ...f, err: "Invalid credentials — try admin / admin" }));
  };

  const runOptimization = () => {
    setOptimizing(true); setOptimResult(null);
    setTimeout(() => {
      const tf = scenario === "traffic" ? 1.4 : 1.0;
      const veh = scenario === "vehicle" ? vehicles.filter(v => v.id !== "VH-002") : vehicles;
      const res = optimizeRoutes(shipments, veh, tf);
      setOptimResult(res); setOptimizing(false);
      setAiLog(prev => [{
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        msg: `Optimization complete — ${res.length} routes generated`,
        type: "success",
      }, ...prev.slice(0, 8)]);
    }, 2000);
  };

  const totalOptDist = optimResult ? optimResult.reduce((s,a) => s + a.totalDist, 0) : 0;
  const baseDist = 5840;
  const distSaved = Math.max(0, baseDist - totalOptDist);
  const costSaved = Math.round(distSaved * 0.65);

  // ── STYLES ─────────────────────────────────────────────────────────────────

  const T = {
    body: { minHeight: "100vh", background: "#ffffff", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#1f2937" },
    sidebar: { width: 228, background: "#ffffff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column" },
    topbar: { background: "white", borderBottom: "1px solid #e5e7eb", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" },
    content: { padding: "28px 32px", maxWidth: 1280 },
    card: { background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: "22px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
    kpi: { background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
    btn: { background: "#2563eb", color: "white", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "background 0.15s" },
    btnOutline: { background: "white", color: "#374151", border: "1px solid #d1d5db", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    btnDanger: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 6, padding: "5px 9px", cursor: "pointer" },
    input: { width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#1f2937", fontFamily: "'Plus Jakarta Sans', sans-serif", background: "white" },
    select: { width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#1f2937", fontFamily: "'Plus Jakarta Sans', sans-serif", background: "white" },
    label: { display: "block", fontSize: 11.5, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 7 },
    th: { textAlign: "left", padding: "0 14px 12px 0", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.6px" },
    td: { padding: "10px 14px 10px 0", fontSize: 13.5, color: "#374151", borderBottom: "1px solid #f3f4f6" },
  };

  // ── LOGIN ───────────────────────────────────────────────────────────────────

  if (page === "login") return (
    <div style={{ ...T.body, display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { outline: 2px solid #2563eb; outline-offset: 0; border-color: transparent !important; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Decorative top bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #1d4ed8, #2563eb, #3b82f6)" }}/>

      <div style={{ width: 420, animation: "fadeUp 0.5s ease" }}>
        {/* Logo area */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, background: "#2563eb", borderRadius: 13, marginBottom: 14, boxShadow: "0 8px 20px rgba(37,99,235,0.3)" }}>
            <svg viewBox="0 0 24 24" fill="white" width="26" height="26"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#111827", letterSpacing: "-0.5px" }}>LogisticsNow</h1>
          <p style={{ color: "#9ca3af", fontSize: 13.5, marginTop: 4 }}>AI-Powered Route Optimization Platform</p>
        </div>

        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: "36px 36px 32px", boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 24 }}>Sign in to your account</h2>

          <div style={{ marginBottom: 18 }}>
            <label style={T.label}>Username</label>
            <input value={loginForm.user} onChange={e => setLoginForm(f => ({...f, user: e.target.value}))}
              onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="admin" style={T.input}/>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={T.label}>Password</label>
            <input type="password" value={loginForm.pass} onChange={e => setLoginForm(f => ({...f, pass: e.target.value}))}
              onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="••••••••" style={T.input}/>
          </div>

          {loginForm.err && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 18 }}>
              <p style={{ color: "#dc2626", fontSize: 13 }}>{loginForm.err}</p>
            </div>
          )}

          <button onClick={handleLogin} style={{ ...T.btn, width: "100%", justifyContent: "center", padding: "12px", fontSize: 14 }}>
            Sign In →
          </button>

          <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 12.5, marginTop: 20, background: "#f9fafb", borderRadius: 7, padding: "8px 12px" }}>
            Demo credentials: <strong style={{ color: "#374151" }}>admin</strong> / <strong style={{ color: "#374151" }}>admin</strong>
          </p>
        </div>
      </div>
    </div>
  );

  // ── MAIN SHELL ──────────────────────────────────────────────────────────────

  const navItems = [
    { id: "dashboard", label: "Dashboard",        Icon: Ico.Dashboard },
    { id: "shipments", label: "Shipments",         Icon: Ico.Package   },
    { id: "vehicles",  label: "Vehicles",           Icon: Ico.Truck     },
    { id: "optimize",  label: "Route Optimization", Icon: Ico.Route     },
    { id: "map",       label: "Route Map",           Icon: Ico.Map       },
    { id: "simulation",label: "Simulation",          Icon: Ico.Zap       },
    { id: "analytics", label: "Analytics",           Icon: Ico.BarChart  },
    { id: "ai",        label: "AI Learning",         Icon: Ico.Brain     },
  ];

  const sectionTitle = navItems.find(n => n.id === section)?.label;

  return (
    <div style={{ ...T.body, display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #f9fafb; } ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
        input:focus, select:focus { outline: 2px solid #2563eb; border-color: transparent !important; }
        table { border-collapse: collapse; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      {/* Sidebar */}
      <div style={T.sidebar}>
        {/* Logo */}
        <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: "#2563eb", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, color: "#111827" }}>LogisticsNow</div>
              <div style={{ fontSize: 10.5, color: "#9ca3af", fontWeight: 500 }}>Route AI v2.4</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "14px 10px", overflowY: "auto" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.8px", padding: "0 10px", marginBottom: 8 }}>Main Menu</p>
          {navItems.map(({ id, label, Icon }) => {
            const active = section === id;
            return (
              <button key={id} onClick={() => setSection(id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", background: active ? "#eff6ff" : "transparent", color: active ? "#1d4ed8" : "#6b7280", cursor: "pointer", fontSize: 13.5, fontWeight: active ? 600 : 500, fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 1, textAlign: "left" }}>
                <span style={{ opacity: active ? 1 : 0.7 }}><Icon /></span>
                {label}
                {active && <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#2563eb", flexShrink: 0 }}/>}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding: "14px 10px", borderTop: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>A</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Admin User</div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>Fleet Manager</div>
            </div>
          </div>
          <button onClick={() => setPage("login")} style={{ ...T.btnOutline, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Ico.Logout /> Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <div style={T.topbar}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>Platform</span>
              <Ico.ChevronR />
              <span style={{ fontSize: 12, color: "#6b7280" }}>{sectionTitle}</span>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#111827", fontFamily: "'Syne', sans-serif" }}>{sectionTitle}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, padding: "5px 12px" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a", animation: "pulse 2s infinite" }}/>
              <span style={{ fontSize: 12, color: "#15803d", fontWeight: 600 }}>System Online</span>
            </div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: "auto", background: "#f9fafb" }}>
          <div style={{ ...T.content, animation: "fadeUp 0.25s ease" }} key={section}>

            {/* ══ DASHBOARD ══ */}
            {section === "dashboard" && (
              <>
                {/* KPI Row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 14, marginBottom: 24 }}>
                  {[
                    { label: "Total Shipments",   value: shipments.length,  sub: "+3 today",         accent: "#2563eb", bg: "#eff6ff", icon: "📦" },
                    { label: "Active Vehicles",    value: vehicles.filter(v => v.status !== "Maintenance").length, sub: "1 in maintenance", accent: "#16a34a", bg: "#f0fdf4", icon: "🚛" },
                    { label: "Avg Distance",       value: "312 mi",          sub: "per route",        accent: "#7c3aed", bg: "#faf5ff", icon: "📍" },
                    { label: "Avg Delivery",       value: "5.7 hrs",         sub: "91% on-time",      accent: "#ea580c", bg: "#fff7ed", icon: "⏱" },
                    { label: "Fuel Cost (wk)",     value: "$8,420",          sub: "↓12% vs last wk",  accent: "#dc2626", bg: "#fef2f2", icon: "⛽" },
                    { label: "Fleet Utilization",  value: "74%",             sub: "↑8% vs last wk",   accent: "#0891b2", bg: "#f0f9ff", icon: "📊" },
                  ].map((k, i) => (
                    <div key={i} style={{ ...T.kpi, borderTop: `3px solid ${k.accent}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>{k.label}</p>
                          <p style={{ fontSize: 24, fontWeight: 800, color: "#111827", fontFamily: "'Syne', sans-serif" }}>{k.value}</p>
                          <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{k.sub}</p>
                        </div>
                        <div style={{ width: 38, height: 38, borderRadius: 9, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{k.icon}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts */}
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18, marginBottom: 18 }}>
                  <div style={T.card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                      <div>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Distance Comparison</h3>
                        <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Current vs AI-optimized routing (miles)</p>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {[["#ef4444","Current"],["#16a34a","Optimized"]].map(([c,l]) => (
                          <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: c }}/>
                            <span style={{ fontSize: 12, color: "#6b7280" }}>{l}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={TREND_DATA}>
                        <defs>
                          <linearGradient id="gRed" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.12}/><stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                        <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false}/>
                        <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false}/>
                        <Tooltip content={<ChartTooltip/>}/>
                        <Area type="monotone" dataKey="current" stroke="#ef4444" fill="url(#gRed)" strokeWidth={2} name="Current"/>
                        <Area type="monotone" dataKey="optimized" stroke="#16a34a" fill="url(#gGreen)" strokeWidth={2} name="Optimized"/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={T.card}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 18 }}>Shipment Status</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                      {[
                        { label: "Pending",      count: shipments.filter(s => s.status==="Pending").length,    bg: "#f9fafb", text: "#374151" },
                        { label: "In Transit",   count: shipments.filter(s => s.status==="In Transit").length, bg: "#eff6ff", text: "#1d4ed8" },
                        { label: "Delivered",    count: shipments.filter(s => s.status==="Delivered").length,  bg: "#f0fdf4", text: "#15803d" },
                        { label: "High Priority",count: shipments.filter(s => s.priority==="High").length,     bg: "#fef2f2", text: "#dc2626" },
                      ].map((s, i) => (
                        <div key={i} style={{ background: s.bg, borderRadius: 10, padding: "12px 14px", border: "1px solid #f3f4f6" }}>
                          <p style={{ fontSize: 24, fontWeight: 800, color: s.text, fontFamily: "'Syne', sans-serif" }}>{s.count}</p>
                          <p style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: "#6b7280" }}>Fleet Utilization</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#16a34a" }}>74%</span>
                      </div>
                      <div style={{ background: "#f3f4f6", borderRadius: 99, height: 8, overflow: "hidden" }}>
                        <div style={{ width: "74%", height: "100%", background: "linear-gradient(90deg, #2563eb, #16a34a)", borderRadius: 99 }}/>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent shipments */}
                <div style={T.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Recent Shipments</h3>
                    <button onClick={() => setSection("shipments")} style={{ ...T.btnOutline, fontSize: 12, padding: "6px 14px" }}>View all →</button>
                  </div>
                  <table style={{ width: "100%" }}>
                    <thead><tr>{["ID","Origin","Destination","Priority","Weight","Status"].map(h => <th key={h} style={T.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {shipments.slice(0,5).map(s => (
                        <tr key={s.id}>
                          <td style={{ ...T.td, color: "#2563eb", fontWeight: 600 }}>{s.id}</td>
                          <td style={T.td}>{CITIES[s.origin]?.name}</td>
                          <td style={T.td}>{CITIES[s.destination]?.name}</td>
                          <td style={T.td}><Badge label={s.priority} colors={priorityColor(s.priority)}/></td>
                          <td style={{ ...T.td, color: "#6b7280" }}>{s.weight} lbs</td>
                          <td style={T.td}><Badge label={s.status} colors={statusColor(s.status)}/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ══ SHIPMENTS ══ */}
            {section === "shipments" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <p style={{ fontSize: 14, color: "#6b7280" }}>{shipments.length} total shipments</p>
                  <button onClick={() => setShowAddForm(v => !v)} style={T.btn}><Ico.Plus/> Add Shipment</button>
                </div>

                {showAddForm && (
                  <div style={{ ...T.card, marginBottom: 18, border: "1px solid #bfdbfe" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1d4ed8", marginBottom: 16 }}>New Shipment</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 14 }}>
                      {[
                        { label: "Origin",         key: "origin",      type: "select", opts: Object.keys(CITIES) },
                        { label: "Destination",    key: "destination", type: "select", opts: Object.keys(CITIES) },
                        { label: "Delivery Window",key: "window",      type: "text" },
                        { label: "Priority",       key: "priority",    type: "select", opts: ["High","Medium","Low"] },
                        { label: "Weight (lbs)",   key: "weight",      type: "number" },
                      ].map(f => (
                        <div key={f.key}>
                          <label style={T.label}>{f.label}</label>
                          {f.type === "select"
                            ? <select value={newShip[f.key]} onChange={e => setNewShip(n => ({...n,[f.key]:e.target.value}))} style={T.select}>
                                {f.opts.map(o => <option key={o}>{o}</option>)}
                              </select>
                            : <input type={f.type} value={newShip[f.key]} onChange={e => setNewShip(n => ({...n,[f.key]:e.target.value}))} style={T.input}/>
                          }
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => {
                        setShipments(s => [...s, { ...newShip, id: `SH-${String(s.length+1).padStart(3,"0")}`, status: "Pending" }]);
                        setShowAddForm(false);
                      }} style={T.btn}>Save Shipment</button>
                      <button onClick={() => setShowAddForm(false)} style={T.btnOutline}>Cancel</button>
                    </div>
                  </div>
                )}

                <div style={T.card}>
                  <table style={{ width: "100%" }}>
                    <thead><tr>{["ID","Origin","Destination","Window","Priority","Weight","Status",""].map(h => <th key={h} style={T.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {shipments.map(s => (
                        <tr key={s.id}>
                          <td style={{ ...T.td, color: "#2563eb", fontWeight: 600 }}>{s.id}</td>
                          <td style={T.td}>{CITIES[s.origin]?.name || s.origin}</td>
                          <td style={T.td}>{CITIES[s.destination]?.name || s.destination}</td>
                          <td style={{ ...T.td, fontSize: 12.5, color: "#6b7280", fontFamily: "monospace" }}>{s.window}</td>
                          <td style={T.td}><Badge label={s.priority} colors={priorityColor(s.priority)}/></td>
                          <td style={{ ...T.td, color: "#6b7280" }}>{s.weight} lbs</td>
                          <td style={T.td}><Badge label={s.status} colors={statusColor(s.status)}/></td>
                          <td style={T.td}>
                            <button onClick={() => setShipments(sh => sh.filter(x => x.id !== s.id))} style={T.btnDanger}><Ico.Trash/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ══ VEHICLES ══ */}
            {section === "vehicles" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
                  {[
                    { label: "Total Fleet",  value: vehicles.length, accent: "#2563eb" },
                    { label: "Available",    value: vehicles.filter(v=>v.status==="Available").length, accent: "#16a34a" },
                    { label: "In Transit",   value: vehicles.filter(v=>v.status==="In Transit").length, accent: "#f59e0b" },
                    { label: "Maintenance",  value: vehicles.filter(v=>v.status==="Maintenance").length, accent: "#dc2626" },
                  ].map((k,i) => (
                    <div key={i} style={{ ...T.kpi, borderLeft: `3px solid ${k.accent}` }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", marginBottom: 8 }}>{k.label}</p>
                      <p style={{ fontSize: 30, fontWeight: 800, color: "#111827", fontFamily: "'Syne', sans-serif" }}>{k.value}</p>
                    </div>
                  ))}
                </div>
                <div style={T.card}>
                  <table style={{ width: "100%" }}>
                    <thead><tr>{["Vehicle ID","Type","Capacity","Fuel Eff.","Location","Status","Utilization"].map(h => <th key={h} style={T.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {vehicles.map(v => (
                        <tr key={v.id}>
                          <td style={{ ...T.td, color: "#2563eb", fontWeight: 600 }}>{v.id}</td>
                          <td style={T.td}>{v.type}</td>
                          <td style={{ ...T.td, color: "#6b7280" }}>{v.capacity.toLocaleString()} lbs</td>
                          <td style={{ ...T.td, color: "#6b7280" }}>{v.fuel} mpg</td>
                          <td style={T.td}>{CITIES[v.location]?.name || v.location}</td>
                          <td style={T.td}><Badge label={v.status} colors={vStatusColor(v.status)}/></td>
                          <td style={{ ...T.td, minWidth: 130 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ flex: 1, background: "#f3f4f6", borderRadius: 99, height: 7, overflow: "hidden" }}>
                                <div style={{ width: `${v.util}%`, height: "100%", background: v.util>75?"#16a34a":v.util>45?"#f59e0b":"#ef4444", borderRadius: 99 }}/>
                              </div>
                              <span style={{ fontSize: 12.5, fontWeight: 600, color: "#374151", minWidth: 30 }}>{v.util}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ══ ROUTE OPTIMIZATION ══ */}
            {section === "optimize" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                  <div style={T.card}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 20 }}>Optimization Parameters</h3>
                    {[
                      { label: "Algorithm", opts: ["Nearest Neighbor (Greedy VRP)","Genetic Algorithm","Simulated Annealing","Google OR-Tools (mock)"] },
                      { label: "Optimization Goal", opts: ["Minimize Distance + Cost","Minimize Delivery Time","Maximize Fleet Utilization"] },
                    ].map(f => (
                      <div key={f.label} style={{ marginBottom: 16 }}>
                        <label style={T.label}>{f.label}</label>
                        <select style={T.select}>{f.opts.map(o => <option key={o}>{o}</option>)}</select>
                      </div>
                    ))}
                    <div style={{ marginBottom: 20 }}>
                      <label style={T.label}>Scenario</label>
                      <select value={scenario} onChange={e => setScenario(e.target.value)} style={T.select}>
                        <option value="normal">Normal Operations</option>
                        <option value="traffic">Traffic Surge (+40%)</option>
                        <option value="vehicle">Vehicle Failure (VH-002)</option>
                        <option value="surge">Demand Surge (+30%)</option>
                      </select>
                    </div>
                    <button onClick={runOptimization} disabled={optimizing} style={{ ...T.btn, width: "100%", justifyContent: "center", padding: "12px", fontSize: 14 }}>
                      {optimizing
                        ? <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }}/> Running Optimization…</>
                        : "▶  Run AI Optimization"
                      }
                    </button>
                  </div>

                  <div style={T.card}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 20 }}>Results</h3>
                    {!optimResult && !optimizing && (
                      <div style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af" }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>🔄</div>
                        <p style={{ fontSize: 14, color: "#6b7280" }}>Run the optimizer to see route assignments</p>
                        <p style={{ fontSize: 13, marginTop: 6 }}>Applies VRP with capacity & priority constraints</p>
                      </div>
                    )}
                    {optimizing && (
                      <div style={{ textAlign: "center", padding: "40px 20px" }}>
                        <div style={{ width: 44, height: 44, border: "3px solid #e5e7eb", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }}/>
                        <p style={{ color: "#6b7280", fontSize: 14 }}>Applying nearest-neighbor VRP…</p>
                        <p style={{ color: "#9ca3af", fontSize: 12.5, marginTop: 4 }}>Evaluating {shipments.length} shipments × {vehicles.length} vehicles</p>
                      </div>
                    )}
                    {optimResult && (
                      <>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                          {[
                            { label: "Routes Generated", value: optimResult.length,        color: "#2563eb", bg: "#eff6ff" },
                            { label: "Total Distance",    value: `${totalOptDist} mi`,      color: "#16a34a", bg: "#f0fdf4" },
                            { label: "Distance Saved",    value: `${distSaved} mi`,         color: "#ea580c", bg: "#fff7ed" },
                            { label: "Cost Saved",        value: `$${costSaved}`,           color: "#7c3aed", bg: "#faf5ff" },
                          ].map((m,i) => (
                            <div key={i} style={{ background: m.bg, borderRadius: 10, padding: "12px 14px" }}>
                              <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>{m.label}</p>
                              <p style={{ fontSize: 22, fontWeight: 800, color: m.color, fontFamily: "'Syne', sans-serif" }}>{m.value}</p>
                            </div>
                          ))}
                        </div>
                        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 14px" }}>
                          <p style={{ color: "#15803d", fontSize: 13, fontWeight: 600 }}>✓ Optimization complete</p>
                          <p style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>~{Math.round((distSaved/baseDist)*100)}% distance reduction achieved</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Assigned routes */}
                {optimResult && (
                  <div style={T.card}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Assigned Routes</h3>
                    {optimResult.map((a, i) => (
                      <div key={i} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 7, padding: "3px 10px", color: "#1d4ed8", fontSize: 12, fontWeight: 700 }}>{a.vehicle.id}</span>
                            <span style={{ color: "#374151", fontSize: 13 }}>{a.vehicle.type}</span>
                            <span style={{ color: "#d1d5db" }}>·</span>
                            <span style={{ color: "#9ca3af", fontSize: 12 }}>{a.stops.length} stop{a.stops.length !== 1 ? "s" : ""}</span>
                          </div>
                          <div style={{ display: "flex", gap: 14 }}>
                            {[
                              { val: `${a.totalDist} mi`, color: "#16a34a" },
                              { val: `${a.totalTime} hrs`, color: "#f59e0b" },
                              { val: `$${a.fuelCost}`, color: "#7c3aed" },
                              { val: `Load ${a.loadPct}%`, color: "#6b7280" },
                            ].map((m,i) => <span key={i} style={{ fontSize: 13, fontWeight: 600, color: m.color }}>{m.val}</span>)}
                          </div>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {a.stops.map((stop, si) => (
                            <div key={si} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <span style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 7, padding: "3px 9px", color: "#374151", fontSize: 12 }}>
                                {CITIES[stop.origin]?.name} → {CITIES[stop.destination]?.name}
                              </span>
                              {si < a.stops.length-1 && <span style={{ color: "#2563eb", fontSize: 13 }}>›</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ══ MAP ══ */}
            {section === "map" && (
              <>
                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                  <button onClick={() => setShowCurrent(v => !v)}
                    style={{ ...T.btnOutline, borderColor: showCurrent ? "#ef4444" : "#d1d5db", color: showCurrent ? "#dc2626" : "#6b7280", background: showCurrent ? "#fef2f2" : "white" }}>
                    {showCurrent ? "◼" : "◻"} Current Routes
                  </button>
                  <button onClick={() => setShowOptimized(v => !v)}
                    style={{ ...T.btnOutline, borderColor: showOptimized ? "#16a34a" : "#d1d5db", color: showOptimized ? "#15803d" : "#6b7280", background: showOptimized ? "#f0fdf4" : "white" }}>
                    {showOptimized ? "◼" : "◻"} Optimized Routes
                  </button>
                  {!optimResult && <span style={{ display: "flex", alignItems: "center", color: "#9ca3af", fontSize: 13 }}>← Run Route Optimization first to enable green routes</span>}
                </div>
                <RouteMap assignments={optimResult || []} showCurrent={showCurrent} showOptimized={showOptimized} scenario={scenario}/>
                {optimResult && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginTop: 16 }}>
                    {[
                      { label: "Routes on Map",   value: optimResult.length,                  color: "#2563eb" },
                      { label: "Total Distance",  value: `${totalOptDist} mi`,                color: "#16a34a" },
                      { label: "Vehicles Active", value: optimResult.length,                  color: "#ea580c" },
                      { label: "Est. Fuel Cost",  value: `$${optimResult.reduce((s,a)=>s+a.fuelCost,0).toLocaleString()}`, color: "#7c3aed" },
                    ].map((m,i) => (
                      <div key={i} style={T.kpi}>
                        <p style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>{m.label}</p>
                        <p style={{ fontSize: 22, fontWeight: 800, color: m.color, fontFamily: "'Syne', sans-serif" }}>{m.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ══ SIMULATION ══ */}
            {section === "simulation" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 22 }}>
                  {[
                    { key: "traffic", label: "Traffic Surge",    desc: "Northeastern corridor +40% travel time. AI recalculates alternate paths.", icon: "🚦", accent: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
                    { key: "vehicle", label: "Vehicle Failure",  desc: "VH-002 goes offline mid-route. Load auto-redistributed to available fleet.", icon: "🔧", accent: "#d97706", bg: "#fffbeb", border: "#fde68a" },
                    { key: "surge",   label: "Demand Surge",     desc: "+30% shipment volume. Tests fleet capacity and prioritization logic.",     icon: "📈", accent: "#7c3aed", bg: "#faf5ff", border: "#ddd6fe" },
                  ].map(sc => (
                    <div key={sc.key} onClick={() => setScenario(sc.key)}
                      style={{ ...T.card, cursor: "pointer", border: `1px solid ${scenario===sc.key ? sc.border : "#e5e7eb"}`, background: scenario===sc.key ? sc.bg : "white", transition: "all 0.15s" }}>
                      <div style={{ fontSize: 32, marginBottom: 10 }}>{sc.icon}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: sc.accent }}>{sc.label}</h3>
                        {scenario===sc.key && <span style={{ background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 20, padding: "2px 9px", fontSize: 10.5, fontWeight: 700, color: sc.accent }}>ACTIVE</span>}
                      </div>
                      <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>{sc.desc}</p>
                    </div>
                  ))}
                </div>

                <div style={{ ...T.card, marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Simulation View — {scenario === "normal" ? "Normal" : scenario === "traffic" ? "Traffic Surge" : scenario === "vehicle" ? "Vehicle Failure" : "Demand Surge"}</h3>
                      <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 2 }}>Select a scenario above, then run optimization to see AI adaptation</p>
                    </div>
                    <button onClick={runOptimization} style={T.btn}>{optimizing ? "Running…" : "▶ Run Simulation"}</button>
                  </div>
                  <RouteMap assignments={optimResult || []} showCurrent={true} showOptimized={!!optimResult} scenario={scenario}/>
                </div>

                {optimResult && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {[
                      { title: "Before Optimization", rows: [
                        { label: "Total Distance", val: "5,840 mi", color: "#dc2626" },
                        { label: "Estimated Cost", val: "$12,400", color: "#dc2626" },
                        { label: "Delivery Time (total)", val: "106.2 hrs", color: "#dc2626" },
                        { label: "Fleet Utilization", val: "63%", color: "#d97706" },
                      ]},
                      { title: "After AI Optimization", rows: [
                        { label: "Total Distance", val: `${totalOptDist} mi`, color: "#15803d" },
                        { label: "Estimated Cost", val: `$${optimResult.reduce((s,a)=>s+a.fuelCost,0).toLocaleString()}`, color: "#15803d" },
                        { label: "Routes Generated", val: `${optimResult.length} routes`, color: "#15803d" },
                        { label: "Fleet Utilization", val: `${Math.round(optimResult.reduce((s,a)=>s+a.loadPct,0)/optimResult.length)}%`, color: "#15803d" },
                      ]},
                    ].map((col, ci) => (
                      <div key={ci} style={T.card}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 14 }}>{col.title}</h3>
                        {col.rows.map((r,i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f3f4f6" }}>
                            <span style={{ fontSize: 13.5, color: "#6b7280" }}>{r.label}</span>
                            <span style={{ fontSize: 13.5, fontWeight: 700, color: r.color }}>{r.val}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ══ ANALYTICS ══ */}
            {section === "analytics" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
                  {[
                    { label: "Distance Reduction", value: "31.2%", icon: "↓", accent: "#16a34a", bg: "#f0fdf4" },
                    { label: "Cost Reduction",     value: "28.7%", icon: "↓", accent: "#16a34a", bg: "#f0fdf4" },
                    { label: "Time Improvement",   value: "23.5%", icon: "↑", accent: "#2563eb", bg: "#eff6ff" },
                    { label: "Fleet Efficiency",   value: "+18.4%",icon: "↑", accent: "#7c3aed", bg: "#faf5ff" },
                  ].map((k,i) => (
                    <div key={i} style={{ ...T.kpi, background: k.bg, borderLeft: `3px solid ${k.accent}` }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", marginBottom: 10 }}>{k.label}</p>
                      <p style={{ fontSize: 28, fontWeight: 800, color: k.accent, fontFamily: "'Syne', sans-serif" }}>{k.value}</p>
                      <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>vs manual routing</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
                  <div style={T.card}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Monthly Distance Comparison</h3>
                    <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16 }}>Miles traveled — Current vs AI Optimized</p>
                    <ResponsiveContainer width="100%" height={210}>
                      <BarChart data={TREND_DATA}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                        <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false}/>
                        <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false}/>
                        <Tooltip content={<ChartTooltip/>}/>
                        <Legend wrapperStyle={{ color: "#6b7280", fontSize: 12 }}/>
                        <Bar dataKey="current" fill="#ef4444" name="Current" radius={[4,4,0,0]} opacity={0.85}/>
                        <Bar dataKey="optimized" fill="#16a34a" name="Optimized" radius={[4,4,0,0]} opacity={0.85}/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={T.card}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Fuel Cost Trend ($)</h3>
                    <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16 }}>Monthly fuel expenditure comparison</p>
                    <ResponsiveContainer width="100%" height={210}>
                      <LineChart data={COST_DATA}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                        <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false}/>
                        <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false}/>
                        <Tooltip content={<ChartTooltip/>}/>
                        <Legend wrapperStyle={{ color: "#6b7280", fontSize: 12 }}/>
                        <Line type="monotone" dataKey="current" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} name="Current"/>
                        <Line type="monotone" dataKey="optimized" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4 }} name="Optimized"/>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={T.card}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Performance Comparison Table</h3>
                  <table style={{ width: "100%" }}>
                    <thead><tr>{["Metric","Manual Routing","AI Optimized","Improvement"].map(h => <th key={h} style={T.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {[
                        ["Avg Route Distance","312 mi","215 mi","−31.1%"],
                        ["Avg Fuel Cost / Route","$124","$88","−29.0%"],
                        ["Avg Delivery Time","5.7 hrs","4.4 hrs","−22.8%"],
                        ["Fleet Utilization","63%","79%","+25.4%"],
                        ["On-Time Delivery Rate","82%","94%","+14.6%"],
                        ["Routes per Vehicle","1.4","2.1","+50.0%"],
                      ].map(([metric, manual, ai, improvement], i) => (
                        <tr key={i}>
                          <td style={T.td}>{metric}</td>
                          <td style={{ ...T.td, color: "#ef4444", fontWeight: 600 }}>{manual}</td>
                          <td style={{ ...T.td, color: "#16a34a", fontWeight: 600 }}>{ai}</td>
                          <td style={T.td}>
                            <span style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 7, padding: "3px 10px", color: "#15803d", fontSize: 12.5, fontWeight: 700 }}>{improvement}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ══ AI LEARNING ══ */}
            {section === "ai" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 18 }}>
                  <div style={T.card}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 18 }}>Model Intelligence</h3>
                    {[
                      { label: "Historical Routes Analyzed", value: "847",     color: "#2563eb" },
                      { label: "Avg Optimization Gain",      value: "28.3%",   color: "#16a34a" },
                      { label: "Prediction Accuracy",        value: "91.4%",   color: "#7c3aed" },
                      { label: "Patterns Detected",          value: "34",      color: "#ea580c" },
                      { label: "Last Model Retrain",         value: "2h ago",  color: "#6b7280" },
                    ].map((m,i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                        <span style={{ fontSize: 13.5, color: "#6b7280" }}>{m.label}</span>
                        <span style={{ fontSize: 15, fontWeight: 800, color: m.color, fontFamily: "'Syne', sans-serif" }}>{m.value}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 18 }}>
                      <button onClick={() => setAiLog(prev => [{
                        time: new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}),
                        msg: `Retrained on ${shipments.length} routes — improvement: ${(25+Math.random()*8).toFixed(1)}%`,
                        type: "success",
                      }, ...prev.slice(0,9)])} style={T.btn}>⟳ Trigger Model Retraining</button>
                    </div>
                  </div>

                  <div style={T.card}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Learning Curve</h3>
                    <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16 }}>Optimization gain improves over time</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={[
                        {w:"W1",g:12},{w:"W2",g:18},{w:"W3",g:21},{w:"W4",g:24},
                        {w:"W5",g:26},{w:"W6",g:27.5},{w:"W7",g:28},{w:"W8",g:28.3},
                      ]}>
                        <defs>
                          <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                        <XAxis dataKey="w" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false}/>
                        <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} unit="%"/>
                        <Tooltip contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }} formatter={v => `${v}%`}/>
                        <Area type="monotone" dataKey="g" stroke="#2563eb" fill="url(#gBlue)" strokeWidth={2.5} dot={{ fill: "#2563eb", r: 4, stroke: "white", strokeWidth: 2 }} name="Optimization Gain"/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={T.card}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 14 }}>AI System Event Log</h3>
                  {aiLog.map((log, i) => (
                    <div key={i} style={{ display: "flex", gap: 14, padding: "9px 12px", borderRadius: 8, marginBottom: 4, background: i === 0 ? "#f0fdf4" : "#f9fafb", border: `1px solid ${i===0?"#bbf7d0":"#f3f4f6"}`, animation: i===0?"fadeUp 0.3s ease":"none" }}>
                      <span style={{ fontSize: 12, color: "#9ca3af", minWidth: 50, fontFamily: "monospace", paddingTop: 1 }}>{log.time}</span>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", marginTop: 5, flexShrink: 0, background: log.type==="success"?"#16a34a":log.type==="warn"?"#d97706":"#2563eb" }}/>
                      <span style={{ fontSize: 13, color: log.type==="success"?"#15803d":log.type==="warn"?"#92400e":"#1e40af", fontWeight: 500 }}>{log.msg}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
