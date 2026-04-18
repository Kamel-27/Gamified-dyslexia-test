// app/(auth)/signup/page.tsx  —  Lexora Create Account page
// Same design system as login.tsx
// Replace auth calls with your next-auth / BetterAuth implementation

"use client"

import { useState } from "react"
import Link from "next/link"

type Role = "parent" | "educator" | "specialist" | ""

export default function SignupPage() {
  const [step, setStep]             = useState<1 | 2>(1)
  const [role, setRole]             = useState<Role>("")
  const [name, setName]             = useState("")
  const [email, setEmail]           = useState("")
  const [password, setPassword]     = useState("")
  const [confirm, setConfirm]       = useState("")
  const [agree, setAgree]           = useState(false)
  const [showPass, setShowPass]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState("")

  const roles = [
    { id: "parent",     label: "Parent / Guardian",    desc: "Screening my child",   icon: "👨‍👩‍👧" },
    { id: "educator",   label: "Teacher / School",     desc: "Screening students",   icon: "🏫" },
    { id: "specialist", label: "Specialist / Clinician", desc: "Professional use",   icon: "🩺" },
  ]

  function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    if (!role) { setError("Please select your role."); return }
    setError("")
    setStep(2)
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!name.trim())         { setError("Please enter your name."); return }
    if (!email.trim())        { setError("Please enter your email."); return }
    if (password.length < 8)  { setError("Password must be at least 8 characters."); return }
    if (password !== confirm) { setError("Passwords do not match."); return }
    if (!agree)               { setError("Please accept the terms to continue."); return }
    setLoading(true)
    try {
      // await signUp({ name, email, password, role, callbackUrl: "/dashboard" })
      console.log("sign up", { name, email, role }) // placeholder
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"]
  const strengthColor = ["", "#EF4444", "#F59E0B", "#10B981", "#059669"]

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

        /* left panel */
        .auth-left {
          background: linear-gradient(155deg, #164E63 0%, #0E7490 40%, #06B6D4 80%, #6366F1 100%);
          display: flex; flex-direction: column; justify-content: space-between;
          padding: 48px; position: relative; overflow: hidden;
        }
        .auth-left-deco-1 {
          position: absolute; width: 360px; height: 360px; border-radius: 50%;
          background: rgba(255,255,255,0.06); top: -80px; right: -80px;
        }
        .auth-left-deco-2 {
          position: absolute; width: 260px; height: 260px; border-radius: 50%;
          background: rgba(99,102,241,0.15); bottom: 40px; left: -60px;
        }
        .auth-left-logo { font-family: var(--font-display); font-size: 26px; color: #fff; position: relative; z-index: 1; }
        .auth-left-logo span { color: rgba(165,243,252,0.9); }
        .auth-left-content { position: relative; z-index: 1; }
        .auth-left-h { font-family: var(--font-display); font-size: 36px; color: #fff;
          line-height: 1.18; letter-spacing: -0.7px; margin-bottom: 14px; }
        .auth-left-h em { color: rgba(165,243,252,0.95); font-style: italic; }
        .auth-left-p { font-size: 15px; color: rgba(255,255,255,0.7); line-height: 1.7; margin-bottom: 28px; }
        .auth-left-features { display: flex; flex-direction: column; gap: 12px; }
        .auth-left-feat { display: flex; align-items: flex-start; gap: 10px; }
        .auth-left-feat-icon { width: 28px; height: 28px; border-radius: 6px;
          background: rgba(255,255,255,0.12); display: flex; align-items: center;
          justify-content: center; font-size: 14px; flex-shrink: 0; }
        .auth-left-feat-text { font-size: 14px; color: rgba(255,255,255,0.8); line-height: 1.45; }
        .auth-left-disclaimer { font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.5; position: relative; z-index: 1; }

        /* right panel */
        .auth-right { display: flex; align-items: center; justify-content: center; padding: 48px 40px; }
        .auth-form-wrap { width: 100%; max-width: 420px; }
        .auth-back { display: inline-flex; align-items: center; gap: 6px; font-size: 13px;
          color: var(--ink-soft); text-decoration: none; margin-bottom: 32px; transition: color .2s; }
        .auth-back:hover { color: var(--ink); }

        /* step indicator */
        .auth-steps { display: flex; align-items: center; gap: 8px; margin-bottom: 28px; }
        .auth-step-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center;
          justify-content: center; font-size: 12px; font-weight: 600; transition: all .25s; }
        .auth-step-dot.done { background: var(--indigo); color: #fff; }
        .auth-step-dot.active { background: var(--indigo-dim); color: var(--indigo); border: 2px solid var(--indigo-light); }
        .auth-step-dot.future { background: var(--border); color: var(--ink-soft); }
        .auth-step-line { flex: 1; height: 1px; background: var(--border); }
        .auth-step-line.done { background: var(--indigo-light); }

        .auth-title { font-family: var(--font-display); font-size: 28px; letter-spacing: -0.5px;
          margin-bottom: 6px; color: var(--ink); }
        .auth-subtitle { font-size: 14px; color: var(--ink-soft); margin-bottom: 28px; }
        .auth-subtitle a { color: var(--indigo-light); text-decoration: none; font-weight: 500; }
        .auth-subtitle a:hover { text-decoration: underline; }

        /* role cards */
        .auth-roles { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
        .auth-role-card { display: flex; align-items: center; gap: 14px; padding: 14px 16px;
          border-radius: 10px; border: 1.5px solid var(--border); background: #fff;
          cursor: pointer; transition: all .2s; user-select: none; }
        .auth-role-card:hover { border-color: rgba(99,102,241,0.4); background: var(--indigo-dim); }
        .auth-role-card.selected { border-color: var(--indigo-light); background: var(--indigo-dim); }
        .auth-role-icon { font-size: 24px; line-height: 1; }
        .auth-role-label { font-size: 15px; font-weight: 500; color: var(--ink); }
        .auth-role-desc { font-size: 13px; color: var(--ink-soft); }
        .auth-role-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--border);
          margin-left: auto; flex-shrink: 0; transition: all .2s; }
        .auth-role-card.selected .auth-role-radio { border-color: var(--indigo-light); background: var(--indigo); box-shadow: inset 0 0 0 3px #fff; }

        /* fields */
        .auth-field { margin-bottom: 14px; }
        .auth-label { display: block; font-size: 13px; font-weight: 500; color: var(--ink-mid); margin-bottom: 5px; }
        .auth-input-wrap { position: relative; }
        .auth-input { width: 100%; padding: 11px 14px; border-radius: 9px;
          border: 1.5px solid var(--border); background: #fff; font-size: 15px;
          color: var(--ink); font-family: var(--font-body); outline: none; transition: border-color .2s; }
        .auth-input:focus { border-color: var(--indigo-light); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .auth-input-suffix { position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: var(--ink-soft);
          font-size: 12px; font-weight: 500; padding: 4px; }

        /* strength */
        .auth-strength-bars { display: flex; gap: 4px; margin-top: 6px; }
        .auth-strength-bar { flex: 1; height: 3px; border-radius: 2px; background: var(--border); transition: background .3s; }
        .auth-strength-label { font-size: 11px; margin-top: 4px; transition: color .3s; }

        /* checkbox */
        .auth-check-row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 16px; }
        .auth-check-row input[type=checkbox] { margin-top: 2px; accent-color: var(--indigo); width: 15px; height: 15px; flex-shrink: 0; }
        .auth-check-label { font-size: 13px; color: var(--ink-soft); line-height: 1.5; }
        .auth-check-label a { color: var(--indigo-light); text-decoration: none; }
        .auth-check-label a:hover { text-decoration: underline; }

        /* error */
        .auth-error { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px;
          padding: 10px 14px; font-size: 13px; color: #991B1B; margin-bottom: 14px; }

        /* submit */
        .auth-submit { width: 100%; padding: 13px; border-radius: 10px; border: none;
          background: var(--indigo); color: #fff; font-size: 15px; font-weight: 500;
          cursor: pointer; transition: all .2s; font-family: var(--font-body);
          display: flex; align-items: center; justify-content: center; gap: 8px; }
        .auth-submit:hover:not(:disabled) { background: var(--indigo-light); transform: translateY(-1px); }
        .auth-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .auth-submit-outline { background: transparent; border: 1.5px solid var(--border); color: var(--ink-mid); }
        .auth-submit-outline:hover:not(:disabled) { background: var(--indigo-dim); border-color: var(--indigo-light); color: var(--indigo); transform: none; }

        .auth-note { margin-top: 20px; padding: 12px 14px; background: #FFFBEB;
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
              Start screening.<br />
              <em>Start supporting.</em>
            </h2>
            <p className="auth-left-p">
              Create your Lexora account and run your first assessment 
              in under 20 minutes — no special equipment needed.
            </p>
            <div className="auth-left-features">
              {[
                { icon: "🎮", text: "Gamified 15-min test — feels like a game to the child" },
                { icon: "📷", text: "Optional webcam eye-tracking — no extra hardware" },
                { icon: "📊", text: "Instant risk report with recommended next steps" },
                { icon: "🔒", text: "Encrypted, GDPR-aware data handling — no names stored" },
              ].map((f, i) => (
                <div className="auth-left-feat" key={i}>
                  <div className="auth-left-feat-icon">{f.icon}</div>
                  <span className="auth-left-feat-text">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="auth-left-disclaimer">
            Lexora is a screening tool only — not a diagnostic instrument.<br />
            Results must be interpreted by a qualified professional.
          </p>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="auth-right">
          <div className="auth-form-wrap">
            <Link href="/" className="auth-back">← Back to home</Link>

            {/* step indicator */}
            <div className="auth-steps">
              <div className={`auth-step-dot ${step === 1 ? "active" : "done"}`}>
                {step === 1 ? "1" : "✓"}
              </div>
              <div className={`auth-step-line ${step === 2 ? "done" : ""}`} />
              <div className={`auth-step-dot ${step === 2 ? "active" : "future"}`}>2</div>
            </div>

            {step === 1 ? (
              <>
                <h1 className="auth-title">Create your account</h1>
                <p className="auth-subtitle">
                  Already have one? <Link href="/login">Sign in</Link>
                </p>

                <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 14 }}>
                  I am joining as a…
                </p>

                <form onSubmit={handleStep1} noValidate>
                  {error && <div className="auth-error">⚠ {error}</div>}

                  <div className="auth-roles">
                    {roles.map(r => (
                      <div
                        key={r.id}
                        className={`auth-role-card ${role === r.id ? "selected" : ""}`}
                        onClick={() => setRole(r.id as Role)}
                      >
                        <span className="auth-role-icon">{r.icon}</span>
                        <div>
                          <div className="auth-role-label">{r.label}</div>
                          <div className="auth-role-desc">{r.desc}</div>
                        </div>
                        <div className="auth-role-radio" />
                      </div>
                    ))}
                  </div>

                  <button type="submit" className="auth-submit">
                    Continue →
                  </button>
                </form>
              </>
            ) : (
              <>
                <h1 className="auth-title">Your details</h1>
                <p className="auth-subtitle">
                  You selected: <strong style={{ color: "var(--indigo)" }}>
                    {roles.find(r => r.id === role)?.label}
                  </strong>{" "}
                  <button
                    onClick={() => setStep(1)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--indigo-light)", fontSize: 13, fontWeight: 500, padding: 0 }}
                  >
                    Change
                  </button>
                </p>

                <form onSubmit={handleStep2} noValidate>
                  {error && <div className="auth-error">⚠ {error}</div>}

                  <div className="auth-field">
                    <label className="auth-label" htmlFor="name">Full name</label>
                    <input id="name" type="text" className="auth-input"
                      placeholder="Ahmed Hassan" autoComplete="name"
                      value={name} onChange={e => setName(e.target.value)} required />
                  </div>

                  <div className="auth-field">
                    <label className="auth-label" htmlFor="email">Email address</label>
                    <input id="email" type="email" className="auth-input"
                      placeholder="you@example.com" autoComplete="email"
                      value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>

                  <div className="auth-field">
                    <label className="auth-label" htmlFor="password">Password</label>
                    <div className="auth-input-wrap">
                      <input id="password" type={showPass ? "text" : "password"}
                        className="auth-input" placeholder="Min. 8 characters"
                        autoComplete="new-password"
                        value={password} onChange={e => setPassword(e.target.value)}
                        required style={{ paddingRight: 52 }} />
                      <button type="button" className="auth-input-suffix"
                        onClick={() => setShowPass(v => !v)}>
                        {showPass ? "Hide" : "Show"}
                      </button>
                    </div>
                    {password.length > 0 && (
                      <>
                        <div className="auth-strength-bars">
                          {[1,2,3,4].map(i => (
                            <div key={i} className="auth-strength-bar"
                              style={{ background: i <= strength ? strengthColor[strength] : undefined }} />
                          ))}
                        </div>
                        <p className="auth-strength-label"
                          style={{ color: strengthColor[strength] }}>
                          {strengthLabel[strength]}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="auth-field">
                    <label className="auth-label" htmlFor="confirm">Confirm password</label>
                    <input id="confirm" type={showPass ? "text" : "password"}
                      className="auth-input" placeholder="Repeat password"
                      autoComplete="new-password"
                      value={confirm} onChange={e => setConfirm(e.target.value)} required />
                  </div>

                  <div className="auth-check-row">
                    <input type="checkbox" id="agree"
                      checked={agree} onChange={e => setAgree(e.target.checked)} />
                    <label className="auth-check-label" htmlFor="agree">
                      I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
                      I understand that Lexora provides screening estimates only, not medical diagnoses.
                    </label>
                  </div>

                  <button type="submit" className="auth-submit" disabled={loading}>
                    {loading ? "Creating account…" : "Create account →"}
                  </button>

                  <div style={{ marginTop: 10 }}>
                    <button type="button" className="auth-submit auth-submit-outline"
                      onClick={() => setStep(1)} disabled={loading}>
                      ← Back
                    </button>
                  </div>
                </form>
              </>
            )}

            <div className="auth-note">
              🛡 We store interaction data only — never names or photos. 
              All data is encrypted. Results are <strong>screening estimates</strong>, 
              not a diagnosis.
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
