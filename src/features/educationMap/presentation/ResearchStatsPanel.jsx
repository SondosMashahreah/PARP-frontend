import { researchBandTotals, researchBands, researchColor, RESEARCH_BEIGE } from '../domain/researchStatistics.js'

const translations = {
  ar: {
    heading: 'إحصائيات الأبحاث حسب المحافظة', note: 'أبحاث مسجّلة في المنصة، وليست تقديرات سكانية أو أعداد مدارس.',
    scope: 'النتائج ضمن نطاق مديريتك المعتمدة فقط.', nationalPublished: 'خريطة الأبحاث المنشورة في جميع محافظات فلسطين، بغضّ النظر عن مديرية حسابك.', total: 'إجمالي الأبحاث', active: 'محافظات فيها أبحاث',
    published: 'أبحاث منشورة', unknown: 'غير محدد المحافظة', legend: 'مفتاح الخريطة',
    zero: 'لا توجد أبحاث — نفس البيج', range: 'بحث', regions: 'محافظات', list: 'ترتيب المحافظات',
    share: 'من الأبحاث محددة المحافظة', empty: 'لا توجد أبحاث مسجّلة في هذا النطاق بعد؛ تظهر المحافظات كلها بالبيج.',
    unavailable: 'تعذّر تحميل الإحصائيات. لا يتم عرض أعداد تقديرية.', retry: 'إعادة المحاولة',
    loading: 'جارٍ تحميل إحصائيات الأبحاث…', focus: 'المحافظة المحددة',
    select: 'اختر محافظة على الخريطة أو من القائمة',
  },
  en: {
    heading: 'Research by governorate', note: 'Registered PARP research, not estimated populations or school counts.',
    scope: 'Results are limited to your approved directorate.', nationalPublished: 'Published research across Palestine, regardless of the directorate of your account.', total: 'Registered research', active: 'Governorates with research',
    published: 'Published research', unknown: 'Unassigned governorate', legend: 'Map legend',
    zero: 'No research — same beige', range: 'research', regions: 'governorates', list: 'Governorate ranking',
    share: 'of assigned research', empty: 'No research has been registered in this scope; all governorates remain beige.',
    unavailable: 'Research statistics could not be loaded. No estimated counts are shown.', retry: 'Retry',
    loading: 'Loading research statistics…', focus: 'Selected governorate',
    select: 'Select a governorate on the map or from the list',
  },
}

function ringBackground(totals, count) {
  if (!count) return 'conic-gradient(#E1D5C6 0% 100%)'
  let start = 0
  const colors = totals.filter((band) => band.research > 0).map((band) => {
    const next = start + band.research / count * 100
    const section = `${band.color} ${start.toFixed(4)}% ${next.toFixed(4)}%`
    start = next
    return section
  })
  return `conic-gradient(${colors.join(', ')})`
}

export default function ResearchStatsPanel({ stats, language, selectedId, onSelect, onRetry }) {
  const t = translations[language === 'ar' ? 'ar' : 'en']
  const format = (n) => new Intl.NumberFormat(language === 'ar' ? 'ar-PS' : 'en').format(n)
  const data = stats.data
  const rows = data?.governorates || []
  const sorted = [...rows].sort((a, b) => b.research_count - a.research_count || a.id.localeCompare(b.id))
  const max = data?.max_research_count || 0
  const bands = researchBands(max)
  const distribution = researchBandTotals(rows, bands)
  const assigned = Math.max(0, (data?.total_research || 0) - (data?.unassigned_research || 0))
  const selected = rows.find((row) => row.id === selectedId)
  const name = (row) => row?.[`name_${language}`] || row?.name_ar || row?.name_en || row?.id || ''

  return <aside className="research-stats" aria-label={t.heading}>
    <header className="research-stats__intro">
      <span className="research-stats__eyebrow">PARP / RESEARCH ATLAS</span>
      <h2>{t.heading}</h2>
      <p>{t.note}</p>
      {data?.scope === 'directorate' && <p className="research-stats__scope">{t.scope}</p>}
      {data?.scope === 'national_published' && <p className="research-stats__scope">{t.nationalPublished}</p>}
    </header>
    {stats.loading ? <p role="status" className="research-stats__message">{t.loading}</p>
      : stats.error ? <div className="research-stats__message" role="alert"><p>{t.unavailable}</p><button type="button" onClick={onRetry}>{t.retry}</button></div>
      : data && <>
        <div className="research-stats__metrics">
          {[
            [t.total, data.total_research], [t.active, data.active_governorates],
            [t.published, data.published_research], [t.unknown, data.unassigned_research],
          ].map(([label, value]) => <div className="research-stats__metric" key={label}><strong>{format(value)}</strong><span>{label}</span></div>)}
        </div>
        {assigned ? <div className="research-stats__distribution">
          <div className="research-stats__donut" role="img" aria-label={`${format(assigned)} ${t.range}`} style={{ background: ringBackground(distribution, assigned) }}>
            <div><strong>{format(assigned)}</strong><span>{t.range}</span></div>
          </div>
          <p>{t.share}</p>
        </div> : <p className="research-stats__message" role="status">{t.empty}</p>}
        <section className="research-stats__legend" aria-label={t.legend}>
          <h3>{t.legend}</h3>
          <ul>
            <li><i style={{ backgroundColor: RESEARCH_BEIGE }} aria-hidden="true" /><span>{t.zero}</span><small>{format(rows.filter((row) => row.research_count === 0).length)} {t.regions}</small></li>
            {distribution.map((band) => <li key={`${band.min}-${band.max}`}>
              <i style={{ backgroundColor: band.color }} aria-hidden="true" />
              <span>{format(band.min)}–{format(band.max)} {t.range}</span>
              <small>{format(band.governorates)} {t.regions}</small>
            </li>)}
          </ul>
        </section>
        <section className="research-stats__rank" aria-label={t.list}>
          <h3>{t.list}</h3>
          <p className="research-stats__helper">{selected ? `${t.focus}: ${name(selected)} · ${format(selected.research_count)}` : t.select}</p>
          <ol>
            {sorted.map((row) => <li key={row.id}>
              <button type="button" aria-pressed={selectedId === row.id} onClick={() => onSelect(selectedId === row.id ? '' : row.id)}>
                <span className="research-stats__rank-top"><span>{name(row)}</span><strong>{format(row.research_count)}</strong></span>
                <span className="research-stats__bar"><i style={{ width: max ? `${row.research_count / max * 100}%` : '0%', backgroundColor: researchColor(row.research_count, bands) }} /></span>
              </button>
            </li>)}
          </ol>
        </section>
      </>}
  </aside>
}
