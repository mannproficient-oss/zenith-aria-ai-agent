 import { useState, useEffect } from "react";
import { db, auth, googleProvider } from "./firebase";
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";

const SERVER = "http://localhost:5000";
const AGENT_ID = "agent_2801kt99m0sxepebjmrbmtf6wnwc";
const LOGO_SRC = "data:image/png;base64,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";

// ── Login Page ─────────────────────────────────────────────────────
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleEmailAuth() {
    if (!email || !password) return setError("Please fill in all fields");
    setLoading(true); setError("");
    try {
      if (isSignUp) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
    } catch (err) { setError(err.message.replace("Firebase: ", "").replace(/\(auth.*\)/, "")); }
    setLoading(false);
  }

  async function handleGoogle() {
    setLoading(true); setError("");
    try { await signInWithPopup(auth, googleProvider); }
    catch (err) { setError(err.message.replace("Firebase: ", "")); }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f0f4ff 0%,#fafafa 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "\'Plus Jakarta Sans\', sans-serif" }}>
      <style>{`@import url(\'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap\'); *{box-sizing:border-box;margin:0;padding:0;} .li:focus{border-color:#0066ff!important;outline:none;box-shadow:0 0 0 3px rgba(0,102,255,.08);}`}</style>
      <div style={{ width: "100%", maxWidth: 420, padding: "0 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src={LOGO_SRC} alt="Zenith" style={{ width: 80, height: 80, objectFit: "contain", marginBottom: 16 }} />
          <div style={{ fontSize: 26, fontWeight: 800, color: "#0f0f0f", marginBottom: 4 }}>Aria Admin</div>
          <div style={{ fontSize: 14, color: "#888" }}>Zenith School of AI · AI Call Center</div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 16, padding: 32, boxShadow: "0 4px 24px rgba(0,0,0,.06)" }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{isSignUp ? "Create account" : "Welcome back"}</div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 24 }}>{isSignUp ? "Sign up to access Aria Admin" : "Sign in to your workspace"}</div>
          <button onClick={handleGoogle} disabled={loading}
            style={{ width: "100%", padding: 11, background: "#fff", border: "1px solid #e5e5e5", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20, color: "#333" }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "#f0f0f0" }}/><span style={{ fontSize: 12, color: "#bbb" }}>or</span><div style={{ flex: 1, height: 1, background: "#f0f0f0" }}/>
          </div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>Email</label>
          <input className="li" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="mannat@zenith.ai"
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: 14, marginBottom: 14, background: "#fafafa", color: "#0f0f0f", fontFamily: "inherit" }} />
          <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>Password</label>
          <input className="li" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
            onKeyDown={e => e.key === "Enter" && handleEmailAuth()}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: 14, marginBottom: 20, background: "#fafafa", color: "#0f0f0f", fontFamily: "inherit" }} />
          {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#991b1b", marginBottom: 16 }}>{error}</div>}
          <button onClick={handleEmailAuth} disabled={loading}
            style={{ width: "100%", padding: 11, background: loading ? "#6aa3ff" : "#0066ff", color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#888" }}>
            {isSignUp ? "Already have an account?" : "Don\'t have an account?"}{" "}
            <span onClick={() => { setIsSignUp(!isSignUp); setError(""); }} style={{ color: "#0066ff", fontWeight: 600, cursor: "pointer" }}>{isSignUp ? "Sign In" : "Sign Up"}</span>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "#bbb" }}>Zenith School of AI © 2026 · Aria Admin v2.0</div>
      </div>
    </div>
  );
}

// ── Score Badge ────────────────────────────────────────────────────
function ScoreBadge({ score = 0 }) {
  const color = score >= 80 ? "#e11d48" : score >= 50 ? "#d97706" : score >= 20 ? "#0066ff" : "#94a3b8";
  const bg = score >= 80 ? "#fff1f2" : score >= 50 ? "#fffbeb" : score >= 20 ? "#eff4ff" : "#f8fafc";
  const grade = score >= 80 ? "Hot" : score >= 50 ? "Warm" : score >= 20 ? "Cold" : "New";
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: bg, border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color }}>
        {score}
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color, background: bg, padding: "2px 8px", borderRadius: 20 }}>{grade}</span>
    </div>
  );
}

// ── Score Bar ──────────────────────────────────────────────────────
function ScoreBar({ score = 0 }) {
  const color = score >= 80 ? "#e11d48" : score >= 50 ? "#d97706" : score >= 20 ? "#0066ff" : "#94a3b8";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: "#f0f0f0", borderRadius: 3 }}>
        <div style={{ width: `${score}%`, height: 6, background: color, borderRadius: 3, transition: "width 0.6s ease" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 28 }}>{score}</span>
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────────────
const I = {
  grid: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  phone: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
  outbound: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="23 7 23 1 17 1"/><line x1="16" y1="8" x2="23" y2="1"/><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72"/></svg>,
  batch: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  chat: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  rec: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>,
  bar: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  users: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  contacts: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  campaign: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 010 7.07"/></svg>,
  bot: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg>,
  mic: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/></svg>,
  settings: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  bell: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>,
  search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  chevronL: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
  chevronD: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
  menu: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  key: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
  logout: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  play: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  upload: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>,
  trend: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  score: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
};

