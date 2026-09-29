import artifact1 from '../../assets/journey/01-account.png'
import artifact2 from '../../assets/journey/02-learning.png'
import artifact3 from '../../assets/journey/03-guide.png'
import artifact4 from '../../assets/journey/04-template.png'
import artifact5 from '../../assets/journey/05-proposal.png'
import artifact6 from '../../assets/journey/06-review.png'
import artifact7 from '../../assets/journey/07-publication.png'
import artifact8 from '../../assets/journey/08-certificate.png'

const artifacts = [
  { src: artifact1, width: 454, height: 348 },
  { src: artifact2, width: 539, height: 372 },
  { src: artifact3, width: 425, height: 443 },
  { src: artifact4, width: 439, height: 429 },
  { src: artifact5, width: 429, height: 395 },
  { src: artifact6, width: 480, height: 450 },
  { src: artifact7, width: 472, height: 450 },
  { src: artifact8, width: 493, height: 463 },
]

export default function ResearchArtifact({ step }) {
  const artifact = artifacts[step - 1] || artifacts[0]
  return <img className="research-artifact" src={artifact.src} width={artifact.width} height={artifact.height}
    alt="" aria-hidden="true" decoding="async" draggable="false" />
}
