const paths = {
  search: <><circle cx="10.75" cy="10.75" r="6.75" /><path d="m16 16 4.25 4.25" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  menu: <><path d="M4 6h16M8 12h12M4 18h16" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
}

export default function Icon({ name, className }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  )
}
