import universityLogo from '../../assets/partners/al-quds-university.png'
import ministryLogo from '../../assets/partners/ministry-of-education.jpeg'
import museumLogo from '../../assets/partners/meet-math-museum.png'

const logos = { university: universityLogo, ministry: ministryLogo, museum: museumLogo }
const names = {
  ar: [
    ['university', 'جامعة القدس', 'أبو ديس · فلسطين', 'https://www.alquds.edu/ar/'],
    ['ministry', 'وزارة التربية والتعليم العالي', 'دولة فلسطين', 'https://www.moe.edu.ps/'],
    ['museum', 'متحف الرياضيات', 'Meet Math Museum · جامعة القدس', 'https://www.alquds.edu/ar/centers-museums-ar/meet-math-museum-ar/'],
  ],
  en: [
    ['university', 'Al-Quds University', 'Abu Dis · Palestine', 'https://www.alquds.edu/en/'],
    ['ministry', 'Ministry of Education and Higher Education', 'State of Palestine', 'https://www.moe.edu.ps/'],
    ['museum', 'Meet Math Museum', 'Al-Quds University', 'https://www.alquds.edu/en/centers-museums/meet-math-museum/'],
  ],
}
export const footerPartners = Object.fromEntries(Object.entries(names).map(([language, items]) => [language,
  items.map(([id, name, shortName, href]) => ({ id, name, shortName, href, logo: logos[id] })),
]))
export const footerLinks = {
  ar: [
    { label: 'عن المنصة', href: '/about' }, { label: 'المستودع البحثي', href: '/repository' },
    { label: 'الدليل', href: '/guide' }, { label: 'المساعدة والدعم', href: '/support' },
  ],
  en: [
    { label: 'About PARP', href: '/about' }, { label: 'Research repository', href: '/repository' },
    { label: 'Research guide', href: '/guide' }, { label: 'Help and support', href: '/support' },
  ],
}
