"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  type AppLocale,
  isArabicLocale,
  localePath,
  oppositeLocale,
} from "@/lib/locale";

type Role = "parent" | "educator" | "specialist" | "";

type SignupPageViewProps = {
  locale?: AppLocale;
};

const copyByLocale = {
  en: {
    roleRequired: "Please select your profile role.",
    nameRequired: "Please enter your name.",
    emailRequired: "Please enter your email.",
    validEmail: "Please enter a valid email address.",
    passwordLength: "Password must be at least 8 characters.",
    passwordMismatch: "Passwords do not match.",
    agreeTerms: "Please accept the terms to continue.",
    signupFailed: "Unable to create account. Please try again.",
    backHome: "Back to home",
    languageSwitch: "العربية",
    titleStep1: "Create your account",
    subtitleStep1: "Already have one?",
    signIn: "Sign in",
    joinAs: "I am joining as a...",
    continue: "Continue",
    titleStep2: "Your details",
    selectedPrefix: "You selected:",
    change: "Change",
    fullName: "Full name",
    email: "Email address",
    password: "Password",
    confirmPassword: "Confirm password",
    show: "Show",
    hide: "Hide",
    minChars: "Min. 8 characters",
    repeatPassword: "Repeat password",
    termsText1: "I agree to the",
    termsText2: "I understand Lexora provides screening estimates only.",
    create: "Create account",
    creating: "Creating account...",
    back: "Back",
    note: "We store interaction data only. Results are screening estimates, not diagnosis.",
    leftTitle1: "Start screening.",
    leftTitle2: "Start supporting.",
    leftBody:
      "Create your Lexora account and run your first assessment in under 20 minutes.",
    features: [
      "Gamified 15-minute test",
      "Optional webcam eye-tracking",
      "Instant risk report",
      "Encrypted data handling",
    ],
    leftDisclaimer:
      "Lexora is a screening tool only, not a diagnostic instrument.",
    accountTypeLabel: "Authentication account type",
    accountTypeValue:
      "Person account (default). Admin accounts are assigned securely by the owner.",
    roleParent: "Parent / Guardian",
    roleParentDesc: "Screening my child",
    roleTeacher: "Teacher / School",
    roleTeacherDesc: "Screening students",
    roleSpecialist: "Specialist / Clinician",
    roleSpecialistDesc: "Professional use",
    weak: "Weak",
    fair: "Fair",
    good: "Good",
    strong: "Strong",
  },
  ar: {
    roleRequired: "يرجى اختيار دورك.",
    nameRequired: "يرجى إدخال الاسم.",
    emailRequired: "يرجى إدخال البريد الإلكتروني.",
    validEmail: "يرجى إدخال بريد إلكتروني صحيح.",
    passwordLength: "يجب أن تكون كلمة المرور 8 أحرف على الأقل.",
    passwordMismatch: "كلمتا المرور غير متطابقتين.",
    agreeTerms: "يرجى الموافقة على الشروط للمتابعة.",
    signupFailed: "تعذر إنشاء الحساب. حاول مرة أخرى.",
    backHome: "العودة للرئيسية",
    languageSwitch: "English",
    titleStep1: "إنشاء حساب جديد",
    subtitleStep1: "لديك حساب بالفعل؟",
    signIn: "تسجيل الدخول",
    joinAs: "سأستخدم المنصة بصفتي...",
    continue: "متابعة",
    titleStep2: "بياناتك",
    selectedPrefix: "اخترت:",
    change: "تغيير",
    fullName: "الاسم الكامل",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    show: "إظهار",
    hide: "إخفاء",
    minChars: "8 أحرف على الأقل",
    repeatPassword: "أعد كتابة كلمة المرور",
    termsText1: "أوافق على",
    termsText2: "وأفهم أن Lexora تقدم تقديرات فحص فقط وليست تشخيصا.",
    create: "إنشاء الحساب",
    creating: "جاري إنشاء الحساب...",
    back: "رجوع",
    note: "نحتفظ ببيانات التفاعل فقط. النتائج تقديرية للفحص وليست تشخيصا.",
    leftTitle1: "ابدأ الفحص.",
    leftTitle2: "وابدأ الدعم.",
    leftBody: "أنشئ حسابك في Lexora وابدأ أول تقييم خلال أقل من 20 دقيقة.",
    features: [
      "اختبار تفاعلي خلال 15 دقيقة",
      "تتبع العين بالكاميرا (اختياري)",
      "تقرير خطر فوري",
      "حماية وتشفير للبيانات",
    ],
    leftDisclaimer: "Lexora أداة فحص أولي فقط وليست أداة تشخيصية.",
    accountTypeLabel: "نوع حساب المصادقة",
    accountTypeValue:
      "حساب شخصي (افتراضي). حسابات الإدارة يتم تعيينها بشكل آمن بواسطة مالك المنصة.",
    roleParent: "ولي أمر",
    roleParentDesc: "لفحص طفلي",
    roleTeacher: "معلم / مدرسة",
    roleTeacherDesc: "لفحص الطلاب",
    roleSpecialist: "أخصائي",
    roleSpecialistDesc: "استخدام مهني",
    weak: "ضعيف",
    fair: "مقبول",
    good: "جيد",
    strong: "قوي",
  },
} as const;

