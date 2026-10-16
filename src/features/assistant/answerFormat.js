export function cleanAnswer(value) {
  return String(value || '')
    .replace(/\[(?:[SW]\d+)(?:\s*[,،]\s*[SW]\d+)*\]/g, '')
    .replace(/cite[^]*/g, '')
    .replace(/【\d+[^】]*】/g, '')
    .replace(/\r\n/g, '\n')
    .trim()
}
const cells = line => line.trim().replace(/^\||\|$/g, '').split('|').map(s => s.trim())
const tableDivider = line => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line)
const listLine = line => /^\s*(?:[-*+]\s+|\d+[.)]\s+|[٠-٩]+[.)]\s+)/.test(line)
export function answerBlocks(value) {
  const lines = cleanAnswer(value).split('\n')
  const blocks = []
  for (let i = 0; i < lines.length;) {
    const line = lines[i]
    if (!line.trim()) { i++; continue }
    // Provider-generated source appendices are not part of the chat presentation.
    if (/^(?:#{1,6}\s*)?(?:\*\*)?(?:مصادر الإجابة|المصادر|Sources)(?:\*\*)?\s*[:：]?\s*$/i.test(line.trim())) break
    if (/^\s*```/.test(line)) {
      const content = []; i++
      while (i < lines.length && !/^\s*```/.test(lines[i])) content.push(lines[i++])
      if (i < lines.length) i++
      blocks.push({ type: 'code', text: content.join('\n') }); continue
    }
    if (i + 1 < lines.length && line.includes('|') && tableDivider(lines[i + 1])) {
      const headers = cells(line); const rows = []; i += 2
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) rows.push(cells(lines[i++]))
      blocks.push({ type: 'table', headers, rows }); continue
    }
    const heading = line.match(/^\s*#{1,6}\s+(.+)/)
    if (heading) { blocks.push({ type: 'heading', text: heading[1] }); i++; continue }
    if (listLine(line)) {
      const ordered = /^\s*[\d٠-٩]+[.)]/.test(line)
      const items = []
      while (i < lines.length && listLine(lines[i]) && /^\s*[\d٠-٩]+[.)]/.test(lines[i]) === ordered) {
        items.push(lines[i++].replace(/^\s*(?:[-*+]\s+|[\d٠-٩]+[.)]\s+)/, ''))
      }
      blocks.push({ type: ordered ? 'ol' : 'ul', items }); continue
    }
    if (/^\s*(?:---+|\*\*\*+)\s*$/.test(line)) { i++; continue }
    const paragraph = [line.replace(/^>\s?/, '')]; i++
    while (i < lines.length && lines[i].trim() && !/^\s*(?:#|```|>)/.test(lines[i]) && !listLine(lines[i]) && !(i + 1 < lines.length && tableDivider(lines[i + 1]))) paragraph.push(lines[i++])
    blocks.push({ type: 'paragraph', text: paragraph.join('\n') })
  }
  return blocks
}
export function inlineParts(text) {
  return text.split(/(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*\n]+\*|\[[^\]]+\]\([^\s)]+\))/g).filter(Boolean).map(part => {
    if (/^(\*\*|__)/.test(part)) return { type: 'strong', text: part.slice(2, -2) }
    if (part.startsWith('`')) return { type: 'code', text: part.slice(1, -1) }
    if (part.startsWith('*') && part.endsWith('*')) return { type: 'em', text: part.slice(1, -1) }
    const link = part.match(/^\[([^\]]+)\]\(([^\s)]+)\)$/)
    // Display readable link labels, without citation/link clutter or unsafe HTML.
    if (link) return { type: 'text', text: link[1] }
    return { type: 'text', text: part }
  })
}
