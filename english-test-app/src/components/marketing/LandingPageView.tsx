import Link from "next/link";
import { faqs, stats } from "@/components/marketing/landing-data";
import {
  IconArrow,
  IconCheck,
  IconEye,
  IconGame,
  IconShield,
} from "@/components/marketing/icons";

export function LandingPageView() {
  return (
    <>
      <style>{`
        :root {
          --indigo: #4338CA;
          --indigo-light: #6366F1;
          --indigo-dim: #EEF2FF;
          --cyan: #06B6D4;
          --cyan-dim: #ECFEFF;
          --ink: #0F0E17;
          --ink-mid: #3D3B4F;
          --ink-soft: #6B6880;
          --surface: #FAFAF9;
          --border: rgba(0,0,0,0.07);
          --font-display: var(--font-serif, "Georgia", serif);
          --font-body: var(--font-sans, "system-ui", sans-serif);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--font-body); background: var(--surface); color: var(--ink); }
        .serif { font-family: var(--font-display); }
        .lx-container { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
        .lx-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          background: rgba(250,250,249,0.88); backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border); }
        .lx-nav-inner { display: flex; align-items: center; justify-content: space-between;
          height: 60px; max-width: 1120px; margin: 0 auto; padding: 0 24px; }
        .lx-logo { font-family: var(--font-display); font-size: 22px; color: var(--ink); text-decoration: none; letter-spacing: -0.5px; }
        .lx-logo span { color: var(--indigo-light); }
        .lx-nav-links { display: flex; align-items: center; gap: 32px; }
        .lx-nav-links a { font-size: 14px; color: var(--ink-soft); text-decoration: none; transition: color .2s; }
        .lx-nav-links a:hover { color: var(--ink); }
        .lx-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 20px;
          border-radius: 8px; font-size: 14px; font-weight: 500; text-decoration: none;
          cursor: pointer; border: none; transition: all .2s; }
        .lx-btn-outline { background: transparent; border: 1.5px solid var(--border); color: var(--ink-mid); }
        .lx-btn-outline:hover { border-color: var(--indigo-light); color: var(--indigo-light); }
        .lx-btn-primary { background: var(--indigo); color: #fff; }
        .lx-btn-primary:hover { background: var(--indigo-light); transform: translateY(-1px); }
        .lx-btn-lg { padding: 14px 28px; font-size: 15px; border-radius: 10px; }
        .lx-btn-ghost { background: rgba(255,255,255,0.12); color: #fff; border: 1.5px solid rgba(255,255,255,0.25); }
        .lx-btn-ghost:hover { background: rgba(255,255,255,0.22); }
        .lx-hero { padding: 140px 0 100px; position: relative; overflow: hidden; }
        .lx-hero-bg { position: absolute; inset: 0; z-index: 0;
          background: radial-gradient(ellipse 80% 60% at 50% -10%, #c7d2fe 0%, transparent 70%); }
        .lx-hero-inner { position: relative; z-index: 1; text-align: center; max-width: 760px; margin: 0 auto; }
        .lx-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px;
          background: var(--indigo-dim); color: var(--indigo); border-radius: 99px;
          font-size: 12px; font-weight: 500; letter-spacing: 0.04em; margin-bottom: 28px; }
        .lx-h1 { font-family: var(--font-display); font-size: clamp(42px, 6vw, 72px);
          line-height: 1.08; letter-spacing: -1.5px; color: var(--ink); margin-bottom: 22px; }
        .lx-h1 em { color: var(--indigo-light); font-style: italic; }
        .lx-lead { font-size: clamp(16px, 2vw, 18px); color: var(--ink-soft); line-height: 1.7;
          max-width: 560px; margin: 0 auto 40px; }
        .lx-hero-ctas { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .lx-disclaimer-tiny { font-size: 12px; color: var(--ink-soft); margin-top: 20px; }
        .lx-stats { background: var(--indigo); color: #fff; padding: 52px 0; }
        .lx-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; }
        .lx-stat { text-align: center; padding: 0 24px; border-right: 1px solid rgba(255,255,255,0.15); }
        .lx-stat:last-child { border-right: none; }
        .lx-stat-num { font-family: var(--font-display); font-size: 40px; letter-spacing: -1px; margin-bottom: 6px; }
        .lx-stat-label { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.4; }
        .lx-section { padding: 96px 0; }
        .lx-section-alt { background: #F5F5F3; }
        .lx-section-dark { background: var(--ink); color: #fff; }
        .lx-eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--indigo-light); margin-bottom: 12px; }
        .lx-h2 { font-family: var(--font-display); font-size: clamp(32px, 4vw, 48px);
          line-height: 1.15; letter-spacing: -0.8px; margin-bottom: 18px; }
        .lx-body { font-size: 16px; color: var(--ink-soft); line-height: 1.75; }
        .lx-body-dark { color: rgba(255,255,255,0.65); }
        .lx-solutions { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 56px; }
        .lx-solution-card { border-radius: 16px; padding: 40px; position: relative; overflow: hidden; }
        .lx-sol-webcam { background: var(--cyan-dim); border: 1px solid rgba(6,182,212,0.2); }
        .lx-sol-game { background: var(--indigo-dim); border: 1px solid rgba(99,102,241,0.2); }
        .lx-sol-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center;
          justify-content: center; margin-bottom: 20px; }
        .lx-sol-icon-cyan { background: var(--cyan); color: #fff; }
        .lx-sol-icon-indigo { background: var(--indigo); color: #fff; }
        .lx-sol-h3 { font-family: var(--font-display); font-size: 24px; margin-bottom: 12px; color: var(--ink); }
        .lx-sol-body { font-size: 15px; color: var(--ink-soft); line-height: 1.7; margin-bottom: 20px; }
        .lx-sol-features { list-style: none; display: flex; flex-direction: column; gap: 8px; }
        .lx-sol-features li { display: flex; align-items: flex-start; gap: 8px; font-size: 14px; color: var(--ink-mid); }
        .lx-sol-features li .check { color: var(--indigo); flex-shrink: 0; margin-top: 2px; }
        .lx-sol-tag { display: inline-flex; margin-top: 24px; padding: 5px 12px; border-radius: 99px;
          font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
        .lx-sol-tag-cyan { background: var(--cyan); color: #fff; }
        .lx-sol-tag-indigo { background: var(--indigo); color: #fff; }
        .lx-sol-bg-deco { position: absolute; right: -30px; bottom: -30px; width: 140px; height: 140px;
          border-radius: 50%; opacity: 0.08; }
        .lx-sol-bg-deco-cyan { background: var(--cyan); }
        .lx-sol-bg-deco-indigo { background: var(--indigo); }
        .lx-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; margin-top: 56px; position: relative; }
        .lx-steps::before { content: ""; position: absolute; top: 28px; left: 12.5%; right: 12.5%;
          height: 1px; background: linear-gradient(90deg, var(--indigo-dim), var(--indigo-light), var(--indigo-dim)); z-index: 0; }
        .lx-step { text-align: center; padding: 0 16px; position: relative; z-index: 1; }
        .lx-step-num { width: 56px; height: 56px; border-radius: 50%; background: #fff;
          border: 2px solid var(--indigo-light); display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px; font-family: var(--font-display); font-size: 22px; color: var(--indigo); }
        .lx-step-h { font-size: 15px; font-weight: 600; color: var(--ink); margin-bottom: 8px; }
        .lx-step-p { font-size: 14px; color: var(--ink-soft); line-height: 1.6; }
        .lx-faq { max-width: 720px; margin: 56px auto 0; }
        .lx-faq-item { border-bottom: 1px solid var(--border); }
        .lx-faq-summary { display: block; cursor: pointer; list-style: none; padding: 22px 0;
          font-size: 16px; font-weight: 500; color: var(--ink); line-height: 1.4; }
        .lx-faq-summary::-webkit-details-marker { display: none; }
        .lx-faq-summary::after { content: "+"; float: right; color: var(--ink-soft); font-size: 20px; line-height: 1; }
        details[open] > .lx-faq-summary::after { content: "-"; }
        .lx-faq-a { font-size: 15px; color: var(--ink-soft); line-height: 1.75; padding-bottom: 20px; }
        .lx-disclaimer { background: #FEF3C7; border-top: 1px solid #FCD34D; border-bottom: 1px solid #FCD34D; padding: 18px 0; }
        .lx-disclaimer-inner { display: flex; align-items: center; gap: 12px; }
        .lx-disclaimer-text { font-size: 13px; color: #78350F; line-height: 1.5; }
        .lx-disclaimer-text strong { font-weight: 600; }
        .lx-cta-inner { text-align: center; max-width: 600px; margin: 0 auto; }
        .lx-h2-light { font-family: var(--font-display); font-size: clamp(32px, 4vw, 48px);
          line-height: 1.15; letter-spacing: -0.8px; margin-bottom: 18px; color: #fff; }
        .lx-footer { background: #0F0E17; color: rgba(255,255,255,0.5); padding: 48px 0; }
        .lx-footer-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        .lx-footer-logo { font-family: var(--font-display); font-size: 20px; color: #fff; }
        .lx-footer-logo span { color: var(--indigo-light); }
        .lx-footer-links { display: flex; gap: 24px; }
        .lx-footer-links a { font-size: 13px; color: rgba(255,255,255,0.5); text-decoration: none; transition: color .2s; }
        .lx-footer-links a:hover { color: #fff; }
        @media (max-width: 768px) {
          .lx-nav-links { display: none; }
          .lx-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
          .lx-stat { border-right: none; }
          .lx-solutions { grid-template-columns: 1fr; }
          .lx-steps { grid-template-columns: repeat(2, 1fr); gap: 32px; }
          .lx-steps::before { display: none; }
          .lx-footer-inner { flex-direction: column; text-align: center; }
        }
      `}</style>

      <nav className="lx-nav">
        <div className="lx-nav-inner">
          <Link href="/" className="lx-logo">
            Lexora<span>.</span>
          </Link>
          <div className="lx-nav-links">
            <a href="#solutions">Solutions</a>
            <a href="#how-it-works">How it works</a>
            <a href="#faq">FAQ</a>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/login" className="lx-btn lx-btn-outline">
              Sign in
            </Link>
            <Link href="/signup" className="lx-btn lx-btn-primary">
              Start screening
            </Link>
          </div>
        </div>
      </nav>

      <section className="lx-hero">
        <div className="lx-hero-bg" />
        <div className="lx-container">
          <div className="lx-hero-inner">
            <div className="lx-badge">
              <IconShield />
              AI-powered dyslexia screening - not a diagnosis
            </div>
            <h1 className="lx-h1 serif">
              Early screening.
              <br />
              <em>Earlier support.</em>
            </h1>
            <p className="lx-lead">
              Lexora helps parents and educators identify dyslexia risk in
              children aged 7-17 through a short, engaging online assessment.
            </p>
            <div className="lx-hero-ctas">
              <Link href="/signup" className="lx-btn lx-btn-primary lx-btn-lg">
                Begin assessment <IconArrow />
              </Link>
              <a href="#solutions" className="lx-btn lx-btn-outline lx-btn-lg">
                How it works
              </a>
            </div>
            <p className="lx-disclaimer-tiny">
              Results are screening estimates only. Consult a qualified
              professional for diagnosis.
            </p>
          </div>
        </div>
      </section>

      <div className="lx-disclaimer">
        <div className="lx-container">
          <div className="lx-disclaimer-inner">
            <p className="lx-disclaimer-text">
              <strong>Important:</strong> Lexora is a <strong>screening tool
              only</strong>. A positive result indicates risk and warrants
              professional evaluation.
            </p>
          </div>
        </div>
      </div>

      <section className="lx-stats">
        <div className="lx-container">
          <div className="lx-stats-grid">
            {stats.map((item) => (
              <div className="lx-stat" key={item.label}>
                <div className="lx-stat-num serif">{item.num}</div>
                <div className="lx-stat-label">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lx-section lx-section-alt" id="solutions">
        <div className="lx-container">
          <p className="lx-eyebrow" style={{ textAlign: "center" }}>
            Our assessments
          </p>
          <h2 className="lx-h2 serif" style={{ textAlign: "center" }}>
            Two ways to screen
          </h2>
          <p
            className="lx-body"
            style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}
          >
            Both tools are grounded in published dyslexia research and validated
            on large participant groups.
          </p>
          <div className="lx-solutions">
            <div className="lx-solution-card lx-sol-webcam">
              <div className="lx-sol-bg-deco lx-sol-bg-deco-cyan" />
              <div className="lx-sol-icon lx-sol-icon-cyan">
                <IconEye />
              </div>
              <h3 className="lx-sol-h3 serif">Webcam Eye-Tracking</h3>
              <p className="lx-sol-body">
                Tracks gaze patterns as the child reads and detects risk-linked
                fixation and regression signatures without special hardware.
              </p>
              <ul className="lx-sol-features">
                {[
                  "No special equipment",
                  "Measures fixation and regression behavior",
                  "Age-appropriate reading passages",
                  "Results in under 10 minutes",
                ].map((feature) => (
                  <li key={feature}>
                    <span className="check">
                      <IconCheck />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <span className="lx-sol-tag lx-sol-tag-cyan">Available now</span>
            </div>

            <div className="lx-solution-card lx-sol-game">
              <div className="lx-sol-bg-deco lx-sol-bg-deco-indigo" />
              <div className="lx-sol-icon lx-sol-icon-indigo">
                <IconGame />
              </div>
              <h3 className="lx-sol-h3 serif">Gamified Language Test</h3>
              <p className="lx-sol-body">
                A game-style assessment that measures phonological awareness,
                working memory, letter discrimination, and orthographic
                processing.
              </p>
              <ul className="lx-sol-features">
                {[
                  "Age-customized tracks",
                  "Arabic and English variants",
                  "Model-backed risk scoring",
                  "Fast completion",
                ].map((feature) => (
                  <li key={feature}>
                    <span className="check">
                      <IconCheck />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <span className="lx-sol-tag lx-sol-tag-indigo">Core assessment</span>
            </div>
          </div>
        </div>
      </section>

      <section className="lx-section" id="how-it-works">
        <div className="lx-container">
          <p className="lx-eyebrow" style={{ textAlign: "center" }}>
            Simple process
          </p>
          <h2 className="lx-h2 serif" style={{ textAlign: "center" }}>
            From sign-up to report in minutes
          </h2>
          <div className="lx-steps">
            {[
              {
                n: "1",
                h: "Create account",
                p: "Register and enter child details.",
              },
              {
                n: "2",
                h: "Choose assessment",
                p: "Select English or Arabic flow and start the test.",
              },
              {
                n: "3",
                h: "Child completes test",
                p: "The child completes interactive tasks.",
              },
              {
                n: "4",
                h: "Review report",
                p: "Open probability, threshold, and risk details.",
              },
            ].map((step) => (
              <div className="lx-step" key={step.n}>
                <div className="lx-step-num serif">{step.n}</div>
                <p className="lx-step-h">{step.h}</p>
                <p className="lx-step-p">{step.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lx-section lx-section-alt" id="faq">
        <div className="lx-container">
          <p className="lx-eyebrow" style={{ textAlign: "center" }}>
            Common questions
          </p>
          <h2 className="lx-h2 serif" style={{ textAlign: "center" }}>
            Frequently asked questions
          </h2>
          <div className="lx-faq">
            {faqs.map((item) => (
              <details className="lx-faq-item" key={item.q}>
                <summary className="lx-faq-summary">{item.q}</summary>
                <p className="lx-faq-a">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="lx-section lx-section-dark">
        <div className="lx-container">
          <div className="lx-cta-inner">
            <p className="lx-eyebrow" style={{ color: "rgba(99,102,241,0.9)" }}>
              Ready to start?
            </p>
            <h2 className="lx-h2-light serif">
              Give your child the gift of early answers
            </h2>
            <p className="lx-body-dark lx-body" style={{ marginBottom: 36 }}>
              Fifteen minutes today can prevent years of unnecessary struggle.
            </p>
            <div
              style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}
            >
              <Link href="/signup" className="lx-btn lx-btn-primary lx-btn-lg">
                Start free assessment <IconArrow />
              </Link>
              <Link href="/login" className="lx-btn lx-btn-ghost lx-btn-lg">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="lx-footer">
        <div className="lx-container">
          <div className="lx-footer-inner">
            <span className="lx-footer-logo serif">
              Lexora<span>.</span>
            </span>
            <div className="lx-footer-links">
              <a href="#faq">FAQ</a>
              <a href="#">Privacy</a>
              <a href="#">About</a>
              <Link href="/login">Sign in</Link>
            </div>
            <p style={{ fontSize: 12 }}>
              Copyright 2026 Lexora - Screening tool only
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
