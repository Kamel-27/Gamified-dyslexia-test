"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function LoginPageView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      if (!email.includes("@")) {
        throw new Error("Please enter a valid email.");
      }

      sessionStorage.setItem("teacherEmail", email);
      router.push("/dashboard");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Invalid email or password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError("");

    try {
      sessionStorage.setItem("teacherEmail", "google-user@example.com");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
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
        .auth-social-btn { width: 100%; display: flex; align-items: center; justify-content: center;
          gap: 10px; padding: 11px 20px; border-radius: 10px; border: 1.5px solid var(--border);
          background: #fff; font-size: 14px; font-weight: 500; color: var(--ink-mid);
          cursor: pointer; transition: all .2s; margin-bottom: 8px; }
        .auth-social-btn:hover { border-color: rgba(99,102,241,0.4); background: var(--indigo-dim); }
        .auth-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
        .auth-divider-line { flex: 1; height: 1px; background: var(--border); }
        .auth-divider-text { font-size: 12px; color: var(--ink-soft); white-space: nowrap; }
        .auth-field { margin-bottom: 16px; }
        .auth-label { display: block; font-size: 13px; font-weight: 500; color: var(--ink-mid); margin-bottom: 6px; }
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
        .auth-error { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px;
          padding: 10px 14px; font-size: 13px; color: #991B1B; margin-bottom: 16px; }
        .auth-submit { width: 100%; padding: 13px; border-radius: 10px; border: none;
          background: var(--indigo); color: #fff; font-size: 15px; font-weight: 500;
          cursor: pointer; transition: all .2s; font-family: var(--font-body);
          display: flex; align-items: center; justify-content: center; gap: 8px; }
        .auth-submit:hover:not(:disabled) { background: var(--indigo-light); transform: translateY(-1px); }
        .auth-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .auth-note { margin-top: 24px; padding: 12px 14px; background: #FFFBEB;
          border-radius: 8px; border: 1px solid #FDE68A; font-size: 12px; color: #78350F; line-height: 1.5; }
        @media (max-width: 768px) {
          .auth-page { grid-template-columns: 1fr; }
          .auth-left { display: none; }
        }
      `}</style>

      <div className="auth-page">
        <div className="auth-left">
          <div className="auth-left-deco-1" />
          <div className="auth-left-deco-2" />
          <div className="auth-left-logo">
            Lexora<span>.</span>
          </div>
          <div className="auth-left-content">
            <h2 className="auth-left-h">
              Every child deserves
              <br />
              <em>to be understood</em>
            </h2>
            <p className="auth-left-p">
              Lexora gives parents and educators a fast, research-backed way to
              identify dyslexia risk before it becomes a school crisis.
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
                <div className="auth-left-stat-num">7-17</div>
                <div className="auth-left-stat-label">age range</div>
              </div>
            </div>
          </div>
          <p className="auth-left-disclaimer">
            Lexora is a screening tool only. Results do not constitute a
            diagnosis.
          </p>
        </div>

        <div className="auth-right">
          <div className="auth-form-wrap">
            <Link href="/" className="auth-back">
              Back to home
            </Link>

            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">
              Do not have an account? <Link href="/signup">Create one free</Link>
            </p>

            <button className="auth-social-btn" onClick={handleGoogle} disabled={loading}>
              Continue with Google
            </button>

            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">or sign in with email</span>
              <div className="auth-divider-line" />
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {error ? <div className="auth-error">{error}</div> : null}

              <div className="auth-field">
                <label className="auth-label" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  className="auth-input"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="auth-field">
                <div className="auth-field-row">
                  <label className="auth-label" htmlFor="password">
                    Password
                  </label>
                  <Link href="#" className="auth-forgot">
                    Forgot password?
                  </Link>
                </div>
                <div className="auth-input-wrap">
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    className="auth-input"
                    placeholder="........"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingRight: 52 }}
                  />
                  <button
                    type="button"
                    className="auth-input-suffix"
                    onClick={() => setShowPass((value) => !value)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="auth-note">
              Lexora is a screening tool only. Results indicate risk, not
              diagnosis.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
