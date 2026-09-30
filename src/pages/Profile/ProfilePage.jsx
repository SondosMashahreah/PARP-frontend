import { useRef, useState } from 'react'
import { useLanguage } from '../../i18n/useLanguage.js'
import { useAuth } from '../../features/auth/useAuth.js'
import { api } from '../../features/auth/authApi.js'
import './ProfilePage.css'

export default function ProfilePage() {
  const { isArabic, dir } = useLanguage()
  const { user, refreshUser, logout } = useAuth()
  const fileRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const copy = isArabic ? {
    title: 'الملف الشخصي', name: 'الاسم الكامل', email: 'البريد الإلكتروني',
    save: 'حفظ التعديلات', avatar: 'تغيير الصورة الشخصية', logout: 'تسجيل الخروج',
    saved: 'تم حفظ التعديلات.', uploaded: 'تم تحديث الصورة.',
  } : {
    title: 'Profile', name: 'Full name', email: 'Email address',
    save: 'Save changes', avatar: 'Change profile photo', logout: 'Log out',
    saved: 'Profile updated.', uploaded: 'Profile photo updated.',
  }

  if (!user) return null

  async function updateProfile(event) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('')
    const data = new FormData(event.currentTarget)
    try {
      await api('/profile/me', { method: 'PATCH', body: JSON.stringify({ full_name: String(data.get('full_name')).trim() }) })
      await refreshUser()
      setMessage(copy.saved)
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  async function uploadAvatar(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const body = new FormData()
    body.append('file', file)
    setBusy(true); setError(''); setMessage('')
    try {
      await api('/profile/avatar', { method: 'POST', body })
      await refreshUser()
      setMessage(copy.uploaded)
    } catch (err) { setError(err.message) } finally {
      setBusy(false)
      event.target.value = ''
    }
  }

  return (
    <section className="profile-page" dir={dir}>
      <div className="profile-card">
        <div className="profile-card__avatar-wrap">
          {user.avatar_url ? <img className="profile-card__avatar" src={user.avatar_url} alt="" /> : <div className="profile-card__avatar profile-card__avatar--empty">{user.full_name?.slice(0, 1)?.toUpperCase()}</div>}
          <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}>{copy.avatar}</button>
          <input ref={fileRef} className="profile-card__file" type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadAvatar} />
        </div>
        <div className="profile-card__content">
          <h1>{copy.title}</h1>
          <form onSubmit={updateProfile}>
            <label>{copy.name}<input name="full_name" defaultValue={user.full_name} minLength={2} maxLength={150} required /></label>
            <label>{copy.email}<input value={user.email} readOnly dir="ltr" /></label>
            {error && <p className="profile-card__error" role="alert">{error}</p>}
            {message && <p className="profile-card__message" role="status">{message}</p>}
            <button className="profile-card__primary" type="submit" disabled={busy}>{copy.save}</button>
          </form>
          <button className="profile-card__logout" type="button" onClick={logout}>{copy.logout}</button>
        </div>
      </div>
    </section>
  )
}
