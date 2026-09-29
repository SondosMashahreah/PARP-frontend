import { useId, useRef, useState } from 'react'
import { useLanguage } from '../../../i18n/useLanguage.js'
import { CONTACT_EMAIL, contactMailto, submitContact, validateContact } from '../application/contactMessage.js'
import Icon from '../../../components/ui/Icon.jsx'
import './ContactForm.css'

const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT?.trim()

export default function ContactForm() {
  const { isArabic, dir } = useLanguage()
  const id = useId()
  const formRef = useRef(null)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [draftUrl, setDraftUrl] = useState('')
  const copy = isArabic ? {
    name: 'الاسم الكامل', email: 'البريد الإلكتروني', subject: 'الموضوع', message: 'رسالتك',
    send: 'إرسال الرسالة', draft: 'متابعة الإرسال عبر البريد', sending: 'جارٍ الإرسال…',
    hint: endpoint ? 'اكتب رسالتك وسيراجعها فريق المنصة.' : 'بعد تعبئة النموذج، سيفتح تطبيق بريدك لإتمام الإرسال إلى فريق المنصة.',
    accepted: 'استلم الخادم طلبك. شكرًا لتواصلك معنا.',
    opened: 'رسالتك جاهزة في تطبيق البريد. اضغط «إرسال» هناك لإتمام التواصل. إذا لم يفتح التطبيق، استخدم الرابط أدناه أو راسلنا مباشرة.',
    failed: 'تعذّر إرسال الرسالة. بقيت بياناتك هنا؛ حاول مجددًا أو تواصل عبر البريد.',
    reopen: 'فتح الرسالة في تطبيق البريد',
    errors: { name: 'اكتب اسمًا من حرفين إلى 100 حرف.', email: 'أدخل بريدًا إلكترونيًا صحيحًا.', subject: 'اكتب موضوعًا من 3 إلى 120 حرفًا.', message: 'اكتب رسالة من 10 إلى 2000 حرف.' },
  } : {
    name: 'Full name', email: 'Email address', subject: 'Subject', message: 'Your message',
    send: 'Send message', draft: 'Continue in your email app', sending: 'Sending…',
    hint: endpoint ? 'Write your message for the platform team.' : 'After you fill in the form, your email app opens so you can finish sending your message.',
    accepted: 'The server accepted your request. Thank you for getting in touch.',
    opened: 'Your draft is ready in your email app. Choose Send there to finish. If the app did not open, use the link below or email us directly.',
    failed: 'Your message could not be sent. Your details are still here; please retry or contact us by email.',
    reopen: 'Open the message in your email app',
    errors: { name: 'Enter a name between 2 and 100 characters.', email: 'Enter a valid email address.', subject: 'Use 3–120 characters for the subject.', message: 'Write a message of 10–2000 characters.' },
  }
  async function handleSubmit(event) {
    event.preventDefault()
    if (status === 'sending') return
    const { data, errors: nextErrors } = validateContact(Object.fromEntries(new FormData(event.currentTarget)))
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setStatus('idle')
      requestAnimationFrame(() => formRef.current?.elements.namedItem(Object.keys(nextErrors)[0])?.focus())
      return
    }
    if (!endpoint) {
      const href = contactMailto(data)
      setDraftUrl(href)
      setStatus('opened')
      window.location.href = href
      return
    }
    setStatus('sending')
    try {
      await submitContact(data, endpoint)
      setStatus('accepted')
      formRef.current?.reset()
    } catch {
      setStatus('failed')
    }
  }
  function fieldProps(name) {
    return { id: `${id}-${name}`, name, required: true, disabled: status === 'sending',
      'aria-invalid': Boolean(errors[name]), 'aria-describedby': errors[name] ? `${id}-${name}-error` : undefined }
  }
  function error(name) {
    return errors[name] && <small className="contact-form__error" id={`${id}-${name}-error`}>{copy.errors[name]}</small>
  }
  return (
    <form ref={formRef} className="contact-form" dir={dir} onSubmit={handleSubmit} noValidate aria-describedby={`${id}-hint`}
      onChange={(event) => {
        const name = event.target.name
        if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }))
        if (status !== 'sending') setStatus('idle')
      }}>
      <p className="contact-form__hint" id={`${id}-hint`}>{copy.hint}</p>
      {Object.values(errors).some(Boolean) && <p className="contact-form__error" role="alert">{isArabic ? 'راجع الحقول المعلّمة أدناه قبل المتابعة.' : 'Please check the marked fields before continuing.'}</p>}
      <div className="contact-form__row">
        <div className="contact-form__field"><label htmlFor={`${id}-name`}>{copy.name}</label><input {...fieldProps('name')} type="text" autoComplete="name" maxLength={100} />{error('name')}</div>
        <div className="contact-form__field"><label htmlFor={`${id}-email`}>{copy.email}</label><input {...fieldProps('email')} type="email" dir="ltr" autoComplete="email" maxLength={254} />{error('email')}</div>
      </div>
      <div className="contact-form__field"><label htmlFor={`${id}-subject`}>{copy.subject}</label><input {...fieldProps('subject')} type="text" maxLength={120} />{error('subject')}</div>
      <div className="contact-form__field"><label htmlFor={`${id}-message`}>{copy.message}</label><textarea {...fieldProps('message')} rows={5} maxLength={2000} />{error('message')}</div>
      <button className="contact-form__submit" type="submit" disabled={status === 'sending'}><Icon name="mail" />{status === 'sending' ? copy.sending : endpoint ? copy.send : copy.draft}</button>
      {['accepted', 'opened', 'failed'].includes(status) && <div className={`contact-form__status ${status === 'failed' ? 'is-error' : ''}`} role={status === 'failed' ? 'alert' : 'status'}>
        <p>{copy[status]}</p>
        {status === 'opened' && <a href={draftUrl}>{copy.reopen}</a>}
        {status !== 'accepted' && <a href={`mailto:${CONTACT_EMAIL}`} dir="ltr">{CONTACT_EMAIL}</a>}
      </div>}
    </form>
  )
}
