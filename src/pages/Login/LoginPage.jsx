import { platformApi } from '../../features/platform/platformApi.js'
import { saveTokens } from '../../features/auth/authApi.js'
import { useState } from 'react'
import { useLanguage } from '../../i18n/useLanguage.js'
import { RouteLink } from '../../routing/clientRouter.jsx'
import Icon from '../../components/ui/Icon.jsx'
import logo from '../../components/Header/img/logo.png'
import { useAuth } from '../../features/auth/useAuth.js'
import { ROLE_OPTIONS } from '../../features/auth/roles.js'
import './LoginPage.css'

const DOMAIN = '@meo.edu.ps'
const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,72}$/

export default function LoginPage() {
  const { isArabic, dir, toggleLanguage } = useLanguage();
  const { login, register, verifyOtp, resendOtp } = useAuth();

  const [committee, setCommittee] = useState(false);
  const [mode, setMode] = useState("login");
  const [visible, setVisible] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const copy = isArabic ? {
    welcome: 'أهلًا بك في PARP', login: 'تسجيل الدخول', register: 'إنشاء حساب', verify: 'تأكيد البريد',
    intro: 'الحسابات متاحة فقط لمستخدمي وزارة التربية والتعليم.',
    name: 'الاسم الكامل', email: 'البريد الإلكتروني', password: 'كلمة المرور', role: 'الدور',
    passwordHelp: '10 أحرف على الأقل، وتتضمن حرفًا كبيرًا وصغيرًا ورقمًا ورمزًا.',
    show: 'إظهار كلمة المرور', hide: 'إخفاء كلمة المرور', otp: 'رمز التحقق',
    submitLogin: 'تسجيل الدخول', submitRegister: 'إنشاء الحساب', submitOtp: 'تأكيد الرمز',
    resend: 'إعادة إرسال الرمز', back: 'العودة إلى المنصة',
    domain: `استخدم بريدك المنتهي بـ ${DOMAIN}`,
  } : {
    welcome: 'Welcome to PARP', login: 'Log in', register: 'Create account', verify: 'Verify email',
    intro: 'Accounts are available only to Ministry of Education users.',
    name: 'Full name', email: 'Email address', password: 'Password', role: 'Role',
    passwordHelp: 'At least 10 characters with uppercase, lowercase, number and symbol.',
    show: 'Show password', hide: 'Hide password', otp: 'Verification code',
    submitLogin: 'Log in', submitRegister: 'Create account', submitOtp: 'Verify code',
    resend: 'Resend code', back: 'Back to the platform',
    domain: `Use your email ending in ${DOMAIN}`,
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    const data = new FormData(event.currentTarget)
    const email = String(data.get('email') || pendingEmail).trim().toLowerCase()
    const password = String(data.get('password') || '')

    if (mode !== 'login' && !email.endsWith(DOMAIN)) {
      setError(copy.domain)
      return
    }
    if (mode === 'register' && !STRONG_PASSWORD.test(password)) {
      setError(copy.passwordHelp)
      return
    }

    setBusy(true)
    try {
      if (mode === 'login' && committee) {
        const payload = await platformApi.post('/committee/login', { username: data.get('username'), password })
        saveTokens(payload)
        window.location.assign('/conference')
      } else if (mode === 'login') {
        const role = String(data.get('role') || 'researcher')
const loggedUser = await login(email, password, role)
const next = new URLSearchParams(window.location.search).get('next')
window.location.assign(
  (next?.startsWith('/') && !next.startsWith('//') ? next : null) || (loggedUser?.role === 'system_admin' ? '/dashboard' : '/workspace')
)
      } else if (mode === 'register') {
        const result = await register({
          full_name: String(data.get('full_name') || '').trim(),
          email,
          password,
        })
        if (result?.access_token) {
          window.location.assign('/workspace')
          return
        }
        setPendingEmail(email)
        setMode('otp')
        setNotice(isArabic ? 'تم إرسال رمز التحقق إلى بريدك.' : 'Verification code sent to your email.')
      } else {
        await verifyOtp(email, String(data.get('otp') || '').trim())
        window.location.assign('/profile')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleResend() {
    setBusy(true); setError('')
    try {
      await resendOtp(pendingEmail)
      setNotice(isArabic ? 'تم إرسال رمز جديد.' : 'A new code was sent.')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

return (
  <section className="login-page" dir={dir} aria-labelledby="login-title">
    <div className="login-shell">
      <aside className="login-brand-side" aria-hidden="true">
        <div className="login-brand-side__inner">
          <div className="login-brand-side__logo">
            <img src={logo} alt="PARP" width="88" height="88" />
          </div>
          <h2>PARP</h2>
        </div>
      </aside>

      <div className="login-panel">
        <div className="login-topbar">
<button
  type="button"
  className="login-topbar__lang"
  onClick={toggleLanguage}
>
  {isArabic ? "EN" : "AR"}
  <span aria-hidden="true">◎</span>
</button>

          <RouteLink className="login-topbar__back" to="/">
            {copy.back}
            <span aria-hidden="true">{isArabic ? "←" : "→"}</span>
          </RouteLink>
        </div>

        <div className="login-card">
          <h1 id="login-title" className="sr-only">
            {mode === "login"
              ? copy.login
              : mode === "register"
                ? copy.register
                : copy.verify}
          </h1>

          {mode !== "otp" && (
            <div className="login-card__tabs" role="tablist">
              <button
                type="button"
                className={mode === "register" ? "is-active" : ""}
                onClick={() => {
                  setCommittee(false);
                  setMode("register");
                }}
              >
                {copy.register}
              </button>

              <button
                type="button"
                className={mode === "login" ? "is-active" : ""}
                onClick={() => setMode("login")}
              >
                {copy.login}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <div className="login-card__field">
                <label htmlFor="full-name">{copy.name}</label>
                <input
                  id="full-name"
                  name="full_name"
                  required
                  minLength={2}
                  maxLength={150}
                />
              </div>
            )}

            {mode !== "otp" ? (
              <>
                {mode === "login" && committee ? (
                  <div className="login-card__field">
                    <label htmlFor="committee-username">
                      {isArabic ? "اسم المستخدم" : "Username"}
                    </label>
                    <input
                      id="committee-username"
                      name="username"
                      required
                      autoComplete="username"
                    />
                  </div>
                ) : (
                  <div className="login-card__field">
                    <label htmlFor="login-email">{copy.email}</label>
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="username"
                      dir="ltr"
                      required
                      maxLength={254}
                      placeholder={
                        isArabic
                          ? "ادخل بريدك الإلكتروني الجامعي"
                          : `name${DOMAIN}`
                      }
                    />
                    {mode === "register" && <small>{copy.domain}</small>}
                    {mode === "login" && (
                      <small>{copy.domain}</small>
                    )}
                  </div>
                )}

                {mode === "login" && !committee && (
                  <div className="login-card__field">
                    <label htmlFor="login-role">{copy.role}</label>
                    <select id="login-role" name="role" defaultValue="researcher">
                      {ROLE_OPTIONS.filter(
                        (item) => item.value !== "organizing_committee"
                      ).map((item) => (
                        <option key={item.value} value={item.value}>
                          {isArabic ? item.ar : item.en}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="login-card__field">
                  <label htmlFor="login-password">{copy.password}</label>
                  <div className="login-card__password">
                    <input
                      id="login-password"
                      name="password"
                      type={visible ? "text" : "password"}
                      autoComplete={
                        mode === "register" ? "new-password" : "current-password"
                      }
                      dir="ltr"
                      required
                      maxLength={72}
                      placeholder={
                        isArabic ? "ادخل كلمة المرور" : "Enter your password"
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setVisible((value) => !value)}
                      aria-label={visible ? copy.hide : copy.show}
                      aria-pressed={visible}
                    >
                      <Icon name="eye" />
                    </button>
                  </div>
                  {mode === "register" && <small>{copy.passwordHelp}</small>}
                </div>

                {mode === "login" && (
                  <div className="login-card__meta">
                    <button type="button" className="login-card__link">
                      {isArabic ? "نسيت كلمة المرور؟" : "Forgot password?"}
                    </button>

                    <label className="login-card__remember">
                      <input type="checkbox" name="remember" />
                      <span>{isArabic ? "تذكرني" : "Remember me"}</span>
                    </label>
                  </div>
                )}
              </>
            ) : (
              <>
                <input type="hidden" name="email" value={pendingEmail} />
                <p className="login-card__pending" dir="ltr">
                  {pendingEmail}
                </p>
                <div className="login-card__field">
                  <label htmlFor="otp">{copy.otp}</label>
                  <input
                    id="otp"
                    name="otp"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    dir="ltr"
                    autoComplete="one-time-code"
                    required
                  />
                </div>
              </>
            )}

            {error && (
              <p className="login-card__error" role="alert">
                {error}
              </p>
            )}

            {notice && (
              <p className="login-card__notice" role="status">
                {notice}
              </p>
            )}

            <button className="login-card__submit" type="submit" disabled={busy}>
              {mode === "login"
                ? copy.submitLogin
                : mode === "register"
                  ? copy.submitRegister
                  : copy.submitOtp}
              <span aria-hidden="true">{isArabic ? "←" : "→"}</span>
            </button>

            {mode === "login" && (
              <button
                className="login-card__committee"
                type="button"
                onClick={() => setCommittee((value) => !value)}
              >
                {isArabic
                  ? "دخول اللجنة المنظمة"
                  : "Organizing committee login"}
              </button>
            )}

            {mode === "otp" && (
              <button
                className="login-card__secondary"
                type="button"
                disabled={busy}
                onClick={handleResend}
              >
                {copy.resend}
              </button>
            )}
          </form>

          {mode !== "otp" && (
            <div className="login-card__switch">
              {mode === "login" ? (
                <>
                  <span>
                    {isArabic
                      ? "ليس لديك حساب؟"
                      : "Don't have an account?"}
                  </span>
                  <button
                    type="button"
                    className="login-card__switch-btn"
                    onClick={() => {
                      setCommittee(false);
                      setMode("register");
                    }}
                  >
                    {isArabic ? "إنشاء حساب جديد" : "Create a new account"}
                  </button>
                </>
              ) : (
                <>
                  <span>
                    {isArabic ? "لديك حساب؟" : "Already have an account?"}
                  </span>
                  <button
                    type="button"
                    className="login-card__switch-btn"
                    onClick={() => setMode("login")}
                  >
                    {copy.login}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  </section>
)
}