import './IconButton.css'

export default function IconButton({ children, className = '', ...props }) {
  return <button type="button" className={['icon-button', className].filter(Boolean).join(' ')} {...props}>{children}</button>
}
