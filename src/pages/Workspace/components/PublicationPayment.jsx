import { useState } from 'react'
import { platformApi } from '../../../features/platform/platformApi.js'
import { workflowApi } from '../../../features/workflow/workflowApi.js'
import { usePlatformData } from '../../../features/platform/usePlatformData.js'
export default function PublicationPayment({ item, isArabic, onRefresh }) {
  const { data, error: loadError, reload } = usePlatformData('/payments')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const t = (ar, en) => (isArabic ? ar : en)
  const payment = data?.find((row) => row.submission_id === item.id)
  async function act(publish) {
    setBusy(true)
    setError('')
    try {
      if (publish) {
        await workflowApi.publish(item.id)
        await onRefresh()
      } else {
        await platformApi.post(`/research/${item.id}/payment`)
        reload()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="publication-payment">
      <h4>{t('طلب نشر البحث', 'Research publication request')}</h4>
      <p>
        {t(
          'القبول العلمي مكتمل. النشر يتطلب تأكيد الأدمين لاستيفاء الدفع على أرض الواقع.',
          'Scientific approval is complete. Publication requires administrator confirmation of offline payment.',
        )}
      </p>
      <button disabled>
        {t(
          'فيزا · 0 ₪ · غير مفعّل حالياً',
          'Visa · 0 ₪ · Currently unavailable',
        )}
      </button>
      {!payment ? (
        <button disabled={busy || !data} onClick={() => act(false)}>
          {t('اختيار الدفع على أرض الواقع', 'Request offline payment')}
        </button>
      ) : (
        <>
          <p>
            {t('المطلوب', 'Required')}:{' '}
            {(payment.required_agorot / 100).toFixed(2)} ₪ ·{' '}
            {t('المدفوع', 'Paid')}: {(payment.paid_agorot / 100).toFixed(2)} ₪
          </p>
          <p role="status">
            {payment.confirmed
              ? t(
                  'تم تأكيد الدفع من الإدارة',
                  'Payment confirmed by administrator',
                )
              : t(
                  'بانتظار تأكيد الأدمين — الصفر لا يعني إعفاءً',
                  'Awaiting administrator confirmation — zero does not mean exempt',
                )}
          </p>
          <button
            disabled={!payment.confirmed || busy}
            onClick={() => act(true)}
          >
            {t('نشر البحث', 'Publish research')}
          </button>
        </>
      )}
      {(error || loadError) && <p role="alert">{error || loadError}</p>}
    </div>
  )
}
