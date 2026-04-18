// app/page.tsx  —  Lexora Landing Page
// Fonts used: "Instrument Serif" (display) + "DM Sans" (body)
// Add to layout.tsx:
//   import { Instrument_Serif, DM_Sans } from "next/font/google"
//   const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-serif" })
//   const sans  = DM_Sans({ subsets: ["latin"], variable: "--font-sans" })
//   <body className={`${serif.variable} ${sans.variable}`}>

import Link from "next/link"

// ─── tiny icon helpers (inline SVG, no dep) ──────────────────────────────────
function IconBrain() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
    </svg>
  )
}
function IconEye() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}
function IconGame() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/>
      <line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/>
      <rect x="2" y="6" width="20" height="12" rx="2"/>
    </svg>
  )
}
function IconShield() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}
function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}
function IconChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}
function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  )
}

// ─── data ─────────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "What exactly is dyslexia?",
    a: "Dyslexia is a specific learning difference affecting how the brain processes written and spoken language. It has nothing to do with intelligence — many highly successful people are dyslexic. It primarily shows up as difficulty with accurate or fluent word recognition, poor spelling, and decoding. It stems from differences in phonological processing, not from lack of effort or poor vision."
  },
  {
    q: "How common is dyslexia?",
    a: "Estimates range from 5% to 17% of the population depending on the definition and screening method used. In Egypt and across the Arab world, awareness remains low and many children go unidentified — often mistaken for low motivation or general learning delay. The true prevalence in Arabic is likely similar to other languages."
  },
  {
    q: "Why does early screening matter so much?",
    a: "The earlier dyslexia is identified, the more effective intervention can be. Children's brains are most plastic before age 8. Without early support, 35% of students with dyslexia drop out of school. With proper support, most children with dyslexia can learn to read successfully. A five-minute screening can change the trajectory of a child's entire education."
  },
  {
    q: "Is this a diagnosis?",
    a: "No. Lexora is a screening tool, not a diagnostic instrument. A positive result means your child shows patterns associated with dyslexia risk and should be evaluated by a qualified professional — a speech-language pathologist, educational psychologist, or neuropsychologist. Think of it like a blood pressure check: useful information, but not a medical diagnosis."
  },
  {
    q: "Can dyslexia be treated?",
    a: "There is no 'cure', but structured literacy interventions — especially those based on the Orton-Gillingham approach — are highly effective. Children who receive appropriate support show measurable improvements in reading accuracy and fluency. The key is identifying the difficulty early and providing the right kind of explicit phonics instruction."
  },
  {
    q: "Is Arabic dyslexia different from English dyslexia?",
    a: "Arabic has a shallow orthography (consistent letter-sound rules), which means dyslexia manifests somewhat differently than in English. Reading speed is a stronger indicator than accuracy alone. Additionally, Arabic's unique features — the root-and-pattern morphology, short vowel omission in standard text, and the diglossia between spoken dialect and written Standard Arabic — create specific challenges that our screening accounts for."
  },
  {
    q: "How accurate is the Lexora screening?",
    a: "Our model is trained on the Rello et al. (2020) dataset of over 5,000 participants and achieves ROC-AUC scores of 0.74–0.86 depending on age group. For the 9–11 age range (where dyslexia is most detectable), sensitivity reaches over 80%. These numbers are comparable to the original research. All results should be interpreted by a professional."
  },
  {
    q: "What data do you collect?",
    a: "During the screening, we collect interaction data — how your child clicks, their response timing, accuracy on each exercise — along with basic demographics (age, gender, language background). We do not collect names, photos, or personally identifying information. All data is encrypted, stored securely, and never sold to third parties."
  }
]

const stats = [
  { num: "1 in 10", label: "children have dyslexia worldwide" },
  { num: "35%", label: "without support drop out of school" },
  { num: "80%+", label: "screening sensitivity (ages 9–11)" },
  { num: "15 min", label: "is all the assessment takes" },
]

