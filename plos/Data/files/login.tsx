// app/(auth)/login/page.tsx  —  Lexora Sign In page
// Same font variables as landing page (Instrument Serif + DM Sans)
// Uses: next-auth signIn or your BetterAuth equivalent
// Replace signIn() calls with your actual auth provider

"use client"

import { useState } from "react"
import Link from "next/link"
// import { signIn } from "next-auth/react"   // ← uncomment for next-auth
// import { signIn } from "@/lib/auth-client" // ← uncomment for BetterAuth

export default function LoginPage() {
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!email || !password) { setError("Please fill in all fields."); return }
    setLoading(true)
    try {
      // await signIn("credentials", { email, password, callbackUrl: "/dashboard" })
      console.log("sign in", email) // placeholder
    } catch {
      setError("Invalid email or password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoading(true)
    // await signIn("google", { callbackUrl: "/dashboard" })
    console.log("google sign in") // placeholder
    setLoading(false)
  }

  return (
    <>
      <style>{`
        :root {
          --indigo: #4338CA;
          --indigo-light: #6366F1;
          --indigo-dim: #EEF2FF;
          --ink: #0F0E17;
          --ink-mid: #3D3B4F;
          --ink-soft: #6B6880;
          --surface: #FAFAF9;
          --border: rgba(0,0,0,0.09);
          --font-display: var(--font-serif, "Georgia", serif);
          --font-body: var(--font-sans, "system-ui", sans-serif);
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--font-body); background: var(--surface); color: var(--ink); }

        .auth-page { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; }

        /* left panel — decorative */
        .auth-left {
          background: linear-gradient(155deg, #312E81 0%, #4338CA 40%, #6366F1 80%, #06B6D4 100%);
          display: flex; flex-direction: column; justify-content: space-between;
          padding: 48px; position: relative; overflow: hidden;
        }
        .auth-left-deco-1 {
          position: absolute; width: 400px; height: 400px; border-radius: 50%;
          background: rgba(255,255,255,0.05); top: -100px; right: -100px;
        }
        .auth-left-deco-2 {
          position: absolute; width: 300px; height: 300px; border-radius: 50%;
          background: rgba(6,182,212,0.12); bottom: 60px; left: -80px;
        }
        .auth-left-logo { font-family: var(--font-display); font-size: 26px; color: #fff; }
        .auth-left-logo span { color: rgba(165,180,252,0.9); }
        .auth-left-content { position: relative; z-index: 1; }
        .auth-left-h { font-family: var(--font-display); font-size: 38px; color: #fff;
          line-height: 1.15; letter-spacing: -0.8px; margin-bottom: 16px; }
        .auth-left-h em { color: rgba(165,180,252,0.95); font-style: italic; }
        .auth-left-p { font-size: 15px; color: rgba(255,255,255,0.72); line-height: 1.7; margin-bottom: 32px; }
        .auth-left-stats { display: flex; gap: 32px; }
        .auth-left-stat-num { font-family: var(--font-display); font-size: 28px; color: #fff; }
        .auth-left-stat-label { font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 2px; }
        .auth-left-disclaimer { font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.5; }

        /* right panel — form */
        .auth-right { display: flex; align-items: center; justify-content: center; padding: 48px 40px; }
        .auth-form-wrap { width: 100%; max-width: 400px; }
        .auth-back { display: inline-flex; align-items: center; gap: 6px; font-size: 13px;
          color: var(--ink-soft); text-decoration: none; margin-bottom: 36px;
          transition: color .2s; }
        .auth-back:hover { color: var(--ink); }
        .auth-title { font-family: var(--font-display); font-size: 30px; letter-spacing: -0.5px;
          margin-bottom: 6px; color: var(--ink); }
        .auth-subtitle { font-size: 14px; color: var(--ink-soft); margin-bottom: 32px; }
        .auth-subtitle a { color: var(--indigo-light); text-decoration: none; font-weight: 500; }
        .auth-subtitle a:hover { text-decoration: underline; }

        /* social */
        .auth-social-btn { width: 100%; display: flex; align-items: center; justify-content: center;
          gap: 10px; padding: 11px 20px; border-radius: 10px; border: 1.5px solid var(--border);
          background: #fff; font-size: 14px; font-weight: 500; color: var(--ink-mid);
          cursor: pointer; transition: all .2s; margin-bottom: 8px; }
        .auth-social-btn:hover { border-color: rgba(99,102,241,0.4); background: var(--indigo-dim); }

        /* divider */
        .auth-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
        .auth-divider-line { flex: 1; height: 1px; background: var(--border); }
        .auth-divider-text { font-size: 12px; color: var(--ink-soft); white-space: nowrap; }

        /* fields */
        .auth-field { margin-bottom: 16px; }
        .auth-label { display: block; font-size: 13px; font-weight: 500; color: var(--ink-mid);
          margin-bottom: 6px; }
        .auth-input-wrap { position: relative; }
        .auth-input { width: 100%; padding: 11px 14px; border-radius: 9px;
          border: 1.5px solid var(--border); background: #fff; font-size: 15px;
          color: var(--ink); font-family: var(--font-body); outline: none; transition: border-color .2s; }
        .auth-input:focus { border-color: var(--indigo-light); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .auth-input-suffix { position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: var(--ink-soft);
          font-size: 12px; font-weight: 500; padding: 4px; }
        .auth-field-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .auth-forgot { font-size: 12px; color: var(--indigo-light); text-decoration: none; }
        .auth-forgot:hover { text-decoration: underline; }

        /* error */
        .auth-error { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px;
          padding: 10px 14px; font-size: 13px; color: #991B1B; margin-bottom: 16px; display: flex; gap: 8px; }

        /* submit */
        .auth-submit { width: 100%; padding: 13px; border-radius: 10px; border: none;
          background: var(--indigo); color: #fff; font-size: 15px; font-weight: 500;
          cursor: pointer; transition: all .2s; font-family: var(--font-body);
          display: flex; align-items: center; justify-content: center; gap: 8px; }
        .auth-submit:hover:not(:disabled) { background: var(--indigo-light); transform: translateY(-1px); }
        .auth-submit:disabled { opacity: 0.7; cursor: not-allowed; }

        /* disclaimer */
        .auth-note { margin-top: 24px; padding: 12px 14px; background: #FFFBEB;
          border-radius: 8px; border: 1px solid #FDE68A; font-size: 12px; color: #78350F; line-height: 1.5; }

        @media (max-width: 768px) {
          .auth-page { grid-template-columns: 1fr; }
          .auth-left { display: none; }
        }
      `}</style>

      <div className="auth-page">

        {/* ── LEFT PANEL ── */}
        <div className="auth-left">
          <div className="auth-left-deco-1" />
          <div className="auth-left-deco-2" />
          <div className="auth-left-logo">Lexora<span>.</span></div>
          <div className="auth-left-content">
            <h2 className="auth-left-h">
              Every child deserves<br />
              <em>to be understood</em>
            </h2>
            <p className="auth-left-p">
              Lexora gives parents and educators a fast, research-backed way to 
              identify dyslexia risk — before it becomes a school crisis.
            </p>
            <div className="auth-left-stats">
              <div>
                <div className="auth-left-stat-num">80%+</div>
                <div className="auth-left-stat-label">screening sensitivity</div>
              </div>
              <div>
                <div className="auth-left-stat-num">15 min</div>
                <div className="auth-left-stat-label">assessment time</div>
              </div>
              <div>
                <div className="auth-left-stat-num">7–17</div>
                <div className="auth-left-stat-label">age range</div>
              </div>
            </div>
          </div>
          <p className="auth-left-disclaimer">
            Lexora is a screening tool only. Results do not constitute a diagnosis.<br />
            Always consult a qualified professional for comprehensive evaluation.
          </p>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="auth-right">
          <div className="auth-form-wrap">
            <Link href="/" className="auth-back">
              ← Back to home
            </Link>

            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">
              Don't have an account?{" "}
              <Link href="/signup">Create one free</Link>
            </p>

            {/* Google */}
            <button className="auth-social-btn" onClick={handleGoogle} disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
                <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332Z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58Z"/>
              </svg>
              Continue with Google
            </button>

            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">or sign in with email</span>
              <div className="auth-divider-line" />
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <div className="auth-error">
                  <span>⚠</span> {error}
                </div>
              )}

              <div className="auth-field">
                <label className="auth-label" htmlFor="email">Email address</label>
                <input
                  id="email" type="email" className="auth-input"
                  placeholder="you@example.com" autoComplete="email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="auth-field">
                <div className="auth-field-row">
                  <label className="auth-label" htmlFor="password">Password</label>
                  <Link href="/forgot-password" className="auth-forgot">Forgot password?</Link>
                </div>
                <div className="auth-input-wrap">
                  <input
                    id="password" type={showPass ? "text" : "password"}
                    className="auth-input" placeholder="••••••••"
                    autoComplete="current-password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    required style={{ paddingRight: 52 }}
                  />
                  <button
                    type="button" className="auth-input-suffix"
                    onClick={() => setShowPass(v => !v)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? "Signing in…" : "Sign in →"}
              </button>
            </form>

            <div className="auth-note">
              🛡 Lexora is a <strong>screening tool only</strong>. Results indicate risk — not diagnosis. 
              Always follow up with a qualified specialist.
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
