export default function Notice({ msg }) {
  if (!msg) return null
  return <p className={`a-msg a-msg--${msg.kind}`} role="status">{msg.text}</p>
}
