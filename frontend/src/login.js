import { useState } from "react";
import { auth, googleProvider } from "./firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword
} from "firebase/auth";

const LOGO_SRC = "/logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleEmailAuth() {
    if (!email || !password) return setError("Please fill in all fields");
    setLoading(true); setError("");
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message.replace("Firebase: ", "").replace(/\(auth.*\)/, ""));
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setLoading(true); setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#f5f5f4",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .login-input:focus { border-color: #0066ff !important; outline: none; box-shadow: 0 0 0 3px rgba(0,102,255,0.08); }
        .btn-google:hover { background: #f8f8f7 !important; }
        .btn-primary:hover { background: #0052cc !important; }
        .toggle-link:hover { color: #0066ff !important; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 420, padding: "0 16px" }}>

        {/* Logo + Title */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src={LOGO_SRC} alt="Zenith" style={{ width: 72, height: 72, objectFit: "contain", marginBottom: 16 }}
            onError={e => e.target.style.display = "none"} />
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0f0f0f", marginBottom: 4 }}>
            Aria Admin
          </div>
          <div style={{ fontSize: 14, color: "#888" }}>
            Zenith School of AI · AI Call Center
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: "#fff", border: "1px solid #ebebeb",
          borderRadius: 16, padding: 32,
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)"
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#0f0f0f", marginBottom: 4 }}>
            {isSignUp ? "Create account" : "Welcome back"}
          </div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 24 }}>
            {isSignUp ? "Sign up to access Aria Admin" : "Sign in to your workspace"}
          </div>

          {/* Google Button */}
          <button className="btn-google" onClick={handleGoogle} disabled={loading}
            style={{
              width: "100%", padding: "11px", background: "#fff",
              border: "1px solid #e5e5e5", borderRadius: 9, fontSize: 14,
              fontWeight: 600, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", gap: 10,
              marginBottom: 20, color: "#333"
            }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
            <span style={{ fontSize: 12, color: "#bbb", fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
          </div>

          {/* Email */}
          <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>
            Email address
          </label>
          <input className="login-input" type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="mannat@zenith.ai"
            style={{
              width: "100%", padding: "10px 12px", border: "1px solid #e5e5e5",
              borderRadius: 8, fontSize: 14, marginBottom: 14,
              background: "#fafafa", color: "#0f0f0f",
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }} />

          {/* Password */}
          <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>
            Password
          </label>
          <input className="login-input" type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === "Enter" && handleEmailAuth()}
            style={{
              width: "100%", padding: "10px 12px", border: "1px solid #e5e5e5",
              borderRadius: 8, fontSize: 14, marginBottom: 20,
              background: "#fafafa", color: "#0f0f0f",
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }} />

          {/* Error */}
          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 8, padding: "10px 14px", fontSize: 13,
              color: "#991b1b", marginBottom: 16
            }}>{error}</div>
          )}

          {/* Submit Button */}
          <button className="btn-primary" onClick={handleEmailAuth} disabled={loading}
            style={{
              width: "100%", padding: "11px", background: loading ? "#6aa3ff" : "#0066ff",
              color: "#fff", border: "none", borderRadius: 9, fontSize: 14,
              fontWeight: 700, cursor: loading ? "not-allowed" : "pointer"
            }}>
            {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
          </button>

          {/* Toggle */}
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#888" }}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <span className="toggle-link"
              onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
              style={{ color: "#555", fontWeight: 600, cursor: "pointer" }}>
              {isSignUp ? "Sign In" : "Sign Up"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "#bbb" }}>
          Zenith School of AI © 2026 · Aria Admin v2.0
        </div>
      </div>
    </div>
  );
}