export function SignupPageView({ locale = "en" }: SignupPageViewProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isArabic = isArabicLocale(locale);
  const t = copyByLocale[locale];
  const dashboardPath = localePath(locale, "/dashboard");

  const roles = [
    { id: "parent", label: t.roleParent, desc: t.roleParentDesc },
    { id: "educator", label: t.roleTeacher, desc: t.roleTeacherDesc },
    {
      id: "specialist",
      label: t.roleSpecialist,
      desc: t.roleSpecialistDesc,
    },
  ] as const;

  function handleStep1(event: FormEvent) {
    event.preventDefault();
    if (!role) {
      setError(t.roleRequired);
      return;
    }

    setError("");
    setStep(2);
  }

  async function handleStep2(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError(t.nameRequired);
      return;
    }
    if (!email.trim()) {
      setError(t.emailRequired);
      return;
    }
    if (!email.includes("@")) {
      setError(t.validEmail);
      return;
    }
    if (password.length < 8) {
      setError(t.passwordLength);
      return;
    }
    if (password !== confirm) {
      setError(t.passwordMismatch);
      return;
    }
    if (!agree) {
      setError(t.agreeTerms);
      return;
    }

    setLoading(true);

    try {
      const response = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        callbackURL: dashboardPath,
      });

      if (response.error) {
        throw new Error(response.error.message || t.signupFailed);
      }

      router.push(dashboardPath);
    } catch (signupError) {
      setError(
        signupError instanceof Error ? signupError.message : t.signupFailed,
      );
    } finally {
      setLoading(false);
    }
  }

  const strength =
    password.length === 0
      ? 0
      : password.length < 6
        ? 1
        : password.length < 10
          ? 2
          : /[A-Z]/.test(password) && /[0-9]/.test(password)
            ? 4
            : 3;

  const strengthLabel = ["", t.weak, t.fair, t.good, t.strong];
  const strengthColor = ["", "#EF4444", "#F59E0B", "#10B981", "#059669"];

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
        .auth-right { display: flex; align-items: center; justify-content: center; padding: 48px 40px; }
        .auth-form-wrap { width: 100%; max-width: 420px; }
        .auth-back { display: inline-flex; align-items: center; gap: 6px; font-size: 13px;
          color: var(--ink-soft); text-decoration: none; margin-bottom: 32px; transition: color .2s; }
        .auth-back:hover { color: var(--ink); }
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
        .auth-roles { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
        .auth-role-card { display: flex; align-items: center; gap: 14px; padding: 14px 16px;
          border-radius: 10px; border: 1.5px solid var(--border); background: #fff;
          cursor: pointer; transition: all .2s; user-select: none; }
        .auth-role-card:hover { border-color: rgba(99,102,241,0.4); background: var(--indigo-dim); }
        .auth-role-card.selected { border-color: var(--indigo-light); background: var(--indigo-dim); }
        .auth-role-label { font-size: 15px; font-weight: 500; color: var(--ink); }
        .auth-role-desc { font-size: 13px; color: var(--ink-soft); }
        .auth-role-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--border);
          margin-left: auto; flex-shrink: 0; transition: all .2s; }
        .auth-role-card.selected .auth-role-radio { border-color: var(--indigo-light); background: var(--indigo); box-shadow: inset 0 0 0 3px #fff; }
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
        .auth-strength-bars { display: flex; gap: 4px; margin-top: 6px; }
        .auth-strength-bar { flex: 1; height: 3px; border-radius: 2px; background: var(--border); transition: background .3s; }
        .auth-strength-label { font-size: 11px; margin-top: 4px; transition: color .3s; }
        .auth-check-row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 16px; }
        .auth-check-row input[type=checkbox] { margin-top: 2px; accent-color: var(--indigo); width: 15px; height: 15px; flex-shrink: 0; }
        .auth-check-label { font-size: 13px; color: var(--ink-soft); line-height: 1.5; }
        .auth-check-label a { color: var(--indigo-light); text-decoration: none; }
        .auth-check-label a:hover { text-decoration: underline; }
        .auth-error { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px;
          padding: 10px 14px; font-size: 13px; color: #991B1B; margin-bottom: 14px; }
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

      <div
        className="auth-page"
        dir={isArabic ? "rtl" : "ltr"}
        lang={isArabic ? "ar" : "en"}
      >
        <div className="auth-left">
          <div className="auth-left-deco-1" />
          <div className="auth-left-deco-2" />
          <div className="auth-left-logo">
            Lexora<span>.</span>
          </div>
          <div className="auth-left-content">
            <h2 className="auth-left-h">
              {t.leftTitle1}
              <br />
              <em>{t.leftTitle2}</em>
            </h2>
            <p className="auth-left-p">{t.leftBody}</p>
            <div className="auth-left-features">
              {t.features.map((feature) => (
                <div className="auth-left-feat" key={feature}>
                  <div className="auth-left-feat-icon">+</div>
                  <span className="auth-left-feat-text">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="auth-left-disclaimer">{t.leftDisclaimer}</p>
        </div>

        <div className="auth-right">
          <div className="auth-form-wrap">
            <Link href={localePath(locale, "/")} className="auth-back">
              {t.backHome}
            </Link>
            <Link
              href={localePath(oppositeLocale(locale), "/signup")}
              className="auth-back"
              style={{ marginLeft: 10 }}
            >
              {t.languageSwitch}
            </Link>

            <div className="auth-steps">
              <div
                className={`auth-step-dot ${step === 1 ? "active" : "done"}`}
              >
                {step === 1 ? "1" : "OK"}
              </div>
              <div className={`auth-step-line ${step === 2 ? "done" : ""}`} />
              <div
                className={`auth-step-dot ${step === 2 ? "active" : "future"}`}
              >
                2
              </div>
            </div>

            {step === 1 ? (
              <>
                <h1 className="auth-title">{t.titleStep1}</h1>
                <p className="auth-subtitle">
                  {t.subtitleStep1}{" "}
                  <Link href={localePath(locale, "/login")}>{t.signIn}</Link>
                </p>

                <p
                  style={{
                    fontSize: 13,
                    color: "var(--ink-soft)",
                    marginBottom: 14,
                  }}
                >
                  {t.joinAs}
                </p>

                <form onSubmit={handleStep1} noValidate>
                  {error ? <div className="auth-error">{error}</div> : null}

                  <div className="auth-roles">
                    {roles.map((entry) => (
                      <div
                        key={entry.id}
                        className={`auth-role-card ${role === entry.id ? "selected" : ""}`}
                        onClick={() => setRole(entry.id as Role)}
                      >
                        <div>
                          <div className="auth-role-label">{entry.label}</div>
                          <div className="auth-role-desc">{entry.desc}</div>
                        </div>
                        <div className="auth-role-radio" />
                      </div>
                    ))}
                  </div>

                  <button type="submit" className="auth-submit">
                    {t.continue}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h1 className="auth-title">{t.titleStep2}</h1>
                <p className="auth-subtitle">
                  {t.selectedPrefix}{" "}
                  <strong style={{ color: "var(--indigo)" }}>
                    {roles.find((entry) => entry.id === role)?.label}
                  </strong>{" "}
                  <button
                    onClick={() => setStep(1)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--indigo-light)",
                      fontSize: 13,
                      fontWeight: 500,
                      padding: 0,
                    }}
                    type="button"
                  >
                    {t.change}
                  </button>
                </p>

                <form onSubmit={handleStep2} noValidate>
                  {error ? <div className="auth-error">{error}</div> : null}

                  <div className="auth-field">
                    <label className="auth-label" htmlFor="name">
                      {t.fullName}
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="auth-input"
                      placeholder="Ahmed Hassan"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label className="auth-label" htmlFor="email">
                      {t.email}
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
                    <label className="auth-label" htmlFor="password">
                      {t.password}
                    </label>
                    <div className="auth-input-wrap">
                      <input
                        id="password"
                        type={showPass ? "text" : "password"}
                        className="auth-input"
                        placeholder={t.minChars}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ paddingRight: 52 }}
                      />
                      <button
                        type="button"
                        className="auth-input-suffix"
                        onClick={() => setShowPass((value) => !value)}
                      >
                        {showPass ? t.hide : t.show}
                      </button>
                    </div>
                    {password.length > 0 ? (
                      <>
                        <div className="auth-strength-bars">
                          {[1, 2, 3, 4].map((index) => (
                            <div
                              key={index}
                              className="auth-strength-bar"
                              style={{
                                background:
                                  index <= strength
                                    ? strengthColor[strength]
                                    : undefined,
                              }}
                            />
                          ))}
                        </div>
                        <p
                          className="auth-strength-label"
                          style={{ color: strengthColor[strength] }}
                        >
                          {strengthLabel[strength]}
                        </p>
                      </>
                    ) : null}
                  </div>

                  <div className="auth-field">
                    <label className="auth-label" htmlFor="confirm">
                      {t.confirmPassword}
                    </label>
                    <input
                      id="confirm"
                      type={showPass ? "text" : "password"}
                      className="auth-input"
                      placeholder={t.repeatPassword}
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                    />
                  </div>

                  <div className="auth-check-row">
                    <input
                      type="checkbox"
                      id="agree"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                    />
                    <label className="auth-check-label" htmlFor="agree">
                      {t.termsText1} <a href="#">Terms of Service</a> and
                      <a href="#"> Privacy Policy</a>. {t.termsText2}
                    </label>
                  </div>

                  <div className="auth-note" style={{ marginBottom: 14 }}>
                    <strong>{t.accountTypeLabel}: </strong>
                    {t.accountTypeValue}
                  </div>

                  <button
                    type="submit"
                    className="auth-submit"
                    disabled={loading}
                  >
                    {loading ? t.creating : t.create}
                  </button>

                  <div style={{ marginTop: 10 }}>
                    <button
                      type="button"
                      className="auth-submit auth-submit-outline"
                      onClick={() => setStep(1)}
                      disabled={loading}
                    >
                      {t.back}
                    </button>
                  </div>
                </form>
              </>
            )}

            <div className="auth-note">{t.note}</div>
          </div>
        </div>
      </div>
    </>
  );
}