export default function LandingPage() {
  return (
    <>
      {/* ── global styles injected via style tag (move to globals.css) ── */}
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
        
        /* nav */
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

        /* hero */
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

        /* stats band */
        .lx-stats { background: var(--indigo); color: #fff; padding: 52px 0; }
        .lx-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; }
        .lx-stat { text-align: center; padding: 0 24px; border-right: 1px solid rgba(255,255,255,0.15); }
        .lx-stat:last-child { border-right: none; }
        .lx-stat-num { font-family: var(--font-display); font-size: 40px; letter-spacing: -1px; margin-bottom: 6px; }
        .lx-stat-label { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.4; }

        /* section basics */
        .lx-section { padding: 96px 0; }
        .lx-section-alt { background: #F5F5F3; }
        .lx-section-dark { background: var(--ink); color: #fff; }
        .lx-eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--indigo-light); margin-bottom: 12px; }
        .lx-h2 { font-family: var(--font-display); font-size: clamp(32px, 4vw, 48px);
          line-height: 1.15; letter-spacing: -0.8px; margin-bottom: 18px; }
        .lx-body { font-size: 16px; color: var(--ink-soft); line-height: 1.75; }
        .lx-body-dark { color: rgba(255,255,255,0.65); }

        /* solutions */
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

        /* how it works */
        .lx-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; margin-top: 56px; position: relative; }
        .lx-steps::before { content: ""; position: absolute; top: 28px; left: 12.5%; right: 12.5%;
          height: 1px; background: linear-gradient(90deg, var(--indigo-dim), var(--indigo-light), var(--indigo-dim)); z-index: 0; }
        .lx-step { text-align: center; padding: 0 16px; position: relative; z-index: 1; }
        .lx-step-num { width: 56px; height: 56px; border-radius: 50%; background: #fff;
          border: 2px solid var(--indigo-light); display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px; font-family: var(--font-display); font-size: 22px; color: var(--indigo); }
        .lx-step-h { font-size: 15px; font-weight: 600; color: var(--ink); margin-bottom: 8px; }
        .lx-step-p { font-size: 14px; color: var(--ink-soft); line-height: 1.6; }

        /* FAQ */
        .lx-faq { max-width: 720px; margin: 56px auto 0; }
        .lx-faq-item { border-bottom: 1px solid var(--border); }
        .lx-faq-q { display: flex; align-items: center; justify-content: space-between;
          padding: 22px 0; cursor: pointer; gap: 16px; }
        .lx-faq-q-text { font-size: 16px; font-weight: 500; color: var(--ink); line-height: 1.4; }
        .lx-faq-chevron { color: var(--ink-soft); flex-shrink: 0; transition: transform .25s; }
        .lx-faq-chevron.open { transform: rotate(180deg); }
        .lx-faq-a { font-size: 15px; color: var(--ink-soft); line-height: 1.75;
          padding-bottom: 20px; display: none; }
        .lx-faq-a.open { display: block; }

        /* disclaimer strip */
        .lx-disclaimer { background: #FEF3C7; border-top: 1px solid #FCD34D; border-bottom: 1px solid #FCD34D;
          padding: 18px 0; }
        .lx-disclaimer-inner { display: flex; align-items: center; gap: 12px; }
        .lx-disclaimer-icon { font-size: 20px; flex-shrink: 0; }
        .lx-disclaimer-text { font-size: 13px; color: #78350F; line-height: 1.5; }
        .lx-disclaimer-text strong { font-weight: 600; }

        /* CTA section */
        .lx-cta-inner { text-align: center; max-width: 600px; margin: 0 auto; }
        .lx-h2-light { font-family: var(--font-display); font-size: clamp(32px, 4vw, 48px);
          line-height: 1.15; letter-spacing: -0.8px; margin-bottom: 18px; color: #fff; }

        /* footer */
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

      {/* ── NAV ── */}
      <nav className="lx-nav">
        <div className="lx-nav-inner">
          <Link href="/" className="lx-logo">Lexora<span>.</span></Link>
          <div className="lx-nav-links">
            <a href="#solutions">Solutions</a>
            <a href="#how-it-works">How it works</a>
            <a href="#faq">FAQ</a>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/login" className="lx-btn lx-btn-outline">Sign in</Link>
            <Link href="/signup" className="lx-btn lx-btn-primary">Start screening</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="lx-hero">
        <div className="lx-hero-bg" />
        <div className="lx-container">
          <div className="lx-hero-inner">
            <div className="lx-badge">
              <IconShield />
              AI-powered dyslexia screening — not a diagnosis
            </div>
            <h1 className="lx-h1 serif">
              Early screening.<br />
              <em>Earlier support.</em>
            </h1>
            <p className="lx-lead">
              Lexora helps parents and educators identify dyslexia risk in children aged 7–17 
              through a short, engaging online assessment. Know earlier. Act sooner.
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
              Results are screening estimates only. Always consult a qualified professional for diagnosis.
            </p>
          </div>
        </div>
      </section>

      {/* ── DISCLAIMER STRIP ── */}
      <div className="lx-disclaimer">
        <div className="lx-container">
          <div className="lx-disclaimer-inner">
            <span className="lx-disclaimer-icon">⚠️</span>
            <p className="lx-disclaimer-text">
              <strong>Important:</strong> Lexora is a <strong>screening tool only</strong> — it does not diagnose dyslexia. 
              A positive result indicates risk and warrants professional evaluation by a speech-language pathologist 
              or educational psychologist. Results may include false positives and false negatives.
            </p>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <section className="lx-stats">
        <div className="lx-container">
          <div className="lx-stats-grid">
            {stats.map((s, i) => (
              <div className="lx-stat" key={i}>
                <div className="lx-stat-num serif">{s.num}</div>
                <div className="lx-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY SCREENING MATTERS ── */}
      <section className="lx-section" id="why">
        <div className="lx-container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            <div>
              <p className="lx-eyebrow">Why it matters</p>
              <h2 className="lx-h2 serif">Most children with dyslexia are never identified</h2>
              <p className="lx-body" style={{ marginBottom: 20 }}>
                In Egypt and across the Arab world, dyslexia is chronically under-diagnosed. 
                Children who struggle are too often labelled as unmotivated, inattentive, 
                or intellectually delayed — when in reality, they simply process written 
                language differently.
              </p>
              <p className="lx-body" style={{ marginBottom: 20 }}>
                The consequences compound over time. Without support, reading difficulties 
                affect every subject, erode self-confidence, and close doors that should 
                have stayed open. Research is clear: the earlier the identification, 
                the more effective the intervention.
              </p>
              <p className="lx-body">
                Lexora was built to make the first step — <em>knowing</em> — as easy 
                and accessible as possible.
              </p>
            </div>
            {/* visual block — replace with actual image/illustration */}
            <div style={{
              borderRadius: 20,
              background: "linear-gradient(135deg, #EEF2FF 0%, #ECFEFF 100%)",
              border: "1px solid rgba(99,102,241,0.15)",
              padding: 40,
              display: "flex",
              flexDirection: "column",
              gap: 16
            }}>
              {[
                { icon: "📚", title: "Missed early", desc: "Most children aren't identified until they fail at school — years too late for optimal intervention." },
                { icon: "🧠", title: "Not about intelligence", desc: "Dyslexia is a neurological difference. IQ is unrelated. Many people with dyslexia are exceptionally capable." },
                { icon: "✅", title: "Intervention works", desc: "Structured literacy programs can substantially close the reading gap when started early." },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 28, lineHeight: 1 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{item.title}</p>
                    <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SOLUTIONS ── */}
      <section className="lx-section lx-section-alt" id="solutions">
        <div className="lx-container">
          <p className="lx-eyebrow" style={{ textAlign: "center" }}>Our assessments</p>
          <h2 className="lx-h2 serif" style={{ textAlign: "center" }}>Two ways to screen</h2>
          <p className="lx-body" style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
            Both tools are grounded in published dyslexia research and validated on thousands of participants. 
            Use one or both for a more complete picture.
          </p>
          <div className="lx-solutions">

            {/* Webcam / eye-tracking */}
            <div className="lx-solution-card lx-sol-webcam">
              <div className="lx-sol-bg-deco lx-sol-bg-deco-cyan" />
              <div className="lx-sol-icon lx-sol-icon-cyan"><IconEye /></div>
              <h3 className="lx-sol-h3 serif">Webcam Eye-Tracking</h3>
              <p className="lx-sol-body">
                Using your device's camera, Lexora tracks gaze patterns as the child reads. 
                Dyslexia produces distinctive eye-movement signatures — irregular fixations, 
                excessive regressions, and atypical saccades — that our model detects 
                without any special hardware.
              </p>
              <ul className="lx-sol-features">
                {[
                  "No special equipment — works with any webcam",
                  "Based on Lexplore-style reading assessment methodology",
                  "Measures fixation duration, saccade length, and regression rate",
                  "Age-appropriate reading passages (Arabic & English)",
                  "Results in under 10 minutes",
                ].map((f, i) => (
                  <li key={i}>
                    <span className="check"><IconCheck /></span>
                    {f}
                  </li>
                ))}
              </ul>
              <span className="lx-sol-tag lx-sol-tag-cyan">Available now</span>
            </div>

            {/* Gamified test */}
            <div className="lx-solution-card lx-sol-game">
              <div className="lx-sol-bg-deco lx-sol-bg-deco-indigo" />
              <div className="lx-sol-icon lx-sol-icon-indigo"><IconGame /></div>
              <h3 className="lx-sol-h3 serif">Gamified Language Test</h3>
              <p className="lx-sol-body">
                A 15-minute game-style assessment — adapted from the Rello et al. (2020) PLOS ONE study — 
                that measures phonological awareness, working memory, letter discrimination, 
                and orthographic knowledge. Designed to feel like a game, not a test.
              </p>
              <ul className="lx-sol-features">
                {[
                  "32 exercises across 3 age-customised tracks (7–8, 9–11, 12–17)",
                  "Adapted for Arabic phonology and dyslexia error patterns",
                  "Random Forest model trained on 5,000+ participants",
                  "80%+ sensitivity for ages 9–11 (ROC-AUC 0.86)",
                  "Bilingual: Arabic and English versions",
                ].map((f, i) => (
                  <li key={i}>
                    <span className="check"><IconCheck /></span>
                    {f}
                  </li>
                ))}
              </ul>
              <span className="lx-sol-tag lx-sol-tag-indigo">Core assessment</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lx-section" id="how-it-works">
        <div className="lx-container">
          <p className="lx-eyebrow" style={{ textAlign: "center" }}>Simple process</p>
          <h2 className="lx-h2 serif" style={{ textAlign: "center" }}>From sign-up to report in 20 minutes</h2>
          <div className="lx-steps">
            {[
              { n: "1", h: "Create account", p: "Sign up as a parent, educator, or specialist. Enter basic details about the child." },
              { n: "2", h: "Choose assessment", p: "Select the gamified test, the eye-tracking assessment, or both for a fuller picture." },
              { n: "3", h: "Child plays the test", p: "The child completes the 15-minute interactive assessment. It feels like a game." },
              { n: "4", h: "Review the report", p: "You receive a risk-level report with recommendations and suggested next steps." },
            ].map((step, i) => (
              <div className="lx-step" key={i}>
                <div className="lx-step-num serif">{step.n}</div>
                <p className="lx-step-h">{step.h}</p>
                <p className="lx-step-p">{step.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="lx-section lx-section-alt" id="faq">
        <div className="lx-container">
          <p className="lx-eyebrow" style={{ textAlign: "center" }}>Common questions</p>
          <h2 className="lx-h2 serif" style={{ textAlign: "center" }}>Frequently asked questions</h2>
          <div className="lx-faq" id="faq-list">
            {faqs.map((item, i) => (
              <div className="lx-faq-item" key={i}>
                <div
                  className="lx-faq-q"
                  onClick={() => {
                    // handled by client component or simple JS below
                  }}
                  data-faq={i}
                >
                  <span className="lx-faq-q-text">{item.q}</span>
                  <span className="lx-faq-chevron" data-chevron={i}><IconChevron /></span>
                </div>
                <div className="lx-faq-a" id={`faq-a-${i}`}>{item.a}</div>
              </div>
            ))}
          </div>
          {/* FAQ toggle script — works in Next.js with dangerouslySetInnerHTML or move to client component */}
          <script dangerouslySetInnerHTML={{ __html: `
            document.querySelectorAll('[data-faq]').forEach(el => {
              el.addEventListener('click', () => {
                const idx = el.dataset.faq;
                const ans = document.getElementById('faq-a-' + idx);
                const chev = document.querySelector('[data-chevron="' + idx + '"]');
                const isOpen = ans.classList.contains('open');
                document.querySelectorAll('.lx-faq-a').forEach(a => a.classList.remove('open'));
                document.querySelectorAll('.lx-faq-chevron').forEach(c => c.classList.remove('open'));
                if (!isOpen) { ans.classList.add('open'); chev.classList.add('open'); }
              });
            });
          `}} />
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="lx-section lx-section-dark">
        <div className="lx-container">
          <div className="lx-cta-inner">
            <p className="lx-eyebrow" style={{ color: "rgba(99,102,241,0.9)" }}>Ready to start?</p>
            <h2 className="lx-h2-light serif">Give your child the gift of early answers</h2>
            <p className="lx-body-dark lx-body" style={{ marginBottom: 36 }}>
              Fifteen minutes today can prevent years of unnecessary struggle. 
              Lexora is free to try. No special equipment required.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/signup" className="lx-btn lx-btn-primary lx-btn-lg">
                Start free assessment <IconArrow />
              </Link>
              <Link href="/login" className="lx-btn lx-btn-ghost lx-btn-lg">
                Sign in
              </Link>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 20 }}>
              Screening results are not a diagnosis. Consult a qualified professional for comprehensive evaluation.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lx-footer">
        <div className="lx-container">
          <div className="lx-footer-inner">
            <span className="lx-footer-logo serif">Lexora<span>.</span></span>
            <div className="lx-footer-links">
              <a href="#faq">FAQ</a>
              <a href="#">Privacy</a>
              <a href="#">About</a>
              <Link href="/login">Sign in</Link>
            </div>
            <p style={{ fontSize: 12 }}>
              © 2025 Lexora · Screening tool only · Not a medical diagnostic device
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
