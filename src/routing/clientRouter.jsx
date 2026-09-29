import { appHref, navigate } from './navigation.js'

export function RouteLink({ to, onClick, target, children, ...props }) {
  function handleClick(event) {
    onClick?.(event)
    if (event.defaultPrevented || (target && target !== '_self') || props.download !== undefined) return
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    navigate(to)
  }
  return <a href={appHref(to)} target={target} onClick={handleClick} {...props}>{children}</a>
}