const NAV_SECTIONS = [
  { label: "Dashboard", items: [{ id: "overview", label: "Overview", icon: I.grid }] },
  { label: "Call Center", items: [
    { id: "calls", label: "Calls", icon: I.phone },
    { id: "outbound", label: "Outbound Calls", icon: I.outbound },
    { id: "batch", label: "Batch Calls", icon: I.batch },
  ]},
  { label: "Analytics", items: [
    { id: "transcripts", label: "Transcripts", icon: I.chat },
    { id: "recordings", label: "Recordings", icon: I.rec },
    { id: "reports", label: "Reports", icon: I.bar },
  ]},
  { label: "CRM", items: [
    { id: "leads", label: "Leads", icon: I.users },
    { id: "leadscore", label: "Lead Scoring", icon: I.score },
    { id: "contacts", label: "Contacts", icon: I.contacts },
  ]},
  { label: "AI Management", items: [
    { id: "agents", label: "AI Agents", icon: I.bot },
    { id: "voice", label: "Voice Settings", icon: I.mic },
  ]},
  { label: "Settings", items: [
    { id: "settings", label: "Settings", icon: I.settings },
    { id: "apikeys", label: "API Keys", icon: I.key },
  ]},
];

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: type === "ok" ? "#f0fdf4" : "#fef2f2", border: `1px solid ${type==="ok"?"#bbf7d0":"#fecaca"}`, color: type==="ok"?"#166534":"#991b1b", borderRadius: 10, padding: "12px 18px", fontSize: 13, fontWeight: 500, boxShadow: "0 4px 24px rgba(0,0,0,.08)", display: "flex", alignItems: "center", gap: 8, minWidth: 280 }}>
      {type==="ok"?"✓":"✗"} {msg}
      <span onClick={onClose} style={{ marginLeft: "auto", cursor: "pointer", opacity: .5, fontSize: 16 }}>×</span>
    </div>
  );
}

function Skeleton({ w="100%", h=16, r=6 }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />;
}

function Badge({ status }) {
  const map = { completed:["#f0fdf4","#16a34a"], failed:["#fef2f2","#dc2626"], queued:["#eff4ff","#0066ff"], initiated:["#eff4ff","#0066ff"], "in-progress":["#fffbeb","#d97706"], Hot:["#fff1f2","#e11d48"], Warm:["#fffbeb","#d97706"], Cold:["#f8fafc","#64748b"], New:["#f8fafc","#94a3b8"] };
  const [bg,color] = map[status]||["#f8fafc","#64748b"];
  return <span style={{ display:"inline-flex", alignItems:"center", fontSize:11, fontWeight:600, padding:"3px 9px", borderRadius:20, background:bg, color }}>{status}</span>;
}

