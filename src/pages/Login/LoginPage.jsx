import { useState } from 'react'
import { useLanguage } from '../../i18n/useLanguage.js'
import { RouteLink } from '../../routing/clientRouter.jsx'
import Icon from '../../components/ui/Icon.jsx'
import logo from '../../components/Header/img/logo.png'
import './LoginPage.css'

export default function LoginPage() {
  const { isArabic, dir } = useLanguage()
  const [visible, setVisible] = useState(false)
  const [notice, setNotice] = useState(false)
  const copy = isArabic ? {
    welcome: 'أهلًا بعودتك', title: 'تسجيل الدخول', intro: 'مساحتك للتعلّم والبحث ومشاركة المعرفة.',
    email: 'البريد الإلكتروني', password: 'كلمة المرور', show: 'إظهار كلمة المرور', hide: 'إخفاء كلمة المرور',
    submit: 'تسجيل الدخول', back: 'العودة إلى المنصة',
    preview: 'تسجيل الدخول غير متاح بعد. يمكنك استكشاف المنصة دون حساب حاليًا.',
    notice: 'هذه واجهة معاينة فقط. لم تُرسل بياناتك ولم يتم تسجيل الدخول.',
  } : {
    welcome: 'Welcome back', title: 'Log in', intro: 'Your space to learn, research, and share knowledge.',
    email: 'Email address', password: 'Password', show: 'Show password', hide: 'Hide password',
    submit: 'Log in', back: 'Back to the platform',
    preview: 'Log in is not available yet. You can explore the platform without an account for now.',
    notice: 'This is a preview. Your details were not sent and you have not been logged in.',
  }
  return (
    <section className="login-page" dir={dir} aria-labelledby="login-title">
      <div className="login-card">
        <span className="login-card__logo"><img src={logo} alt="PARP" width="52" height="52" /></span>
        <span className="login-card__eyebrow">{copy.welcome}</span>
        <h1 id="login-title">{copy.title}</h1><p className="login-card__intro">{copy.intro}</p>
        <p className="login-card__preview" id="login-preview">{copy.preview}</p>
        <form aria-describedby="login-preview" onSubmit={(event) => { event.preventDefault(); setNotice(true) }}>
          <div className="login-card__field"><label htmlFor="login-email">{copy.email}</label><input id="login-email" name="email" type="email" autoComplete="username" dir="ltr" required maxLength={254} /></div>
          <div className="login-card__field"><label htmlFor="login-password">{copy.password}</label>
            <div className="login-card__password"><input id="login-password" name="password" type={visible ? 'text' : 'password'} autoComplete="current-password" dir="ltr" required maxLength={256} />
              <button type="button" onClick={() => setVisible((value) => !value)} aria-label={visible ? copy.hide : copy.show} aria-pressed={visible}><Icon name="eye" /></button>
            </div>
          </div>
          <button className="login-card__submit" type="submit">{copy.submit}</button>
          {notice && <p className="login-card__notice" role="status">{copy.notice}</p>}
        </form>
        <RouteLink className="login-card__back" to="/">{copy.back}<span aria-hidden="true">{isArabic ? '←' : '→'}</span></RouteLink>
      </div>
    </section>
  )
}
