import { useState } from 'react'
import { useLanguage } from '../../i18n/useLanguage.js'
import { RouteLink } from '../../routing/clientRouter.jsx'
import Icon from '../../components/ui/Icon.jsx'
import logo from '../../components/Header/img/logo.png'
import { useAuth } from '../../features/auth/useAuth.js'
import './LoginPage.css'

const DOMAIN = '@meo.edu.ps'
const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,72}$/

export default function LoginPage() {
  const { isArabic, dir } = useLanguage()
  const { login, register, verifyOtp, resendOtp } = useAuth()
  const [mode, setMode] = useState('login')
  const [visible, setVisible] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const copy = isArabic ? {
    welcome: 'أهلًا بك في PARP', login: 'تسجيل الدخول', register: 'إنشاء حساب', verify: 'تأكيد البريد',
    intro: 'الحسابات متاحة فقط لمستخدمي وزارة التربية والتعليم.',
    name: 'الاسم الكامل', email: 'البريد الإلكتروني', password: 'كلمة المرور',
    passwordHelp: '10 أحرف على الأقل، وتتضمن حرفًا كبيرًا وصغيرًا ورقمًا ورمزًا.',
    show: 'إظهار كلمة المرور', hide: 'إخفاء كلمة المرور', otp: 'رمز التحقق',
    submitLogin: 'تسجيل الدخول', submitRegister: 'إنشاء الحساب وإرسال الرمز', submitOtp: 'تأكيد الرمز',
    resend: 'إعادة إرسال الرمز', back: 'العودة إلى المنصة',
    domain: `استخدم بريدك المنتهي بـ ${DOMAIN}`,
  } : {
    welcome: 'Welcome to PARP', login: 'Log in', register: 'Create account', verify: 'Verify email',
    intro: 'Accounts are available only to Ministry of Education users.',
    name: 'Full name', email: 'Email address', password: 'Password',
    passwordHelp: 'At least 10 characters with uppercase, lowercase, number and symbol.',
    show: 'Show password', hide: 'Hide password', otp: 'Verification code',
    submitLogin: 'Log in', submitRegister: 'Create account & send code', submitOtp: 'Verify code',
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

    if (!email.endsWith(DOMAIN)) {
      setError(copy.domain)
      return
    }
    if (mode === 'register' && !STRONG_PASSWORD.test(password)) {
      setError(copy.passwordHelp)
      return
    }

    setBusy(true)
    try {
      if (mode === 'login') {
        await login(email, password)
        const next = new URLSearchParams(window.location.search).get('next')
        window.location.assign(next || '/')
      } else if (mode === 'register') {
        await register({
          full_name: String(data.get('full_name') || '').trim(),
          email,
          password,
        })
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
      <div className="login-card">
        <span className="login-card__logo"><img src={logo} alt="PARP" width="52" height="52" /></span>
        <span className="login-card__eyebrow">{copy.welcome}</span>
        <h1 id="login-title">{mode === 'login' ? copy.login : mode === 'register' ? copy.register : copy.verify}</h1>
        <p className="login-card__intro">{copy.intro}</p>

        {mode !== 'otp' && (
          <div className="login-card__tabs" role="tablist">
            <button type="button" className={mode === 'login' ? 'is-active' : ''} onClick={() => setMode('login')}>{copy.login}</button>
            <button type="button" className={mode === 'register' ? 'is-active' : ''} onClick={() => setMode('register')}>{copy.register}</button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && <div className="login-card__field"><label htmlFor="full-name">{copy.name}</label><input id="full-name" name="full_name" required minLength={2} maxLength={150} /></div>}
          {mode !== 'otp' ? (
            <>
              <div className="login-card__field"><label htmlFor="login-email">{copy.email}</label><input id="login-email" name="email" type="email" autoComplete="username" dir="ltr" required maxLength={254} placeholder={`name${DOMAIN}`} /><small>{copy.domain}</small></div>
              <div className="login-card__field"><label htmlFor="login-password">{copy.password}</label>
                <div className="login-card__password"><input id="login-password" name="password" type={visible ? 'text' : 'password'} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} dir="ltr" required maxLength={72} />
                  <button type="button" onClick={() => setVisible((value) => !value)} aria-label={visible ? copy.hide : copy.show} aria-pressed={visible}><Icon name="eye" /></button>
                </div>
                {mode === 'register' && <small>{copy.passwordHelp}</small>}
              </div>
            </>
          ) : (
            <>
              <input type="hidden" name="email" value={pendingEmail} />
              <p className="login-card__pending" dir="ltr">{pendingEmail}</p>
              <div className="login-card__field"><label htmlFor="otp">{copy.otp}</label><input id="otp" name="otp" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} dir="ltr" autoComplete="one-time-code" required /></div>
            </>
          )}
          {error && <p className="login-card__error" role="alert">{error}</p>}
          {notice && <p className="login-card__notice" role="status">{notice}</p>}
          <button className="login-card__submit" type="submit" disabled={busy}>
            {mode === 'login' ? copy.submitLogin : mode === 'register' ? copy.submitRegister : copy.submitOtp}
          </button>
          {mode === 'otp' && <button className="login-card__secondary" type="button" disabled={busy} onClick={handleResend}>{copy.resend}</button>}
        </form>
        <RouteLink className="login-card__back" to="/">{copy.back}<span aria-hidden="true">{isArabic ? '←' : '→'}</span></RouteLink>
      </div>
    </section>
  )
}
