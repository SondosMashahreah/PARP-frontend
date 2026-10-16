import { answerBlocks, inlineParts } from './answerFormat.js'
function Inline({ text }) {
  return inlineParts(text).map((part, i) => {
    if (part.type === 'strong') return <strong key={i}>{part.text}</strong>
    if (part.type === 'em') return <em key={i}>{part.text}</em>
    if (part.type === 'code') return <code key={i}>{part.text}</code>
    return <span key={i}>{part.text}</span>
  })
}
export default function Answer({ text }) {
  return <div className="assistant-answer" dir="auto">{answerBlocks(text).map((block, i) => {
    if (block.type === 'heading') return <h3 key={i}><Inline text={block.text}/></h3>
    if (block.type === 'code') return <pre key={i}><code>{block.text}</code></pre>
    if (block.type === 'table') return <div className="assistant-answer__table" key={i}><table><thead><tr>{block.headers.map((h,j)=><th key={j}><Inline text={h}/></th>)}</tr></thead><tbody>{block.rows.map((row,j)=><tr key={j}>{block.headers.map((_,k)=><td key={k}><Inline text={row[k] || ''}/></td>)}</tr>)}</tbody></table></div>
    if (block.type === 'ol' || block.type === 'ul') {
      const List = block.type
      return <List key={i}>{block.items.map((item,j)=><li key={j}><Inline text={item}/></li>)}</List>
    }
    return <p key={i}><Inline text={block.text}/></p>
  })}</div>
}
