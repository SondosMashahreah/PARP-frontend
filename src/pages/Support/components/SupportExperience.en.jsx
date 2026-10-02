import { useState } from 'react'
import ContactForm from '../../../features/contact/presentation/ContactForm.jsx'
import { FAQS } from '../../../features/platform/data/platformContent.en.js'

export default function SupportExperience() {
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <div className="platform-experience platform-experience--support">
      <div>
        <h2 className="platform-experience__section-title">Frequently Asked Questions</h2>
        <div className="platform-experience__faq">
          {FAQS.map(([question, answer], index) => (
            <div key={question}>
              <button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>
                <span>{question}</span><span>{openFaq === index ? '−' : '+'}</span>
              </button>
              {openFaq === index && <p>{answer}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="platform-experience__support-form"><h2>How can we help?</h2><ContactForm /></div>
    </div>
  )
}