function KPICard({ label, value, sub, icon, color="#0066ff", loading }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #ebebeb", borderRadius:12, padding:"18px 20px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:"#999", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>{label}</div>
          {loading ? <Skeleton w={60} h={28}/> : <div style={{ fontSize:30, fontWeight:700, color:"#0f0f0f", lineHeight:1 }}>{value}</div>}
          {loading ? <div style={{marginTop:4}}><Skeleton w={80} h={12}/></div> : <div style={{ fontSize:12, color:"#aaa", marginTop:4 }}>{sub}</div>}
        </div>
        <div style={{ width:38, height:38, borderRadius:10, background:`${color}15`, display:"flex", alignItems:"center", justifyContent:"center", color }}>{icon}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [active, setActive] = useState("overview");
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebar")==="collapsed");
  const [calls, setCalls] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(false);
  const [phone, setPhone] = useState("+91");
  const [calling, setCalling] = useState(false);
  const [batchNumbers, setBatchNumbers] = useState("");
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchResults, setBatchResults] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [quickOpen, setQuickOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedSections, setExpandedSections] = useState({ "Dashboard":true, "Call Center":true, "Analytics":true, "CRM":true, "AI Management":false, "Settings":false });

  const showToast = (msg, type="ok") => setToast({ msg, type });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { setUser(u); setAuthLoading(false); });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch(SERVER).then(() => setServerOnline(true)).catch(() => setServerOnline(false));
    const q1 = query(collection(db,"calls"), orderBy("createdAt","desc"));
    const u1 = onSnapshot(q1, snap => { setCalls(snap.docs.map(d=>({id:d.id,...d.data()}))); setLoading(false); });
    const q2 = query(collection(db,"leads"), orderBy("createdAt","desc"));
    const u2 = onSnapshot(q2, snap => setLeads(snap.docs.map(d=>({id:d.id,...d.data()}))));
    return () => { u1(); u2(); };
  }, [user]);

  useEffect(() => { localStorage.setItem("sidebar", collapsed?"collapsed":"expanded"); }, [collapsed]);
  useEffect(() => {
    const h = e => { if ((e.metaKey||e.ctrlKey)&&e.key==="k") { e.preventDefault(); setCmdOpen(v=>!v); } };
    window.addEventListener("keydown",h);
    return () => window.removeEventListener("keydown",h);
  }, []);

  async function makeCall(to) {
    if (!to||to==="+91") return showToast("Enter a valid phone number","err");
    setCalling(true);
    try {
      const res = await fetch(`${SERVER}/call`,{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({to}) });
      const data = await res.json();
      if (data.success) { showToast(`Call initiated to ${to}`); setPhone("+91"); }
      else showToast(data.error,"err");
    } catch { showToast("Server not reachable","err"); }
    setCalling(false);
  }

  async function runBatch() {
    const numbers = batchNumbers.split("\n").map(n=>n.trim()).filter(Boolean);
    if (!numbers.length) return;
    setBatchRunning(true); setBatchResults([]);
    for (const num of numbers) {
      try {
        const res = await fetch(`${SERVER}/call`,{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({to:num}) });
        const data = await res.json();
        setBatchResults(p=>[...p,{num,ok:data.success,sid:data.callSid,err:data.error}]);
        await new Promise(r=>setTimeout(r,1500));
      } catch { setBatchResults(p=>[...p,{num,ok:false,err:"Server error"}]); }
    }
    setBatchRunning(false); showToast("Batch complete!");
  }

  async function addLead() {
    const name = prompt("Lead name?");
    const p = prompt("Phone (+91xxxxxxxxxx)?");
    const interest = prompt("Hot / Warm / Cold?") || "Warm";
    const course = prompt("Course interest?") || "B.Tech AI";
    if (name && p) {
      await addDoc(collection(db,"leads"),{ name, phone:p, interest, course, score:0, grade:"New", callCount:0, completedCalls:0, totalDuration:0, avgDuration:0, scoreBreakdown:[], lastCalled:null, createdAt:serverTimestamp(), updatedAt:serverTimestamp() });
      showToast(`Lead ${name} added`);
    }
  }

  async function recalcScore(lead) {
    try {
      const res = await fetch(`${SERVER}/leads/${lead.id}/score`, { method:"POST" });
      const data = await res.json();
      if (data.success) showToast(`Score updated: ${data.score}/100`);
      else showToast(data.error,"err");
    } catch { showToast("Server not reachable","err"); }
  }

  const filteredCalls = calls.filter(c => (c.to?.includes(search)) && (statusFilter==="all"||c.status===statusFilter));
  const sortedLeads = [...leads].sort((a,b) => (b.score||0)-(a.score||0));
  const toggleSection = label => setExpandedSections(p=>({...p,[label]:!p[label]}));
  const navigate = id => { setActive(id); setQuickOpen(false); setCmdOpen(false); };
  const pageLabel = NAV_SECTIONS.flatMap(s=>s.items).find(i=>i.id===active)?.label||"Overview";

  if (authLoading) return (
    <div style={{ height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f5f5f4" }}>
      <div style={{ textAlign:"center" }}>
        <img src={LOGO_SRC} alt="Zenith" style={{ width:60, height:60, objectFit:"contain", marginBottom:16 }}/>
        <div style={{ fontSize:14, color:"#888", fontFamily:"sans-serif" }}>Loading Aria Admin...</div>
      </div>
    </div>
  );
  if (!user) return <Login />;

  const css = `
    @import url(\'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap\');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:\'Plus Jakarta Sans\',sans-serif;background:#f5f5f4;color:#111;font-size:14px;}
    ::-webkit-scrollbar{width:4px;height:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:#ddd;border-radius:4px;}
    @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
    .nav-item:hover{background:#f5f5f4!important;}
    .nav-item-active{background:#eff4ff!important;color:#0066ff!important;}
    .table-row:hover{background:#fafafa!important;}
    .card{animation:fadeIn .2s ease;}
    .qa:hover{background:#f5f5f5!important;}
    input:focus{border-color:#0066ff!important;outline:none;box-shadow:0 0 0 3px rgba(0,102,255,.08);}
    textarea:focus{border-color:#0066ff!important;outline:none;box-shadow:0 0 0 3px rgba(0,102,255,.08);}
  `;

  const sidebar = (
    <aside style={{ width:collapsed?60:220, background:"#fff", borderRight:"1px solid #ebebeb", display:"flex", flexDirection:"column", flexShrink:0, transition:"width .22s cubic-bezier(.4,0,.2,1)", overflow:"hidden" }}>
      <div style={{ padding:collapsed?"16px 0":"16px 14px", borderBottom:"1px solid #f0f0f0", display:"flex", alignItems:"center", justifyContent:collapsed?"center":"space-between", minHeight:72 }}>
        {!collapsed && <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <img src={LOGO_SRC} alt="Zenith" style={{ width:36, height:36, objectFit:"contain", flexShrink:0 }}/>
          <div><div style={{ fontSize:13, fontWeight:700, color:"#0f0f0f", lineHeight:1.2 }}>Aria Admin</div><div style={{ fontSize:10, color:"#aaa", marginTop:1 }}>Zenith School of AI</div></div>
        </div>}
        {collapsed && <img src={LOGO_SRC} alt="Zenith" style={{ width:30, height:30, objectFit:"contain" }}/>}
        {!collapsed && <button onClick={() => setCollapsed(true)} style={{ background:"none", border:"none", cursor:"pointer", color:"#bbb", padding:4, borderRadius:6, display:"flex" }}>{I.chevronL}</button>}
      </div>
      <nav style={{ flex:1, overflowY:"auto", padding:collapsed?"8px 6px":"8px 8px" }}>
        {NAV_SECTIONS.map(section => (
          <div key={section.label} style={{ marginBottom:4 }}>
            {!collapsed && <div onClick={() => toggleSection(section.label)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 8px 3px", cursor:"pointer" }}>
              <span style={{ fontSize:10, fontWeight:700, color:"#bbb", textTransform:"uppercase", letterSpacing:"0.08em" }}>{section.label}</span>
              <span style={{ color:"#ccc", transform:expandedSections[section.label]?"rotate(0)":"rotate(-90deg)", transition:"transform .15s", display:"flex" }}>{I.chevronD}</span>
            </div>}
            {(collapsed||expandedSections[section.label]) && section.items.map(item => (
              <div key={item.id} className={`nav-item ${active===item.id?"nav-item-active":""}`}
                onClick={() => navigate(item.id)} title={collapsed?item.label:""}
                style={{ display:"flex", alignItems:"center", gap:9, padding:collapsed?"9px 0":"8px 10px", borderRadius:7, cursor:"pointer", justifyContent:collapsed?"center":"flex-start", color:active===item.id?"#0066ff":"#555", marginBottom:1 }}>
                <span style={{ flexShrink:0, opacity:active===item.id?1:.6 }}>{item.icon}</span>
                {!collapsed && <span style={{ fontSize:13, fontWeight:active===item.id?600:500 }}>{item.label}</span>}
                {!collapsed && item.id==="calls" && calls.length>0 && <span style={{ marginLeft:"auto", fontSize:10, fontWeight:700, background:"#0066ff", color:"#fff", borderRadius:10, padding:"1px 6px" }}>{calls.length}</span>}
                {!collapsed && item.id==="leadscore" && leads.filter(l=>(l.score||0)>=80).length>0 && <span style={{ marginLeft:"auto", fontSize:10, fontWeight:700, background:"#e11d48", color:"#fff", borderRadius:10, padding:"1px 6px" }}>{leads.filter(l=>(l.score||0)>=80).length}</span>}
              </div>
            ))}
          </div>
        ))}
      </nav>
      {collapsed && <div style={{ padding:"12px 0", borderTop:"1px solid #f0f0f0", display:"flex", justifyContent:"center" }}>
        <button onClick={() => setCollapsed(false)} style={{ background:"none", border:"none", cursor:"pointer", color:"#bbb", padding:6, borderRadius:6, display:"flex" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>}
      {!collapsed && <div style={{ padding:"10px 16px", borderTop:"1px solid #f0f0f0" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#667eea,#764ba2)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11, fontWeight:700, flexShrink:0 }}>
            {user?.displayName?.[0]||user?.email?.[0]?.toUpperCase()||"U"}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:600, color:"#0f0f0f", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.displayName||"Admin"}</div>
            <div style={{ fontSize:10, color:"#aaa", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.email}</div>
          </div>
          <button onClick={() => signOut(auth)} title="Sign out" style={{ background:"none", border:"none", cursor:"pointer", color:"#bbb", padding:4, display:"flex" }}>{I.logout}</button>
        </div>
      </div>}
    </aside>
  );

  const topbar = (
    <div style={{ height:54, background:"#fff", borderBottom:"1px solid #ebebeb", display:"flex", alignItems:"center", padding:"0 20px", gap:12, flexShrink:0 }}>
      {collapsed && <button onClick={() => setCollapsed(false)} style={{ background:"none", border:"none", cursor:"pointer", color:"#888", display:"flex", padding:4 }}>{I.menu}</button>}
      <div style={{ fontSize:13, color:"#888", display:"flex", alignItems:"center", gap:6 }}>
        <span>Aria Admin</span><span style={{ color:"#ddd" }}>›</span>
        <span style={{ color:"#0f0f0f", fontWeight:600 }}>{pageLabel}</span>
      </div>
      <div style={{ flex:1 }}/>
      <button onClick={() => setCmdOpen(true)} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 12px", background:"#f8f8f7", border:"1px solid #e8e8e8", borderRadius:8, cursor:"pointer", color:"#999", fontSize:12 }}>
        {I.search} <span>Search…</span> <span style={{ marginLeft:8, fontSize:10, background:"#eee", padding:"1px 5px", borderRadius:4 }}>⌘K</span>
      </button>
      <div style={{ position:"relative" }}>
        <button onClick={() => setQuickOpen(v=>!v)} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", background:"#0066ff", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer" }}>
          {I.plus} New Action
        </button>
        {quickOpen && <div style={{ position:"absolute", top:"calc(100% + 6px)", right:0, background:"#fff", border:"1px solid #ebebeb", borderRadius:10, boxShadow:"0 8px 32px rgba(0,0,0,.08)", minWidth:180, zIndex:100, padding:6, animation:"fadeIn .12s ease" }}>
          {[{label:"New Call",id:"outbound"},{label:"Batch Campaign",id:"batch"},{label:"Add Lead",id:"leads"},{label:"Lead Scoring",id:"leadscore"}].map(a => (
            <div key={a.label} className="qa" onClick={() => navigate(a.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:7, cursor:"pointer", fontSize:13, color:"#333" }}>{a.label}</div>
          ))}
        </div>}
      </div>
      <button style={{ position:"relative", background:"none", border:"none", cursor:"pointer", color:"#888", padding:6, borderRadius:8, display:"flex" }}>
        {I.bell}
        <span style={{ position:"absolute", top:4, right:4, width:6, height:6, background:"#ef4444", borderRadius:"50%", border:"1.5px solid #fff" }}/>
      </button>
      <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#667eea,#764ba2)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}>
        {user?.displayName?.[0]||user?.email?.[0]?.toUpperCase()||"U"}
      </div>
    </div>
  );

  const cmdPalette = cmdOpen && (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.3)", zIndex:9000, display:"flex", alignItems:"flex-start", justifyContent:"center", paddingTop:120 }} onClick={() => setCmdOpen(false)}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:14, boxShadow:"0 24px 64px rgba(0,0,0,.15)", width:500, overflow:"hidden", animation:"fadeIn .15s ease" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 16px", borderBottom:"1px solid #f0f0f0" }}>
          <span style={{ color:"#aaa" }}>{I.search}</span>
          <input autoFocus placeholder="Search pages…" value={search} onChange={e=>setSearch(e.target.value)}
            style={{ border:"none", outline:"none", fontSize:15, flex:1, fontFamily:"inherit" }}/>
        </div>
        <div style={{ padding:8 }}>
          {NAV_SECTIONS.flatMap(s=>s.items).filter(i=>i.label.toLowerCase().includes(search.toLowerCase())).map(item => (
            <div key={item.id} onClick={() => navigate(item.id)} className="qa"
              style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:8, cursor:"pointer", fontSize:13, color:"#333" }}>
              <span style={{ color:"#0066ff" }}>{item.icon}</span>
              <span style={{ fontWeight:500 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const comingSoon = label => (
    <div style={{ textAlign:"center", padding:"80px 0" }}>
      <div style={{ fontSize:48, marginBottom:16 }}>🚧</div>
      <div style={{ fontSize:20, fontWeight:800, marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:14, color:"#aaa", marginBottom:24 }}>Coming soon!</div>
      <button onClick={() => navigate("overview")} style={{ padding:"10px 24px", background:"#0066ff", color:"#fff", border:"none", borderRadius:9, fontSize:14, fontWeight:700, cursor:"pointer" }}>← Back to Overview</button>
    </div>
  );

  const pages = {
    overview: (
      <div style={{ animation:"fadeIn .2s ease" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
          <KPICard label="Total Calls" value={calls.length} sub="all time" icon={I.phone} loading={loading}/>
          <KPICard label="Completed" value={calls.filter(c=>c.status==="completed").length} sub="connected" icon={I.trend} color="#16a34a" loading={loading}/>
          <KPICard label="Total Leads" value={leads.length} sub="in pipeline" icon={I.users} color="#7c3aed" loading={loading}/>
          <KPICard label="Hot Leads" value={leads.filter(l=>(l.score||0)>=80).length} sub="score ≥ 80" icon={I.score} color="#e11d48" loading={loading}/>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div className="card" style={{ background:"#fff", border:"1px solid #ebebeb", borderRadius:12, padding:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:700 }}>Recent Calls</div>
              <button onClick={() => navigate("calls")} style={{ fontSize:12, color:"#0066ff", background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>View all →</button>
            </div>
            {loading ? [1,2,3].map(i=><div key={i} style={{marginBottom:10}}><Skeleton h={36} r={8}/></div>) :
            calls.length===0 ? (
              <div style={{ textAlign:"center", padding:"32px 0", color:"#bbb" }}>
                <div style={{ fontSize:32, marginBottom:8 }}>📞</div>
                <div style={{ fontSize:14, fontWeight:600, color:"#888", marginBottom:4 }}>No calls yet</div>
                <button onClick={() => navigate("outbound")} style={{ padding:"8px 16px", background:"#0066ff", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", marginTop:8 }}>Start Calling</button>
              </div>
            ) : calls.slice(0,6).map(c => (
              <div key={c.id} className="table-row" onClick={() => { setSelectedCall(c); navigate("transcripts"); }}
                style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 8px", borderRadius:7, cursor:"pointer", marginBottom:2 }}>
                <div>
                  <div style={{ fontSize:13, fontFamily:"\'JetBrains Mono\',monospace", fontWeight:500 }}>{c.to}</div>
                  <div style={{ fontSize:11, color:"#bbb" }}>{c.createdAt?.toDate?.()?.toLocaleTimeString?.()||"—"}</div>
                </div>
                <Badge status={c.status}/>
              </div>
            ))}
          </div>
          <div className="card" style={{ background:"#fff", border:"1px solid #ebebeb", borderRadius:12, padding:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:700 }}>Top Leads by Score</div>
              <button onClick={() => navigate("leadscore")} style={{ fontSize:12, color:"#0066ff", background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>Full scoring →</button>
            </div>
            {sortedLeads.slice(0,5).map(l => (
              <div key={l.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #f8f8f8" }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{l.name}</div>
                  <div style={{ fontSize:11, color:"#bbb", fontFamily:"\'JetBrains Mono\',monospace" }}>{l.phone}</div>
                </div>
                <ScoreBadge score={l.score||0}/>
              </div>
            ))}
            {leads.length===0 && <div style={{ textAlign:"center", padding:"24px 0", color:"#bbb" }}>
              <div style={{ fontSize:28, marginBottom:8 }}>👥</div>
              <button onClick={() => navigate("leads")} style={{ padding:"7px 14px", background:"#7c3aed", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", marginTop:8 }}>Add Leads</button>
            </div>}
          </div>
        </div>
      </div>
    ),

    calls: (
      <div className="card" style={{ background:"#fff", border:"1px solid #ebebeb", borderRadius:12, padding:20, animation:"fadeIn .2s ease" }}>
        <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, minWidth:200, background:"#f8f8f7", border:"1px solid #e8e8e8", borderRadius:8, padding:"7px 12px" }}>
            <span style={{ color:"#bbb" }}>{I.search}</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search number…" style={{ border:"none", background:"transparent", outline:"none", fontSize:13, flex:1 }}/>
          </div>
          {["all","completed","failed","queued"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{ padding:"7px 14px", borderRadius:8, border:"1px solid", fontSize:12, fontWeight:600, cursor:"pointer", borderColor:statusFilter===s?"#0066ff":"#e8e8e8", background:statusFilter===s?"#eff4ff":"#fff", color:statusFilter===s?"#0066ff":"#888" }}>
              {s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
          <button onClick={() => { const csv=["Number,SID,Status,Date",...filteredCalls.map(c=>`${c.to},${c.callSid},${c.status},${c.createdAt?.toDate?.()?.toLocaleString?.()||""}`)].join("\n"); const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download="calls.csv"; a.click(); }}
            style={{ padding:"7px 14px", background:"#fff", border:"1px solid #e8e8e8", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", color:"#555", display:"flex", alignItems:"center", gap:6 }}>
            {I.upload} Export CSV
          </button>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>{["Number","Call SID","Status","Duration","Date","Action"].map(h=><th key={h} style={{ fontSize:11, fontWeight:700, color:"#999", textTransform:"uppercase", letterSpacing:"0.06em", padding:"8px 12px", textAlign:"left", borderBottom:"1px solid #f0f0f0" }}>{h}</th>)}</tr></thead>
          <tbody>
            {filteredCalls.map(c => (
              <tr key={c.id} className="table-row">
                <td style={{ padding:"11px 12px", fontSize:13, fontFamily:"\'JetBrains Mono\',monospace", fontWeight:500 }}>{c.to}</td>
                <td style={{ padding:"11px 12px", fontSize:11, color:"#aaa", fontFamily:"\'JetBrains Mono\',monospace" }}>{c.callSid?.slice(0,16)}…</td>
                <td style={{ padding:"11px 12px" }}><Badge status={c.status}/></td>
                <td style={{ padding:"11px 12px", fontSize:12, color:"#888" }}>{c.duration ? `${c.duration}s` : "—"}</td>
                <td style={{ padding:"11px 12px", fontSize:12, color:"#aaa" }}>{c.createdAt?.toDate?.()?.toLocaleString?.()||"—"}</td>
                <td style={{ padding:"11px 12px" }}><button onClick={() => { setSelectedCall(c); navigate("transcripts"); }} style={{ padding:"5px 12px", background:"#fff", border:"1px solid #e8e8e8", borderRadius:6, fontSize:12, fontWeight:600, cursor:"pointer", color:"#0066ff" }}>Transcript</button></td>
              </tr>
            ))}
            {!filteredCalls.length && <tr><td colSpan={6} style={{ padding:"48px 0", textAlign:"center", color:"#bbb" }}>No calls found</td></tr>}
          </tbody>
        </table>
      </div>
    ),

    leadscore: (
      <div style={{ animation:"fadeIn .2s ease" }}>
        {/* Score Summary */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
          {[{label:"Hot Leads",filter:l=>(l.score||0)>=80,color:"#e11d48"},{label:"Warm Leads",filter:l=>(l.score||0)>=50&&(l.score||0)<80,color:"#d97706"},{label:"Cold Leads",filter:l=>(l.score||0)>=20&&(l.score||0)<50,color:"#64748b"},{label:"New Leads",filter:l=>(l.score||0)<20,color:"#94a3b8"}].map(({label,filter,color}) => (
            <div key={label} style={{ background:"#fff", border:"1px solid #ebebeb", borderRadius:12, padding:"18px 20px" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#999", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>{label}</div>
              <div style={{ fontSize:30, fontWeight:700, color }}>{leads.filter(filter).length}</div>
              <div style={{ fontSize:12, color:"#aaa", marginTop:4 }}>leads</div>
            </div>
          ))}
        </div>

        {/* Lead Score Table */}
        <div className="card" style={{ background:"#fff", border:"1px solid #ebebeb", borderRadius:12, padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <div style={{ fontSize:13, fontWeight:700 }}>Lead Scores</div>
            <div style={{ fontSize:12, color:"#888" }}>Auto-updated after each call · Click to view breakdown</div>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr>{["Lead","Phone","Score","Grade","Calls","Avg Duration","Last Called","Actions"].map(h=><th key={h} style={{ fontSize:11, fontWeight:700, color:"#999", textTransform:"uppercase", letterSpacing:"0.06em", padding:"8px 12px", textAlign:"left", borderBottom:"1px solid #f0f0f0" }}>{h}</th>)}</tr></thead>
            <tbody>
              {sortedLeads.map(l => (
                <>
                  <tr key={l.id} className="table-row" style={{ cursor:"pointer" }} onClick={() => setSelectedLead(selectedLead?.id===l.id?null:l)}>
                    <td style={{ padding:"11px 12px", fontWeight:700 }}>{l.name}</td>
                    <td style={{ padding:"11px 12px", fontSize:12, fontFamily:"\'JetBrains Mono\',monospace" }}>{l.phone}</td>
                    <td style={{ padding:"11px 12px", minWidth:140 }}><ScoreBar score={l.score||0}/></td>
                    <td style={{ padding:"11px 12px" }}><Badge status={l.grade||"New"}/></td>
                    <td style={{ padding:"11px 12px", fontSize:13, fontWeight:600 }}>{l.completedCalls||0}/{l.callCount||0}</td>
                    <td style={{ padding:"11px 12px", fontSize:12, color:"#888" }}>{l.avgDuration ? `${l.avgDuration}s` : "—"}</td>
                    <td style={{ padding:"11px 12px", fontSize:11, color:"#bbb" }}>{l.lastCalled?.toDate?.()?.toLocaleDateString?.()||"Never"}</td>
                    <td style={{ padding:"11px 12px", display:"flex", gap:6 }}>
                      <button onClick={e => { e.stopPropagation(); makeCall(l.phone); setPhone(l.phone); navigate("outbound"); }}
                        style={{ padding:"4px 10px", background:"#eff4ff", border:"none", borderRadius:6, fontSize:11, fontWeight:700, cursor:"pointer", color:"#0066ff", display:"flex", alignItems:"center", gap:4 }}>
                        {I.phone} Call
                      </button>
                      <button onClick={e => { e.stopPropagation(); recalcScore(l); }}
                        style={{ padding:"4px 10px", background:"#f0fdf4", border:"none", borderRadius:6, fontSize:11, fontWeight:700, cursor:"pointer", color:"#16a34a" }}>
                        ↻ Recalc
                      </button>
                    </td>
                  </tr>
                  {selectedLead?.id===l.id && (
                    <tr key={`${l.id}-detail`}>
                      <td colSpan={8} style={{ padding:"0 12px 16px", background:"#fafafa" }}>
                        <div style={{ padding:16, borderRadius:8, border:"1px solid #f0f0f0", background:"#fff" }}>
                          <div style={{ fontSize:12, fontWeight:700, color:"#888", marginBottom:12, textTransform:"uppercase", letterSpacing:"0.06em" }}>Score Breakdown</div>
                          {(l.scoreBreakdown||[]).length===0 ? (
                            <div style={{ fontSize:13, color:"#bbb" }}>No score data yet. Make a call to generate score.</div>
                          ) : (
                            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                              {(l.scoreBreakdown||[]).map((b,i) => (
                                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", background:"#fafafa", borderRadius:8, border:"1px solid #f0f0f0" }}>
                                  <span style={{ fontSize:12, color:"#555" }}>{b.rule}</span>
                                  <span style={{ fontSize:12, fontWeight:700, color:b.points>0?"#16a34a":"#dc2626" }}>{b.points>0?"+":""}{b.points}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div style={{ marginTop:12, display:"flex", gap:16, fontSize:12, color:"#888" }}>
                            <span>Total calls: <strong style={{ color:"#0f0f0f" }}>{l.callCount||0}</strong></span>
                            <span>Completed: <strong style={{ color:"#16a34a" }}>{l.completedCalls||0}</strong></span>
                            <span>Total duration: <strong style={{ color:"#0f0f0f" }}>{l.totalDuration||0}s</strong></span>
                            <span>Avg duration: <strong style={{ color:"#0f0f0f" }}>{l.avgDuration||0}s</strong></span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {!leads.length && <tr><td colSpan={8} style={{ padding:"56px 0", textAlign:"center", color:"#bbb" }}>
                <div style={{ fontSize:36, marginBottom:10 }}>⭐</div>
                <div style={{ fontSize:14, fontWeight:700, color:"#888", marginBottom:16 }}>No leads to score yet</div>
                <button onClick={() => navigate("leads")} style={{ padding:"9px 20px", background:"#0066ff", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer" }}>Add Leads First</button>
              </td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    ),

    transcripts: (
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.4fr", gap:16, animation:"fadeIn .2s ease" }}>
        <div className="card" style={{ background:"#fff", border:"1px solid #ebebeb", borderRadius:12, padding:20 }}>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>Select Call</div>
          {calls.slice(0,10).map(c => (
            <div key={c.id} onClick={() => setSelectedCall(c)}
              style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:10, borderRadius:8, cursor:"pointer", background:selectedCall?.id===c.id?"#eff4ff":"transparent", marginBottom:3, border:selectedCall?.id===c.id?"1px solid #c7d9ff":"1px solid transparent" }}>
              <div>
                <div style={{ fontSize:13, fontFamily:"\'JetBrains Mono\',monospace", fontWeight:500, color:selectedCall?.id===c.id?"#0066ff":"#333" }}>{c.to}</div>
                <div style={{ fontSize:11, color:"#bbb", marginTop:2 }}>{c.createdAt?.toDate?.()?.toLocaleString?.()||"—"}</div>
              </div>
              <Badge status={c.status}/>
            </div>
          ))}
          {!calls.length && <div style={{ color:"#bbb", fontSize:13, textAlign:"center", padding:32 }}>No calls yet</div>}
        </div>
        <div className="card" style={{ background:"#fff", border:"1px solid #ebebeb", borderRadius:12, padding:20 }}>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>Transcript Viewer</div>
          {selectedCall ? (
            <>
              <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:14, padding:"10px 12px", background:"#f8f8f7", borderRadius:8 }}>
                <span style={{ fontFamily:"\'JetBrains Mono\',monospace", fontSize:12, fontWeight:600, color:"#0066ff" }}>{selectedCall.to}</span>
                <Badge status={selectedCall.status}/>
                {selectedCall.duration && <span style={{ marginLeft:"auto", fontSize:11, color:"#888" }}>{selectedCall.duration}s</span>}
              </div>
              <div style={{ background:"#fafafa", border:"1px solid #f0f0f0", borderRadius:8, padding:16, fontSize:13, lineHeight:1.8, maxHeight:280, overflowY:"auto", color:"#555", fontFamily:"\'JetBrains Mono\',monospace", marginBottom:14 }}>
                {selectedCall.transcript || "Transcript is saved in ElevenLabs Conversations after each call.\n\nGo to elevenlabs.io → Conversational AI → Conversations to view."}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <a href="https://elevenlabs.io/app/conversational-ai/conversations" target="_blank" rel="noreferrer" style={{ padding:"8px 14px", background:"#0066ff", color:"#fff", borderRadius:8, fontSize:12, fontWeight:700, textDecoration:"none" }}>View on ElevenLabs →</a>
                <button onClick={() => { navigator.clipboard.writeText(selectedCall.callSid); showToast("SID copied"); }} style={{ padding:"8px 14px", background:"#fff", border:"1px solid #e5e5e5", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", color:"#555" }}>Copy SID</button>
              </div>
            </>
          ) : <div style={{ color:"#bbb", fontSize:13, textAlign:"center", padding:"48px 0" }}>← Select a call to view transcript</div>}
        </div>
      </div>
    ),

    recordings: (
      <div className="card" style={{ background:"#fff", border:"1px solid #ebebeb", borderRadius:12, padding:20, animation:"fadeIn .2s ease" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div style={{ fontSize:13, fontWeight:700 }}>Recordings</div>
          <a href="https://elevenlabs.io/app/conversational-ai/conversations" target="_blank" rel="noreferrer" style={{ fontSize:12, color:"#0066ff", fontWeight:600, textDecoration:"none" }}>View on ElevenLabs →</a>
        </div>
        {calls.filter(c=>c.status==="completed").length===0 ? (
          <div style={{ textAlign:"center", padding:"56px 0", color:"#bbb" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🎙️</div>
            <div style={{ fontSize:15, fontWeight:700, color:"#888", marginBottom:6 }}>No recordings yet</div>
            <button onClick={() => navigate("outbound")} style={{ padding:"9px 20px", background:"#0066ff", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", marginTop:8 }}>Make First Call</button>
          </div>
        ) : calls.filter(c=>c.status==="completed").map(c => (
          <div key={c.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #f5f5f5" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:"#eff4ff", display:"flex", alignItems:"center", justifyContent:"center", color:"#0066ff" }}>{I.play}</div>
              <div>
                <div style={{ fontSize:13, fontFamily:"\'JetBrains Mono\',monospace", fontWeight:600 }}>{c.to}</div>
                <div style={{ fontSize:11, color:"#bbb", marginTop:1 }}>{c.duration ? `${c.duration}s` : "—"} · {c.createdAt?.toDate?.()?.toLocaleString?.()||"—"}</div>
              </div>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(c.callSid); showToast("SID copied"); }} style={{ padding:"5px 12px", background:"#fff", border:"1px solid #e5e5e5", borderRadius:6, fontSize:12, fontWeight:600, cursor:"pointer", color:"#555" }}>Copy SID</button>
          </div>
        ))}
      </div>
    ),

    outbound: (
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, maxWidth:860, animation:"fadeIn .2s ease" }}>
        <div className="card" style={{ background:"#fff", border:"1px solid #ebebeb", borderRadius:12, padding:22 }}>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:18 }}>Make Outbound Call</div>
          <label style={{ fontSize:12, color:"#888", display:"block", marginBottom:5 }}>Phone Number</label>
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+919015955040"
            style={{ width:"100%", padding:"10px 12px", border:"1px solid #e5e5e5", borderRadius:8, fontSize:14, color:"#0f0f0f", background:"#fafafa", marginBottom:6, fontFamily:"\'JetBrains Mono\',monospace" }}/>
          <div style={{ fontSize:11, color:"#bbb", marginBottom:16 }}>Format: +91XXXXXXXXXX · Trial: only verified numbers</div>
          <button onClick={() => makeCall(phone)} disabled={calling}
            style={{ width:"100%", padding:11, background:calling?"#6aa3ff":"#0066ff", color:"#fff", border:"none", borderRadius:9, fontSize:14, fontWeight:700, cursor:calling?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            {I.phone} {calling?"Calling…":"Call with Aria"}
          </button>
        </div>
        <div className="card" style={{ background:"#fff", border:"1px solid #ebebeb", borderRadius:12, padding:22 }}>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:16 }}>Agent Info</div>
          {[["Agent","Aria — Zenith School of AI"],["Voice","Anvi (Hindi + English)"],["LLM","Gemini 2.5 Flash"],["Number","+1 401 398 5468"],["Server",serverOnline?"Online ✓":"Offline ✗"],["User",user?.email||"—"]].map(([k,v]) => (
            <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #f8f8f7", fontSize:13 }}>
              <span style={{ color:"#999" }}>{k}</span>
              <span style={{ fontWeight:600, color:k==="Server"?(serverOnline?"#16a34a":"#dc2626"):"#0f0f0f" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    ),

    batch: (
      <div style={{ maxWidth:600, animation:"fadeIn .2s ease" }}>
        <div className="card" style={{ background:"#fff", border:"1px solid #ebebeb", borderRadius:12, padding:22 }}>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:6 }}>Batch Call Campaign</div>
          <div style={{ fontSize:12, color:"#888", marginBottom:14 }}>One phone number per line. Scores update automatically after each call.</div>
          <textarea value={batchNumbers} onChange={e=>setBatchNumbers(e.target.value)} placeholder={"+919015955040\n+919876543210"}
            style={{ width:"100%", padding:"10px 12px", border:"1px solid #e5e5e5", borderRadius:8, fontSize:13, color:"#0f0f0f", background:"#fafafa", resize:"vertical", minHeight:140, marginBottom:12, fontFamily:"\'JetBrains Mono\',monospace", outline:"none" }}/>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={runBatch} disabled={batchRunning}
              style={{ flex:1, padding:10, background:batchRunning?"#6aa3ff":"#0066ff", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:batchRunning?"not-allowed":"pointer" }}>
              {batchRunning?`Calling ${batchResults.length+1}/${batchNumbers.split("\n").filter(Boolean).length}…`:"Start Batch"}
            </button>
            <button onClick={() => { setBatchNumbers(""); setBatchResults([]); }} style={{ padding:"10px 16px", background:"#fff", border:"1px solid #e5e5e5", borderRadius:8, fontSize:13, cursor:"pointer", color:"#888" }}>Clear</button>
          </div>
          {batchResults.length>0 && <div style={{ marginTop:16 }}>
            {batchResults.map((r,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #f5f5f5", fontSize:13 }}>
                <span style={{ fontFamily:"\'JetBrains Mono\',monospace" }}>{r.num}</span>
                {r.ok ? <span style={{ color:"#16a34a", fontWeight:600 }}>✓ Done</span> : <span style={{ color:"#dc2626", fontWeight:600 }}>✗ {r.err}</span>}
              </div>
            ))}
          </div>}
        </div>
      </div>
    ),

    leads: (
      <div className="card" style={{ background:"#fff", border:"1px solid #ebebeb", borderRadius:12, padding:20, animation:"fadeIn .2s ease" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div style={{ fontSize:13, fontWeight:700 }}>Lead Management</div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => navigate("leadscore")} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", background:"#fff", color:"#0066ff", border:"1px solid #0066ff", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer" }}>{I.score} Scoring</button>
            <button onClick={addLead} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", background:"#0066ff", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer" }}>{I.plus} Add Lead</button>
          </div>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>{["Name","Phone","Course","Score","Interest","Calls","Action"].map(h=><th key={h} style={{ fontSize:11, fontWeight:700, color:"#999", textTransform:"uppercase", letterSpacing:"0.06em", padding:"8px 12px", textAlign:"left", borderBottom:"1px solid #f0f0f0" }}>{h}</th>)}</tr></thead>
          <tbody>
            {sortedLeads.map(l => (
              <tr key={l.id} className="table-row">
                <td style={{ padding:"11px 12px", fontWeight:700 }}>{l.name}</td>
                <td style={{ padding:"11px 12px", fontSize:12, fontFamily:"\'JetBrains Mono\',monospace" }}>{l.phone}</td>
                <td style={{ padding:"11px 12px", fontSize:12, color:"#888" }}>{l.course||"—"}</td>
                <td style={{ padding:"11px 12px", minWidth:120 }}><ScoreBar score={l.score||0}/></td>
                <td style={{ padding:"11px 12px" }}><Badge status={l.grade||l.interest||"New"}/></td>
                <td style={{ padding:"11px 12px", fontSize:12, color:"#888" }}>{l.completedCalls||0}/{l.callCount||0}</td>
                <td style={{ padding:"11px 12px", display:"flex", gap:6 }}>
                  <button onClick={() => { setPhone(l.phone); navigate("outbound"); }}
                    style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", background:"#eff4ff", border:"none", borderRadius:6, fontSize:12, fontWeight:700, cursor:"pointer", color:"#0066ff" }}>
                    {I.phone} Call
                  </button>
                  <button onClick={() => { setSelectedLead(l); navigate("leadscore"); }}
                    style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", background:"#fff", border:"1px solid #e5e5e5", borderRadius:6, fontSize:12, fontWeight:700, cursor:"pointer", color:"#888" }}>
                    {I.score}
                  </button>
                </td>
              </tr>
            ))}
            {!leads.length && <tr><td colSpan={7} style={{ padding:"56px 0", textAlign:"center", color:"#bbb" }}>
              <div style={{ fontSize:36, marginBottom:10 }}>👥</div>
              <div style={{ fontSize:14, fontWeight:700, color:"#888", marginBottom:16 }}>No leads yet</div>
              <button onClick={addLead} style={{ padding:"9px 20px", background:"#0066ff", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer" }}>Add First Lead</button>
            </td></tr>}
          </tbody>
        </table>
      </div>
    ),
  };

  return (
    <>
      <style>{css}</style>
      <div style={{ display:"flex", height:"100vh", overflow:"hidden" }}>
        {sidebar}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>
          {topbar}
          <main style={{ flex:1, overflowY:"auto", padding:22, background:"#f5f5f4" }}>
            {pages[active]||comingSoon(pageLabel)}
          </main>
        </div>
      </div>
      {cmdPalette}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
    </>
  );
}