import { useEffect } from 'react'
import './FileDropEnhancer.css'

// Progressive enhancement for every existing file input, including dashboard,
// researcher, conference, profile and news upload controls. The native input
// remains the source of truth (including FormData and built-in validation).
const ACCEPTED = (file, accept) => {
  const rules = (accept || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
  if (!rules.length) return true
  const name = file.name.toLowerCase()
  const type = (file.type || '').toLowerCase()
  return rules.some(rule => rule.startsWith('.') ? name.endsWith(rule)
    : rule.endsWith('/*') ? type.startsWith(rule.slice(0, -1)) ||
        (rule === 'image/*' && /\.(heic|heif|avif|tif|tiff|bmp|gif|jpg|jpeg|png|webp)$/i.test(name))
      : rule === type)
}

export default function FileDropEnhancer() {
  useEffect(() => {
    const holder = event => {
      const target = event.target instanceof Element ? event.target : null
      const label = target?.closest('label')
      if (target?.matches('input[type="file"]')) return { zone: target.closest('label') || target, input: target }
      const group = target?.closest('.ards-upload, .profile-card__avatar-wrap, .ac-excellence-upload')
      const area = label?.querySelector('input[type="file"]') ? label : group
      const input = area?.querySelector('input[type="file"]')
      return input ? { zone: area, input } : null
    }
    const isFiles = event => Array.from(event.dataTransfer?.types || []).includes('Files')
    const clearError = event => {
      if (event.target instanceof HTMLInputElement && event.target.type === 'file') event.target.setCustomValidity('')
    }
    const clear = () => document.querySelectorAll('.parp-file-drop-active').forEach(el => el.classList.remove('parp-file-drop-active'))
    const over = event => {
      if (!isFiles(event)) return
      const match = holder(event)
      if (!match || match.input.disabled) return
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
      clear()
      match.zone.classList.add('parp-file-drop-active')
    }
    const drop = event => {
      if (!isFiles(event)) return
      const match = holder(event)
      clear()
      if (!match || match.input.disabled) return
      event.preventDefault()
      const input = match.input
      const files = Array.from(event.dataTransfer.files || [])
      if (!files.length) return
      if (files.some(file => !ACCEPTED(file, input.accept))) {
        input.setCustomValidity('File type not supported / امتداد الملف غير مدعوم')
        input.reportValidity()
        return
      }
      input.setCustomValidity('')
      const selected = input.multiple ? files : files.slice(0, 1)
      const transfer = new DataTransfer()
      selected.forEach(file => transfer.items.add(file))
      input.files = transfer.files
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }
    // Avoid accidental browser navigation if someone drops a file outside a field.
    const safeOutsideDrop = event => { if (isFiles(event)) event.preventDefault() }
    document.addEventListener('change', clearError, true)
    document.addEventListener('dragover', safeOutsideDrop)
    document.addEventListener('dragover', over, true)
    document.addEventListener('drop', safeOutsideDrop)
    document.addEventListener('drop', drop, true)
    document.addEventListener('dragleave', clear)
    return () => {
      document.removeEventListener('change', clearError, true)
      document.removeEventListener('dragover', safeOutsideDrop)
      document.removeEventListener('dragover', over, true)
      document.removeEventListener('drop', safeOutsideDrop)
      document.removeEventListener('drop', drop, true)
      document.removeEventListener('dragleave', clear)
      clear()
    }
  }, [])
  return null
}
