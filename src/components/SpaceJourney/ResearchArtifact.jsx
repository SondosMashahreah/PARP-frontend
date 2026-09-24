import researchToolsAtlas from '../../assets/research-tools-atlas.png'

// Measured regions include transparent padding around each complete object.
// Using one atlas keeps all eight assets in a single network request.
const ATLAS_WIDTH = 1774
const ATLAS_HEIGHT = 887
const REGIONS = [
  { x: 18, y: 72, width: 418, height: 315 }, // Researcher identity
  { x: 446, y: 45, width: 491, height: 350 }, // Open learning book
  { x: 938, y: 16, width: 383, height: 419 }, // Research guide
  { x: 1368, y: 30, width: 390, height: 405 }, // Template folder
  { x: 10, y: 447, width: 420, height: 394 }, // Proposal and pen
  { x: 457, y: 449, width: 446, height: 400 }, // Review magnifier
  { x: 904, y: 444, width: 399, height: 417 }, // Publication
  { x: 1334, y: 447, width: 428, height: 402 }, // Certificate
]

export default function ResearchArtifact({ step }) {
  const { x, y, width, height } = REGIONS[step - 1] || REGIONS[0]
  return (
    <div
      className="research-artifact"
      aria-hidden="true"
      style={{
        width: `${Math.min(1, width / height) * 100}%`,
        aspectRatio: `${width} / ${height}`,
        backgroundImage: `url(${researchToolsAtlas})`,
        backgroundSize: `${ATLAS_WIDTH / width * 100}% ${ATLAS_HEIGHT / height * 100}%`,
        backgroundPosition: `${x / (ATLAS_WIDTH - width) * 100}% ${y / (ATLAS_HEIGHT - height) * 100}%`,
      }}
    />
  )
}
